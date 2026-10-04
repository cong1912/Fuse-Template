import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const RevenueReportPage = lazy(() => import('./RevenueReportPage'));
const OrdersReportPage = lazy(() => import('./OrdersReportPage'));
const ProductsReportPage = lazy(() => import('./ProductsReportPage'));
const CustomersReportPage = lazy(() => import('./CustomersReportPage'));
const FinanceReportPage = lazy(() => import('./FinanceReportPage'));
const InventoryReportPage = lazy(() => import('./InventoryReportPage'));
const MarketingReportPage = lazy(() => import('./MarketingReportPage'));

const ReportsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'reports',
			children: [
				{ path: 'revenue', element: <RevenueReportPage /> },
				{ path: 'orders', element: <OrdersReportPage /> },
				{ path: 'products', element: <ProductsReportPage /> },
				{ path: 'customers', element: <CustomersReportPage /> },
				{ path: 'finance', element: <FinanceReportPage /> },
				{ path: 'inventory', element: <InventoryReportPage /> },
				{ path: 'marketing', element: <MarketingReportPage /> },
				{ path: '', element: <Navigate to="revenue" /> }
			]
		}
	]
};

export default ReportsConfig;
