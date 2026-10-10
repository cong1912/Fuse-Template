import { lazy } from 'react';

const DomainSettingsPage = lazy(() => import('./DomainSettingsPage'));

const DomainConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'settings/domain',
			element: <DomainSettingsPage />
		}
	]
};

export default DomainConfig;
