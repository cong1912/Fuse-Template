import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const navigationConfig: FuseNavItemType[] = [
	{
		id: 'home',
		title: 'Trang chá»§',
		type: 'item',
		icon: 'heroicons-outline:home',
		url: '/dashboard'
	},
	{
		id: 'orders',
		title: 'ÄÆ¡n hÃ ng',
		type: 'item',
		icon: 'heroicons-outline:shopping-cart',
		url: '/apps/e-commerce/orders'
	},
	{
		id: 'products',
		title: 'Sáº£n pháº©m',
		type: 'item',
		icon: 'heroicons-outline:cube',
		url: '/apps/e-commerce/products'
	},
	{
		id: 'customers',
		title: 'KhÃ¡ch hÃ ng',
		type: 'item',
		icon: 'heroicons-outline:users',
		url: '/customers'
	},
	{
		id: 'marketing',
		title: 'Marketing',
		type: 'item',
		icon: 'heroicons-outline:speakerphone',
		url: '/marketing'
	},
	{
		id: 'analytics',
		title: 'PhÃ¢n tÃ­ch',
		type: 'collapse',
		icon: 'heroicons-outline:chart-bar',
		children: [
			{ id: 'revenue', title: 'Doanh thu', type: 'item', url: '/reports/revenue' },
			{ id: 'orders', title: 'ÄÆ¡n hÃ ng', type: 'item', url: '/reports/orders' },
			{ id: 'products', title: 'Sáº£n pháº©m', type: 'item', url: '/reports/products' },
			{ id: 'customers', title: 'KhÃ¡ch hÃ ng', type: 'item', url: '/reports/customers' },
			{ id: 'finance', title: 'TÃ i chÃ­nh', type: 'item', url: '/reports/finance' },
			{ id: 'inventory', title: 'Tá»“n kho', type: 'item', url: '/reports/inventory' },
			{ id: 'marketing-report', title: 'Marketing', type: 'item', url: '/reports/marketing' }
		]
	},
	{
		id: 'finance',
		title: 'TÃ i chÃ­nh',
		type: 'item',
		icon: 'heroicons-outline:cash',
		url: '/finance'
	},
	{
		id: 'platform',
		title: 'Há»‡ thá»‘ng/Platform',
		type: 'item',
		icon: 'heroicons-outline:server',
		url: '/platform'
	},
	{
		id: 'settings',
		title: 'CÃ i Ä‘áº·t',
		type: 'collapse',
		icon: 'heroicons-outline:cog',
		children: [
			{ id: 'staff', title: 'NhÃ¢n viÃªn', type: 'item', url: '/settings/staff' },
			{ id: 'account', title: 'TÃ i khoáº£n', type: 'item', url: '/account/profile' },
			{ id: 'integrations', title: 'TÃ­ch há»£p (Integrations)', type: 'item', url: '/settings/integrations' }
		]
	}
];

export default navigationConfig;

