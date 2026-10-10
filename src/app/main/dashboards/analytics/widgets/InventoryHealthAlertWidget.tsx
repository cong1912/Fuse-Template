import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useSnackbar } from 'notistack';

const criticalItems = [
	{ id: 'item-1', name: 'Áo thun Polo nam cotton dệt tổ ong', sku: 'POLO-RED-M', warehouse: 'Kho Tân Bình (HCM)', stock: 3, dailySales: 12, daysLeft: '0.2 ngày (Sắp hết)', severity: 'critical' },
	{ id: 'item-2', name: 'Quần âu nam co giãn dáng slimfit', sku: 'PANT-BLK-32', warehouse: 'Kho Cầu Giấy (Hà Nội)', stock: 4, dailySales: 8, daysLeft: '0.5 ngày (Sắp hết)', severity: 'critical' },
	{ id: 'item-3', name: 'Áo sơ mi oxford trắng dài tay', sku: 'SHIRT-WHT-L', warehouse: 'Kho Tân Bình (HCM)', stock: 0, dailySales: 15, daysLeft: 'Đã hết hàng', severity: 'out' },
	{ id: 'item-4', name: 'Thắt lưng da bò nguyên tấm khóa kim', sku: 'BELT-BRN-01', warehouse: 'Kho Hải Châu (Đà Nẵng)', stock: 5, dailySales: 6, daysLeft: '0.8 ngày', severity: 'warning' }
];

export default function InventoryHealthAlertWidget() {
	const { enqueueSnackbar } = useSnackbar();
	const [processingIds, setProcessingIds] = React.useState<string[]>([]);

	const handleCreatePo = (id: string, name: string) => {
		if (processingIds.includes(id)) {
			return;
		}
		setProcessingIds((prev) => [...prev, id]);
		enqueueSnackbar(`Đã tạo lệnh nhập hàng khẩn cấp (Purchase Order) cho "${name}" gửi đến Nhà Cung Cấp!`, { variant: 'success' });
		setTimeout(() => {
			setProcessingIds((prev) => prev.filter((x) => x !== id));
		}, 1500);
	};

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 3,
				borderRadius: 3,
				boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
				bgcolor: 'background.paper',
				display: 'flex',
				flexDirection: 'column',
				gap: 2
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1 }}>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<WarehouseIcon className="text-orange-500" />
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Sức Khỏe Tồn Kho & Cảnh Báo Cháy Hàng (Inventory Health Alert)
						</Typography>
						<Chip label="4 Mặt Hàng Nguy Cấp" color="error" size="small" sx={{ fontWeight: 700, height: 22 }} />
					</Box>
					<Typography variant="body2" color="text.secondary">
						Các mặt hàng có tốc độ bán nhanh chạm ngưỡng cạn kho cần bổ sung khẩn cấp để tránh gián đoạn đơn hàng
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
					<Box sx={{ textAlign: 'right' }}>
						<Typography variant="caption" color="text.secondary">Tỷ lệ kho an toàn</Typography>
						<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>92.4%</Typography>
					</Box>
					<Box sx={{ textAlign: 'right' }}>
						<Typography variant="caption" color="text.secondary">Tổng tồn toàn chuỗi</Typography>
						<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>12.450 Cái</Typography>
					</Box>
				</Box>
			</Box>

			{/* Critical Items Table */}
			<TableContainer>
				<Table size="small">
					<TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Sản Phẩm & Mã SKU</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Vị Trí Kho Hàng</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Tồn Hiện Tại</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Tốc Độ Bán / Ngày</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Thời Gian Còn Lại</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Hành Động</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{criticalItems.map((item) => (
							<TableRow key={item.id} hover>
								<TableCell>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
									<Typography variant="caption" color="text.secondary">SKU: {item.sku}</Typography>
								</TableCell>
								<TableCell>
									<Chip label={item.warehouse} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
								</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 800,
											color: item.stock === 0 ? 'error.main' : item.stock <= 3 ? 'error.main' : 'warning.main'
										}}
									>
										{item.stock} cái
									</Typography>
								</TableCell>
								<TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
									~{item.dailySales} cái/ngày
								</TableCell>
								<TableCell>
									<Chip
										label={item.daysLeft}
										size="small"
										color={item.severity === 'out' ? 'error' : item.severity === 'critical' ? 'error' : 'warning'}
										sx={{ fontWeight: 700, fontSize: '0.7rem' }}
									/>
								</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>
									<Button
										size="small"
										variant="contained"
										color="primary"
										disabled={processingIds.includes(item.id)}
										startIcon={<AddShoppingCartIcon fontSize="small" />}
										onClick={() => handleCreatePo(item.id, item.name)}
										sx={{ fontSize: '0.75rem', textTransform: 'none', py: 0.5 }}
									>
										{processingIds.includes(item.id) ? 'Đang tạo...' : 'Tạo Lệnh Nhập (PO)'}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
	);
}
