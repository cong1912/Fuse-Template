import { lazy } from 'react';
import authRoles from 'src/app/auth/authRoles';

const AnalyticsDashboardApp = lazy(() => import('./AnalyticsDashboardApp'));
/**
 * The analytics dashboard app config.
 */
const AnalyticsDashboardAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: authRoles.staff,
	routes: [
		{
			path: 'dashboards/analytics',
			element: <AnalyticsDashboardApp />
		}
	]
};

export default AnalyticsDashboardAppConfig;
