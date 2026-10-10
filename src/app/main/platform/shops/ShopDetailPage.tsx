import { useParams, useNavigate } from 'react-router-dom';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
	useGetShopOverviewQuery,
	useImpersonateTenantMutation
} from '../AdminTenantsApi';
import TenantBrandingTab from './tabs/TenantBrandingTab';

function ShopDetailPage() {
	const { id = '' } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: shop, isLoading, error } = useGetShopOverviewQuery(id);
	const [impersonateTenant, { isLoading: isImpersonating }] = useImpersonateTenantMutation();

	const handleImpersonate = async () => {
		if (!shop) return;
		try {
			const res = await impersonateTenant({ tenantId: shop.shopId }).unwrap();
			const originalToken = localStorage.getItem('jwt_access_token') || '';
			localStorage.setItem(
				'impersonation_info',
				JSON.stringify({
					tenantId: res.tenantId,
					tenantName: res.tenantName,
					subdomain: res.subdomain,
					originalToken: originalToken,
					expiresAt: res.expiresAt
				})
			);
			localStorage.setItem('jwt_access_token', res.accessToken);
			window.location.href = '/dashboards/analytics';
		} catch (err) {
			console.error('Failed to impersonate tenant', err);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div className="flex items-center space-x-12">
						<Button
							variant="outlined"
							size="small"
							startIcon={<ArrowBackIcon />}
							onClick={() => navigate('/platform/shops')}
						>
							Quay Lại
						</Button>
						<div>
							<Typography variant="h5" className="font-bold tracking-tight">
								Hồ Sơ Cửa Hàng Chi Tiết (Shop Inspection Console)
							</Typography>
							<Typography variant="caption" className="text-text-secondary">
								ID: {id}
							</Typography>
						</div>
					</div>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<LoginIcon />}
						disabled={isImpersonating || !shop}
						onClick={handleImpersonate}
					>
						{isImpersonating ? 'Đang Đăng Nhập...' : 'Đăng Nhập Cửa Hàng (Login as Shop)'}
					</Button>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full space-y-24">
					{isLoading && (
						<div className="flex justify-center p-48">
							<CircularProgress />
						</div>
					)}

					{error && (
						<Alert severity="error">
							Không thể tải dữ liệu chi tiết cửa hàng.
						</Alert>
					)}

					{!isLoading && shop && (
						<>
							{/* Store Identity Card */}
							<Paper className="p-24 rounded-2xl border border-divider flex flex-col md:flex-row justify-between items-start md:items-center gap-16">
								<div className="space-y-8">
									<div className="flex items-center space-x-12">
										<Typography variant="h4" className="font-extrabold text-text-primary">
											{shop.name}
										</Typography>
										<Chip label={shop.plan} color="primary" size="small" />
										<Chip
											label={shop.status === 'Active' ? 'Đang Hoạt Động' : 'Đang Tạm Khóa'}
											color={shop.status === 'Active' ? 'success' : 'default'}
											size="small"
										/>
									</div>
									<Typography variant="body2" className="text-text-secondary">
										Tên miền phụ: <span className="font-mono font-bold text-text-primary">{shop.subdomain}.ecommerce.vn</span>
										{shop.customDomain && (
											<span className="ml-16">| Tên miền riêng: <span className="font-mono font-bold text-primary">{shop.customDomain}</span></span>
										)}
									</Typography>
								</div>
								<div className="text-right">
									<Typography variant="caption" className="text-text-secondary">
										Cước phí gói dịch vụ
									</Typography>
									<Typography variant="h5" className="font-extrabold text-primary">
										{formatCurrency(shop.monthlyPriceVnd)} / tháng
									</Typography>
								</div>
							</Paper>

							{/* Effective Quotas Breakdown */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
								<Paper className="p-20 rounded-2xl border border-divider">
									<Typography variant="caption" className="text-text-secondary font-medium">
										Hạn Mức Sản Phẩm Tối Đa
									</Typography>
									<Typography variant="h5" className="font-extrabold text-text-primary mt-4">
										{shop.effectiveMaxProducts > 1000000 ? 'Không giới hạn' : shop.effectiveMaxProducts}
									</Typography>
								</Paper>
								<Paper className="p-20 rounded-2xl border border-divider">
									<Typography variant="caption" className="text-text-secondary font-medium">
										Hạn Mức Nhân Viên Cửa Hàng
									</Typography>
									<Typography variant="h5" className="font-extrabold text-text-primary mt-4">
										{shop.effectiveMaxStaff > 1000000 ? 'Không giới hạn' : shop.effectiveMaxStaff}
									</Typography>
								</Paper>
								<Paper className="p-20 rounded-2xl border border-divider">
									<Typography variant="caption" className="text-text-secondary font-medium">
										Hạn Mức Khuyến Mãi / Mã Giảm Giá
									</Typography>
									<Typography variant="h5" className="font-extrabold text-text-primary mt-4">
										{shop.effectiveMaxCoupons > 1000000 ? 'Không giới hạn' : shop.effectiveMaxCoupons}
									</Typography>
								</Paper>
							</div>

							{/* Active Features Matrix */}
							<Paper className="p-24 rounded-2xl border border-divider space-y-16">
								<Typography variant="h6" className="font-bold flex items-center space-x-8">
									<FuseSvgIcon size={20}>heroicons-outline:shield-check</FuseSvgIcon>
									<span>Tính Năng & Module Kích Hoạt ({shop.features?.length || 0})</span>
								</Typography>

								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
									{shop.features?.map((feat, idx) => (
										<div key={idx} className="flex items-center space-x-8 p-8 border rounded-lg bg-background-default">
											<CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
											<span className="text-13 font-medium text-text-primary truncate">{feat}</span>
										</div>
									))}
								</div>
							</Paper>

							{/* Tenant White-Labeling & Theme Tokens */}
							<TenantBrandingTab />
						</>
					)}
				</div>
			}
		/>
	);
}

export default ShopDetailPage;
