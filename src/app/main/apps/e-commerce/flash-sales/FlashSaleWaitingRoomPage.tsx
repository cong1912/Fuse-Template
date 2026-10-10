import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { showMessage } from '@fuse/core/FuseMessage/store/fuseMessageSlice';
import {
	useGetFlashSalesQuery,
	useAdmitWaitingRoomBatchMutation,
	useCreateFlashSaleMutation,
	useAddFlashSaleItemMutation,
	useAddFlashSaleItemsBatchMutation,
	useRemoveFlashSaleItemMutation,
	FlashSaleDto
} from './FlashSaleApi';
import {
	useGetECommerceProductsQuery,
	useGetECommerceCategoriesQuery,
	EcommerceProduct
} from '../ECommerceApi';

interface BulkProductRow {
	productId: string;
	productName: string;
	sku: string;
	originalPrice: number;
	discountPrice: number;
	discountPercent: number;
	stockLimit: number;
	selected: boolean;
	image?: string;
}

function FlashSaleWaitingRoomPage() {
	const dispatch = useDispatch();
	const { data: sales = [], isLoading, error, refetch } = useGetFlashSalesQuery();
	const { data: products = [] } = useGetECommerceProductsQuery();
	const { data: categories = [] } = useGetECommerceCategoriesQuery();

	const [admitBatch, { isLoading: isAdmitting }] = useAdmitWaitingRoomBatchMutation();
	const [createFlashSale, { isLoading: isCreating }] = useCreateFlashSaleMutation();
	const [addFlashSaleItemsBatch, { isLoading: isBatchAdding }] = useAddFlashSaleItemsBatchMutation();
	const [removeFlashSaleItem, { isLoading: isRemoving }] = useRemoveFlashSaleItemMutation();

	const [selectedSale, setSelectedSale] = useState<FlashSaleDto | null>(null);
	const [admitSuccessMsg, setAdmitSuccessMsg] = useState<string | null>(null);

	// Create Sale Dialog State
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [campaignName, setCampaignName] = useState('');
	const [campaignDesc, setCampaignDesc] = useState('');
	const [startsAt, setStartsAt] = useState(() => {
		const d = new Date();
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
	});
	const [endsAt, setEndsAt] = useState(() => {
		const d = new Date(Date.now() + 24 * 3600 * 1000);
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
	});

	// Modern Multi-Product & Category Bulk Dialog State
	const [openAddModal, setOpenAddModal] = useState(false);
	const [modalTab, setModalTab] = useState(0); // 0: By Category, 1: Multi-Product Picker

	// Tab 0: Bulk by Category state
	const [selectedCategoryId, setSelectedCategoryId] = useState('');
	const [discountType, setDiscountType] = useState<'percent' | 'fixed' | 'flat'>('percent');
	const [discountValue, setDiscountValue] = useState<number>(30); // 30% default
	const [categoryDefaultStockLimit, setCategoryDefaultStockLimit] = useState<number>(50);
	const [categoryPreviewRows, setCategoryPreviewRows] = useState<BulkProductRow[]>([]);

	// Tab 1: Multi-Product Picker state
	const [searchQuery, setSearchQuery] = useState('');
	const [filterCatId, setFilterCatId] = useState('');
	const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
	const [pickerDiscountPercent, setPickerDiscountPercent] = useState<number>(30);
	const [pickerStockLimit, setPickerStockLimit] = useState<number>(50);

	const activeSale = (selectedSale && sales.find((s) => s.id === selectedSale.id)) || (sales.length > 0 ? sales[0] : null);

	// Map product counts per category
	const categoryProductCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		products.forEach((p) => {
			const catId = (p.categories && p.categories[0]) || (p as any).categoryId;
			if (catId) {
				counts[catId] = (counts[catId] || 0) + 1;
			}
		});
		return counts;
	}, [products]);

	// Filter products when category changes in Tab 0
	useEffect(() => {
		if (!selectedCategoryId) {
			setCategoryPreviewRows([]);
			return;
		}

		const matched = products.filter((p) => {
			if (p.categories && p.categories.includes(selectedCategoryId)) return true;
			if ((p as any).categoryId === selectedCategoryId) return true;
			return false;
		});

		const rows: BulkProductRow[] = matched.map((p) => {
			const orig = p.priceTaxIncl || Number((p as any).price) || 100000;
			let disc = Math.round(orig * 0.7); // 30% off
			if (disc >= orig) disc = Math.round(orig * 0.9);
			return {
				productId: p.id,
				productName: p.name,
				sku: (p as any).sku || `SKU-${p.id.substring(0, 6).toUpperCase()}`,
				originalPrice: orig,
				discountPrice: disc,
				discountPercent: Math.round((1 - disc / orig) * 100),
				stockLimit: categoryDefaultStockLimit,
				selected: true,
				image: p.images?.[0]?.url
			};
		});

		setCategoryPreviewRows(rows);
	}, [selectedCategoryId, products]);

	// Recalculate preview rows with bulk formula
	const handleApplyCategoryFormula = () => {
		if (categoryPreviewRows.length === 0) return;

		setCategoryPreviewRows((prev) =>
			prev.map((row) => {
				const orig = row.originalPrice;
				let disc = orig;

				if (discountType === 'percent') {
					const pct = Math.min(99, Math.max(1, discountValue));
					disc = Math.round(orig * (1 - pct / 100));
				} else if (discountType === 'fixed') {
					disc = Math.max(1000, orig - discountValue);
				} else if (discountType === 'flat') {
					disc = Math.min(orig - 1000, discountValue);
				}

				if (disc >= orig) {
					disc = Math.round(orig * 0.9);
				}
				if (disc <= 0) {
					disc = Math.max(1000, Math.round(orig * 0.5));
				}

				const pct = Math.round((1 - disc / orig) * 100);

				return {
					...row,
					discountPrice: disc,
					discountPercent: pct,
					stockLimit: categoryDefaultStockLimit > 0 ? categoryDefaultStockLimit : row.stockLimit
				};
			})
		);

		dispatch(showMessage({ message: `Đã áp dụng công thức giảm giá cho ${categoryPreviewRows.length} sản phẩm`, variant: 'success' }));
	};

	// Toggle row selection in Tab 0
	const handleToggleCategoryRow = (prodId: string) => {
		setCategoryPreviewRows((prev) =>
			prev.map((r) => (r.productId === prodId ? { ...r, selected: !r.selected } : r))
		);
	};

	const handleToggleAllCategoryRows = (checked: boolean) => {
		setCategoryPreviewRows((prev) => prev.map((r) => ({ ...r, selected: checked })));
	};

	// Edit individual row in Tab 0
	const handleUpdateRowField = (prodId: string, field: 'discountPrice' | 'stockLimit', val: number) => {
		setCategoryPreviewRows((prev) =>
			prev.map((r) => {
				if (r.productId !== prodId) return r;
				if (field === 'discountPrice') {
					const disc = Math.min(r.originalPrice - 1000, Math.max(1000, val));
					const pct = Math.round((1 - disc / r.originalPrice) * 100);
					return { ...r, discountPrice: disc, discountPercent: pct };
				}
				return { ...r, stockLimit: Math.max(1, val) };
			})
		);
	};

	// Submit Tab 0: Bulk by Category
	const handleSubmitCategoryBulk = async () => {
		if (!activeSale) return;

		const selectedRows = categoryPreviewRows.filter((r) => r.selected);
		if (selectedRows.length === 0) {
			dispatch(showMessage({ message: 'Vui lòng chọn ít nhất 1 sản phẩm để thêm', variant: 'warning' }));
			return;
		}

		try {
			const itemsPayload = selectedRows.map((r) => ({
				productId: r.productId,
				discountPrice: r.discountPrice,
				currency: 'VND',
				stockLimit: r.stockLimit
			}));

			const res = await addFlashSaleItemsBatch({
				flashSaleId: activeSale.id,
				items: itemsPayload
			}).unwrap();

			dispatch(showMessage({ message: `Thêm thành công ${res} sản phẩm vào chiến dịch Flash Sale!`, variant: 'success' }));
			setOpenAddModal(false);
			await refetch();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.data?.detail || err?.data?.message || 'Có lỗi khi thêm sản phẩm hàng loạt', variant: 'error' }));
		}
	};

	// Submit Tab 1: Multi-Product Picker
	const handleSubmitPicker = async () => {
		if (!activeSale) return;
		if (selectedProductIds.length === 0) {
			dispatch(showMessage({ message: 'Vui lòng chọn ít nhất 1 sản phẩm', variant: 'warning' }));
			return;
		}

		try {
			const itemsPayload = selectedProductIds.map((id) => {
				const prod = products.find((p) => p.id === id);
				const orig = prod?.priceTaxIncl || Number((prod as any)?.price) || 100000;
				let disc = Math.round(orig * (1 - pickerDiscountPercent / 100));
				if (disc >= orig) disc = Math.round(orig * 0.9);
				if (disc <= 0) disc = 1000;

				return {
					productId: id,
					discountPrice: disc,
					currency: 'VND',
					stockLimit: pickerStockLimit > 0 ? pickerStockLimit : 50
				};
			});

			const res = await addFlashSaleItemsBatch({
				flashSaleId: activeSale.id,
				items: itemsPayload
			}).unwrap();

			dispatch(showMessage({ message: `Thêm thành công ${res} sản phẩm vào Flash Sale!`, variant: 'success' }));
			setOpenAddModal(false);
			setSelectedProductIds([]);
			await refetch();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.data?.detail || 'Có lỗi khi thêm sản phẩm', variant: 'error' }));
		}
	};

	// Remove item from active sale
	const handleRemoveItem = async (itemId: string) => {
		if (!activeSale) return;
		try {
			await removeFlashSaleItem({ flashSaleId: activeSale.id, itemId }).unwrap();
			dispatch(showMessage({ message: 'Đã xóa sản phẩm khỏi chiến dịch Flash Sale', variant: 'info' }));
			await refetch();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.data?.detail || 'Không thể xóa sản phẩm', variant: 'error' }));
		}
	};

	const handleAdmit = async (saleId: string, count: number) => {
		try {
			const res = await admitBatch({ flashSaleId: saleId, batchSize: count, ttlMinutes: 5 }).unwrap();
			setAdmitSuccessMsg(`Cho phép ${res.admittedCount} người dùng vào thanh toán thành công!`);
			setTimeout(() => setAdmitSuccessMsg(null), 4000);
			refetch();
		} catch (e: any) {
			dispatch(showMessage({ message: e?.data?.detail || 'Không thể cấp quyền vào hàng đợi', variant: 'error' }));
		}
	};

	const handleCreateSubmit = async () => {
		if (!campaignName.trim()) {
			dispatch(showMessage({ message: 'Vui lòng nhập tên chiến dịch', variant: 'warning' }));
			return;
		}

		try {
			await createFlashSale({
				name: campaignName.trim(),
				description: campaignDesc.trim(),
				startsAtUtc: new Date(startsAt).toISOString(),
				endsAtUtc: new Date(endsAt).toISOString()
			}).unwrap();

			dispatch(showMessage({ message: 'Tạo chiến dịch Flash Sale thành công!', variant: 'success' }));
			setOpenCreateDialog(false);
			setCampaignName('');
			setCampaignDesc('');
			await refetch();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.data?.detail || err?.data?.message || err?.message || 'Có lỗi khi tạo Flash Sale', variant: 'error' }));
		}
	};

	// Filtered products for Tab 1
	const filteredPickerProducts = useMemo(() => {
		return products.filter((p) => {
			const matchesSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCat = !filterCatId || (p.categories && p.categories.includes(filterCatId)) || (p as any).categoryId === filterCatId;
			return matchesSearch && matchesCat;
		});
	}, [products, searchQuery, filterCatId]);

	// Calculate campaign KPIs
	const totalItemsCount = activeSale?.items?.length || 0;
	const totalStockQuota = (activeSale?.items || []).reduce((acc, i) => acc + (i.stockLimit || 0), 0);
	const totalStockSold = (activeSale?.items || []).reduce((acc, i) => acc + (i.stockSold || 0), 0);
	const soldPercent = totalStockQuota > 0 ? Math.round((totalStockSold / totalStockQuota) * 100) : 0;

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row items-center justify-between p-24 sm:p-32 w-full border-b border-divider">
					<div className="flex items-center">
						<FuseSvgIcon size={32} className="text-secondary-main mr-16">
							heroicons-outline:lightning-bolt
						</FuseSvgIcon>
						<div>
							<Typography className="text-2xl font-bold tracking-tight">
								Flash Sales & Virtual Waiting Room
							</Typography>
							<Typography color="text.secondary" className="text-sm">
								Kiểm soát lưu lượng truy cập cao và quản lý các chiến dịch Flash Sale siêu giảm giá
							</Typography>
						</div>
					</div>
					<div className="mt-16 sm:mt-0 flex gap-12">
						<Button
							variant="contained"
							color="secondary"
							onClick={() => setOpenCreateDialog(true)}
							startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
						>
							Tạo Chiến Dịch Flash Sale
						</Button>
						<Button
							variant="outlined"
							color="inherit"
							size="small"
							onClick={() => refetch()}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:refresh</FuseSvgIcon>}
						>
							Làm mới
						</Button>
					</div>
				</div>
			}
			content={
				<div className="p-24 sm:p-32 w-full max-w-7xl mx-auto space-y-24">
					{admitSuccessMsg && (
						<Alert severity="success" className="shadow rounded-xl">
							{admitSuccessMsg}
						</Alert>
					)}

					{/* Live Waiting Room Control Banner */}
					<Paper className="p-24 rounded-2xl shadow bg-primary-dark text-primary-contrastText flex flex-col md:flex-row items-center justify-between gap-24">
						<div className="space-y-8">
							<div className="flex items-center gap-8">
								<Chip size="small" label="REDIS TOKEN BUCKET ACTIVE" color="success" />
								<Typography className="font-semibold text-lg">
									High-Concurrency Traffic Guard
								</Typography>
							</div>
							<Typography className="text-sm opacity-90 max-w-xl">
								Phòng chờ ảo bảo vệ database khi lưu lượng tăng đột biến tới 50.000 req/s. Khách hàng xếp hàng FIFO qua Redis và nhận token thanh toán hợp lệ.
							</Typography>
						</div>

						{activeSale && (
							<div className="flex flex-col sm:flex-row gap-12">
								<Button
									variant="contained"
									color="secondary"
									disabled={isAdmitting}
									onClick={() => handleAdmit(activeSale.id, 50)}
									startIcon={<FuseSvgIcon size={18}>heroicons-outline:user-add</FuseSvgIcon>}
								>
									{isAdmitting ? 'Đang duyệt...' : 'Cho vào 50 khách'}
								</Button>
								<Button
									variant="outlined"
									sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.4)' }}
									disabled={isAdmitting}
									onClick={() => handleAdmit(activeSale.id, 200)}
								>
									Duyệt mẻ 200 khách
								</Button>
							</div>
						)}
					</Paper>

					{/* Sales Campaigns Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
						{/* Campaign List */}
						<Paper className="lg:col-span-1 p-24 rounded-2xl shadow space-y-16">
							<div className="flex items-center justify-between">
								<Typography className="text-lg font-semibold">Chiến dịch Flash Sale</Typography>
								<Chip label={`${sales.length} chiến dịch`} size="small" />
							</div>

							{isLoading ? (
								<div className="py-32 flex justify-center">
									<CircularProgress size={28} />
								</div>
							) : sales.length === 0 ? (
								<div className="py-32 text-center space-y-12">
									<Typography color="text.secondary" className="text-sm">
										Chưa có chiến dịch Flash Sale nào được tạo.
									</Typography>
									<Button
										variant="outlined"
										size="small"
										color="secondary"
										onClick={() => setOpenCreateDialog(true)}
									>
										Tạo chiến dịch đầu tiên
									</Button>
								</div>
							) : (
								<div className="space-y-12">
									{sales.map((sale) => {
										const isSelected = activeSale?.id === sale.id;
										return (
											<div
												key={sale.id}
												onClick={() => setSelectedSale(sale)}
												className={`p-16 rounded-xl border cursor-pointer transition-all ${
													isSelected
														? 'border-primary-main bg-primary-light/10 shadow-sm'
														: 'border-divider hover:bg-background-default'
												}`}
											>
												<div className="flex items-center justify-between mb-4">
													<Typography className="font-semibold text-sm">{sale.name}</Typography>
													<Chip
														size="small"
														label={sale.isActive ? 'Đang chạy' : 'Lên lịch'}
														color={sale.isActive ? 'success' : 'default'}
													/>
												</div>
												<Typography color="text.secondary" className="text-xs line-clamp-1">
													{sale.description || 'Không có mô tả'}
												</Typography>
												<div className="flex items-center justify-between mt-8 text-xs text-text-secondary">
													<span>{sale.items?.length || 0} sản phẩm</span>
													<span>Kết thúc: {new Date(sale.endsAtUtc).toLocaleDateString('vi-VN')}</span>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</Paper>

						{/* Campaign Details & Quotas */}
						<Paper className="lg:col-span-2 p-24 rounded-2xl shadow space-y-20">
							{activeSale ? (
								<>
									<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-divider pb-16 gap-12">
										<div>
											<Typography className="text-xl font-bold">{activeSale.name}</Typography>
											<Typography color="text.secondary" className="text-sm">
												{activeSale.description || 'Chiến dịch giảm giá giờ vàng'}
											</Typography>
											<Typography variant="caption" className="text-text-secondary mt-4 block">
												Thời gian: {new Date(activeSale.startsAtUtc).toLocaleString('vi-VN')} → {new Date(activeSale.endsAtUtc).toLocaleString('vi-VN')}
											</Typography>
										</div>
										<div className="flex items-center gap-8">
											<Chip
												label={activeSale.isActive ? 'Đang kích hoạt' : 'Sẵn sàng'}
												color={activeSale.isActive ? 'primary' : 'default'}
											/>
											<Button
												variant="contained"
												size="small"
												color="secondary"
												onClick={() => setOpenAddModal(true)}
												startIcon={<FlashOnIcon fontSize="small" />}
											>
												Thêm Sản Phẩm Khuyến Mãi
											</Button>
										</div>
									</div>

									{/* Campaign KPI Statistics */}
									<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
										<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
											<Typography variant="caption" color="text.secondary">Sản Phẩm Trong Sale</Typography>
											<Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
												{totalItemsCount}
											</Typography>
										</Paper>
										<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
											<Typography variant="caption" color="text.secondary">Tổng Suất Mở Bán</Typography>
											<Typography variant="h6" sx={{ fontWeight: 700 }}>
												{totalStockQuota.toLocaleString('vi-VN')}
											</Typography>
										</Paper>
										<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
											<Typography variant="caption" color="text.secondary">Đã Bán Thành Công</Typography>
											<Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
												{totalStockSold} ({soldPercent}%)
											</Typography>
										</Paper>
										<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
											<Typography variant="caption" color="text.secondary">Trạng Thái Chiến Dịch</Typography>
											<Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, color: activeSale.isActive ? 'success.dark' : 'text.secondary' }}>
												{activeSale.isActive ? '● Đang Chạy' : '○ Lên Lịch'}
											</Typography>
										</Paper>
									</Box>

									{/* Product Quota Bars */}
									<div>
										<div className="flex items-center justify-between mb-12">
											<Typography className="text-base font-semibold">
												Sản Phẩm Khuyến Mãi & Hạn Mức Tồn Kho Flash Sale
											</Typography>
											{totalItemsCount > 0 && (
												<Button
													size="small"
													color="secondary"
													onClick={() => setOpenAddModal(true)}
												>
													+ Thêm thêm sản phẩm
												</Button>
											)}
										</div>

										{(!activeSale.items || activeSale.items.length === 0) ? (
											<div className="py-32 text-center border border-dashed border-divider rounded-xl space-y-12">
												<ShoppingBagIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
												<Typography color="text.secondary" className="text-sm">
													Chưa có sản phẩm nào được gán vào chiến dịch này.
												</Typography>
												<Button
													variant="contained"
													color="secondary"
													onClick={() => setOpenAddModal(true)}
													startIcon={<CategoryIcon />}
												>
													Chọn theo Danh Mục hoặc Chọn Lẻ
												</Button>
											</div>
										) : (
											<div className="space-y-16">
												{activeSale.items.map((item) => {
													const matchedProduct = products.find((p) => p.id === item.productId);
													const percent = Math.min(
														100,
														Math.round(((item.stockSold || 0) / (item.stockLimit || 1)) * 100)
													);
													return (
														<div key={item.id} className="p-16 border border-divider rounded-xl space-y-8 hover:border-primary-light transition-all">
															<div className="flex items-center justify-between text-sm">
																<div className="flex items-center gap-12">
																	<Avatar
																		variant="rounded"
																		src={matchedProduct?.images?.[0]?.url || `assets/images/apps/ecommerce/product-1.jpg`}
																		sx={{ width: 44, height: 44 }}
																	/>
																	<div>
																		<Typography className="font-semibold text-sm">
																			{matchedProduct?.name || item.productName || `Sản phẩm #${item.productId.substring(0, 8)}`}
																		</Typography>
																		{matchedProduct?.priceTaxIncl && (
																			<Typography variant="caption" className="line-through text-text-disabled">
																				Giá gốc: {matchedProduct.priceTaxIncl.toLocaleString('vi-VN')} đ
																			</Typography>
																		)}
																	</div>
																</div>
																<div className="flex items-center gap-16">
																	<div className="text-right">
																		<span className="font-bold text-primary-main text-base">
																			{item.discountPrice.toLocaleString('vi-VN')} {item.currency || 'VND'}
																		</span>
																		{matchedProduct?.priceTaxIncl && (
																			<Chip
																				label={`-${Math.round((1 - item.discountPrice / matchedProduct.priceTaxIncl) * 100)}%`}
																				size="small"
																				color="error"
																				className="ml-8"
																			/>
																		)}
																	</div>
																	<Tooltip title="Xóa khỏi Flash Sale">
																		<IconButton
																			size="small"
																			color="error"
																			onClick={() => handleRemoveItem(item.id)}
																			disabled={isRemoving}
																		>
																			<DeleteOutlineIcon fontSize="small" />
																		</IconButton>
																	</Tooltip>
																</div>
															</div>
															<LinearProgress
																variant="determinate"
																value={percent}
																className="h-8 rounded-full"
																color={percent > 80 ? 'error' : 'primary'}
															/>
															<div className="flex justify-between text-xs text-text-secondary">
																<span>Đã bán: {item.stockSold || 0} / {item.stockLimit} suất</span>
																<span className="font-medium text-secondary-main">{percent}% Đã đặt</span>
															</div>
														</div>
													);
												})}
											</div>
										)}
									</div>
								</>
							) : (
								<div className="py-48 text-center text-text-secondary">
									Chọn một chiến dịch Flash Sale ở bên trái để theo dõi phòng chờ và sản phẩm.
								</div>
							)}
						</Paper>
					</div>

					{/* Dialog Tạo Chiến Dịch Flash Sale Mới */}
					<Dialog
						open={openCreateDialog}
						onClose={() => setOpenCreateDialog(false)}
						maxWidth="sm"
						fullWidth
					>
						<DialogTitle className="font-bold">
							Tạo Chiến Dịch Flash Sale Mới
						</DialogTitle>
						<DialogContent dividers className="space-y-16">
							<TextField
								label="Tên chiến dịch *"
								fullWidth
								size="small"
								placeholder="Ví dụ: Giờ Vàng Siêu Sale 10.10"
								value={campaignName}
								onChange={(e) => setCampaignName(e.target.value)}
							/>

							<TextField
								label="Mô tả chiến dịch"
								fullWidth
								multiline
								rows={2}
								size="small"
								placeholder="Săn deal giảm sốc tới 50% chỉ trong 24 giờ..."
								value={campaignDesc}
								onChange={(e) => setCampaignDesc(e.target.value)}
							/>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
								<TextField
									label="Thời gian bắt đầu"
									type="datetime-local"
									fullWidth
									size="small"
									InputLabelProps={{ shrink: true }}
									value={startsAt}
									onChange={(e) => setStartsAt(e.target.value)}
								/>
								<TextField
									label="Thời gian kết thúc"
									type="datetime-local"
									fullWidth
									size="small"
									InputLabelProps={{ shrink: true }}
									value={endsAt}
									onChange={(e) => setEndsAt(e.target.value)}
								/>
							</div>
						</DialogContent>
						<DialogActions className="p-16">
							<Button onClick={() => setOpenCreateDialog(false)} color="inherit">
								Hủy
							</Button>
							<Button
								variant="contained"
								color="secondary"
								disabled={isCreating}
								onClick={handleCreateSubmit}
							>
								{isCreating ? <CircularProgress size={20} /> : 'Tạo Chiến Dịch'}
							</Button>
						</DialogActions>
					</Dialog>

					{/* Modal "Quản Lý Sản Phẩm Khuyến Mãi Flash Sale" (Bulk by Category & Multi-Product Picker) */}
					<Dialog
						open={openAddModal}
						onClose={() => setOpenAddModal(false)}
						maxWidth="md"
						fullWidth
					>
						<DialogTitle sx={{ pb: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<FlashOnIcon color="secondary" />
									<Typography variant="h6" sx={{ fontWeight: 700 }}>
										Thêm Sản Phẩm Vào Chiến Dịch Flash Sale
									</Typography>
								</Box>
								{activeSale && (
									<Chip label={activeSale.name} color="primary" size="small" variant="outlined" />
								)}
							</Box>
							<Tabs
								value={modalTab}
								onChange={(_e, val) => setModalTab(val)}
								sx={{ mt: 1, borderBottom: 1, borderColor: 'divider' }}
							>
								<Tab
									icon={<CategoryIcon fontSize="small" />}
									iconPosition="start"
									label="Chọn Nguyên Danh Mục (Bulk Category)"
									sx={{ fontWeight: 600 }}
								/>
								<Tab
									icon={<SearchIcon fontSize="small" />}
									iconPosition="start"
									label="Chọn Sản Phẩm Tự Do (Multi-Product Picker)"
									sx={{ fontWeight: 600 }}
								/>
							</Tabs>
						</DialogTitle>

						<DialogContent dividers sx={{ p: 2.5 }}>
							{/* TAB 0: CHỌN NGUYÊN DANH MỤC */}
							{modalTab === 0 && (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
									{/* Category Selector */}
									<TextField
										select
										label="1. Chọn Ngành Hàng / Danh Mục Sản Phẩm *"
										fullWidth
										size="small"
										value={selectedCategoryId}
										onChange={(e) => setSelectedCategoryId(e.target.value)}
										helperText="Hệ thống sẽ lọc toàn bộ sản phẩm thuộc danh mục và tự động tính giá Flash Sale"
									>
										<MenuItem value="">
											<em>-- Chọn một danh mục --</em>
										</MenuItem>
										{categories.map((cat) => (
											<MenuItem key={cat.id} value={cat.id}>
												{cat.name} ({categoryProductCounts[cat.id] || 0} sản phẩm)
											</MenuItem>
										))}
									</TextField>

									{/* Bulk Pricing Rule Box */}
									{selectedCategoryId && (
										<Paper
											variant="outlined"
											sx={{
												p: 2,
												borderRadius: 2,
												bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc'
											}}
										>
											<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
												<CalculateIcon fontSize="small" color="primary" />
												2. Thiết Lập Công Thức Giảm Giá Hàng Loạt
											</Typography>

											<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
												<TextField
													select
													label="Kiểu giảm giá"
													size="small"
													value={discountType}
													onChange={(e) => setDiscountType(e.target.value as any)}
												>
													<MenuItem value="percent">Giảm theo % (-%)</MenuItem>
													<MenuItem value="fixed">Giảm số tiền cố định (-₫)</MenuItem>
													<MenuItem value="flat">Đồng giá Flash Sale (₫)</MenuItem>
												</TextField>

												<TextField
													label={discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền (₫)'}
													type="number"
													size="small"
													value={discountValue}
													onChange={(e) => setDiscountValue(Number(e.target.value))}
													InputProps={{
														endAdornment: <InputAdornment position="end">{discountType === 'percent' ? '%' : '₫'}</InputAdornment>
													}}
												/>

												<TextField
													label="Suất bán / SP"
													type="number"
													size="small"
													value={categoryDefaultStockLimit}
													onChange={(e) => setCategoryDefaultStockLimit(Number(e.target.value))}
												/>

												<Button
													variant="contained"
													color="primary"
													onClick={handleApplyCategoryFormula}
													sx={{ height: 40 }}
												>
													Áp dụng
												</Button>
											</Box>
										</Paper>
									)}

									{/* Live Preview Table */}
									{selectedCategoryId && (
										<Box>
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
												<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
													3. Xem Trước Danh Sách Sản Phẩm ({categoryPreviewRows.filter((r) => r.selected).length}/{categoryPreviewRows.length} sản phẩm được chọn)
												</Typography>
												<Box sx={{ display: 'flex', gap: 1 }}>
													<Button size="small" onClick={() => handleToggleAllCategoryRows(true)}>
														Chọn tất cả
													</Button>
													<Button size="small" color="inherit" onClick={() => handleToggleAllCategoryRows(false)}>
														Bỏ chọn tất cả
													</Button>
												</Box>
											</Box>

											{categoryPreviewRows.length === 0 ? (
												<Alert severity="info" sx={{ borderRadius: 2 }}>
													Danh mục này hiện chưa có sản phẩm nào. Vui lòng chọn danh mục khác.
												</Alert>
											) : (
												<TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320, borderRadius: 2 }}>
													<Table size="small" stickyHeader>
														<TableHead>
															<TableRow>
																<TableCell padding="checkbox">
																	<Checkbox
																		checked={categoryPreviewRows.length > 0 && categoryPreviewRows.every((r) => r.selected)}
																		indeterminate={categoryPreviewRows.some((r) => r.selected) && !categoryPreviewRows.every((r) => r.selected)}
																		onChange={(e) => handleToggleAllCategoryRows(e.target.checked)}
																	/>
																</TableCell>
																<TableCell sx={{ fontWeight: 700 }}>Sản phẩm</TableCell>
																<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Giá niêm yết</TableCell>
																<TableCell sx={{ fontWeight: 700, textAlign: 'right', minWidth: 140 }}>Giá Flash Sale (₫)</TableCell>
																<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>% Giảm</TableCell>
																<TableCell sx={{ fontWeight: 700, textAlign: 'right', minWidth: 100 }}>Suất bán</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{categoryPreviewRows.map((row) => (
																<TableRow hover key={row.productId} selected={row.selected}>
																	<TableCell padding="checkbox">
																		<Checkbox
																			checked={row.selected}
																			onChange={() => handleToggleCategoryRow(row.productId)}
																		/>
																	</TableCell>
																	<TableCell>
																		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
																			<Avatar
																				variant="rounded"
																				src={row.image || 'assets/images/apps/ecommerce/product-1.jpg'}
																				sx={{ width: 36, height: 36 }}
																			/>
																			<Box>
																				<Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
																					{row.productName}
																				</Typography>
																				<Typography variant="caption" color="text.secondary">
																					{row.sku}
																				</Typography>
																			</Box>
																		</Box>
																	</TableCell>
																	<TableCell sx={{ textAlign: 'right', color: 'text.secondary', textDecoration: 'line-through' }}>
																		₫{row.originalPrice.toLocaleString('vi-VN')}
																	</TableCell>
																	<TableCell sx={{ textAlign: 'right' }}>
																		<TextField
																			type="number"
																			size="small"
																			value={row.discountPrice}
																			onChange={(e) => handleUpdateRowField(row.productId, 'discountPrice', Number(e.target.value))}
																			sx={{ width: 120 }}
																			inputProps={{ style: { textAlign: 'right', fontWeight: 700, color: '#e11d48' } }}
																		/>
																	</TableCell>
																	<TableCell sx={{ textAlign: 'center' }}>
																		<Chip
																			label={`-${row.discountPercent}%`}
																			size="small"
																			color={row.discountPercent >= 50 ? 'error' : row.discountPercent >= 30 ? 'warning' : 'default'}
																			sx={{ fontWeight: 700 }}
																		/>
																	</TableCell>
																	<TableCell sx={{ textAlign: 'right' }}>
																		<TextField
																			type="number"
																			size="small"
																			value={row.stockLimit}
																			onChange={(e) => handleUpdateRowField(row.productId, 'stockLimit', Number(e.target.value))}
																			sx={{ width: 80 }}
																			inputProps={{ style: { textAlign: 'center', fontWeight: 600 } }}
																		/>
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</TableContainer>
											)}
										</Box>
									)}
								</Box>
							)}

							{/* TAB 1: CHỌN SẢN PHẨM TỰ DO */}
							{modalTab === 1 && (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									{/* Filter Toolbar */}
									<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
										<TextField
											size="small"
											placeholder="Tìm theo tên sản phẩm..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											InputProps={{
												startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
											}}
										/>
										<TextField
											select
											size="small"
											label="Lọc theo danh mục"
											value={filterCatId}
											onChange={(e) => setFilterCatId(e.target.value)}
										>
											<MenuItem value="">Tất cả danh mục</MenuItem>
											{categories.map((c) => (
												<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
											))}
										</TextField>
									</Box>

									{/* Bulk pricing parameters for picked items */}
									<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
										<Typography variant="caption" sx={{ fontWeight: 700 }}>Áp dụng chung:</Typography>
										<TextField
											label="Mức giảm giá (%)"
											type="number"
											size="small"
											value={pickerDiscountPercent}
											onChange={(e) => setPickerDiscountPercent(Number(e.target.value))}
											sx={{ width: 140 }}
											InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
										/>
										<TextField
											label="Suất bán / SP"
											type="number"
											size="small"
											value={pickerStockLimit}
											onChange={(e) => setPickerStockLimit(Number(e.target.value))}
											sx={{ width: 140 }}
										/>
										<Typography variant="caption" color="text.secondary">
											Đã chọn: <b>{selectedProductIds.length}</b> sản phẩm
										</Typography>
									</Paper>

									{/* Products Table */}
									<TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, borderRadius: 2 }}>
										<Table size="small" stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell padding="checkbox">
														<Checkbox
															checked={filteredPickerProducts.length > 0 && selectedProductIds.length === filteredPickerProducts.length}
															indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < filteredPickerProducts.length}
															onChange={(e) => {
																if (e.target.checked) {
																	setSelectedProductIds(filteredPickerProducts.map((p) => p.id));
																} else {
																	setSelectedProductIds([]);
																}
															}}
														/>
													</TableCell>
													<TableCell sx={{ fontWeight: 700 }}>Sản phẩm</TableCell>
													<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Giá niêm yết</TableCell>
													<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Giá dự kiến (-{pickerDiscountPercent}%)</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{filteredPickerProducts.map((p) => {
													const isChecked = selectedProductIds.includes(p.id);
													const orig = p.priceTaxIncl || Number((p as any).price) || 100000;
													const disc = Math.round(orig * (1 - pickerDiscountPercent / 100));
													return (
														<TableRow
															hover
															key={p.id}
															selected={isChecked}
															onClick={() => {
																if (isChecked) {
																	setSelectedProductIds((prev) => prev.filter((id) => id !== p.id));
																} else {
																	setSelectedProductIds((prev) => [...prev, p.id]);
																}
															}}
															sx={{ cursor: 'pointer' }}
														>
															<TableCell padding="checkbox">
																<Checkbox checked={isChecked} />
															</TableCell>
															<TableCell>
																<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
																	<Avatar
																		variant="rounded"
																		src={p.images?.[0]?.url || 'assets/images/apps/ecommerce/product-1.jpg'}
																		sx={{ width: 36, height: 36 }}
																	/>
																	<Typography variant="body2" sx={{ fontWeight: 600 }}>
																		{p.name}
																	</Typography>
																</Box>
															</TableCell>
															<TableCell sx={{ textAlign: 'right' }}>
																₫{orig.toLocaleString('vi-VN')}
															</TableCell>
															<TableCell sx={{ textAlign: 'right', fontWeight: 700, color: 'error.main' }}>
																₫{disc.toLocaleString('vi-VN')}
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</TableContainer>
								</Box>
							)}
						</DialogContent>

						<DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
							<Button onClick={() => setOpenAddModal(false)} color="inherit">
								Đóng
							</Button>
							{modalTab === 0 ? (
								<Button
									variant="contained"
									color="secondary"
									disabled={isBatchAdding || categoryPreviewRows.filter((r) => r.selected).length === 0}
									onClick={handleSubmitCategoryBulk}
									startIcon={<FlashOnIcon />}
								>
									{isBatchAdding ? (
										<CircularProgress size={20} />
									) : (
										`Thêm ${categoryPreviewRows.filter((r) => r.selected).length} Sản Phẩm Vào Flash Sale`
									)}
								</Button>
							) : (
								<Button
									variant="contained"
									color="secondary"
									disabled={isBatchAdding || selectedProductIds.length === 0}
									onClick={handleSubmitPicker}
									startIcon={<FlashOnIcon />}
								>
									{isBatchAdding ? (
										<CircularProgress size={20} />
									) : (
										`Thêm ${selectedProductIds.length} Sản Phẩm Đã Chọn`
									)}
								</Button>
							)}
						</DialogActions>
					</Dialog>
				</div>
			}
		/>
	);
}

export default FlashSaleWaitingRoomPage;
