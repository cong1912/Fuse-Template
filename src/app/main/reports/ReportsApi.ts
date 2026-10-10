import { apiService } from 'app/store/apiService';

export interface RevenueSummaryDto {
	totalRevenue: number;
	netRevenue: number;
	totalOrders: number;
	averageOrderValue: number;
	refundRate: number;
	dailyBreakdown?: Array<{
		date: string;
		revenue: number;
		orders: number;
	}>;
}

export interface TopProductReportItem {
	productId: string;
	productName: string;
	sku: string;
	unitsSold: number;
	totalRevenue: number;
	profitMargin?: number;
	stockQuantity?: number;
}

export interface PaymentStatsReportItem {
	gateway: string;
	transactionCount: number;
	totalAmount: number;
	successRate: number;
	feeAmount: number;
}

export interface CategoryRevenueItem {
	categoryId: string;
	categoryName: string;
	revenue: number;
	percentage: number;
}

export interface OrderStatusSummaryReport {
	pending: number;
	confirmed: number;
	processing: number;
	shipped: number;
	delivered: number;
	cancelled: number;
	refunded: number;
	total: number;
}

export interface GetRevenueReportParams {
	startDate?: string;
	endDate?: string;
}

export interface GetTopProductsParams {
	topN?: number;
}

export interface GetPaymentReportParams {
	startDate?: string;
	endDate?: string;
}

export interface GetCategoryRevenueParams {
	days?: number;
}

export const reportsApi = apiService.enhanceEndpoints({
	addTagTypes: ['ReportsAnalytics']
}).injectEndpoints({
	endpoints: (builder) => ({
		getRevenueSummary: builder.query<RevenueSummaryDto, GetRevenueReportParams | void>({
			query: (arg) => {
				const params = arg || {};
				const queryParams = new URLSearchParams();
				if (params.startDate) queryParams.append('startDate', params.startDate);
				if (params.endDate) queryParams.append('endDate', params.endDate);
				const qs = queryParams.toString();
				return {
					url: `/api/admin/analytics/revenue${qs ? `?${qs}` : ''}`,
					method: 'GET'
				};
			},
			providesTags: ['ReportsAnalytics']
		}),

		getTopProductsReport: builder.query<TopProductReportItem[], GetTopProductsParams | void>({
			query: (arg) => {
				const params = arg || {};
				return {
					url: `/api/admin/analytics/top-products?topN=${params.topN || 10}`,
					method: 'GET'
				};
			},
			providesTags: ['ReportsAnalytics']
		}),

		getPaymentReport: builder.query<{ items: PaymentStatsReportItem[]; totalProcessed: number; totalFees: number }, GetPaymentReportParams | void>({
			query: (arg) => {
				const params = arg || {};
				const queryParams = new URLSearchParams();
				if (params.startDate) queryParams.append('startDate', params.startDate);
				if (params.endDate) queryParams.append('endDate', params.endDate);
				const qs = queryParams.toString();
				return {
					url: `/api/admin/analytics/payments${qs ? `?${qs}` : ''}`,
					method: 'GET'
				};
			},
			providesTags: ['ReportsAnalytics']
		}),

		getOrderStatusSummaryReport: builder.query<OrderStatusSummaryReport, void>({
			query: () => ({
				url: '/api/admin/analytics/order-status-summary',
				method: 'GET'
			}),
			providesTags: ['ReportsAnalytics']
		}),

		getCategoryRevenueReport: builder.query<CategoryRevenueItem[], GetCategoryRevenueParams | void>({
			query: (arg) => {
				const params = arg || {};
				return {
					url: `/api/admin/analytics/categories?days=${params.days || 30}`,
					method: 'GET'
				};
			},
			providesTags: ['ReportsAnalytics']
		})
	}),
	overrideExisting: false
});

export const {
	useGetRevenueSummaryQuery,
	useGetTopProductsReportQuery,
	useGetPaymentReportQuery,
	useGetOrderStatusSummaryReportQuery,
	useGetCategoryRevenueReportQuery
} = reportsApi;

export default reportsApi;
