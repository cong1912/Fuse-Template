import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const TOKEN_STORAGE_KEY = 'jwt_access_token';
export const API_BASE_URL = 'http://localhost:5269';

// Configure global axios baseURL as fallback for components calling axios directly
axios.defaults.baseURL = API_BASE_URL;

/**
 * Custom Axios client configured for Backend API communication.
 * Automatically attaches the Bearer JWT token from localStorage.
 */
const axiosClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Request interceptor to attach Authorization header
axiosClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem(TOKEN_STORAGE_KEY);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling / pass-through
axiosClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default axiosClient;
