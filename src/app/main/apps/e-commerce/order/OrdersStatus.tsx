import _ from '@lodash';
import clsx from 'clsx';
import { EcommerceOrder } from '../ECommerceApi';
import { getOrderStatusConfig, ORDER_STATUS_LIST } from './constants';

/**
 * The order statuses (Re-exported from single source of truth for backward compatibility).
 */
export const orderStatuses: EcommerceOrder['status'] = ORDER_STATUS_LIST;

/**
 * The orders status properties.
 */
type OrdersStatusProps = {
	name: string;
};

/**
 * The orders status component.
 */
function OrdersStatus(props: OrdersStatusProps) {
	const { name } = props;
	const config = getOrderStatusConfig(name);

	return (
		<div
			className={clsx(
				'inline-flex items-center text-12 font-semibold py-4 px-12 rounded-full truncate shadow-sm',
				config.colorTailwind
			)}
			title={`${config.labelEn}: ${config.description}`}
		>
			{config.labelVi}
		</div>
	);
}

export default OrdersStatus;
