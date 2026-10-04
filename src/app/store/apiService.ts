import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import { AxiosRequestConfig, AxiosError } from 'axios';
import axiosClient from '../api/axiosClient';

const axiosBaseQuery =
	(): BaseQueryFn<AxiosRequestConfig<unknown>, unknown, unknown> =>
	async ({ url, method, data, params }) => {
		try {
			const result = await axiosClient({
				url,
				method,
				data,
				params
			});
			return { data: result.data };
		} catch (axiosError) {
			const error = axiosError as AxiosError;
			return {
				error: {
					status: error.response?.status,
					data: error.response?.data,
					message: error.message
				}
			};
		}
	};

export const apiService = createApi({
	baseQuery: axiosBaseQuery(),
	endpoints: () => ({}),
	reducerPath: 'apiService'
});

export default apiService;
