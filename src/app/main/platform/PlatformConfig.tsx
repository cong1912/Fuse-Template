import { lazy } from 'react';

const OverviewPage = lazy(() => import('./overview/OverviewPage'));
const ShopsPage = lazy(() => import('./shops/ShopsPage'));
const ShopDetailPage = lazy(() => import('./shops/ShopDetailPage'));
const PlansPage = lazy(() => import('./plans/PlansPage'));
const BillingPage = lazy(() => import('./billing/BillingPage'));
const UsersPage = lazy(() => import('./users/UsersPage'));
const RiskPage = lazy(() => import('./risk/RiskPage'));
const InvitesPage = lazy(() => import('./invites/InvitesPage'));
const AuditPage = lazy(() => import('./audit/AuditPage'));
const SystemPage = lazy(() => import('./system/SystemPage'));

const PlatformConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'platform/overview',
			element: <OverviewPage />
		},
		{
			path: 'platform/shops',
			element: <ShopsPage />
		},
		{
			path: 'platform/shops/:id',
			element: <ShopDetailPage />
		},
		{
			path: 'platform/plans',
			element: <PlansPage />
		},
		{
			path: 'platform/billing',
			element: <BillingPage />
		},
		{
			path: 'platform/users',
			element: <UsersPage />
		},
		{
			path: 'platform/risk',
			element: <RiskPage />
		},
		{
			path: 'platform/invites',
			element: <InvitesPage />
		},
		{
			path: 'platform/audit',
			element: <AuditPage />
		},
		{
			path: 'platform/system',
			element: <SystemPage />
		}
	]
};

export default PlatformConfig;
