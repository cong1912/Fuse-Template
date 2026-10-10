import { useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {
	useGetPlatformPlansQuery,
	useCreatePlatformPlanMutation,
	useUpdatePlatformPlanMutation,
	useDeletePlatformPlanMutation,
	PlatformPlanDto
} from '../AdminTenantsApi';

const AVAILABLE_FEATURES = [
	{ id: 'CustomDomain', label: 'Tên miền riêng (Custom Domain)' },
	{ id: 'VirtualWaitingRoom', label: 'Phòng chờ ảo Flash Sale' },
	{ id: 'B2BWholesale', label: 'B2B Bán buôn & Báo giá RFQ' },
	{ id: 'TikTokShopSync', label: 'Đồng bộ TikTok Shop' },
	{ id: 'PosBarcodeCheckout', label: 'Quét mã vạch POS tại quầy' },
	{ id: 'AdvancedBooking', label: 'Đặt lịch hẹn Spa / Clinic' },
	{ id: 'AffiliateProgram', label: 'Tiếp thị liên kết Affiliate' },
	{ id: 'EInvoiceMisa', label: 'Hóa đơn điện tử MISA meInvoice' },
	{ id: 'AdvancedAnalytics', label: 'Báo cáo & Phân tích nâng cao' },
	{ id: 'AiChat', label: 'Trợ lý AI CSKH' },
	{ id: 'MultiWarehouse', label: 'Quản lý đa kho hàng' },
	{ id: 'JevAiDecision', label: 'Jev AI Smart Decisions' }
];

function PlansPage() {
	const { data: rawPlans = [], isLoading, error } = useGetPlatformPlansQuery();
	const plans: PlatformPlanDto[] = Array.isArray(rawPlans)
		? rawPlans
		: ((rawPlans as any)?.items || []);
	const [createPlan, { isLoading: isCreating }] = useCreatePlatformPlanMutation();
	const [updatePlan, { isLoading: isUpdating }] = useUpdatePlatformPlanMutation();
	const [deletePlan, { isLoading: isDeleting }] = useDeletePlatformPlanMutation();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
	const [planToDelete, setPlanToDelete] = useState<PlatformPlanDto | null>(null);
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	// Form State
	const [currentId, setCurrentId] = useState<number | null>(null);
	const [code, setCode] = useState('');
	const [name, setName] = useState('');
	const [price, setPrice] = useState<number>(0);
	const [maxProducts, setMaxProducts] = useState('Không giới hạn');
	const [maxStaff, setMaxStaff] = useState('Không giới hạn');
	const [maxCoupons, setMaxCoupons] = useState('Không giới hạn');
	const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
	const [popular, setPopular] = useState(false);

	const formatCurrency = (amount: number) => {
		if (amount === 0) return 'Miễn phí';
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
	};

	const handleOpenCreate = () => {
		setDialogMode('create');
		setCurrentId(null);
		setCode(`PLAN_${Date.now().toString().slice(-4)}`);
		setName('');
		setPrice(499000);
		setMaxProducts('1000');
		setMaxStaff('10');
		setMaxCoupons('50');
		setSelectedFeatures(['CustomDomain', 'TikTokShopSync']);
		setPopular(false);
		setFormError(null);
		setDialogOpen(true);
	};

	const handleOpenEdit = (plan: PlatformPlanDto) => {
		setDialogMode('edit');
		setCurrentId(plan.id);
		setCode(plan.code);
		setName(plan.name);
		setPrice(plan.price);
		setMaxProducts(plan.maxProducts);
		setMaxStaff(plan.maxStaff);
		setMaxCoupons(plan.maxCoupons);
		setSelectedFeatures([...(plan.features || [])]);
		setPopular(Boolean(plan.popular));
		setFormError(null);
		setDialogOpen(true);
	};

	const toggleFeature = (featId: string) => {
		setSelectedFeatures((prev) =>
			prev.includes(featId) ? prev.filter((f) => f !== featId) : [...prev, featId]
		);
	};

	const handleSave = async () => {
		if (!name.trim()) {
			setFormError('Vui lòng nhập tên gói dịch vụ.');
			return;
		}
		if (!code.trim()) {
			setFormError('Vui lòng nhập mã định danh gói.');
			return;
		}
		if (price < 0) {
			setFormError('Giá cước không thể nhỏ hơn 0.');
			return;
		}

		try {
			if (dialogMode === 'create') {
				await createPlan({
					code: code.trim().toUpperCase(),
					name: name.trim(),
					price: Number(price),
					maxProducts: maxProducts.trim() || 'Không giới hạn',
					maxStaff: maxStaff.trim() || 'Không giới hạn',
					maxCoupons: maxCoupons.trim() || 'Không giới hạn',
					features: selectedFeatures,
					popular
				}).unwrap();
				setSnackbarMessage(`Tạo gói dịch vụ "${name}" thành công!`);
			} else if (currentId !== null) {
				await updatePlan({
					id: currentId,
					code: code.trim().toUpperCase(),
					name: name.trim(),
					price: Number(price),
					maxProducts: maxProducts.trim() || 'Không giới hạn',
					maxStaff: maxStaff.trim() || 'Không giới hạn',
					maxCoupons: maxCoupons.trim() || 'Không giới hạn',
					features: selectedFeatures,
					popular
				}).unwrap();
				setSnackbarMessage(`Cập nhật gói dịch vụ "${name}" thành công!`);
			}
			setDialogOpen(false);
		} catch (err: any) {
			console.error('Failed to save plan', err);
			setFormError(err?.data?.message || 'Có lỗi xảy ra khi lưu gói dịch vụ.');
		}
	};

	const handleDelete = async () => {
		if (!planToDelete) return;
		try {
			await deletePlan(planToDelete.id).unwrap();
			setSnackbarMessage(`Đã xóa gói dịch vụ "${planToDelete.name}" thành công!`);
			setPlanToDelete(null);
		} catch (err: any) {
			console.error('Failed to delete plan', err);
			setSnackbarMessage(err?.data?.message || 'Không thể xóa gói dịch vụ này.');
		}
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-primary">heroicons-outline:collection</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Gói Dịch Vụ & Bảng Giá Nền Tảng (Plan Catalog & Tier Limits)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Quản lý danh mục gói thuê bao đa tầng, hạn ngạch tài nguyên (Quotas) và danh mục tính năng cho toàn bộ cửa hàng trên sàn
						</Typography>
					</div>
					<Button
						variant="contained"
						color="primary"
						startIcon={<AddCircleOutlineIcon />}
						onClick={handleOpenCreate}
						className="shadow-md"
					>
						Tạo Gói Mới
					</Button>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full">
					{isLoading && (
						<div className="flex justify-center p-48">
							<CircularProgress />
						</div>
					)}

					{error && (
						<Alert severity="error" className="mb-24">
							Không thể tải danh sách gói thuê bao. Vui lòng thử lại sau.
						</Alert>
					)}

					{!isLoading && !error && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24">
							{plans.map((plan) => (
								<Paper
									key={plan.id}
									elevation={plan.popular ? 4 : 1}
									className={`flex flex-col rounded-2xl p-24 relative border transition-all duration-200 hover:shadow-lg ${
										plan.popular ? 'border-primary ring-2 ring-primary ring-opacity-20' : 'border-divider'
									}`}
								>
									{plan.popular && (
										<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
											<Chip
												icon={<StarIcon className="text-white text-sm" />}
												label="Phổ Biến Nhất"
												color="primary"
												size="small"
												className="font-bold shadow-md"
											/>
										</div>
									)}

									<div className="mb-16">
										<div className="flex justify-between items-start">
											<Typography variant="h6" className="font-bold truncate pr-8">
												{plan.name}
											</Typography>
											<Chip label={plan.code} size="small" variant="outlined" className="text-11" />
										</div>
										<div className="mt-8 flex items-baseline">
											<span className="text-28 font-extrabold text-text-primary">
												{formatCurrency(plan.price)}
											</span>
											{plan.price > 0 && (
												<span className="text-14 text-text-secondary ml-4">/ tháng</span>
											)}
										</div>
									</div>

									<div className="py-16 border-t border-b border-divider space-y-12 flex-1">
										<div className="flex justify-between items-center text-13">
											<span className="text-text-secondary">Sản phẩm tối đa:</span>
											<span className="font-semibold text-text-primary">{plan.maxProducts}</span>
										</div>
										<div className="flex justify-between items-center text-13">
											<span className="text-text-secondary">Nhân viên tối đa:</span>
											<span className="font-semibold text-text-primary">{plan.maxStaff}</span>
										</div>
										<div className="flex justify-between items-center text-13">
											<span className="text-text-secondary">Mã giảm giá tối đa:</span>
											<span className="font-semibold text-text-primary">{plan.maxCoupons}</span>
										</div>
									</div>

									<div className="mt-16 space-y-8 mb-24">
										<Typography variant="caption" className="font-bold text-text-secondary uppercase">
											Tính năng nổi bật ({(plan.features || []).length})
										</Typography>
										<div className="space-y-6 max-h-140 overflow-y-auto pr-4">
											{(plan.features || []).map((feature, idx) => (
												<div key={idx} className="flex items-center space-x-6 text-12">
													<CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
													<span className="truncate">{feature}</span>
												</div>
											))}
										</div>
									</div>

									<div className="flex items-center gap-8 mt-auto pt-16 border-t border-divider">
										<Button
											variant={plan.popular ? 'contained' : 'outlined'}
											color="primary"
											fullWidth
											startIcon={<EditOutlinedIcon />}
											onClick={() => handleOpenEdit(plan)}
											size="small"
										>
											Chi Tiết & Hạn Ngạch
										</Button>
										{plan.id !== 0 && (
											<IconButton
												size="small"
												color="error"
												title="Xóa gói dịch vụ"
												onClick={() => setPlanToDelete(plan)}
												className="border border-divider rounded-lg hover:bg-error-50"
											>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										)}
									</div>
								</Paper>
							))}
						</div>
					)}

					{/* Create / Edit Plan Modal */}
					<Dialog
						open={dialogOpen}
						onClose={() => setDialogOpen(false)}
						maxWidth="sm"
						fullWidth
					>
						<DialogTitle className="border-b font-bold flex justify-between items-center">
							<span>{dialogMode === 'create' ? 'Tạo Gói Dịch Vụ Mới' : `Cấu Hình Gói: ${name}`}</span>
							{dialogMode === 'edit' && <Chip label={code} size="small" color="primary" />}
						</DialogTitle>
						<DialogContent className="pt-24 space-y-16">
							{formError && (
								<Alert severity="error" className="mb-16">
									{formError}
								</Alert>
							)}

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
								<TextField
									label="Tên Gói Dịch Vụ"
									fullWidth
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="VD: Gói Doanh Nghiệp VIP"
								/>
								<TextField
									label="Mã Gói (Code)"
									fullWidth
									required
									value={code}
									onChange={(e) => setCode(e.target.value)}
									placeholder="VD: VIP_ENTERPRISE"
									disabled={dialogMode === 'edit' && currentId === 0}
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
								<TextField
									label="Giá Cước Hàng Tháng (VND)"
									type="number"
									fullWidth
									required
									value={price}
									onChange={(e) => setPrice(Number(e.target.value))}
									helperText={formatCurrency(price)}
								/>
								<div className="flex items-center pt-8">
									<FormControlLabel
										control={
											<Switch
												checked={popular}
												onChange={(e) => setPopular(e.target.checked)}
												color="primary"
											/>
										}
										label="Đặt làm Gói Phổ Biến Nhất"
									/>
								</div>
							</div>

							<Typography variant="subtitle2" className="font-bold border-b pb-4 pt-8">
								Hạn Ngạch Tài Nguyên (Quotas)
							</Typography>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
								<TextField
									label="Sản phẩm tối đa"
									size="small"
									value={maxProducts}
									onChange={(e) => setMaxProducts(e.target.value)}
									placeholder="VD: 500 hoặc Không giới hạn"
								/>
								<TextField
									label="Nhân viên tối đa"
									size="small"
									value={maxStaff}
									onChange={(e) => setMaxStaff(e.target.value)}
									placeholder="VD: 10 hoặc Không giới hạn"
								/>
								<TextField
									label="Mã giảm giá tối đa"
									size="small"
									value={maxCoupons}
									onChange={(e) => setMaxCoupons(e.target.value)}
									placeholder="VD: 50 hoặc Không giới hạn"
								/>
							</div>

							<Typography variant="subtitle2" className="font-bold border-b pb-4 pt-8">
								Danh Mục Tính Năng Kèm Theo ({selectedFeatures.length})
							</Typography>
							<div className="flex flex-wrap gap-8 max-h-180 overflow-y-auto p-4 border rounded-xl bg-background-default">
								{AVAILABLE_FEATURES.map((feat) => {
									const isSelected = selectedFeatures.includes(feat.id);
									return (
										<Chip
											key={feat.id}
											label={feat.label}
											size="small"
											variant={isSelected ? 'filled' : 'outlined'}
											color={isSelected ? 'primary' : 'default'}
											onClick={() => toggleFeature(feat.id)}
											className="cursor-pointer"
										/>
									);
								})}
							</div>
						</DialogContent>
						<DialogActions className="border-t p-16">
							<Button onClick={() => setDialogOpen(false)} disabled={isCreating || isUpdating}>
								Đóng
							</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={handleSave}
								disabled={isCreating || isUpdating}
								startIcon={(isCreating || isUpdating) ? <CircularProgress size={16} /> : null}
							>
								{isCreating || isUpdating ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
							</Button>
						</DialogActions>
					</Dialog>

					{/* Delete Confirmation Dialog */}
					<Dialog
						open={Boolean(planToDelete)}
						onClose={() => setPlanToDelete(null)}
						maxWidth="xs"
						fullWidth
					>
						<DialogTitle className="font-bold text-error">
							Xác Nhận Xóa Gói Dịch Vụ
						</DialogTitle>
						<DialogContent>
							<Typography variant="body2">
								Bạn có chắc chắn muốn xóa gói dịch vụ <strong>{planToDelete?.name}</strong> ({planToDelete?.code})?
								Thao tác này không thể hoàn tác.
							</Typography>
						</DialogContent>
						<DialogActions className="p-16 border-t">
							<Button onClick={() => setPlanToDelete(null)} disabled={isDeleting}>
								Hủy Bỏ
							</Button>
							<Button
								variant="contained"
								color="error"
								onClick={handleDelete}
								disabled={isDeleting}
								startIcon={isDeleting ? <CircularProgress size={16} /> : null}
							>
								{isDeleting ? 'Đang Xóa...' : 'Xóa Gói'}
							</Button>
						</DialogActions>
					</Dialog>

					{/* Toast Notifications */}
					<Snackbar
						open={Boolean(snackbarMessage)}
						autoHideDuration={4000}
						onClose={() => setSnackbarMessage(null)}
						message={snackbarMessage}
					/>
				</div>
			}
		/>
	);
}

export default PlansPage;
