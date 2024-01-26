import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['finance_dashboard_widgets'] as const;

const FinanceDashboardApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getFinanceDashboardWidgets: build.query<
				GetFinanceDashboardWidgetsApiResponse,
				GetFinanceDashboardWidgetsApiArg
			>({
				query: () => ({ url: `/mock-api/dashboards/finance/widgets` }),
				providesTags: ['finance_dashboard_widgets']
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
