import { lazy } from 'react';

const StaffPage = lazy(() => import('./StaffPage'));
const IntegrationsPage = lazy(() => import('./integrations/IntegrationsPage'));
const DomainSettingsPage = lazy(() => import('./domain/DomainSettingsPage'));
const ThemeCustomizerPage = lazy(() => import('./theme/ThemeCustomizerPage'));

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
					path: 'domain',
					element: <DomainSettingsPage />
				},
				{
					path: 'theme',
					element: <ThemeCustomizerPage />
				},
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
