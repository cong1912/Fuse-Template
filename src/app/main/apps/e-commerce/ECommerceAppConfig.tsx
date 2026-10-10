import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const ECommerceApp = lazy(() => import('./ECommerceApp'));
const Product = lazy(() => import('./product/Product'));
const Products = lazy(() => import('./products/Products'));
const Order = lazy(() => import('./order/Order'));
const Orders = lazy(() => import('./orders/Orders'));
const Categories = lazy(() => import('./categories/Categories'));
const ProductClasses = lazy(() => import('./product-classes/ProductClasses'));
const FlashSaleWaitingRoomPage = lazy(() => import('./flash-sales/FlashSaleWaitingRoomPage'));
const B2BQuotesPage = lazy(() => import('./b2b/B2BQuotesPage'));
const PromotionsHubPage = lazy(() => import('./promotions/PromotionsHubPage'));

/**
 * The E-Commerce app configuration.
 */
const ECommerceAppConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'apps/e-commerce',
			element: <ECommerceApp />,
			children: [
				{
					path: '',
					element: <Navigate to="products" />
				},
				{
					path: 'products',
					element: <Products />
				},
				{
					path: 'products/:productId/*',
					element: <Product />
				},
				{
					path: 'categories',
					element: <Categories />
				},
				{
					path: 'product-classes',
					element: <ProductClasses />
				},
				{
					path: 'orders',
					element: <Orders />
				},
				{
					path: 'orders/:orderId',
					element: <Order />
				},
				{
					path: 'flash-sales',
					element: <FlashSaleWaitingRoomPage />
				},
				{
					path: 'promotions',
					element: <PromotionsHubPage />
				},
				{
					path: 'b2b',
					element: <B2BQuotesPage />
				}
			]
		}
	]
};

export default ECommerceAppConfig;
