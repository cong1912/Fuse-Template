import { lazy } from 'react';

const DomainsManagementPage = lazy(() => import('./DomainsManagementPage'));

const DomainsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'platform/domains',
			element: <DomainsManagementPage />
		}
	]
};

export default DomainsConfig;
