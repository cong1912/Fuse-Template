import { lazy } from 'react';
import authRoles from '../../auth/authRoles';

const ProfilePage = lazy(() => import('./ProfilePage'));

const AccountConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: authRoles.user,
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
