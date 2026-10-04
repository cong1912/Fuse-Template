import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['finance_dashboard_widgets'] as const;

const FinanceDashboardApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getFinanceDashboardWidgets: build.query<any, void>({
				query: () => ({ url: `/api/admin/analytics/dashboard-summary?days=30` }),
				providesTags: ['finance_dashboard_widgets'],
				transformResponse: (res: any) => {
					return {
						accountBalance: { growRate: res.revenueChangePercent, ami: res.grossRevenue, series: [{ name: 'Balance', data: [] }] },
						budget: { expenses: 0, expensesLimit: 0, savings: 0, savingsGoal: 0, bills: 0, billsLimit: 0 },
						currentStatement: { status: 'Paid', date: new Date().toLocaleDateString(), limit: 10000, spent: res.grossRevenue, minimum: 0 },
						previousStatement: { status: 'Paid', date: new Date().toLocaleDateString(), limit: 10000, spent: res.previousPeriodRevenue, minimum: 0 },
						recentTransactions: { columns: ['Date', 'Name', 'Amount', 'Status'], rows: [] }
					};
				}
			})
		}),
		overrideExisting: false
	});

export default FinanceDashboardApi;

export type GetFinanceDashboardWidgetsApiResponse = /** status 200 OK */ object;
export type GetFinanceDashboardWidgetsApiArg = void;

export const { useGetFinanceDashboardWidgetsQuery } = FinanceDashboardApi;

export type FinanceDashboardApiType = {
	[FinanceDashboardApi.reducerPath]: ReturnType<typeof FinanceDashboardApi.reducer>;
};

export const selectWidget =
	<T>(id: string) =>
	(state: FinanceDashboardApiType) => {
		const widgets = FinanceDashboardApi.endpoints.getFinanceDashboardWidgets.select()(state)?.data;
		return widgets?.[id] as T;
	};
