import { FuseRouteConfigsType } from '@fuse/utils/FuseUtils';
import AnalyticsDashboardAppConfig from './analytics/AnalyticsDashboardAppConfig';
import ProjectDashboardAppConfig from './project/ProjectDashboardAppConfig';
import FinanceDashboardAppConfig from './finance/FinanceDashboardAppConfig';

const dashboardsConfigs: FuseRouteConfigsType = [
	AnalyticsDashboardAppConfig,
	ProjectDashboardAppConfig,
	FinanceDashboardAppConfig
];
export default dashboardsConfigs;
