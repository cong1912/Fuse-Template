import { FuseRouteConfigsType } from '@fuse/utils/FuseUtils';
import ECommerceAppConfig from './e-commerce/ECommerceAppConfig';
import ProfileAppConfig from './profile/profileAppConfig';
import NotificationsAppConfig from './notifications/NotificationsAppConfig';

const appsConfigs: FuseRouteConfigsType = [ECommerceAppConfig, ProfileAppConfig, NotificationsAppConfig];
export default appsConfigs;
