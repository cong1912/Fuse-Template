import { apiService as api } from 'app/store/apiService';
import { appSelector } from 'app/store/store';

export const addTagTypes = ['analytics_dashboard_widgets'] as const;

const AnalyticsDashboardApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAnalyticsDashboardWidgets: build.query<any, void>({
				query: () => ({ url: `/api/admin/analytics/dashboard-summary?days=30` }),
				providesTags: ['analytics_dashboard_widgets'],
				transformResponse: (res: any) => {
					const dailyLabels = (res.dailyStats || []).map((s: any) => new Date(s.date).toLocaleDateString());
					const revenueData = (res.dailyStats || []).map((s: any) => s.revenue);
					const ordersData = (res.dailyStats || []).map((s: any) => s.orders);
					
					const visitorsSeriesData = (res.dailyStats || []).map((s: any) => ({
						x: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
						y: s.revenue
					}));
					
					return {
						visitors: {
							ranges: { "30days": "Last 30 Days" },
							series: { "30days": [{ name: "Gross Revenue", data: visitorsSeriesData }] }
						},
						conversions: {
							amount: res.totalOrders,
							labels: dailyLabels,
							series: [{ name: "Orders", data: ordersData }]
						},
						impressions: {
							amount: res.grossRevenue,
							labels: dailyLabels,
							series: [{ name: "Revenue", data: revenueData }]
						},
						visits: {
							amount: res.averageOrderValue,
							labels: dailyLabels,
							series: [{ name: "AOV", data: revenueData }]
						},
						visitorsVsPageViews: {
							overallScore: res.totalProducts,
							averageRatio: res.lowStockCount,
							predictedRatio: res.outOfStockCount,
							series: [{ name: "Inventory", data: [] }]
						},
						newVsReturning: { uniqueVisitors: res.totalCustomers, series: [res.newCustomersThisPeriod || 1, Math.max(1, res.totalCustomers - res.newCustomersThisPeriod)], labels: ["New", "Returning"] },
						gender: { uniqueVisitors: res.totalCustomers, series: [50, 50], labels: ["Male", "Female"] },
						age: { uniqueVisitors: res.totalCustomers, series: [100], labels: ["All"] },
						language: { uniqueVisitors: res.totalCustomers, series: [100], labels: ["EN"] }
					};
				}
			}),
			getOrderStatusSummary: build.query<{ pending?: number; confirmed?: number; processing?: number; shipped?: number; delivered?: number; cancelled?: number; refunded?: number }, void>({
				query: () => ({ url: `/api/admin/analytics/order-status-summary` }),
				providesTags: ['analytics_dashboard_widgets']
			})
		}),
		overrideExisting: false
	});
export default AnalyticsDashboardApi;

export type GetAnalyticsDashboardWidgetsApiResponse = object;
export type GetAnalyticsDashboardWidgetsApiArg = void;

export const { useGetAnalyticsDashboardWidgetsQuery, useGetOrderStatusSummaryQuery } = AnalyticsDashboardApi;

export type AnalyticsDashboardApiType = {
	[AnalyticsDashboardApi.reducerPath]: ReturnType<typeof AnalyticsDashboardApi.reducer>;
};

export const selectWidget = <T>(id: string) =>
	appSelector((state: AnalyticsDashboardApiType) => {
		const widgets = AnalyticsDashboardApi.endpoints.getAnalyticsDashboardWidgets.select()(state)?.data;
		return widgets?.[id] as T;
	});
