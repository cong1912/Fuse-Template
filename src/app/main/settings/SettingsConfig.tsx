import { lazy } from 'react';

const StaffPage = lazy(() => import('./StaffPage'));

const SettingsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'settings',
			children: [
				{
					path: 'staff',
					element: <StaffPage />
				}
			]
		}
	]
};

export default SettingsConfig;
