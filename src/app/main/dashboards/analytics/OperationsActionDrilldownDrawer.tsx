import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export interface ActionCategory {
	id: string;
	label: string;
	count: number;
	subtitle?: string;
	color?: string;
	url?: string;
}

interface OperationsActionDrilldownDrawerProps {
	open: boolean;
	onClose: () => void;
	action: ActionCategory | null;
}

export default function OperationsActionDrilldownDrawer({
	open,
	onClose,
	action
}: OperationsActionDrilldownDrawerProps) {
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const [processedIds, setProcessedIds] = useState<string[]>([]);

	if (!action) return null;

	const handleQuickAction = (id: string, actionName: string, successMessage: string) => {
		setProcessedIds((prev) => [...prev, id]);
		enqueueSnackbar(successMessage, {
			variant: 'success',
			action: (key) => (
				<Button
					size="small"
					color="inherit"
					onClick={() => {
						setProcessedIds((prev) => prev.filter((item) => item !== id));
						enqueueSnackbar('Đã hoàn tác thao tác!', { variant: 'info' });
					}}
				>
					Hoàn tác
				</Button>
			)
		});
	};

	const renderItems = () => {
		if (action.id === 'op-pending') {
			const items = [
				{ id: 'ORD-9821', customer: 'Nguyễn Văn An', total: '₫450.000', channel: 'Web Store', time: '15 phút trước' },
				{ id: 'ORD-9822', customer: 'Trần Thị Mai', total: '₫1.250.000', channel: 'Shopee Mall', time: '32 phút trước' },
				{ id: 'ORD-9823', customer: 'Lê Hoàng Long', total: '₫780.000', channel: 'TikTok Shop', time: '1 giờ trước' }
			];

			return (
				<List className="p-0 flex flex-col gap-12">
					{items.map((item) => {
						const isDone = processedIds.includes(item.id);
						return (
							<Paper
								key={item.id}
								variant="outlined"
								sx={{
									p: 2,
									borderRadius: 2.5,
									opacity: isDone ? 0.5 : 1,
									transition: 'all 0.2s',
									bgcolor: isDone ? 'action.hover' : 'background.paper'
								}}
							>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
											#{item.id}
										</Typography>
										<Chip size="small" label={item.channel} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
									</Box>
									<Typography variant="caption" color="text.secondary">
										{item.time}
									</Typography>
								</Box>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>
									Khách hàng: {item.customer}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
									Tổng tiền: <strong>{item.total}</strong>
								</Typography>
								<Box sx={{ display: 'flex', gap: 1 }}>
									<Button
										size="small"
										variant="contained"
										color="primary"
										disabled={isDone}
										startIcon={<CheckCircleOutlineIcon />}
										onClick={() => handleQuickAction(item.id, 'confirm', `Đã xác nhận đơn hàng #${item.id} thành công!`)}
										data-testid={`quick-confirm-${item.id}`}
									>
										{isDone ? 'Đã Xác Nhận' : 'Xác Nhận Nhanh'}
									</Button>
									{isDone && (
										<Button
											size="small"
											variant="outlined"
											color="warning"
											onClick={() => {
												setProcessedIds((prev) => prev.filter((id) => id !== item.id));
												enqueueSnackbar('Đã hoàn tác xác nhận đơn hàng!', { variant: 'info' });
											}}
											data-testid={`undo-${item.id}`}
										>
											Hoàn tác
										</Button>
									)}
									<Button
										size="small"
										variant="outlined"
										onClick={() => {
											onClose();
											navigate('/apps/e-commerce/orders');
										}}
									>
										Chi Tiết
									</Button>
								</Box>
							</Paper>
						);
					})}
				</List>
			);
		}

		if (action.id === 'op-pack') {
			const items = [
				{ id: 'ORD-9819', desc: 'Áo Polo Nam + Quần Jean Slim', payment: 'Đã TT VNPay', total: '₫890.000' },
				{ id: 'ORD-9820', desc: '2x Áo Sơ Mi Oxford Trắng', payment: 'Đã TT MoMo', total: '₫1.100.000' }
			];

			return (
				<List className="p-0 flex flex-col gap-12">
					{items.map((item) => {
						const isDone = processedIds.includes(item.id);
						return (
							<Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5, opacity: isDone ? 0.5 : 1 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.main' }}>
										#{item.id}
									</Typography>
									<Chip size="small" label={item.payment} color="success" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
								</Box>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.desc}</Typography>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
									Giá trị: {item.total}
								</Typography>
								<Button
									size="small"
									variant="contained"
									color="info"
									disabled={isDone}
									startIcon={<PrintIcon />}
									onClick={() => handleQuickAction(item.id, 'print', `Đã in vận đơn mã #${item.id}!`)}
									data-testid={`quick-pack-${item.id}`}
								>
									{isDone ? 'Đã In Vận Đơn' : 'In Vận Đơn & Đóng Gói'}
								</Button>
							</Paper>
						);
					})}
				</List>
			);
		}

		if (action.id === 'op-lowstock') {
			const items = [
				{ id: 'PROD-01', name: 'Áo thun Polo nam cotton dệt tổ ong', sku: 'POLO-WHT-M', stock: 2, min: 15 },
				{ id: 'PROD-02', name: 'Quần âu nam co giãn dáng slimfit', sku: 'PANT-BLK-31', stock: 1, min: 20 },
				{ id: 'PROD-03', name: 'Áo sơ mi oxford trắng dài tay', sku: 'SHIRT-OXF-L', stock: 0, min: 30 }
			];

			return (
				<List className="p-0 flex flex-col gap-12">
					{items.map((item) => {
						const isDone = processedIds.includes(item.id);
						return (
							<Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5, opacity: isDone ? 0.5 : 1 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										{item.name}
									</Typography>
									<Chip
										size="small"
										label={`Tồn: ${item.stock}`}
										color={item.stock === 0 ? 'error' : 'warning'}
										sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
									/>
								</Box>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
									SKU: {item.sku} • Ngưỡng an toàn tối thiểu: {item.min} cái
								</Typography>
								<Button
									size="small"
									variant="contained"
									color="warning"
									disabled={isDone}
									startIcon={<AddShoppingCartIcon />}
									onClick={() => handleQuickAction(item.id, 'po', `Đã tạo lệnh nhập kho khẩn cấp cho ${item.sku}!`)}
									data-testid={`quick-po-${item.id}`}
								>
									{isDone ? 'Đã Tạo Lệnh PO' : 'Tạo Lệnh Nhập Kho (PO)'}
								</Button>
							</Paper>
						);
					})}
				</List>
			);
		}

		if (action.id === 'op-shipping') {
			const items = [
				{ id: 'SHIP-101', courier: 'Giao Hàng Nhanh (GHN)', code: 'GHN-89218491', status: 'Đang phát đến khách', time: '14:20 Hôm nay' },
				{ id: 'SHIP-102', courier: 'GHTK Tiết Kiệm', code: 'GHTK-99012384', status: 'Đang luân chuyển kho liên tỉnh', time: '11:05 Hôm nay' }
			];

			return (
				<List className="p-0 flex flex-col gap-12">
					{items.map((item) => (
						<Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<LocalShippingIcon color="primary" fontSize="small" />
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										{item.courier}
									</Typography>
								</Box>
								<Typography variant="caption" color="text.secondary">{item.time}</Typography>
							</Box>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>Mã vận đơn: {item.code}</Typography>
							<Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
								Trạng thái: {item.status}
							</Typography>
						</Paper>
					))}
				</List>
			);
		}

		if (action.id === 'op-return') {
			const items = [
				{ id: 'RET-001', order: 'ORD-9750', reason: 'Không vừa kích thước (muốn đổi size M -> L)', customer: 'Đỗ Thị Lan' },
				{ id: 'RET-002', order: 'ORD-9742', reason: 'Màu sắc thực tế không như ảnh (khiếu nại)', customer: 'Vũ Đức Thịnh' }
			];

			return (
				<List className="p-0 flex flex-col gap-12">
					{items.map((item) => {
						const isDone = processedIds.includes(item.id);
						return (
							<Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5, opacity: isDone ? 0.5 : 1 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<AssignmentReturnIcon color="error" fontSize="small" />
										<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
											Đổi trả: {item.order}
										</Typography>
									</Box>
								</Box>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>Khách hàng: {item.customer}</Typography>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block', my: 1 }}>
									Lý do: {item.reason}
								</Typography>
								<Button
									size="small"
									variant="contained"
									color="error"
									disabled={isDone}
									onClick={() => handleQuickAction(item.id, 'approve_return', `Đã duyệt yêu cầu đổi trả cho đơn ${item.order}!`)}
									data-testid={`quick-return-${item.id}`}
								>
									{isDone ? 'Đã Duyệt Đổi Trả' : 'Duyệt Đổi Trả Hàng'}
								</Button>
							</Paper>
						);
					})}
				</List>
			);
		}

		return null;
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 480 },
					p: 3,
					bgcolor: 'background.default'
				}
			}}
			data-testid="operations-drilldown-drawer"
		>
			{/* Drawer Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							{action.label}
						</Typography>
						<Chip
							label={action.count}
							size="small"
							sx={{ bgcolor: action.color || 'primary.main', color: '#fff', fontWeight: 800 }}
						/>
					</Box>
					<Typography variant="caption" color="text.secondary">
						{action.subtitle || 'Danh sách tác vụ cần giải quyết ngay'}
					</Typography>
				</Box>
				<IconButton onClick={onClose} size="small" data-testid="close-drilldown-drawer-btn">
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			<Divider sx={{ mb: 2.5 }} />

			{/* Item List */}
			<Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
				{renderItems()}
			</Box>

			<Divider sx={{ my: 2 }} />

			{/* Drawer Footer Actions */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Button
					color="inherit"
					size="small"
					onClick={onClose}
				>
					Đóng
				</Button>
				<Button
					variant="text"
					size="small"
					endIcon={<OpenInNewIcon fontSize="small" />}
					onClick={() => {
						onClose();
						if (action.url) navigate(action.url);
					}}
					sx={{ fontWeight: 700 }}
				>
					Mở Bảng Đầy Đủ
				</Button>
			</Box>
		</Drawer>
	);
}
