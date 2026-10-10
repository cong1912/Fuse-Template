import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import SyncIcon from '@mui/icons-material/Sync';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageIcon from '@mui/icons-material/Language';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

interface CustomerRecord {
	id: string;
	name: string;
	phone: string;
	email: string;
	source: 'Web' | 'Shopee' | 'TikTok' | 'POS';
	rfmSegment: 'VIP' | 'Loyal' | 'AtRisk' | 'New';
	orderCount: number;
	totalSpent: number;
	lastPurchase: string;
}

const mockCustomers: CustomerRecord[] = [
	{ id: 'c-1', name: 'Nguyễn Minh Tú', phone: '0912 345 678', email: 'minhtu.nguyen@gmail.com', source: 'Web', rfmSegment: 'VIP', orderCount: 12, totalSpent: 14850000, lastPurchase: 'Hôm nay 09:30' },
	{ id: 'c-2', name: 'Trần Thị Thu Thảo', phone: '0988 123 456', email: 'thuthao.tran@gmail.com', source: 'Shopee', rfmSegment: 'VIP', orderCount: 8, totalSpent: 8600000, lastPurchase: 'Hôm qua 18:20' },
	{ id: 'c-3', name: 'Lê Hoàng Nam', phone: '0903 888 999', email: 'hoangnam.le@yahoo.com', source: 'TikTok', rfmSegment: 'Loyal', orderCount: 5, totalSpent: 4200000, lastPurchase: '3 ngày trước' },
	{ id: 'c-4', name: 'Phạm Quỳnh Anh', phone: '0977 456 789', email: 'quynhanh.pham@outlook.com', source: 'Web', rfmSegment: 'Loyal', orderCount: 4, totalSpent: 3890000, lastPurchase: '5 ngày trước' },
	{ id: 'c-5', name: 'Đỗ Mạnh Cường', phone: '0918 666 777', email: 'manhcuong.do@gmail.com', source: 'Shopee', rfmSegment: 'AtRisk', orderCount: 6, totalSpent: 6200000, lastPurchase: '95 ngày trước' },
	{ id: 'c-6', name: 'Vũ Bích Ngọc', phone: '0934 112 233', email: 'bichngoc.vu@gmail.com', source: 'TikTok', rfmSegment: 'New', orderCount: 1, totalSpent: 350000, lastPurchase: 'Hôm nay 11:15' },
	{ id: 'c-7', name: 'Bùi Gia Huy', phone: '0965 334 455', email: 'giahuy.bui@gmail.com', source: 'Web', rfmSegment: 'New', orderCount: 1, totalSpent: 680000, lastPurchase: 'Hôm qua 15:40' }
];

export default function CustomersReportPage() {
	const { enqueueSnackbar } = useSnackbar();
	const [activeTab, setActiveTab] = useState(0);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [importFile, setImportFile] = useState<string>('');

	const handleSyncNow = () => {
		setIsSyncing(true);
		setTimeout(() => {
			setIsSyncing(false);
			enqueueSnackbar('Đã đồng bộ thành công dữ liệu từ Web Store, Shopee và TikTok Shop! Thêm 18 khách hàng mới.', { variant: 'success' });
		}, 1200);
	};

	const handleImport = () => {
		setIsImportOpen(false);
		enqueueSnackbar('Đã nhập thành công danh sách khách hàng từ file! Đã cập nhật 120 khách hàng.', { variant: 'success' });
	};

	const filteredCustomers = mockCustomers.filter((c) => {
		if (activeTab === 1) return c.rfmSegment === 'VIP';
		if (activeTab === 2) return c.rfmSegment === 'Loyal';
		if (activeTab === 3) return c.rfmSegment === 'AtRisk';
		if (activeTab === 4) return c.rfmSegment === 'New';
		return true;
	});

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'col', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Trung Tâm Quản Lý & Đồng Bộ Khách Hàng (Customer CRM & Sync Hub)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Hợp nhất dữ liệu khách hàng đa kênh: Web Store, Sàn Shopee, TikTok Shop và Phân khúc RFM tự động
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
					<Button
						variant="outlined"
						startIcon={<UploadFileIcon />}
						onClick={() => setIsImportOpen(true)}
					>
						Nhập File (Excel/CSV)
					</Button>
					<Button
						variant="contained"
						color="primary"
						startIcon={isSyncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
						onClick={handleSyncNow}
						disabled={isSyncing}
						sx={{ px: 2.5 }}
					>
						{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay Bây Giờ'}
					</Button>
				</Box>
			</Box>

			{/* 4 Multi-channel Sync Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
				{/* Web Store */}
				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #6366f1' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<LanguageIcon className="text-indigo-500" />
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Kênh Web Store</Typography>
						</Box>
						<Chip label="Realtime" color="success" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 800 }}>1.240 Khách</Typography>
					<Typography variant="caption" color="text.secondary">Tự động gắn qua Checkout & Khử trùng SĐT</Typography>
				</Paper>

				{/* Shopee */}
				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #ee4d2d' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<StorefrontIcon sx={{ color: '#ee4d2d' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Kênh Shopee</Typography>
						</Box>
						<Chip label="n8n Webhook" color="primary" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 800 }}>856 Khách</Typography>
					<Typography variant="caption" color="text.secondary">Lần đồng bộ gần nhất: 15 phút trước</Typography>
				</Paper>

				{/* TikTok Shop */}
				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #000000' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<MusicNoteIcon />
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>TikTok Shop</Typography>
						</Box>
						<Chip label="n8n Webhook" color="primary" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 800 }}>420 Khách</Typography>
					<Typography variant="caption" color="text.secondary">Lần đồng bộ gần nhất: 30 phút trước</Typography>
				</Paper>

				{/* POS / Offline */}
				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #10b981' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<PointOfSaleIcon className="text-emerald-500" />
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>POS Tại Quầy</Typography>
						</Box>
						<Chip label="Sẵn sàng" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 800 }}>Sẵn Sàng</Typography>
					<Typography variant="caption" color="text.secondary">Hỗ trợ nhập Excel / CSV từ KiotViet, Sapo</Typography>
				</Paper>
			</Box>

			{/* Main Customer List & RFM Segmentation */}
			<Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
				{/* RFM Tabs */}
				<Box sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
					<Tabs
						value={activeTab}
						onChange={(_, val) => setActiveTab(val)}
						variant="scrollable"
						scrollButtons="auto"
						sx={{ minHeight: 48 }}
					>
						<Tab label="Tất cả (2.516)" />
						<Tab label="⭐ VIP / Champions (215)" />
						<Tab label="💎 Thân Thiết (680)" />
						<Tab label="⚠️ Nguy Cơ Rời Bỏ (180)" />
						<Tab label="🌱 Khách Mới (1.441)" />
					</Tabs>
				</Box>

				{/* Customers Table */}
				<TableContainer>
					<Table>
						<TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700 }}>Khách Hàng</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Nguồn Kênh</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Phân Khúc RFM</TableCell>
								<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Số Đơn</TableCell>
								<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Tổng Chi Tiêu (LTV)</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Mua Gần Nhất</TableCell>
								<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Hành Động</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredCustomers.map((c) => (
								<TableRow key={c.id} hover>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											<Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.light', fontWeight: 700, fontSize: '0.9rem' }}>
												{c.name[0]}
											</Avatar>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
												<Typography variant="caption" color="text.secondary">{c.phone} • {c.email}</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell>
										<Chip
											label={c.source}
											size="small"
											color={c.source === 'Web' ? 'primary' : c.source === 'Shopee' ? 'warning' : 'default'}
											variant="outlined"
											sx={{ fontWeight: 600 }}
										/>
									</TableCell>
									<TableCell>
										{c.rfmSegment === 'VIP' && (
											<Chip label="⭐ VIP Champion" color="success" size="small" sx={{ fontWeight: 700 }} />
										)}
										{c.rfmSegment === 'Loyal' && (
											<Chip label="💎 Thân Thiết" color="primary" size="small" sx={{ fontWeight: 600 }} />
										)}
										{c.rfmSegment === 'AtRisk' && (
											<Chip label="⚠️ Cần Kéo Lại" color="error" size="small" sx={{ fontWeight: 600 }} />
										)}
										{c.rfmSegment === 'New' && (
											<Chip label="🌱 Khách Mới" size="small" sx={{ fontWeight: 500 }} />
										)}
									</TableCell>
									<TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
										{c.orderCount}
									</TableCell>
									<TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
										₫{c.totalSpent.toLocaleString('vi-VN')}
									</TableCell>
									<TableCell sx={{ fontSize: '0.85rem' }}>
										{c.lastPurchase}
									</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>
										<Button
											size="small"
											variant="text"
											startIcon={<LocalOfferIcon fontSize="small" />}
											onClick={() => enqueueSnackbar(`Đã gửi voucher tri ân tới ${c.name}`, { variant: 'info' })}
										>
											Tặng Mã
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Import Modal */}
			<Dialog open={isImportOpen} onClose={() => setIsImportOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>
					Nhập Danh Sách Khách Hàng (Excel / CSV)
				</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Hỗ trợ file xuất danh bạ khách hàng từ KiotViet, Sapo, Haravan, Shopify hoặc file Excel chuẩn:
					</Typography>
					<Box sx={{ p: 3, border: '2px dashed #cbd5e1', borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc', cursor: 'pointer' }}>
						<UploadFileIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
						<Typography variant="body2" sx={{ fontWeight: 600 }}>
							Kéo thả file CSV / Excel vào đây, hoặc click để duyệt file
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 50.000 dòng / lần)
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setIsImportOpen(false)} color="inherit">
						Hủy bỏ
					</Button>
					<Button onClick={handleImport} variant="contained" color="primary">
						Tiến Hành Nhập Dữ Liệu
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
