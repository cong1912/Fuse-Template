import { lazy } from 'react';

const ProfilePage = lazy(() => import('./ProfilePage'));

const AccountConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'account',
			children: [
				{
					path: 'profile',
					element: <ProfilePage />
				}
			]
		}
	]
};

export default AccountConfig;
