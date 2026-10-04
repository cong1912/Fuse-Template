import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const navigationConfig: FuseNavItemType[] = [
	{
		id: 'dashboards',
		title: 'Dashboards',
		type: 'group',
		icon: 'heroicons-outline:home',
		children: [
			{
				id: 'dashboards.project',
				title: 'Project',
				type: 'item',
				icon: 'heroicons-outline:clipboard-check',
				url: '/dashboards/project'
			},
			{
				id: 'dashboards.analytics',
				title: 'Analytics',
				type: 'item',
				icon: 'heroicons-outline:chart-pie',
				url: '/dashboards/analytics'
			},
			{
				id: 'dashboards.finance',
				title: 'Finance',
				type: 'item',
				icon: 'heroicons-outline:cash',
				url: '/dashboards/finance'
			}
		]
	},
	{
		id: 'apps',
		title: 'Applications',
		type: 'group',
		icon: 'heroicons-outline:cube',
		children: [
			{
				id: 'apps.e-commerce',
				title: 'ECommerce',
				type: 'collapse',
				icon: 'heroicons-outline:shopping-cart',
				children: [
					{
						id: 'e-commerce.products',
						title: 'Products',
						type: 'item',
						url: '/apps/e-commerce/products'
					},
					{
						id: 'e-commerce.orders',
						title: 'Orders',
						type: 'item',
						url: '/apps/e-commerce/orders'
					}
				]
			}
		]
	}
];

export default navigationConfig;
