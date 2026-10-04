import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const navigationConfig: FuseNavItemType[] = [
	{
		id: 'home',
		title: 'Trang chủ',
		type: 'item',
		icon: 'heroicons-outline:home',
		url: '/dashboard'
	},
	{
		id: 'orders',
		title: 'Đơn hàng',
		type: 'item',
		icon: 'heroicons-outline:shopping-cart',
		url: '/orders'
	},
	{
		id: 'products',
		title: 'Sản phẩm',
		type: 'item',
		icon: 'heroicons-outline:cube',
		url: '/products'
	},
	{
		id: 'customers',
		title: 'Khách hàng',
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
		title: 'Phân tích',
		type: 'collapse',
		icon: 'heroicons-outline:chart-bar',
		children: [
			{ id: 'revenue', title: 'Doanh thu', type: 'item', url: '/reports/revenue' },
			{ id: 'orders', title: 'Đơn hàng', type: 'item', url: '/reports/orders' },
			{ id: 'products', title: 'Sản phẩm', type: 'item', url: '/reports/products' },
			{ id: 'customers', title: 'Khách hàng', type: 'item', url: '/reports/customers' },
			{ id: 'finance', title: 'Tài chính', type: 'item', url: '/reports/finance' },
			{ id: 'inventory', title: 'Tồn kho', type: 'item', url: '/reports/inventory' },
			{ id: 'marketing-report', title: 'Marketing', type: 'item', url: '/reports/marketing' }
		]
	},
	{
		id: 'finance',
		title: 'Tài chính',
		type: 'item',
		icon: 'heroicons-outline:cash',
		url: '/finance'
	},
	{
		id: 'platform',
		title: 'Hệ thống/Platform',
		type: 'item',
		icon: 'heroicons-outline:server',
		url: '/platform'
	},
	{
		id: 'settings',
		title: 'Cài đặt',
		type: 'collapse',
		icon: 'heroicons-outline:cog',
		children: [
			{ id: 'staff', title: 'Nhân viên', type: 'item', url: '/settings/staff' },
			{ id: 'account', title: 'Tài khoản', type: 'item', url: '/account/profile' }
		]
	}
];

export default navigationConfig;
