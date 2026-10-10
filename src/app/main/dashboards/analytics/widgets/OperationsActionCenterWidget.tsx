import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useGetOrderStatusSummaryQuery } from '../AnalyticsDashboardApi';

interface OperationsActionCenterWidgetProps {
	onSelectAction?: (item: any) => void;
}

export default function OperationsActionCenterWidget({ onSelectAction }: OperationsActionCenterWidgetProps) {
	const navigate = useNavigate();
	const { data: statusSummary } = useGetOrderStatusSummaryQuery();

	const pendingCount = statusSummary?.pending !== undefined ? statusSummary.pending : 12;
	const packCount = statusSummary?.processing !== undefined ? statusSummary.processing : 8;
	const shippingCount = statusSummary?.shipped !== undefined ? statusSummary.shipped : 15;
	const returnCount = statusSummary?.refunded !== undefined ? statusSummary.refunded : 2;
	const lowStockCount = 4;

	const operationsItems = [
		{ id: 'op-pending', label: 'Chờ Xác Nhận', count: pendingCount, subtitle: 'Đơn mới từ Web & Sàn', icon: <AssignmentTurnedInIcon className="text-amber-500" />, color: '#f59e0b', url: '/apps/e-commerce/orders' },
		{ id: 'op-pack', label: 'Chờ Đóng Gói', count: packCount, subtitle: 'Đã thanh toán / In vận đơn', icon: <InventoryIcon className="text-blue-500" />, color: '#3b82f6', url: '/apps/e-commerce/orders' },
		{ id: 'op-shipping', label: 'Đang Giao Vận', count: shippingCount, subtitle: 'Shipper GHN/GHTK đang phát', icon: <LocalShippingIcon className="text-indigo-500" />, color: '#6366f1', url: '/apps/e-commerce/orders' },
		{ id: 'op-return', label: 'Đổi Trả / Khiếu Nại', count: returnCount, subtitle: 'Cần xử lý trong 24h', icon: <AssignmentReturnIcon className="text-rose-500" />, color: '#f43f5e', url: '/apps/e-commerce/orders' },
		{ id: 'op-lowstock', label: 'Cảnh Báo Hết Hàng', count: lowStockCount, subtitle: 'Sản phẩm tồn < 5 cái', icon: <WarningAmberIcon className="text-orange-500" />, color: '#ea580c', url: '/apps/e-commerce/products' }
	];

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 3,
				borderRadius: 3,
				bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.04)' : '#ffffff',
				boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1, mb: 2.5 }}>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<CheckCircleOutlineIcon className="text-emerald-500" />
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Trung Tâm Tác Vụ Vận Hành (Operations Action Center)
						</Typography>
						<Chip label="Real-time" color="success" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
					</Box>
					<Typography variant="body2" color="text.secondary">
						Danh sách công việc ưu tiên cần nhân viên kho và điều phối xử lý ngay hôm nay
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="caption" color="text.secondary">
						SLA Xử lý đơn trong ngày: <strong>96.8%</strong>
					</Typography>
					<Box sx={{ width: 80 }}>
						<LinearProgress variant="determinate" value={96.8} color="success" sx={{ height: 6, borderRadius: 3 }} />
					</Box>
				</Box>
			</Box>

			{/* 5 Action Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
				{operationsItems.map((item) => (
					<Box
						key={item.id}
						onClick={() => onSelectAction ? onSelectAction(item) : navigate(item.url)}
						data-testid={`action-card-${item.id}`}
						sx={{
							p: 2,
							borderRadius: 2.5,
							border: 1,
							borderColor: 'divider',
							bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
							cursor: 'pointer',
							transition: 'all 0.2s',
							'&:hover': {
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
								borderColor: item.color
							}
						}}
					>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
								{item.label}
							</Typography>
							{item.icon}
						</Box>

						<Typography variant="h4" sx={{ fontWeight: 800, color: item.color, mb: 0.5 }}>
							{item.count}
						</Typography>

						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
							{item.subtitle}
						</Typography>
					</Box>
				))}
			</Box>
		</Paper>
	);
}
