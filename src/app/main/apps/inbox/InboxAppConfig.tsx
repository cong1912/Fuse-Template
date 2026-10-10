import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';

const InboxApp = lazy(() => import('./InboxApp'));

/**
 * The Inbox & Live Support app config.
 */
const InboxAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: authRoles.user,
	routes: [
		{
			path: 'apps/inbox',
			children: [
				{
					path: '',
					element: <InboxApp />,
					exact: true
				}
			]
		}
	]
};

export default InboxAppConfig;
