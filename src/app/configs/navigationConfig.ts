import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const navigationConfig: FuseNavItemType[] = [
	{
		id: 'home',
		title: 'Trang chủ',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:home',
		url: '/dashboards/analytics'
	},
	{
		id: 'orders',
		title: 'Đơn hàng',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:shopping-cart',
		url: '/apps/e-commerce/orders',
		badge: {
			title: '12',
			bg: '#ef4444',
			fg: '#ffffff'
		}
	},
	{
		id: 'products',
		title: 'Sản phẩm',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:cube',
		url: '/apps/e-commerce/products'
	},
	{
		id: 'flash-sales',
		title: 'Flash Sales (Waiting Room)',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:lightning-bolt',
		url: '/apps/e-commerce/flash-sales',
		badge: {
			title: 'HOT',
			bg: '#f97316',
			fg: '#ffffff'
		}
	},
	{
		id: 'b2b-quotes',
		title: 'B2B Wholesale (RFQ)',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:briefcase',
		url: '/apps/e-commerce/b2b'
	},
	{
		id: 'calendar',
		title: 'Lịch hẹn & Đặt chỗ (Calendar)',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff', 'user'],
		icon: 'heroicons-outline:calendar',
		url: '/apps/calendar',
		badge: {
			title: 'MỚI',
			bg: '#3b82f6',
			fg: '#ffffff'
		}
	},
	{
		id: 'categories',
		title: 'Categories',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:view-list',
		url: '/apps/e-commerce/categories'
	},
	{
		id: 'product-classes',
		title: 'Product Classes',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:collection',
		url: '/apps/e-commerce/product-classes'
	},
	{
		id: 'customers',
		title: 'Khách hàng',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:users',
		url: '/reports/customers'
	},
	{
		id: 'marketing',
		title: 'Khuyến Mãi & Marketing',
		type: 'item',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:speakerphone',
		url: '/apps/e-commerce/promotions'
	},
	{
		id: 'analytics',
		title: 'Phân tích',
		type: 'collapse',
		auth: ['superadmin', 'admin', 'staff'],
		icon: 'heroicons-outline:chart-bar',
		children: [
			{ id: 'revenue', title: 'Doanh thu', type: 'item', auth: ['superadmin', 'admin'], icon: 'heroicons-outline:trending-up', url: '/reports/revenue' },
			{ id: 'report-orders', title: 'Báo cáo Đơn hàng', type: 'item', auth: ['superadmin', 'admin', 'staff'], icon: 'heroicons-outline:shopping-bag', url: '/reports/orders' },
			{ id: 'report-products', title: 'Báo cáo Sản phẩm', type: 'item', auth: ['superadmin', 'admin', 'staff'], icon: 'heroicons-outline:chart-square-bar', url: '/reports/products' },
			{ id: 'report-customers', title: 'Báo cáo Khách hàng', type: 'item', auth: ['superadmin', 'admin', 'staff'], icon: 'heroicons-outline:user-group', url: '/reports/customers' },
			{ id: 'report-finance', title: 'Báo cáo Tài chính', type: 'item', auth: ['superadmin', 'admin'], icon: 'heroicons-outline:currency-dollar', url: '/reports/finance' },
			{ id: 'report-inventory', title: 'Báo cáo Tồn kho', type: 'item', auth: ['superadmin', 'admin', 'staff'], icon: 'heroicons-outline:archive', url: '/reports/inventory' },
			{ id: 'report-marketing', title: 'Báo cáo Marketing', type: 'item', auth: ['superadmin', 'admin', 'staff'], icon: 'heroicons-outline:badge-check', url: '/reports/marketing' }
		]
	},
	{
		id: 'finance',
		title: 'Tài chính',
		type: 'item',
		auth: ['superadmin', 'admin'],
		icon: 'heroicons-outline:cash',
		url: '/dashboards/finance'
	},
	{
		id: 'platform',
		title: 'Hệ thống/Platform',
		type: 'collapse',
		auth: ['superadmin'],
		icon: 'heroicons-outline:server',
		children: [
			{ id: 'platform-overview', title: 'Platform Overview', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:view-grid', url: '/platform/overview' },
			{ id: 'platform-tenants', title: 'Super Admin Control Center', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:office-building', url: '/platform/shops' },
			{ id: 'platform-plans', title: 'Gói & Bảng giá (Plans)', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:tag', url: '/platform/plans' },
			{ id: 'platform-billing', title: 'Đăng ký & Hóa đơn (Billing)', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:credit-card', url: '/platform/billing' },
			{ id: 'platform-users', title: 'Người dùng nền tảng (Users)', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:users', url: '/platform/users' },
			{
				id: 'platform-risk',
				title: 'Giám sát rủi ro (Risk Queue)',
				type: 'item',
				auth: ['superadmin'],
				icon: 'heroicons-outline:shield-exclamation',
				url: '/platform/risk',
				badge: {
					title: '3',
					bg: '#dc2626',
					fg: '#ffffff'
				}
			},
			{ id: 'platform-invites', title: 'Quản lý lời mời (Invites)', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:mail', url: '/platform/invites' },
			{
				id: 'platform-domains',
				title: 'Quản lý Tên miền (Domains)',
				type: 'item',
				auth: ['superadmin'],
				icon: 'heroicons-outline:globe',
				url: '/platform/domains',
				badge: {
					title: 'NEW',
					bg: '#10b981',
					fg: '#ffffff'
				}
			},
			{ id: 'platform-audit', title: 'Audit Trail & Compliance', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:clipboard-check', url: '/platform/audit' },
			{ id: 'platform-system', title: 'Sức khỏe hệ thống (Diagnostics)', type: 'item', auth: ['superadmin'], icon: 'heroicons-outline:status-online', url: '/platform/system' }
		]
	},
	{
		id: 'settings',
		title: 'Cài đặt',
		type: 'collapse',
		auth: ['superadmin', 'admin'],
		icon: 'heroicons-outline:cog',
		children: [
			{
				id: 'domain-settings',
				title: 'Tên miền & Subdomain',
				type: 'item',
				auth: ['superadmin', 'admin'],
				icon: 'heroicons-outline:globe-alt',
				url: '/settings/domain',
				badge: {
					title: 'NEW',
					bg: '#10b981',
					fg: '#ffffff'
				}
			},
			{
				id: 'theme-customizer',
				title: 'Tùy biến Giao diện (Theme)',
				type: 'item',
				auth: ['superadmin', 'admin'],
				icon: 'heroicons-outline:color-swatch',
				url: '/settings/theme',
				badge: {
					title: 'PRO',
					bg: '#8b5cf6',
					fg: '#ffffff'
				}
			},
			{ id: 'staff', title: 'Nhân viên', type: 'item', auth: ['superadmin', 'admin'], icon: 'heroicons-outline:user-add', url: '/settings/staff' },
			{ id: 'integrations', title: 'Tích hợp (Integrations)', type: 'item', auth: ['superadmin', 'admin'], icon: 'heroicons-outline:puzzle', url: '/settings/integrations' }
		]
	}
];

export default navigationConfig;
