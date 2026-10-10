import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams } from 'react-router-dom';
import { useGetECommerceOrderQuery } from '../../ECommerceApi';
import { getOrderStatusConfig } from '../constants';

function formatOrderDateTime(dateStr?: string, addMinutes: number = 0): string {
	const d = dateStr ? new Date(dateStr) : new Date('2026-10-09T09:30:00');
	const validDate = isNaN(d.getTime()) ? new Date('2026-10-09T09:30:00') : d;
	
	const target = new Date(validDate.getTime() + addMinutes * 60000);
	const hours = String(target.getHours()).padStart(2, '0');
	const minutes = String(target.getMinutes()).padStart(2, '0');
	const day = String(target.getDate()).padStart(2, '0');
	const month = String(target.getMonth() + 1).padStart(2, '0');
	const year = target.getFullYear();
	return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export default function OrderDetailsTab({ order: propOrder }: { order?: any } = {}) {
	const { orderId } = useParams();
	const { data: fetchedOrder } = useGetECommerceOrderQuery(orderId, { skip: !orderId || !!propOrder });
	const order = propOrder || fetchedOrder;
	const [copied, setCopied] = useState(false);

	const statusConfig = getOrderStatusConfig(order?.status?.[0]?.name || (order as any)?.status);
	const statusName = statusConfig.name;
	const orderReference = String(order?.reference || (orderId ? String(orderId).slice(0, 8) : 'ORD-9821')).toUpperCase();

	// Calculate active step index and completion states from central config
	// Steps: 0: Đặt hàng, 1: Đã thanh toán, 2: Đang đóng gói, 3: Giao cho ĐVVC, 4: Giao thành công
	const activeStepIndex = statusConfig.activeStep;
	const isDelivered = statusName === 'Delivered';

	const steps = [
		{
			label: 'Đặt hàng',
			time: formatOrderDateTime(order?.date, 0),
			isCompleted: statusName !== 'Cancelled',
			isActive: activeStepIndex === 0
		},
		{
			label: 'Đã thanh toán',
			time: activeStepIndex >= 1 ? formatOrderDateTime(order?.date, 2) : 'Chờ thanh toán',
			isCompleted: activeStepIndex >= 1,
			isActive: activeStepIndex === 1
		},
		{
			label: 'Đang đóng gói',
			time: activeStepIndex >= 2 ? formatOrderDateTime(order?.date, 45) : (activeStepIndex === 1 ? 'Đang xếp lịch' : 'Chờ xử lý'),
			isCompleted: activeStepIndex >= 2,
			isActive: activeStepIndex === 2
		},
		{
			label: 'Giao cho ĐVVC',
			time: activeStepIndex >= 3 ? formatOrderDateTime(order?.date, 270) : (activeStepIndex === 2 ? 'Chờ ĐVVC lấy hàng' : 'Chờ xuất kho'),
			isCompleted: activeStepIndex >= 4,
			isActive: activeStepIndex === 3
		},
		{
			label: 'Giao thành công',
			time: isDelivered ? formatOrderDateTime(order?.date, 435) : (activeStepIndex === 3 ? 'Dự kiến: Hôm nay' : 'Dự kiến: 2-3 ngày'),
			isCompleted: isDelivered,
			isActive: isDelivered
		}
	];

	const renderStatusBadge = () => (
		<Chip
			label={statusConfig.labelVi}
			color={statusConfig.colorMui}
			size="small"
			sx={{ fontWeight: 600 }}
		/>
	);

	const renderTrackingMilestones = () => {
		if (statusName === 'Cancelled') {
			return (
				<Box sx={{ pl: 2 }}>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
						{formatOrderDateTime(order?.date, 15)} - Đơn hàng đã bị hủy
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Giao dịch đã được hủy trên hệ thống E-Commerce
					</Typography>
				</Box>
			);
		}

		if (statusName === 'Delivered') {
			return (
				<>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
							{formatOrderDateTime(order?.date, 435)} - Giao hàng thành công
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Khách hàng đã nhận bưu kiện và ký nhận đầy đủ
						</Typography>
					</Box>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{formatOrderDateTime(order?.date, 270)} - Kiện hàng đã đến Bưu cục phát Tân Bình
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Shipper Nguyễn Tuấn Anh (0988.112.233) đang trên đường giao
						</Typography>
					</Box>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{formatOrderDateTime(order?.date, 45)} - Đã xuất kho tổng E-Commerce Hub
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Kiện hàng đã qua máy quét phân loại tự động
						</Typography>
					</Box>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{formatOrderDateTime(order?.date, 2)} - Shop đã xác nhận và đóng gói sản phẩm
						</Typography>
						<Typography variant="caption" color="text.secondary">
							In phiếu gửi hàng và niêm phong kiện
						</Typography>
					</Box>
				</>
			);
		}

		if (statusName === 'PartiallyShipped' || statusName === 'Shipped') {
			return (
				<>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
							{formatOrderDateTime(order?.date, 270)} - Kiện hàng đã đến Bưu cục phát Tân Bình
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Shipper Nguyễn Tuấn Anh (0988.112.233) đang trên đường giao
						</Typography>
					</Box>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{formatOrderDateTime(order?.date, 45)} - Đã xuất kho tổng E-Commerce Hub
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Kiện hàng đã qua máy quét phân loại tự động
						</Typography>
					</Box>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{formatOrderDateTime(order?.date, 2)} - Shop đã xác nhận và đóng gói sản phẩm
						</Typography>
						<Typography variant="caption" color="text.secondary">
							In phiếu gửi hàng và niêm phong kiện
						</Typography>
					</Box>
				</>
			);
		}

		if (statusName === 'Processing') {
			return (
				<>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
							{formatOrderDateTime(order?.date, 45)} - Nhân viên kho đang kiểm đếm và đóng gói sản phẩm
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Chuẩn bị bao bì và tem niêm phong xuất kho
						</Typography>
					</Box>
					<Box sx={{ pl: 2 }}>
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{formatOrderDateTime(order?.date, 2)} - Đơn hàng đã được xác nhận thanh toán thành công
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Hệ thống đã nhận lệnh chuyển kho
						</Typography>
					</Box>
				</>
			);
		}

		if (statusName === 'Confirmed') {
			return (
				<Box sx={{ pl: 2 }}>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
						{formatOrderDateTime(order?.date, 2)} - Đơn hàng đã được xác nhận thành công
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Đang xếp lịch chuyển sang kho đóng gói
					</Typography>
				</Box>
			);
		}

		return (
			<Box sx={{ pl: 2 }}>
				<Typography variant="body2" sx={{ fontWeight: 600 }}>
					{formatOrderDateTime(order?.date, 0)} - Khách hàng đặt hàng thành công
				</Typography>
				<Typography variant="caption" color="text.secondary">
					Đang chờ hệ thống xác nhận thanh toán & kiểm tra tồn kho
				</Typography>
			</Box>
		);
	};

	const customerName = order?.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : 'Nguyễn Văn An';
	const customerCompany = (order as any)?.customer?.company;
	const customerEmail = order?.customer?.email || 'nguyenvanan@gmail.com';
	const customerPhone = order?.customer?.phone || '0912 345 678';
	const shippingAddress = (order as any)?.customer?.shippingAddress?.address || (order as any)?.shippingAddress?.address || 'Số 123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh';
	
	const productsList = order?.products || [];
	const computedSubtotal = productsList.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
	const subtotal = computedSubtotal > 0 ? computedSubtotal : (Number(order?.total || order?.subtotal) || 0);
	const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
	const discountAmount = subtotal >= 2000000 ? 50000 : (shippingFee === 0 && subtotal > 0 ? 30000 : 0);
	const totalAmount = subtotal + shippingFee - discountAmount;

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			{/* Alerts for special statuses */}
			{statusName === 'Cancelled' && (
				<Alert severity="error" icon={<CancelIcon />} sx={{ borderRadius: 2 }}>
					Đơn hàng này đã bị hủy. Mọi tiến trình xử lý và vận chuyển đã ngừng.
				</Alert>
			)}
			{statusName === 'Refunded' && (
				<Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
					Đơn hàng đã được hoàn tiền thành công cho khách hàng.
				</Alert>
			)}

			{/* Order Lifecycle Stepper */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Typography variant="h6" sx={{ fontWeight: 700 }}>
							Tiến Trình Đơn Hàng #{orderReference}
						</Typography>
						{renderStatusBadge()}
					</Box>
					<Button
						variant="outlined"
						size="small"
						startIcon={<PrintIcon />}
						onClick={() => window.print()}
					>
						In Vận Đơn (A5/A4)
					</Button>
				</Box>

				<Stepper activeStep={activeStepIndex} alternativeLabel>
					{steps.map((step) => (
						<Step key={step.label} completed={step.isCompleted}>
							<StepLabel
								optional={
									<Typography
										variant="caption"
										color={step.isActive ? 'primary.main' : 'text.secondary'}
										sx={{
											display: 'block',
											textAlign: 'center',
											fontWeight: step.isActive ? 700 : 400
										}}
									>
										{step.time}
									</Typography>
								}
							>
								<Typography
									variant="body2"
									sx={{
										fontWeight: step.isActive || step.isCompleted ? 700 : 500,
										color: step.isActive ? 'primary.main' : 'inherit'
									}}
								>
									{step.label}
								</Typography>
							</StepLabel>
						</Step>
					))}
				</Stepper>
			</Paper>

			{/* Main Content Layout: 2 Columns */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
				{/* Left Column (Items & Logistics) */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* Fulfillment & Logistics */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<LocalShippingIcon className="text-indigo-500" />
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
									Vận Chuyển & Giao Hàng (GHN Express)
								</Typography>
							</Box>
							<Chip label={`Mã: GHN-${orderReference}`} color="secondary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
						</Box>

						<Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: 2, border: 1, borderColor: 'divider', mb: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Box>
									<Typography variant="caption" color="text.secondary">Đơn vị vận chuyển</Typography>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>Giao Hàng Nhanh (GHN) - Gói Nhanh 24h</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary">Dự kiến giao</Typography>
									<Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
										{isDelivered ? 'Đã giao thành công' : 'Hôm nay, trước 18:00'}
									</Typography>
								</Box>
								<Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép mã vận đơn'}>
									<IconButton size="small" onClick={() => handleCopy(`GHN-${orderReference}`)}>
										<ContentCopyIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
						</Box>

						{/* Tracking Milestones */}
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1, borderLeft: '2px solid #6366f1' }}>
							{renderTrackingMilestones()}
						</Box>
					</Paper>

					{/* Products & Payment Settlement */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
							Danh Sách Sản Phẩm Trong Đơn ({productsList.length} sản phẩm)
						</Typography>

						<TableContainer>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>Sản phẩm</TableCell>
										<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Số lượng</TableCell>
										<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Đơn giá</TableCell>
										<TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Thành tiền</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{productsList.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
												Chưa có sản phẩm nào trong đơn hàng
											</TableCell>
										</TableRow>
									) : (
										productsList.map((item: any, idx: number) => {
											const price = Number(item.price) || 0;
											const qty = Number(item.quantity) || 1;
											const lineTotal = price * qty;
											return (
												<TableRow hover key={item.id || idx}>
												<TableCell>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
														<Avatar
															variant="rounded"
															sx={{ width: 44, height: 44, bgcolor: idx % 2 === 0 ? 'primary.light' : 'secondary.light' }}
															src={item.image || `assets/images/apps/ecommerce/product-${(idx % 4) + 1}.jpg`}
														/>
														<Box>
															<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
															<Typography variant="caption" color="text.secondary">
																{item.detail || `Mã SP: ${item.id ? String(item.id).substring(0, 8).toUpperCase() : `SKU-${idx + 1}`}`}
															</Typography>
														</Box>
													</Box>
												</TableCell>
												<TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{qty}</TableCell>
												<TableCell sx={{ textAlign: 'right' }}>₫{price.toLocaleString('vi-VN')}</TableCell>
												<TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>₫{lineTotal.toLocaleString('vi-VN')}</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
							</Table>
						</TableContainer>

						<Divider sx={{ my: 2 }} />

						{/* Financial Breakdown */}
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 360, ml: 'auto' }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant="body2" color="text.secondary">Tiền hàng tạm tính:</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>₫{subtotal.toLocaleString('vi-VN')}</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant="body2" color="text.secondary">Phí vận chuyển:</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>₫{shippingFee.toLocaleString('vi-VN')}</Typography>
							</Box>
							{discountAmount > 0 && (
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="body2" color="success.main">Giảm giá Playbook (FREESHIP50):</Typography>
									<Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>-₫{discountAmount.toLocaleString('vi-VN')}</Typography>
								</Box>
							)}
							<Divider sx={{ my: 0.5 }} />
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tổng thanh toán:</Typography>
								<Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>₫{totalAmount.toLocaleString('vi-VN')}</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1, bgcolor: 'success.light', color: 'success.dark', borderRadius: 1.5 }}>
								<CheckCircleIcon fontSize="small" />
								<Typography variant="caption" sx={{ fontWeight: 700 }}>
									Đã thanh toán 100% qua VietQR (Vietcombank)
								</Typography>
							</Box>
						</Box>
					</Paper>
				</Box>

				{/* Right Column (AI Risk & Customer CRM) */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* AI Fraud & Risk Scoring Card */}
					<Paper
						variant="outlined"
						sx={{
							p: 3,
							borderRadius: 3,
							border: 1,
							borderColor: 'emerald.300',
							bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.03)'
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<AutoAwesomeIcon className="text-amber-500" fontSize="small" />
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
									AI Đánh Giá Rủi Ro
								</Typography>
							</Box>
							<Chip label="98/100 An Toàn" color="success" size="small" icon={<VerifiedUserIcon />} sx={{ fontWeight: 700 }} />
						</Box>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Hệ thống AI phân tích 12 chỉ số chống gian lận & boom hàng thời gian thực:
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<CheckCircleIcon fontSize="small" className="text-emerald-500" />
								<Typography variant="caption">Địa chỉ IP trùng khớp với TP. Hồ Chí Minh</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<CheckCircleIcon fontSize="small" className="text-emerald-500" />
								<Typography variant="caption">Số điện thoại đã kích hoạt Zalo & nhận OTP</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<CheckCircleIcon fontSize="small" className="text-emerald-500" />
								<Typography variant="caption">Lịch sử: 5 đơn thành công, 0 lần boom hàng</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<CheckCircleIcon fontSize="small" className="text-emerald-500" />
								<Typography variant="caption">Tỷ lệ hủy / hoàn trả dự báo: &lt; 0.5%</Typography>
							</Box>
						</Box>

						<Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'emerald.700', display: 'block' }}>
								Khuyến nghị từ AI:
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Khách hàng uy tín cao. Khuyến nghị xuất kho và ưu tiên giao hàng nhanh.
							</Typography>
						</Box>
					</Paper>

					{/* Customer CRM Card */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
							<PersonIcon className="text-indigo-500" fontSize="small" />
							<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
								Thông Tin Khách Hàng
							</Typography>
						</Box>

						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
							<Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 700 }}>
								{customerName[0]}
							</Avatar>
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{customerName}</Typography>
								<Chip label="Khách Thân Thiết (VIP)" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
							</Box>
						</Box>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
							{customerCompany && (
								<Box>
									<Typography variant="caption" color="text.secondary">Công ty / Tổ chức</Typography>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>{customerCompany}</Typography>
								</Box>
							)}
							<Box>
								<Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>{customerPhone}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">Email</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>{customerEmail}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">Địa chỉ giao hàng</Typography>
								<Typography variant="body2">{shippingAddress}</Typography>
							</Box>
						</Box>

						<Divider sx={{ my: 1.5 }} />

						<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, textAlign: 'center' }}>
							<Box sx={{ p: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 1.5 }}>
								<Typography variant="caption" color="text.secondary">Tổng số đơn</Typography>
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>5 Đơn</Typography>
							</Box>
							<Box sx={{ p: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 1.5 }}>
								<Typography variant="caption" color="text.secondary">Tổng chi tiêu</Typography>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>₫3.850.000</Typography>
							</Box>
						</Box>
					</Paper>
				</Box>
			</Box>
		</Box>
	);
}
