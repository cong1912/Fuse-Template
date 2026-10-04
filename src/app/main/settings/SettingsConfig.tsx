import { lazy } from 'react';

const StaffPage = lazy(() => import('./StaffPage'));
const IntegrationsPage = lazy(() => import('./integrations/IntegrationsPage'));

import authRoles from 'src/app/auth/authRoles';

const SettingsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: authRoles.admin,
	routes: [
		{
			path: 'settings',
			children: [
				{
					path: 'staff',
					element: <StaffPage />
				},
				{
					path: 'integrations',
					element: <IntegrationsPage />
				}
			]
		}
	]
};

export default SettingsConfig;
