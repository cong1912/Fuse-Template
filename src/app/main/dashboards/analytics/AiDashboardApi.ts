import { apiService as api } from 'app/store/apiService';

export interface LowStockRiskDto {
	productId: string;
	productName: string;
	currentStock: number;
	estimatedDaysUntilStockout: number;
	urgencyLevel: 'Critical' | 'High' | 'Medium';
}

export interface RfmSummaryDto {
	champions: number;
	loyal: number;
	regular: number;
	atRisk: number;
	lost: number;
	total: number;
}

export const AiDashboardApi = api
	.enhanceEndpoints({
		addTagTypes: ['ai_rfm_summary', 'ai_low_stock_risk']
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getRfmSummary: build.query<RfmSummaryDto, void>({
				query: () => ({ url: '/api/ai/rfm-segments/summary' }),
				providesTags: ['ai_rfm_summary']
			}),
			getLowStockRisk: build.query<LowStockRiskDto[], void>({
				query: () => ({ url: '/api/ai/demand-forecast/low-stock-risk' }),
				providesTags: ['ai_low_stock_risk']
			}),
			sendAiChatMessage: build.mutation<{ reply: string }, { message: string }>({
				query: (data) => ({
					url: '/api/ai/chat',
					method: 'POST',
					data
				}),
				transformResponse: (res: any) => {
					if (typeof res === 'string') return { reply: res };
					if (res && res.reply) return { reply: res.reply };
					if (res && res.message) return { reply: res.message };
					return { reply: JSON.stringify(res) };
				}
			})
		}),
		overrideExisting: false
	});

export const {
	useGetRfmSummaryQuery,
	useGetLowStockRiskQuery,
	useSendAiChatMessageMutation
} = AiDashboardApi;

export default AiDashboardApi;
