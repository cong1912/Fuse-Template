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
import Snackbar from '@mui/material/Snackbar';
import {
	useGetPlatformBillingQuery,
	useApprovePlatformBillingMutation,
	PlatformBillingInvoiceDto
} from '../AdminTenantsApi';

function BillingPage() {
	const { data: rawInvoices = [], isLoading, error } = useGetPlatformBillingQuery();
	const invoices: PlatformBillingInvoiceDto[] = Array.isArray(rawInvoices)
		? rawInvoices
		: ((rawInvoices as any)?.items || []);
	const [approveBilling, { isLoading: isApproving }] = useApprovePlatformBillingMutation();
	const [filterStatus, setFilterStatus] = useState<string>('ALL');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
	};

	const handleApprove = async (invoice: PlatformBillingInvoiceDto) => {
		try {
			await approveBilling(invoice.id).unwrap();
			setSnackbarMessage(`Đã duyệt thanh toán thành công cho hóa đơn ${invoice.id.slice(0, 8)} (${invoice.shopName})`);
		} catch (err) {
			console.error('Failed to approve billing', err);
			setSnackbarMessage('Có lỗi xảy ra khi duyệt thanh toán');
		}
	};

	const filteredInvoices = invoices.filter((inv) => {
		if (filterStatus === 'ALL') return true;
		return inv.status === filterStatus;
	});

	const totalAmount = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
	const paidCount = invoices.filter((i) => i.status === 'Paid').length;
	const pendingCount = invoices.filter((i) => i.status === 'Pending').length;

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-primary">heroicons-outline:credit-card</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Quản Lý Hóa Đơn & Thuê Bao (Platform Subscriptions & Billing)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Theo dõi doanh thu cước dịch vụ từ các cửa hàng đối tác, trạng thái hóa đơn VietQR và phê duyệt thanh toán tự động
						</Typography>
					</div>
					<div className="flex items-center space-x-8">
						<Button
							variant={filterStatus === 'ALL' ? 'contained' : 'outlined'}
							size="small"
							onClick={() => setFilterStatus('ALL')}
						>
							Tất cả ({invoices.length})
						</Button>
						<Button
							variant={filterStatus === 'Pending' ? 'contained' : 'outlined'}
							color="warning"
							size="small"
							onClick={() => setFilterStatus('Pending')}
						>
							Chờ duyệt ({pendingCount})
						</Button>
						<Button
							variant={filterStatus === 'Paid' ? 'contained' : 'outlined'}
							color="success"
							size="small"
							onClick={() => setFilterStatus('Paid')}
						>
							Đã thu ({paidCount})
						</Button>
					</div>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full space-y-24">
					{/* KPI Summary Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
						<Paper className="p-20 rounded-2xl border border-divider">
							<Typography variant="caption" className="text-text-secondary font-medium">
								Tổng Doanh Thu Hóa Đơn (MRR)
							</Typography>
							<Typography variant="h5" className="font-extrabold text-primary mt-4">
								{formatCurrency(totalAmount)}
							</Typography>
						</Paper>
						<Paper className="p-20 rounded-2xl border border-divider">
							<Typography variant="caption" className="text-text-secondary font-medium">
								Hóa Đơn Đã Quyết Toán
							</Typography>
							<Typography variant="h5" className="font-extrabold text-success mt-4">
								{paidCount} hóa đơn
							</Typography>
						</Paper>
						<Paper className="p-20 rounded-2xl border border-divider">
							<Typography variant="caption" className="text-text-secondary font-medium">
								Hóa Đơn Chờ Xử Lý / Thu Tiền
							</Typography>
							<Typography variant="h5" className="font-extrabold text-warning mt-4">
								{pendingCount} hóa đơn
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
							Không thể tải danh sách hóa đơn thuê bao.
						</Alert>
					)}

					{!isLoading && !error && (
						<Paper className="rounded-2xl border border-divider overflow-hidden">
							<Table>
								<TableHead className="bg-background-default">
									<TableRow>
										<TableCell className="font-bold">Mã Hóa Đơn</TableCell>
										<TableCell className="font-bold">Tên Cửa Hàng / Shop</TableCell>
										<TableCell className="font-bold">Gói Thuê Bao</TableCell>
										<TableCell className="font-bold">Số Tiền (VND)</TableCell>
										<TableCell className="font-bold">Phương Thức</TableCell>
										<TableCell className="font-bold">Ngày Đến Hạn</TableCell>
										<TableCell className="font-bold">Trạng Thái</TableCell>
										<TableCell className="font-bold text-right">Thao Tác</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredInvoices.map((inv) => (
										<TableRow key={inv.id} hover>
											<TableCell className="font-mono text-12 text-primary font-bold">
												#{inv.id.slice(0, 8).toUpperCase()}
											</TableCell>
											<TableCell className="font-semibold text-text-primary">
												{inv.shopName}
											</TableCell>
											<TableCell>
												<Chip label={inv.plan} size="small" variant="outlined" color="primary" />
											</TableCell>
											<TableCell className="font-bold text-14">
												{formatCurrency(inv.amount)}
											</TableCell>
											<TableCell className="text-13 text-text-secondary">
												{inv.paymentMethod}
											</TableCell>
											<TableCell className="text-13">
												{new Date(inv.dueDateUtc).toLocaleDateString('vi-VN')}
											</TableCell>
											<TableCell>
												{inv.status === 'Paid' ? (
													<Chip label="Đã Thanh Toán" size="small" color="success" />
												) : (
													<Chip label="Chờ Thanh Toán" size="small" color="warning" />
												)}
											</TableCell>
											<TableCell className="text-right">
												{inv.status === 'Pending' ? (
													<Button
														variant="contained"
														size="small"
														color="primary"
														disabled={isApproving}
														onClick={() => handleApprove(inv)}
													>
														Duyệt Thu Tiền
													</Button>
												) : (
													<span className="text-12 text-text-secondary">Hoàn tất</span>
												)}
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

export default BillingPage;
