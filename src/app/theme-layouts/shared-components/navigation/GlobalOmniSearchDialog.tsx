import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import { useNavigate } from 'react-router-dom';
import { useGetECommerceProductsQuery, useGetECommerceOrdersQuery } from 'src/app/main/apps/e-commerce/ECommerceApi';

interface GlobalOmniSearchDialogProps {
	open: boolean;
	onClose: () => void;
}

const quickActions = [
	{ id: 'act-new-prod', title: 'Tạo sản phẩm mới', subtitle: 'Thêm sản phẩm và ma trận biến thể mới', url: '/apps/e-commerce/products/new', icon: <AddCircleOutlineIcon className="text-blue-500" />, category: 'Tác Vụ Nhanh' },
	{ id: 'act-orders', title: 'Xem danh sách đơn hàng', subtitle: 'Quản lý xử lý đơn hàng và giao vận', url: '/apps/e-commerce/orders', icon: <ReceiptLongIcon className="text-emerald-500" />, category: 'Tác Vụ Nhanh' },
	{ id: 'act-promotions', title: 'Trung tâm Kịch bản Khuyến Mãi', subtitle: 'Cấu hình playbook kích cầu doanh số & voucher', url: '/apps/e-commerce/promotions', icon: <CampaignIcon className="text-purple-500" />, category: 'Tác Vụ Nhanh' },
	{ id: 'act-domain', title: 'Cài đặt Tên miền (Custom Domain)', subtitle: 'Cấu hình subdomain và kết nối tên miền riêng', url: '/settings/domain', icon: <LanguageIcon className="text-teal-500" />, category: 'Tác Vụ Nhanh' },
	{ id: 'act-admin-domains', title: 'Quản lý Tên miền Toàn Sàn', subtitle: 'SuperAdmin kiểm soát DNS và custom giúp gian hàng', url: '/platform/domains', icon: <PublicIcon className="text-cyan-500" />, category: 'Tác Vụ Nhanh' },
	{ id: 'act-payout', title: 'Tài khoản Ngân hàng & Payout', subtitle: 'Quản lý thẻ nhận tiền rút tiền doanh thu', url: '/account/profile', icon: <AccountBalanceIcon className="text-amber-500" />, category: 'Tác Vụ Nhanh' },
	{ id: 'act-analytics', title: 'Báo cáo Doanh thu & Phân tích', subtitle: 'Xem biểu đồ tăng trưởng và RFM khách hàng', url: '/dashboards/analytics', icon: <AssessmentIcon className="text-indigo-500" />, category: 'Tác Vụ Nhanh' },
];

export default function GlobalOmniSearchDialog({ open, onClose }: GlobalOmniSearchDialogProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);

	const { data: products = [] } = useGetECommerceProductsQuery();
	const { data: orders = [] } = useGetECommerceOrdersQuery();

	useEffect(() => {
		if (open) {
			setSearchTerm('');
			setSelectedIndex(0);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [open]);

	const filteredResults = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		// Quick actions
		const actions = quickActions.filter(a =>
			!term || a.title.toLowerCase().includes(term) || a.subtitle.toLowerCase().includes(term)
		);

		// Products
		const prods = (products as any[])
			.filter(p => !term || p.name?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term))
			.slice(0, 5)
			.map(p => ({
				id: `prod-${p.id}`,
				title: p.name,
				subtitle: `SKU: ${p.sku || 'N/A'} • ₫${Number(p.price || 0).toLocaleString('vi-VN')} • Tồn: ${p.stockQuantity ?? p.totalStock ?? 100}`,
				url: `/apps/e-commerce/products/${p.id}`,
				icon: <ShoppingBagIcon className="text-indigo-500" />,
				category: 'Sản Phẩm'
			}));

		// Orders
		const ords = (orders as any[])
			.filter(o => !term || String(o.id || '').toLowerCase().includes(term) || o.customer?.firstName?.toLowerCase().includes(term) || o.customer?.lastName?.toLowerCase().includes(term))
			.slice(0, 4)
			.map(o => ({
				id: `ord-${o.id}`,
				title: `Đơn hàng #${String(o.id).slice(0, 8).toUpperCase()}`,
				subtitle: `Khách: ${o.customer?.firstName || ''} ${o.customer?.lastName || 'Khách lẻ'} • Tổng: ₫${Number(o.total || o.subtotal || 0).toLocaleString('vi-VN')}`,
				url: `/apps/e-commerce/orders/${o.id}`,
				icon: <ReceiptLongIcon className="text-emerald-500" />,
				category: 'Đơn Hàng'
			}));

		return [...actions, ...prods, ...ords];
	}, [searchTerm, products, orders]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex(prev => (prev + 1 < filteredResults.length ? prev + 1 : 0));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const selected = filteredResults[selectedIndex];
			if (selected) {
				navigate(selected.url);
				onClose();
			}
		} else if (e.key === 'Escape') {
			onClose();
		}
	};

	const handleSelect = (url: string) => {
		navigate(url);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					overflow: 'hidden',
					top: -50,
					boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)'
				}
			}}
		>
			<DialogContent sx={{ p: 0 }}>
				<Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
					<TextField
						inputRef={inputRef}
						fullWidth
						variant="standard"
						placeholder="Tìm kiếm sản phẩm, đơn hàng, tác vụ nhanh... (Ctrl + K)"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setSelectedIndex(0);
						}}
						onKeyDown={handleKeyDown}
						InputProps={{
							disableUnderline: true,
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon className="text-gray-400 mr-1" />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<Chip label="ESC để đóng" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
								</InputAdornment>
							)
						}}
						sx={{ '& input': { fontSize: '1.1rem', py: 0.5 } }}
					/>
				</Box>

				<Box sx={{ maxHeight: 420, overflowY: 'auto', p: 1 }}>
					{filteredResults.length === 0 ? (
						<Box sx={{ py: 6, textAlign: 'center' }}>
							<Typography color="text.secondary">Không tìm thấy kết quả nào phù hợp với "{searchTerm}"</Typography>
						</Box>
					) : (
						<List dense disablePadding>
							{filteredResults.map((item, idx) => (
								<ListItemButton
									key={item.id}
									selected={idx === selectedIndex}
									onClick={() => handleSelect(item.url)}
									sx={{
										borderRadius: 2,
										my: 0.5,
										px: 2,
										py: 1.2,
										'&.Mui-selected': {
											backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.08)',
											borderLeft: '4px solid #6366f1'
										}
									}}
								>
									<ListItemIcon sx={{ minWidth: 40 }}>
										{item.icon}
									</ListItemIcon>
									<ListItemText
										primary={
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
													{item.title}
												</Typography>
												<Chip
													label={item.category}
													size="small"
													sx={{ height: 18, fontSize: '0.65rem', opacity: 0.8 }}
												/>
											</Box>
										}
										secondary={item.subtitle}
										secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
									/>
								</ListItemButton>
							))}
						</List>
					)}
				</Box>

				<Box sx={{ p: 1.5, bg: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Typography variant="caption" color="text.secondary">
							↑↓ Điều hướng
						</Typography>
						<Typography variant="caption" color="text.secondary">
							↵ Chọn kết quả
						</Typography>
					</Box>
					<Typography variant="caption" color="text.secondary">
						Omnisearch Command Palette
					</Typography>
				</Box>
			</DialogContent>
		</Dialog>
	);
}
