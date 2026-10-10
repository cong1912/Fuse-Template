import { FuseRouteConfigsType } from '@fuse/utils/FuseUtils';
import ECommerceAppConfig from './e-commerce/ECommerceAppConfig';
import ProfileAppConfig from './profile/profileAppConfig';
import NotificationsAppConfig from './notifications/NotificationsAppConfig';
import InboxAppConfig from './inbox/InboxAppConfig';
import CalendarAppConfig from './calendar/CalendarAppConfig';

const appsConfigs: FuseRouteConfigsType = [ECommerceAppConfig, ProfileAppConfig, NotificationsAppConfig, InboxAppConfig, CalendarAppConfig];
export default appsConfigs;
