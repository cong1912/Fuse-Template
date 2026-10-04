import { apiService } from 'app/store/apiService';

export interface Integration {
	id: string;
	provider: string; // 'vnpay' or 'ghn'
	type: string; // 'payment' or 'shipping'
	isActive: boolean;
	credentials: Record<string, string>;
}

export const integrationsApi = apiService.enhanceEndpoints({ addTagTypes: ['Integrations'] }).injectEndpoints({
	endpoints: (builder) => ({
		getIntegrations: builder.query<Integration[], void>({
			query: () => ({
				url: '/api/tenant/integrations',
				method: 'GET'
			}),
			providesTags: ['Integrations']
		}),
		updateIntegration: builder.mutation<Integration, { provider: string; data: Partial<Integration> }>({
			query: ({ provider, data }) => ({
				url: `/api/tenant/integrations/${provider}`,
				method: 'PUT',
				data
			}),
			invalidatesTags: ['Integrations']
		})
	}),
	overrideExisting: false
});

export const { useGetIntegrationsQuery, useUpdateIntegrationMutation } = integrationsApi;
