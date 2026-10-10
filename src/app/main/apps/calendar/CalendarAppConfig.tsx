import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';

const CalendarApp = lazy(() => import('./CalendarApp'));

/**
 * The Universal Calendar & Booking app config.
 */
const CalendarAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	auth: authRoles.user,
	routes: [
		{
			path: 'apps/calendar',
			children: [
				{
					path: '',
					element: <CalendarApp />,
					exact: true
				}
			]
		}
	]
};

export default CalendarAppConfig;
