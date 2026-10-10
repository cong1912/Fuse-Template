import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import ReactApexChart from 'react-apexcharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useGetPaymentReportQuery } from './ReportsApi';

const mockPaymentRows = [
	{ id: '1', gateway: 'VNPay QR / Thẻ ATM & Visa', code: 'VNPAY', txCount: 198, total: 98000000, fee: 1470000, net: 96530000, successRate: '98.5%', status: 'Đã Đối Soát' },
	{ id: '2', gateway: 'Ví Điện Tử MoMo', code: 'MOMO', txCount: 112, total: 48000000, fee: 720000, net: 47280000, successRate: '99.1%', status: 'Đã Đối Soát' },
	{ id: '3', gateway: 'Giao Hàng Thu Tiền (COD)', code: 'COD', txCount: 86, total: 28500000, fee: 0, net: 28500000, successRate: '94.2%', status: 'Đang Thu Hộ' },
	{ id: '4', gateway: 'Chuyển Khoản Ngân Hàng VietQR', code: 'VIETQR', txCount: 32, total: 10000000, fee: 0, net: 10000000, successRate: '100%', status: 'Đã Nhận Tiền' }
];

const columns: GridColDef[] = [
	{ field: 'code', headerName: 'Mã Kênh', width: 110 },
	{ field: 'gateway', headerName: 'Cổng Thanh Toán / Phương Thức', width: 260 },
	{ field: 'txCount', headerName: 'Số Giao Dịch', width: 120 },
	{
		field: 'total',
		headerName: 'Tổng Thu',
		width: 160,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'fee',
		headerName: 'Phí Dịch Vụ',
		width: 140,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'net',
		headerName: 'Thực Nhận',
		width: 160,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{ field: 'successRate', headerName: 'Tỷ Lệ TC', width: 110 },
	{
		field: 'status',
		headerName: 'Trạng Thái',
		width: 150,
		renderCell: (params) => {
			const color = params.value === 'Đã Đối Soát' ? 'success' : params.value === 'Đang Thu Hộ' ? 'warning' : 'primary';
			return <Chip size="small" label={params.value} color={color as any} />;
		}
	}
];

export default function FinanceReportPage() {
	const { enqueueSnackbar } = useSnackbar();
	const { data: paymentData } = useGetPaymentReportQuery();

	const handleExport = () => {
		const csv = 'Gateway,Transactions,GrossTotal,Fee,NetTotal,SuccessRate\nVNPAY,198,98000000,1470000,96530000,98.5%\nMOMO,112,48000000,720000,47280000,99.1%';
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'Bao_Cao_Tai_Chinh.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		enqueueSnackbar('Đã tải xuống file báo cáo tài chính thành công!', { variant: 'success' });
	};

	const gatewayShareOptions: ApexCharts.ApexOptions = {
		chart: { type: 'donut' },
		labels: ['VNPay QR / Thẻ', 'Ví MoMo', 'Thu Hộ COD', 'Chuyển Khoản VietQR'],
		colors: ['#0284c7', '#d946ef', '#f59e0b', '#10b981'],
		legend: { position: 'bottom' }
	};

	const cashflowBarOptions: ApexCharts.ApexOptions = {
		chart: { type: 'bar', toolbar: { show: false } },
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: '45%'
			}
		},
		colors: ['#10b981', '#ef4444'],
		xaxis: {
			categories: ['04/10', '05/10', '06/10', '07/10', '08/10', '09/10', '10/10']
		},
		yaxis: {
			labels: {
				formatter: (val) => `${(val / 1000000).toFixed(0)}Tr`
			}
		}
	};

	const cashflowSeries = [
		{ name: 'Dòng tiền vào (Doanh thu)', data: [21000000, 24500000, 28000000, 23000000, 31000000, 29000000, 28000000] },
		{ name: 'Dòng tiền ra (Rút tiền / Phí)', data: [1500000, 2000000, 10000000, 0, 5000000, 12000000, 4000000] }
	];

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Báo Cáo Tài Chính & Dòng Tiền (Financial Health & Settlement)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Đối soát tự động dòng tiền từ các cổng thanh toán điện tử, công nợ COD và lịch sử thanh khoản
					</Typography>
				</Box>

				<Button
					variant="contained"
					color="primary"
					startIcon={<DownloadIcon />}
					onClick={handleExport}
				>
					Xuất Sổ Kế Toán CSV
				</Button>
			</Box>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-emerald-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Số Dư Thực Nhận Khả Dụng</Typography>
						<AccountBalanceIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">172.310.000 đ</Typography>
					<div className="text-xs text-green-600 font-medium">Sẵn sàng rút tiền về ngân hàng</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-amber-500">
						<Typography variant="body2" className="font-semibold text-gray-500">COD Đang Thu Hộ</Typography>
						<LocalAtmIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">28.500.000 đ</Typography>
					<div className="text-xs text-amber-600 font-medium">86 đơn đang vận chuyển/chờ đối soát</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-purple-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Phí Cổng & Phí Sàn</Typography>
						<PaymentsIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{(paymentData?.totalFees || 2190000).toLocaleString('vi-VN')} đ
					</Typography>
					<div className="text-xs text-gray-500">1.18% tổng giá trị giao dịch</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-blue-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Đã Quyết Toán Tháng Này</Typography>
						<PriceCheckIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">310.000.000 đ</Typography>
					<div className="text-xs text-green-600 font-medium">100% khớp sổ phụ ngân hàng</div>
				</Paper>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
				<Paper className="p-20 border rounded-xl shadow-none lg:col-span-2 flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Lưu Chuyển Tiền Tệ Hàng Ngày (Cash Flow)
					</Typography>
					<ReactApexChart
						options={cashflowBarOptions}
						series={cashflowSeries}
						type="bar"
						height={290}
					/>
				</Paper>

				<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Cơ Cấu Phương Thức Thanh Toán
					</Typography>
					<div className="flex-1 flex items-center justify-center">
						<ReactApexChart
							options={gatewayShareOptions}
							series={[53.1, 26.0, 15.4, 5.5]}
							type="donut"
							height={270}
						/>
					</div>
				</Paper>
			</div>

			{/* Data Grid Table */}
			<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
				<Typography variant="h6" className="font-bold">
					Bảng Đối Soát Chi Tiết Từng Cổng Thanh Toán
				</Typography>
				<div style={{ height: 320, width: '100%' }}>
					<DataGrid
						rows={mockPaymentRows}
						columns={columns}
						pageSizeOptions={[5, 10]}
						initialState={{
							pagination: { paginationModel: { pageSize: 5, page: 0 } }
						}}
						disableRowSelectionOnClick
					/>
				</div>
			</Paper>
		</div>
	);
}
