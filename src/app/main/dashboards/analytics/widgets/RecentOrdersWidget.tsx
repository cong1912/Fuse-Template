import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link, useNavigate } from 'react-router-dom';
import { useGetECommerceOrdersQuery } from '../../../apps/e-commerce/ECommerceApi';

function RecentOrdersWidget() {
	const navigate = useNavigate();
	const { data: orders = [], isLoading } = useGetECommerceOrdersQuery();

	const recentOrders = orders.slice(0, 5);

	const getStatusChip = (statusList: { name: string; color?: string }[]) => {
		const status = statusList?.[0]?.name || 'Pending';
		switch (status.toLowerCase()) {
			case 'delivered':
				return <Chip size="small" label={status} color="success" variant="outlined" />;
			case 'shipped':
				return <Chip size="small" label={status} color="info" variant="outlined" />;
			case 'processing':
				return <Chip size="small" label={status} color="warning" variant="outlined" />;
			case 'cancelled':
				return <Chip size="small" label={status} color="error" variant="outlined" />;
			default:
				return <Chip size="small" label={status} color="default" variant="outlined" />;
		}
	};

	return (
		<Paper className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden p-24">
			<div className="flex items-center justify-between mb-16">
				<div>
					<Typography className="text-xl font-semibold tracking-tight">Recent Orders</Typography>
					<Typography color="text.secondary" className="text-sm">
						Latest transactions across all channels
					</Typography>
				</div>
				<Button
					component={Link}
					to="/apps/e-commerce/orders"
					variant="text"
					size="small"
					endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-narrow-right</FuseSvgIcon>}
				>
					View All
				</Button>
			</div>

			<div className="overflow-x-auto">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell className="font-semibold">Reference</TableCell>
							<TableCell className="font-semibold">Customer</TableCell>
							<TableCell className="font-semibold">Total</TableCell>
							<TableCell className="font-semibold">Status</TableCell>
							<TableCell className="font-semibold">Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{recentOrders.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" className="py-24 text-text-secondary">
									{isLoading ? 'Loading orders...' : 'No orders found.'}
								</TableCell>
							</TableRow>
						) : (
							recentOrders.map((order) => (
								<TableRow
									key={order.id}
									hover
									onClick={() => navigate(`/apps/e-commerce/orders/${order.id}`)}
									className="cursor-pointer"
								>
									<TableCell className="font-medium text-primary-main">
										#{order.reference || order.id.substring(0, 8).toUpperCase()}
									</TableCell>
									<TableCell>
										{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest'}
									</TableCell>
									<TableCell className="font-semibold">
										{Number(order.total).toLocaleString()} đ
									</TableCell>
									<TableCell>{getStatusChip(order.status)}</TableCell>
									<TableCell color="text.secondary" className="text-xs">
										{new Date(order.date).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</Paper>
	);
}

export default RecentOrdersWidget;
