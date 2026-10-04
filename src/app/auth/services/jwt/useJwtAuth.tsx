import { useState, useEffect, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import axios from 'app/api/axiosClient';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import _ from '@lodash';
import { PartialDeep } from 'type-fest';
import UserModel from '../../user/models/UserModel';

const defaultAuthConfig = {
	tokenStorageKey: 'jwt_access_token',
	signInUrl: '/api/auth/login',
	signUpUrl: '/api/auth/register',
	tokenRefreshUrl: '/api/auth/refresh',
	getUserUrl: '/api/shop/staff/me',
	updateUserUrl: '/api/shop/staff/me',
	updateTokenFromHeader: false
};

/**
 * Map C# Role (e.g., "Admin", "Staff", "User") to Fuse array format (e.g., ['admin'])
 */
export const mapRoleToFuseRoles = (role: unknown): string[] => {
	if (!role) {
		return ['admin']; // Default fallback role
	}

	if (Array.isArray(role)) {
		const mapped = role.flatMap((r) => mapRoleToFuseRoles(r));
		return mapped.length > 0 ? mapped : ['admin'];
	}

	if (typeof role === 'string') {
		const normalized = role.trim().toLowerCase();
		switch (normalized) {
			case 'admin':
			case 'administrator':
			case 'superadmin':
			case 'owner':
				return ['admin'];
			case 'staff':
			case 'manager':
			case 'vendor':
			case 'employee':
				return ['staff'];
			case 'user':
			case 'customer':
			case 'viewer':
				return ['user'];
			default:
				return [normalized];
		}
	}

	return ['admin'];
};

/**
 * Extract claims from JWT token
 */
export const decodeTokenClaims = (
	token: string
): {
	uid: string;
	email: string;
	role: string[];
	displayName: string;
} => {
	try {
		const decoded: any = jwtDecode(token);
		const uid =
			decoded?.sub ||
			decoded?.nameid ||
			decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
			'';
		const email =
			decoded?.email ||
			decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
			'';
		const rawRole =
			decoded?.role ||
			decoded?.roles ||
			decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
			'Admin';
		const displayName =
			decoded?.name ||
			decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
			(email ? email.split('@')[0] : '');

		return {
			uid: String(uid),
			email,
			role: mapRoleToFuseRoles(rawRole),
			displayName
		};
	} catch {
		return {
			uid: '',
			email: '',
			role: ['admin'],
			displayName: ''
		};
	}
};

/**
 * Map user data from backend response to Fuse User format
 */
export const mapUserData = (
	rawUser: any,
	fallbackEmail?: string,
	fallbackUid?: string
): any => {
	if (!rawUser && !fallbackEmail && !fallbackUid) {
		return null;
	}

	const email =
		rawUser?.email ||
		rawUser?.data?.email ||
		rawUser?.user?.email ||
		fallbackEmail ||
		'';

	const uid =
		rawUser?.uid ||
		rawUser?.uuid ||
		rawUser?.id ||
		rawUser?.userId ||
		fallbackUid ||
		'';

	const rawRole =
		rawUser?.role ||
		rawUser?.roles ||
		rawUser?.user?.role ||
		rawUser?.user?.roles;

	const role = mapRoleToFuseRoles(rawRole);

	const displayName =
		rawUser?.displayName ||
		rawUser?.fullName ||
		rawUser?.name ||
		rawUser?.data?.displayName ||
		rawUser?.user?.displayName ||
		(email ? email.split('@')[0] : 'User');

	const photoURL =
		rawUser?.photoURL ||
		rawUser?.avatar ||
		rawUser?.avatarUrl ||
		rawUser?.data?.photoURL ||
		'';

	return UserModel({
		uid: String(uid),
		role,
		data: {
			displayName,
			email,
			photoURL,
			shortcuts: rawUser?.data?.shortcuts || rawUser?.shortcuts || [],
			settings: rawUser?.data?.settings || rawUser?.settings || {},
			loginRedirectUrl: rawUser?.data?.loginRedirectUrl || rawUser?.loginRedirectUrl || '/'
		}
	});
};

export type JwtAuthProps<T> = {
	config: {
		tokenStorageKey: string;
		signInUrl: string;
		signUpUrl: string;
		tokenRefreshUrl: string;
		getUserUrl: string;
		updateUserUrl: string;
		/**
		 * If the response auth header contains a new access token, update the token
		 * in the Authorization header of the successful responses
		 */
		updateTokenFromHeader: boolean;
	};
	onSignedIn?: (U: T) => void;
	onSignedUp?: (U: T) => void;
	onSignedOut?: () => void;
	onUpdateUser?: (U: T) => void;
	onError?: (error: AxiosError) => void;
};

export type JwtAuth<User, SignInPayload, SignUpPayload> = {
	user: User;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (U: SignInPayload) => Promise<AxiosResponse<User, AxiosError>>;
	signOut: () => void;
	signUp: (U: SignUpPayload) => Promise<AxiosResponse<User, AxiosError>>;
	updateUser: (U: PartialDeep<User>) => void;
	refreshToken: () => void;
	setIsLoading: (isLoading: boolean) => void;
};

/**
 * useJwtAuth hook
 * Description: This hook handles the authentication flow using JWT
 * It uses axios to make the HTTP requests
 * It uses jwt-decode to decode the access token
 * It uses localStorage to store the access token
 * It uses Axios interceptors to update the access token from the response headers
 * It uses Axios interceptors to sign out the user if the refresh token is invalid or expired
 */

const useJwtAuth = <User, SignInPayload, SignUpPayload>(
	props: JwtAuthProps<User>
): JwtAuth<User, SignInPayload, SignUpPayload> => {
	const { config, onSignedIn, onSignedOut, onSignedUp, onError, onUpdateUser } = props;

	// Merge default config with the one from the props
	const authConfig = _.defaults(config, defaultAuthConfig);

	const [user, setUser] = useState<User>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	/**
	 * Set session
	 */
	const setSession = useCallback((accessToken: string) => {
		if (accessToken) {
			localStorage.setItem(authConfig.tokenStorageKey, accessToken);
			axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
		}
	}, []);

	const resetSession = useCallback(() => {
		localStorage.removeItem(authConfig.tokenStorageKey);
		delete axios.defaults.headers.common.Authorization;
	}, []);

	/**
	 * Get access token from local storage
	 */
	const getAccessToken = useCallback(() => {
		return localStorage.getItem(authConfig.tokenStorageKey);
	}, []);

	/**
	 * Handle sign-in success
	 */
	const handleSignInSuccess = useCallback((userData: User, accessToken: string) => {
		setSession(accessToken);

		setIsAuthenticated(true);

		setUser(userData);

		onSignedIn(userData);
	}, []);
	/**
	 * Handle sign-up success
	 */

	const handleSignUpSuccess = useCallback((userData: User, accessToken: string) => {
		setSession(accessToken);

		setIsAuthenticated(true);

		setUser(userData);

		onSignedUp(userData);
	}, []);

	/**
	 * Handle sign-in failure
	 */
	const handleSignInFailure = useCallback((error: AxiosError) => {
		resetSession();

		setIsAuthenticated(false);
		setUser(null);

		handleError(error);
	}, []);

	/**
	 * Handle sign-up failure
	 */
	const handleSignUpFailure = useCallback((error: AxiosError) => {
		resetSession();

		setIsAuthenticated(false);
		setUser(null);

		handleError(error);
	}, []);

	/**
	 * Handle error
	 */
	const handleError = useCallback((error: AxiosError) => {
		onError(error);
	}, []);

	/**
	 * Check if the access token is valid
	 */
	const isTokenValid = useCallback((accessToken: string) => {
		if (accessToken) {
			try {
				const decoded = jwtDecode<JwtPayload>(accessToken);
				const currentTime = Date.now() / 1000;
				return decoded.exp > currentTime;
			} catch (error) {
				return false;
			}
		}
		return false;
	}, []);

	/**
	 * Check if the access token exist and is valid on mount
	 * If it is, set the user and isAuthenticated states
	 * If not, clear the session
	 */
	useEffect(() => {
		const attemptAutoLogin = async () => {
			const accessToken = getAccessToken();
			if (isTokenValid(accessToken)) {
				try {
					setIsLoading(true);

					const response: AxiosResponse<any> = await axios.get(authConfig.getUserUrl, {
						headers: { Authorization: `Bearer ${accessToken}` }
					});

					const userData = mapUserData(response?.data) as unknown as User;

					handleSignInSuccess(userData, accessToken);

					return true;
				} catch (error) {
					// Fallback: If getUserUrl is unreachable but token is valid, restore session from token claims
					const claims = decodeTokenClaims(accessToken);
					if (claims.email || claims.uid) {
						const fallbackUser = mapUserData({
							uid: claims.uid,
							email: claims.email,
							role: claims.role,
							displayName: claims.displayName
						}) as unknown as User;
						handleSignInSuccess(fallbackUser, accessToken);
						return true;
					}

					const axiosError = error as AxiosError;

					handleSignInFailure(axiosError);
					return false;
				}
			} else {
				resetSession();
				return false;
			}
		};

		if (!isAuthenticated) {
			attemptAutoLogin().then(() => {
				setIsLoading(false);
			});
		}
	}, [
		isTokenValid,
		setSession,
		handleSignInSuccess,
		handleSignInFailure,
		handleError,
		getAccessToken,
		isAuthenticated
	]);

	/**
	 * Sign in
	 */
	const signIn = async (credentials: SignInPayload) => {
		try {
			const response = await axios.post(authConfig.signInUrl, credentials);

			// Extract accessToken from response.data.accessToken, response.data.token, response.data.access_token
			const accessToken: string =
				response?.data?.accessToken ||
				response?.data?.token ||
				response?.data?.access_token ||
				(response?.data?.data && (response.data.data.accessToken || response.data.data.token));

			if (!accessToken) {
				throw new Error('Access token is missing from the login response');
			}

			setSession(accessToken);

			let userData: User;

			// If the login response itself includes a user object
			if (response?.data?.user) {
				userData = mapUserData(response.data.user) as unknown as User;
			} else {
				// Fetch user info from getUserUrl (GET /api/shop/staff/me)
				try {
					const userResponse = await axios.get(authConfig.getUserUrl, {
						headers: { Authorization: `Bearer ${accessToken}` }
					});
					userData = mapUserData(
						userResponse?.data,
						response?.data?.email || (credentials as Record<string, unknown>)?.email as string,
						response?.data?.userId || response?.data?.id
					) as unknown as User;
				} catch {
					// Fallback: map user info from login response + token claims
					const claims = decodeTokenClaims(accessToken);
					userData = mapUserData({
						uid: response?.data?.userId || response?.data?.id || claims.uid,
						email: response?.data?.email || claims.email || (credentials as Record<string, unknown>)?.email,
						role: claims.role || 'Admin',
						displayName: response?.data?.fullName || claims.displayName || response?.data?.email || (credentials as Record<string, unknown>)?.email
					}) as unknown as User;
				}
			}

			handleSignInSuccess(userData, accessToken);

			return response;
		} catch (error) {
			const axiosError = error as AxiosError;

			// Format error response so JwtSignInTab can render message without crashing
			if (axiosError?.response && axiosError.response.data) {
				const data: any = axiosError.response.data;
				if (!Array.isArray(data)) {
					const message =
						data?.detail ||
						data?.message ||
						data?.title ||
						(typeof data === 'string' ? data : 'Authentication failed. Please check your credentials.');
					axiosError.response.data = [
						{
							type: 'root',
							message
						}
					];
				}
			}

			handleSignInFailure(axiosError);
			return Promise.reject(axiosError);
		}
	};

	/**
	 * Sign up
	 */
	const signUp = useCallback(async (data: SignUpPayload) => {
		try {
			const response = await axios.post(authConfig.signUpUrl, data);

			const accessToken =
				response?.data?.accessToken ||
				response?.data?.token ||
				response?.data?.access_token;

			if (accessToken) {
				setSession(accessToken);
			}

			const userData = mapUserData(response?.data?.user || response?.data) as unknown as User;

			handleSignUpSuccess(userData, accessToken);

			return response;
		} catch (error) {
			const axiosError = error as AxiosError;
			handleSignUpFailure(axiosError);
			return Promise.reject(axiosError);
		}
	}, []);

	/**
	 * Sign out
	 */
	const signOut = useCallback(() => {
		resetSession();

		setIsAuthenticated(false);
		setUser(null);

		onSignedOut();
	}, []);

	/**
	 * Update user
	 */
	const updateUser = useCallback(async (userData: PartialDeep<User>) => {
		try {
			const response: AxiosResponse<User, PartialDeep<User>> = await axios.put(
				authConfig.updateUserUrl,
				userData
			);

			const updatedUserData = mapUserData(response?.data) as unknown as User;

			onUpdateUser(updatedUserData);

			return null;
		} catch (error) {
			const axiosError = error as AxiosError;

			handleError(axiosError);
			return axiosError;
		}
	}, []);

	/**
	 * Refresh access token
	 */
	const refreshToken = async () => {
		setIsLoading(true);
		try {
			const response: AxiosResponse<any> = await axios.post(authConfig.tokenRefreshUrl);

			const accessToken =
				(response?.headers?.['New-Access-Token'] as string) ||
				response?.data?.accessToken ||
				response?.data?.token ||
				response?.data?.access_token;

			if (accessToken) {
				setSession(accessToken);
				return accessToken;
			}
			return null;
		} catch (error) {
			const axiosError = error as AxiosError;

			handleError(axiosError);
			return axiosError;
		}
	};

	/**
	 * if a successful response contains a new Authorization header,
	 * updates the access token from it.
	 *
	 */
	useEffect(() => {
		if (authConfig.updateTokenFromHeader && isAuthenticated) {
			axios.interceptors.response.use(
				(response) => {
					const newAccessToken = response?.headers?.['New-Access-Token'] as string;

					if (newAccessToken) {
						setSession(newAccessToken);
					}
					return response;
				},
				(error) => {
					const axiosError = error as AxiosError;

					if (axiosError?.response?.status === 401) {
						signOut();
						// eslint-disable-next-line no-console
						console.warn('Unauthorized request. User was signed out.');
					}
					return Promise.reject(axiosError);
				}
			);
		}
	}, [isAuthenticated]);

	return { user, isAuthenticated, isLoading, signIn, signUp, signOut, updateUser, refreshToken, setIsLoading };
};

export default useJwtAuth;

