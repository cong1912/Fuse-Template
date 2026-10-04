import { lazy } from 'react';

const StaffPage = lazy(() => import('./StaffPage'));
const IntegrationsPage = lazy(() => import('./integrations/IntegrationsPage'));

const SettingsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: ['Owner', 'Admin'],
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
