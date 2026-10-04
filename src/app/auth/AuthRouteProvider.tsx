import React, { createContext, useCallback, useContext, useMemo } from 'react';
import FuseAuthorization from '@fuse/core/FuseAuthorization';
import { useAppDispatch } from 'app/store/store';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen/FuseSplashScreen';
import {
	resetUser,
	selectUser,
	selectUserRole,
	setUser,
	updateUser,
	userSlice
} from 'src/app/auth/user/store/userSlice';
import BrowserRouter from '@fuse/core/BrowserRouter';
import { PartialDeep } from 'type-fest';
import _ from '@lodash';
import { useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import useJwtAuth, { JwtAuth } from './services/jwt/useJwtAuth';
import { User } from './user';
import UserModel from './user/models/UserModel';

export type SignInPayload = {
	email: string;
	password: string;
};

export type SignUpPayload = {
	displayName: string;
	password: string;
	email: string;
};

type AuthContext = {
	jwtService?: JwtAuth<User, SignInPayload, SignUpPayload>;
	signOut?: () => void;
	updateUser?: (U: PartialDeep<User>) => void;
	isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContext>({
	isAuthenticated: false
});

type AuthProviderProps = { children: React.ReactNode };

function AuthRoute(props: AuthProviderProps) {
	const { children } = props;
	const dispatch = useAppDispatch();
	const user = useSelector(selectUser);
	const userRole = useSelector(selectUserRole);

	const jwtService = useJwtAuth({
		config: {
			tokenStorageKey: 'jwt_access_token',
			signInUrl: '/api/auth/login',
			signUpUrl: '/api/auth/register',
			tokenRefreshUrl: '/api/auth/refresh',
			getUserUrl: '/api/shop/staff/me',
			updateUserUrl: '/api/shop/staff/me',
			updateTokenFromHeader: true
		},
		onSignedIn: (user: User) => {
			dispatch(setUser(user));
			setAuthService('jwt');
		},
		onSignedUp: (user: User) => {
			dispatch(setUser(user));
			setAuthService('jwt');
		},
		onSignedOut: () => {
			dispatch(resetUser());
			resetAuthService();
		},
		onUpdateUser: (user) => {
			dispatch(updateUser(user));
		},
		onError: (error) => {
			console.warn(error);
		}
	});

	const isLoading = useMemo(
		() => jwtService?.isLoading,
		[jwtService?.isLoading]
	);

	const isAuthenticated = useMemo(
		() => jwtService?.isAuthenticated,
		[jwtService?.isAuthenticated]
	);

	const combinedAuth = useMemo<AuthContext>(
		() => ({
			jwtService,
			signOut: () => {
				const authService = getAuthService();
				if (authService === 'jwt') {
					return jwtService?.signOut();
				}
				return null;
			},
			updateUser: (userData) => {
				const authService = getAuthService();
				if (authService === 'jwt') {
					return jwtService?.updateUser(userData);
				}
				return null;
			},
			isAuthenticated
		}),
		[isAuthenticated, user]
	);

	const getAuthService = useCallback(() => {
		return localStorage.getItem('authService');
	}, []);

	const setAuthService = useCallback((authService: string) => {
		if (authService) {
			localStorage.setItem('authService', authService);
		}
	}, []);

	const resetAuthService = useCallback(() => {
		localStorage.removeItem('authService');
	}, []);

	if (isLoading) {
		return <FuseSplashScreen />;
	}

	return (
		<AuthContext.Provider value={combinedAuth}>
			<BrowserRouter>
				<FuseAuthorization userRole={userRole}>{children}</FuseAuthorization>
			</BrowserRouter>
		</AuthContext.Provider>
	);
}

function useAuth(): AuthContext {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within a AuthRouteProvider');
	}
	return context;
}
const AuthRouteProvider = withReducer<AuthProviderProps>('user', userSlice.reducer)(AuthRoute);

export { useAuth, AuthRouteProvider };
