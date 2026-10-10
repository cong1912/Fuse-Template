import { useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import ShieldAlertIcon from '@mui/icons-material/WarningAmber';
import {
	useGetPlatformRiskQueueQuery,
	useUpdateShopStatusMutation,
	PlatformRiskAlertDto
} from '../AdminTenantsApi';

function RiskPage() {
	const { data: rawAlerts = [], isLoading, error } = useGetPlatformRiskQueueQuery();
	const alerts: PlatformRiskAlertDto[] = Array.isArray(rawAlerts)
		? rawAlerts
		: ((rawAlerts as any)?.items || []);
	const [updateShopStatus] = useUpdateShopStatusMutation();
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const handleFreezeShop = async (alert: PlatformRiskAlertDto) => {
		try {
			await updateShopStatus({ shopId: alert.shopId, status: 'Suspended' }).unwrap();
			setSnackbarMessage(`Đã tạm khóa cửa hàng ${alert.shopName} do rủi ro an ninh`);
		} catch (err) {
			console.error('Failed to suspend shop', err);
			setSnackbarMessage('Có lỗi xảy ra khi khóa cửa hàng');
		}
	};

	const getRiskColor = (score: number) => {
		if (score >= 80) return 'error';
		if (score >= 50) return 'warning';
		return 'success';
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-warning">heroicons-outline:shield-exclamation</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Hàng Đợi Giám Sát Rủi Ro & Gian Lận (Platform Fraud & Risk Queue)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Phát hiện bất thường về tốc độ đơn hàng, địa chỉ IP ngoại lai, tỉ lệ bồi hoàn (Chargeback) và phòng vệ tài chính
						</Typography>
					</div>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full space-y-24">
					{/* KPI Summary */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
						<Paper className="p-20 rounded-2xl border border-divider">
							<Typography variant="caption" className="text-text-secondary font-medium">
								Cảnh Báo Cấp Độ Cao (High Risk)
							</Typography>
							<div className="flex items-center space-x-8 mt-4">
								<ShieldAlertIcon color="error" />
								<Typography variant="h5" className="font-extrabold text-error">
									{alerts.filter((a) => a.riskLevel === 'High').length} trường hợp
								</Typography>
							</div>
						</Paper>
						<Paper className="p-20 rounded-2xl border border-divider">
							<Typography variant="caption" className="text-text-secondary font-medium">
								Đang Điều Tra / Giám Sát
							</Typography>
							<Typography variant="h5" className="font-extrabold text-warning mt-4">
								{alerts.filter((a) => a.status === 'UnderReview').length} vụ việc
							</Typography>
						</Paper>
						<Paper className="p-20 rounded-2xl border border-divider">
							<Typography variant="caption" className="text-text-secondary font-medium">
								Tỉ Lệ Gian Lận Ước Tính (Platform Risk Rate)
							</Typography>
							<Typography variant="h5" className="font-extrabold text-primary mt-4">
								0.08% GMV
							</Typography>
						</Paper>
					</div>

					{isLoading && (
						<div className="flex justify-center p-48">
							<CircularProgress />
						</div>
					)}

					{error && (
						<Alert severity="error">
							Không thể tải hàng đợi rủi ro và gian lận.
						</Alert>
					)}

					{!isLoading && !error && (
						<Paper className="rounded-2xl border border-divider overflow-hidden">
							<Table>
								<TableHead className="bg-background-default">
									<TableRow>
										<TableCell className="font-bold">Điểm Rủi Ro (Score)</TableCell>
										<TableCell className="font-bold">Cửa Hàng Bị Cảnh Báo</TableCell>
										<TableCell className="font-bold">Dấu Hiệu & Nguyên Nhân Kích Hoạt</TableCell>
										<TableCell className="font-bold">Thời Gian Phát Hiện</TableCell>
										<TableCell className="font-bold">Trạng Thái Xử Lý</TableCell>
										<TableCell className="font-bold text-right">Biện Pháp Xử Lý</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{alerts.map((alert) => (
										<TableRow key={alert.id} hover>
											<TableCell className="w-180">
												<div className="space-y-4">
													<div className="flex justify-between items-center text-12 font-bold">
														<span>Điểm: {alert.riskScore}/100</span>
														<Chip
															label={alert.riskLevel}
															size="small"
															color={getRiskColor(alert.riskScore)}
														/>
													</div>
													<LinearProgress
														variant="determinate"
														value={alert.riskScore}
														color={getRiskColor(alert.riskScore)}
														className="rounded h-6"
													/>
												</div>
											</TableCell>
											<TableCell className="font-bold text-text-primary">
												{alert.shopName}
											</TableCell>
											<TableCell className="text-13 text-text-primary">
												{alert.trigger}
											</TableCell>
											<TableCell className="text-12 text-text-secondary">
												{new Date(alert.detectedAtUtc).toLocaleString('vi-VN')}
											</TableCell>
											<TableCell>
												{alert.status === 'Open' && (
													<Chip label="Mới Phát Hiện" size="small" color="error" variant="outlined" />
												)}
												{alert.status === 'UnderReview' && (
													<Chip label="Đang Thẩm Định" size="small" color="warning" variant="outlined" />
												)}
												{alert.status === 'Resolved' && (
													<Chip label="Đã Xử Lý" size="small" color="success" variant="outlined" />
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-8">
													<Button
														variant="outlined"
														color="error"
														size="small"
														onClick={() => handleFreezeShop(alert)}
													>
														Khóa Cửa Hàng
													</Button>
													<Button
														variant="text"
														size="small"
														onClick={() => setSnackbarMessage('Đã chuyển cảnh báo vào trạng thái Đang theo dõi')}
													>
														Xem Chi Tiết
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Paper>
					)}

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

export default RiskPage;
