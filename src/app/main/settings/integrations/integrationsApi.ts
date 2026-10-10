import { apiService } from 'app/store/apiService';

export interface Integration {
	id?: string;
	provider: string; // 'vnpay' | 'ghn' | 'tiktok' | 'shopee' | 'pos' | 'vietqr'
	type?: string; // 'payment' | 'shipping' | 'marketplace'
	isActive?: boolean;
	isEnabled?: boolean;
	credentials?: Record<string, string>;
	credentialsJson?: string;
}

export interface WebhookSubscription {
	id: string;
	tenantId: string;
	targetUrl: string;
	events: string[];
	isActive: boolean;
	failureCount: number;
	createdAtUtc: string;
	lastTriggeredAtUtc: string | null;
}

export interface WebhookDeliveryLog {
	id: string;
	subscriptionId: string;
	eventType: string;
	payloadJson: string;
	responseStatusCode: number | null;
	responseBody: string | null;
	isSuccess: boolean;
	attemptNumber: number;
	errorMessage: string | null;
	deliveredAtUtc: string;
}

export interface RegisterWebhookPayload {
	targetUrl: string;
	secretKey: string;
	events: string[];
}

export interface N8nConfig {
	webhookUrl: string;
	secretKey: string;
	isEnabled: boolean;
	subscribedEvents: string[];
}

export interface N8nPingResponse {
	success: boolean;
	statusCode: number;
	responseTimeMs: number;
	signature: string;
	payloadSent: string;
	message: string;
}

export const integrationsApi = apiService.enhanceEndpoints({
	addTagTypes: ['Integrations', 'N8nConfig', 'Webhooks', 'WebhookLogs']
}).injectEndpoints({
	endpoints: (builder) => ({
		// Multi-Tenant Webhooks (Outbound)
		getMyWebhooks: builder.query<WebhookSubscription[], void>({
			query: () => ({
				url: '/api/tenant/webhooks',
				method: 'GET'
			}),
			providesTags: ['Webhooks']
		}),
		registerWebhook: builder.mutation<WebhookSubscription, RegisterWebhookPayload>({
			query: (data) => ({
				url: '/api/tenant/webhooks',
				method: 'POST',
				data
			}),
			invalidatesTags: ['Webhooks']
		}),
		deleteWebhook: builder.mutation<void, string>({
			query: (id) => ({
				url: `/api/tenant/webhooks/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: ['Webhooks']
		}),
		toggleWebhook: builder.mutation<boolean, string>({
			query: (id) => ({
				url: `/api/tenant/webhooks/${id}/toggle`,
				method: 'PATCH'
			}),
			invalidatesTags: ['Webhooks']
		}),
		getWebhookLogs: builder.query<WebhookDeliveryLog[], { subscriptionId: string; take?: number }>({
			query: ({ subscriptionId, take = 50 }) => ({
				url: `/api/tenant/webhooks/${subscriptionId}/logs?take=${take}`,
				method: 'GET'
			}),
			providesTags: ['WebhookLogs']
		}),
		pingWebhook: builder.mutation<{ success: boolean; message?: string }, string>({
			query: (id) => ({
				url: `/api/tenant/webhooks/${id}/ping`,
				method: 'POST'
			}),
			invalidatesTags: ['WebhookLogs']
		}),

		// Tenant Integrations (Omnichannel, Payment, Logistics)
		getIntegrations: builder.query<Integration[], void>({
			query: () => ({
				url: '/api/tenant/integrations',
				method: 'GET'
			}),
			providesTags: ['Integrations']
		}),
		updateIntegration: builder.mutation<string, { provider: string; data: { credentialsJson: string; isEnabled: boolean } }>({
			query: ({ provider, data }) => ({
				url: `/api/tenant/integrations/${provider}`,
				method: 'PUT',
				data
			}),
			invalidatesTags: ['Integrations']
		}),

		// n8n Workflow Automation
		getN8nConfig: builder.query<N8nConfig, void>({
			query: () => ({
				url: '/api/integrations/n8n/config',
				method: 'GET'
			}),
			providesTags: ['N8nConfig']
		}),
		updateN8nConfig: builder.mutation<{ success: boolean; message: string }, N8nConfig>({
			query: (data) => ({
				url: '/api/integrations/n8n/config',
				method: 'PUT',
				data
			}),
			invalidatesTags: ['N8nConfig']
		}),
		testN8nPing: builder.mutation<N8nPingResponse, { webhookUrl: string; secretKey: string }>({
			query: (data) => ({
				url: '/api/integrations/n8n/test-ping',
				method: 'POST',
				data
			})
		})
	}),
	overrideExisting: false
});

export const {
	useGetMyWebhooksQuery,
	useRegisterWebhookMutation,
	useDeleteWebhookMutation,
	useToggleWebhookMutation,
	useGetWebhookLogsQuery,
	useLazyGetWebhookLogsQuery,
	usePingWebhookMutation,
	useGetIntegrationsQuery,
	useUpdateIntegrationMutation,
	useGetN8nConfigQuery,
	useUpdateN8nConfigMutation,
	useTestN8nPingMutation
} = integrationsApi;
