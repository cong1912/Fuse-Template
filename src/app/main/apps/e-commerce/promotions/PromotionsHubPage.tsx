import { useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PlaybookConfigDialog from './components/PlaybookConfigDialog';
import CreateCouponDialog from './components/CreateCouponDialog';
import {
	useGetPromotionPlaybooksQuery,
	useTogglePlaybookMutation,
	useGetShopCouponsQuery,
	useToggleCouponMutation,
	PromotionPlaybookDto
} from './PromotionsApi';

function formatCurrency(val?: number | null) {
	if (!val) return '0 ₫';
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

function getPlaybookIcon(type: number) {
	switch (type) {
		case 0: return 'heroicons-outline:trending-up'; // Tiered
		case 1: return 'heroicons-outline:truck'; // Freeship
		case 2: return 'heroicons-outline:gift'; // Buy X Get Y
		case 3: return 'heroicons-outline:user-add'; // First order
		case 4: return 'heroicons-outline:lightning-bolt'; // Flash sale
		case 5: return 'heroicons-outline:shopping-cart'; // Cart recovery
		default: return 'heroicons-outline:sparkles';
	}
}

export default function PromotionsHubPage() {
	const [activeTab, setActiveTab] = useState(0);
	const [selectedPlaybook, setSelectedPlaybook] = useState<PromotionPlaybookDto | null>(null);
	const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
	const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
	const [notification, setNotification] = useState<string | null>(null);

	const {
		data: playbooks = [],
		isLoading: isLoadingPlaybooks,
		error: playbooksError,
		refetch: refetchPlaybooks
	} = useGetPromotionPlaybooksQuery();

	const {
		data: coupons = [],
		isLoading: isLoadingCoupons,
		error: couponsError,
		refetch: refetchCoupons
	} = useGetShopCouponsQuery();

	const [togglePlaybook] = useTogglePlaybookMutation();
	const [toggleCoupon] = useToggleCouponMutation();

	const handleTogglePlaybook = async (pb: PromotionPlaybookDto) => {
		try {
			await togglePlaybook({ id: pb.id, isEnabled: !pb.isEnabled }).unwrap();
			setNotification(`Đã ${!pb.isEnabled ? 'kích hoạt' : 'tạm ngưng'} kịch bản "${pb.name}"`);
			setTimeout(() => setNotification(null), 3500);
		} catch {
			setNotification('Không thể thay đổi trạng thái kịch bản');
		}
	};

	const handleToggleCoupon = async (id: string, code: string, currentStatus: boolean) => {
		try {
			await toggleCoupon(id).unwrap();
			setNotification(`Đã ${!currentStatus ? 'bật' : 'tắt'} voucher "${code}"`);
			setTimeout(() => setNotification(null), 3500);
		} catch {
			setNotification('Không thể thay đổi trạng thái voucher');
		}
	};

	const activePlaybooksCount = playbooks.filter((p) => p.isEnabled).length;
	const totalSpent = playbooks.reduce((acc, p) => acc + (p.totalDiscountSpent || 0), 0);
	const totalRevenue = playbooks.reduce((acc, p) => acc + (p.revenueGenerated || 0), 0);
	const totalUsage = playbooks.reduce((acc, p) => acc + (p.usageCount || 0), 0);

	return (
		<>
			<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row items-center justify-between p-24 sm:p-32 w-full border-b border-divider">
					<div className="flex items-center">
						<div className="p-12 rounded-12 bg-primary-50 text-primary-main mr-16">
							<FuseSvgIcon size={32}>heroicons-outline:speakerphone</FuseSvgIcon>
						</div>
						<div>
							<Typography className="text-2xl font-extrabold tracking-tight">
								Trung Tâm Kịch Bản Khuyến Mãi (Promotion Playbooks)
							</Typography>
							<Typography color="text.secondary" className="text-sm font-medium">
								Sân chơi tùy biến cho Shop: Tự do Bật / Tắt và cấu hình các kịch bản kích cầu doanh số
							</Typography>
						</div>
					</div>

					<div className="mt-16 sm:mt-0 flex gap-12">
						<Button
							variant="outlined"
							color="inherit"
							size="medium"
							onClick={() => {
								refetchPlaybooks();
								refetchCoupons();
							}}
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:refresh</FuseSvgIcon>}
						>
							Làm Mới
						</Button>
						<Button
							variant="contained"
							color="secondary"
							size="medium"
							onClick={() => setIsCouponDialogOpen(true)}
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:ticket</FuseSvgIcon>}
						>
							Tạo Mã Giảm Giá
						</Button>
					</div>
				</div>
			}
			content={
				<div className="p-24 sm:p-32 max-w-7xl mx-auto w-full space-y-24">
					{notification && (
						<Alert severity="success" onClose={() => setNotification(null)} className="shadow-sm">
							{notification}
						</Alert>
					)}

					{/* Metric Row */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
						<Paper className="p-20 flex flex-col justify-between border border-divider shadow-sm rounded-16">
							<div className="flex items-center justify-between mb-8">
								<Typography color="text.secondary" className="text-sm font-medium">
									Kịch Bản Đang Bật
								</Typography>
								<div className="p-8 rounded-full bg-green-50 text-green-600">
									<FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
								</div>
							</div>
							<Typography className="text-3xl font-bold tracking-tight text-green-600">
								{activePlaybooksCount} <span className="text-base font-normal text-text-secondary">/ {playbooks.length}</span>
							</Typography>
							<Typography variant="caption" color="text.secondary" className="mt-8">
								Kịch bản đang trực tiếp kích cầu
							</Typography>
						</Paper>

						<Paper className="p-20 flex flex-col justify-between border border-divider shadow-sm rounded-16">
							<div className="flex items-center justify-between mb-8">
								<Typography color="text.secondary" className="text-sm font-medium">
									GMV Doanh Số Kích Cầu
								</Typography>
								<div className="p-8 rounded-full bg-blue-50 text-blue-600">
									<FuseSvgIcon size={20}>heroicons-outline:currency-dollar</FuseSvgIcon>
								</div>
							</div>
							<Typography className="text-3xl font-bold tracking-tight text-blue-600">
								{formatCurrency(totalRevenue)}
							</Typography>
							<Typography variant="caption" color="text.secondary" className="mt-8">
								Doanh số mang lại từ các đơn khuyến mãi
							</Typography>
						</Paper>

						<Paper className="p-20 flex flex-col justify-between border border-divider shadow-sm rounded-16">
							<div className="flex items-center justify-between mb-8">
								<Typography color="text.secondary" className="text-sm font-medium">
									Tổng Chi Phí Trợ Giá
								</Typography>
								<div className="p-8 rounded-full bg-amber-50 text-amber-600">
									<FuseSvgIcon size={20}>heroicons-outline:receipt-tax</FuseSvgIcon>
								</div>
							</div>
							<Typography className="text-3xl font-bold tracking-tight text-amber-600">
								{formatCurrency(totalSpent)}
							</Typography>
							<Typography variant="caption" color="text.secondary" className="mt-8">
								Số tiền Shop đã tài trợ cho khách
							</Typography>
						</Paper>

						<Paper className="p-20 flex flex-col justify-between border border-divider shadow-sm rounded-16">
							<div className="flex items-center justify-between mb-8">
								<Typography color="text.secondary" className="text-sm font-medium">
									Lượt Áp Dụng
								</Typography>
								<div className="p-8 rounded-full bg-purple-50 text-purple-600">
									<FuseSvgIcon size={20}>heroicons-outline:users</FuseSvgIcon>
								</div>
							</div>
							<Typography className="text-3xl font-bold tracking-tight text-purple-600">
								{totalUsage}
							</Typography>
							<Typography variant="caption" color="text.secondary" className="mt-8">
								Lượt khách hàng nhận ưu đãi thành công
							</Typography>
						</Paper>
					</div>

					{/* Navigation Tabs */}
					<Paper className="border border-divider shadow-sm rounded-16 overflow-hidden">
						<Tabs
							value={activeTab}
							onChange={(_, val) => setActiveTab(val)}
							indicatorColor="primary"
							textColor="primary"
							className="border-b border-divider px-16"
						>
							<Tab
								label="Thư Viện Kịch Bản Khuyến Mãi"
								icon={<FuseSvgIcon size={20}>heroicons-outline:template</FuseSvgIcon>}
								iconPosition="start"
								className="font-bold py-16"
							/>
							<Tab
								label="Voucher & Mã Giảm Giá Của Shop"
								data-testid="tab-vouchers"
								icon={<FuseSvgIcon size={20}>heroicons-outline:ticket</FuseSvgIcon>}
								iconPosition="start"
								className="font-bold py-16"
							/>
						</Tabs>

						{/* Tab 1: Playbook Gallery */}
						{activeTab === 0 && (
							<div className="p-24">
								{isLoadingPlaybooks ? (
									<div className="flex items-center justify-center p-48">
										<CircularProgress />
									</div>
								) : playbooksError ? (
									<Alert severity="error">Không thể tải danh sách kịch bản khuyến mãi.</Alert>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
										{playbooks.map((pb) => (
											<Paper
												key={pb.id}
												className={`p-20 flex flex-col justify-between rounded-16 border transition-all ${
													pb.isEnabled
														? 'border-primary-200 bg-white shadow-md'
														: 'border-gray-200 bg-gray-50 opacity-80'
												}`}
											>
												<div>
													{/* Card Header */}
													<div className="flex items-start justify-between mb-12">
														<div className="flex items-center gap-10">
															<div
																className={`p-8 rounded-10 ${
																	pb.isEnabled ? 'bg-primary-50 text-primary-main' : 'bg-gray-200 text-gray-500'
																}`}
															>
																<FuseSvgIcon size={24}>{getPlaybookIcon(pb.type)}</FuseSvgIcon>
															</div>
															<div>
																<Typography className="font-bold text-base line-clamp-1">
																	{pb.name}
																</Typography>
																<Typography variant="caption" className="font-mono text-text-secondary">
																	{pb.code}
																</Typography>
															</div>
														</div>

														{/* Toggle Switch */}
														<div className="flex items-center gap-4">
															<Switch
																checked={pb.isEnabled}
																onChange={() => handleTogglePlaybook(pb)}
																color="primary"
															/>
														</div>
													</div>

													{/* Badges */}
													<div className="flex items-center gap-8 mb-12 flex-wrap">
														<Chip
															label={pb.isEnabled ? 'Đang Chạy' : 'Tạm Dừng'}
															size="small"
															color={pb.isEnabled ? 'success' : 'default'}
															variant="outlined"
														/>
														{pb.badgeText && (
															<Chip
																label={pb.badgeText}
																size="small"
																color="primary"
																variant="filled"
																className="font-semibold text-xs"
															/>
														)}
													</div>

													{/* Description */}
													<Typography
														color="text.secondary"
														className="text-sm mb-16 line-clamp-3 leading-relaxed"
													>
														{pb.description}
													</Typography>
												</div>

												{/* Card Footer: Metrics & Actions */}
												<div className="border-t border-divider pt-16 mt-8 space-y-12">
													<div className="flex justify-between text-xs text-text-secondary">
														<span>Đã chi trợ giá:</span>
														<span className="font-semibold text-text-primary">
															{formatCurrency(pb.totalDiscountSpent)}
														</span>
													</div>
													{pb.budgetLimit && (
														<div className="flex justify-between text-xs text-text-secondary">
															<span>Trần ngân sách:</span>
															<span className="font-semibold text-text-primary">
																{formatCurrency(pb.budgetLimit)}
															</span>
														</div>
													)}

													<Button
														fullWidth
														variant="outlined"
														color="primary"
														size="small"
														data-testid={`btn-customize-${pb.code}`}
														onClick={() => {
															setSelectedPlaybook(pb);
															setIsConfigDialogOpen(true);
														}}
														startIcon={<FuseSvgIcon size={16}>heroicons-outline:cog</FuseSvgIcon>}
													>
														Tùy Biến Cấu Hình
													</Button>
												</div>
											</Paper>
										))}
									</div>
								)}
							</div>
						)}

						{/* Tab 2: Shop Coupons */}
						{activeTab === 1 && (
							<div className="p-24">
								{isLoadingCoupons ? (
									<div className="flex items-center justify-center p-48">
										<CircularProgress />
									</div>
								) : couponsError ? (
									<Alert severity="error">Không thể tải danh sách mã giảm giá.</Alert>
								) : coupons.length === 0 ? (
									<div className="text-center p-48 text-text-secondary">
										<FuseSvgIcon size={48} className="mb-12 text-gray-400">
											heroicons-outline:ticket
										</FuseSvgIcon>
										<Typography className="text-base font-semibold">
											Shop chưa tạo mã giảm giá nào.
										</Typography>
										<Button
											variant="contained"
											color="secondary"
											className="mt-16"
											onClick={() => setIsCouponDialogOpen(true)}
										>
											Tạo Mã Đầu Tiên
										</Button>
									</div>
								) : (
									<TableContainer>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell className="font-bold">Mã Voucher</TableCell>
													<TableCell className="font-bold">Mô Tả</TableCell>
													<TableCell className="font-bold">Loại & Giá Trị</TableCell>
													<TableCell className="font-bold">Đã Dùng / Tối Đa</TableCell>
													<TableCell className="font-bold">Thời Hạn</TableCell>
													<TableCell className="font-bold text-center">Bật / Tắt</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{coupons.map((c) => (
													<TableRow key={c.id} hover>
														<TableCell className="font-mono font-bold text-primary-main">
															{c.code}
														</TableCell>
														<TableCell>{c.description || '—'}</TableCell>
														<TableCell>
															<Chip
																size="small"
																label={c.type === 'Percentage' ? `${c.value}%` : formatCurrency(c.value)}
																color="primary"
																variant="outlined"
															/>
														</TableCell>
														<TableCell>
															{c.timesUsed} / {c.maxUses}
														</TableCell>
														<TableCell className="text-xs text-text-secondary">
															{new Date(c.validTo).toLocaleDateString('vi-VN')}
														</TableCell>
														<TableCell align="center">
															<Switch
																checked={c.isActive}
																onChange={() => handleToggleCoupon(c.id, c.code, c.isActive)}
																color="success"
															/>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</div>
						)}
					</Paper>
				</div>
			}
		/>

		{/* Dialogs */}
		<PlaybookConfigDialog
			open={isConfigDialogOpen}
			playbook={selectedPlaybook}
			onClose={() => {
				setIsConfigDialogOpen(false);
				setSelectedPlaybook(null);
			}}
		/>

		<CreateCouponDialog
			open={isCouponDialogOpen}
			onClose={() => setIsCouponDialogOpen(false)}
		/>
	</>
);
}
