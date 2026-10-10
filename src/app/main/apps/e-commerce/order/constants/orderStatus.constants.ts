/**
 * Order Status Definitions & Metadata (Single Source of Truth)
 * Aligns with Backend C# ECommerce.Domain.Enums.OrderStatus:
 * 0: Pending
 * 1: Confirmed
 * 2: Processing
 * 3: PartiallyShipped
 * 4: Shipped
 * 5: Delivered
 * 6: Cancelled
 * 7: Refunded
 */

export const ORDER_STATUS = {
	PENDING: 0,
	CONFIRMED: 1,
	PROCESSING: 2,
	PARTIALLY_SHIPPED: 3,
	SHIPPED: 4,
	DELIVERED: 5,
	CANCELLED: 6,
	REFUNDED: 7
} as const;

export type OrderStatusId = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export type OrderStatusKey =
	| 'Pending'
	| 'Confirmed'
	| 'Processing'
	| 'PartiallyShipped'
	| 'Shipped'
	| 'Delivered'
	| 'Cancelled'
	| 'Refunded';

export interface OrderStatusConfig {
	id: OrderStatusId;
	name: OrderStatusKey;
	labelVi: string;
	labelEn: string;
	colorTailwind: string;
	colorMui: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
	activeStep: number;
	description: string;
}

export const ORDER_STATUS_NAMES: readonly OrderStatusKey[] = [
	'Pending',
	'Confirmed',
	'Processing',
	'PartiallyShipped',
	'Shipped',
	'Delivered',
	'Cancelled',
	'Refunded'
] as const;

export const ORDER_STATUS_CONFIG: Record<OrderStatusKey, OrderStatusConfig> = {
	Pending: {
		id: ORDER_STATUS.PENDING,
		name: 'Pending',
		labelVi: 'Chờ xác nhận',
		labelEn: 'Pending',
		colorTailwind: 'bg-slate-500 text-white',
		colorMui: 'default',
		activeStep: 0,
		description: 'Đơn hàng mới tạo, đang chờ xác nhận thanh toán'
	},
	Confirmed: {
		id: ORDER_STATUS.CONFIRMED,
		name: 'Confirmed',
		labelVi: 'Đã xác nhận',
		labelEn: 'Confirmed',
		colorTailwind: 'bg-blue-600 text-white',
		colorMui: 'info',
		activeStep: 1,
		description: 'Đơn hàng đã được xác nhận thanh toán thành công'
	},
	Processing: {
		id: ORDER_STATUS.PROCESSING,
		name: 'Processing',
		labelVi: 'Đang đóng gói',
		labelEn: 'Processing',
		colorTailwind: 'bg-amber-600 text-white',
		colorMui: 'warning',
		activeStep: 2,
		description: 'Nhân viên kho đang kiểm đếm và đóng gói sản phẩm'
	},
	PartiallyShipped: {
		id: ORDER_STATUS.PARTIALLY_SHIPPED,
		name: 'PartiallyShipped',
		labelVi: 'Giao một phần',
		labelEn: 'Partially Shipped',
		colorTailwind: 'bg-indigo-600 text-white',
		colorMui: 'info',
		activeStep: 3,
		description: 'Đơn hàng được chia thành nhiều đợt giao'
	},
	Shipped: {
		id: ORDER_STATUS.SHIPPED,
		name: 'Shipped',
		labelVi: 'Đang giao hàng',
		labelEn: 'Shipped',
		colorTailwind: 'bg-purple-600 text-white',
		colorMui: 'primary',
		activeStep: 3,
		description: 'Đã bàn giao cho đơn vị vận chuyển (GHN/GHTK)'
	},
	Delivered: {
		id: ORDER_STATUS.DELIVERED,
		name: 'Delivered',
		labelVi: 'Giao thành công',
		labelEn: 'Delivered',
		colorTailwind: 'bg-green-600 text-white',
		colorMui: 'success',
		activeStep: 5,
		description: 'Khách hàng đã nhận hàng và ký biên bản nhận'
	},
	Cancelled: {
		id: ORDER_STATUS.CANCELLED,
		name: 'Cancelled',
		labelVi: 'Đã hủy',
		labelEn: 'Cancelled',
		colorTailwind: 'bg-rose-600 text-white',
		colorMui: 'error',
		activeStep: 0,
		description: 'Đơn hàng đã bị hủy trên hệ thống'
	},
	Refunded: {
		id: ORDER_STATUS.REFUNDED,
		name: 'Refunded',
		labelVi: 'Đã hoàn tiền',
		labelEn: 'Refunded',
		colorTailwind: 'bg-red-700 text-white',
		colorMui: 'secondary',
		activeStep: 0,
		description: 'Đơn hàng đã hoàn tiền cho khách'
	}
};

/**
 * Array format for selects / dropdowns / legacy compatibility
 */
export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS_CONFIG).map((cfg) => ({
	id: String(cfg.id),
	name: cfg.name,
	color: cfg.colorTailwind,
	labelVi: cfg.labelVi,
	labelEn: cfg.labelEn
}));

/**
 * Helper to get config from status enum id or string name
 */
export function getOrderStatusConfig(status: number | string | undefined | null): OrderStatusConfig {
	if (status === undefined || status === null) {
		return ORDER_STATUS_CONFIG.Pending;
	}

	if (typeof status === 'number') {
		const name = ORDER_STATUS_NAMES[status] || 'Pending';
		return ORDER_STATUS_CONFIG[name];
	}

	if (typeof status === 'string') {
		const trimmed = status.trim();
		if (trimmed in ORDER_STATUS_CONFIG) {
			return ORDER_STATUS_CONFIG[trimmed as OrderStatusKey];
		}
		const parsed = parseInt(trimmed, 10);
		if (!isNaN(parsed) && parsed in ORDER_STATUS_NAMES) {
			return ORDER_STATUS_CONFIG[ORDER_STATUS_NAMES[parsed]];
		}
	}

	return ORDER_STATUS_CONFIG.Pending;
}

export function getOrderStatusName(status: number | string | undefined | null): OrderStatusKey {
	return getOrderStatusConfig(status).name;
}

export function getOrderStatusLabel(status: number | string | undefined | null, lang: 'vi' | 'en' = 'vi'): string {
	const cfg = getOrderStatusConfig(status);
	return lang === 'vi' ? cfg.labelVi : cfg.labelEn;
}

export function getOrderStatusId(statusName: string | undefined | null): OrderStatusId {
	return getOrderStatusConfig(statusName).id;
}
