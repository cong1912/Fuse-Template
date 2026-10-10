import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReactApexChart from 'react-apexcharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useGetRevenueSummaryQuery } from './ReportsApi';

const mockDailyRows = [
	{ id: '1', date: '10/10/2026', gross: 28000000, net: 26800000, orders: 68, aov: 411700, refund: 450000, growth: '+12.4%' },
	{ id: '2', date: '09/10/2026', gross: 29000000, net: 27500000, orders: 68, aov: 426400, refund: 320000, growth: '+15.2%' },
	{ id: '3', date: '08/10/2026', gross: 31000000, net: 29200000, orders: 74, aov: 418900, refund: 580000, growth: '+22.8%' },
	{ id: '4', date: '07/10/2026', gross: 23000000, net: 21900000, orders: 52, aov: 442300, refund: 290000, growth: '-4.1%' },
	{ id: '5', date: '06/10/2026', gross: 28000000, net: 26500000, orders: 62, aov: 451600, refund: 410000, growth: '+8.3%' },
	{ id: '6', date: '05/10/2026', gross: 24500000, net: 23100000, orders: 56, aov: 437500, refund: 380000, growth: '+6.5%' },
	{ id: '7', date: '04/10/2026', gross: 21000000, net: 19800000, orders: 48, aov: 437500, refund: 250000, growth: '+3.2%' }
];

const columns: GridColDef[] = [
	{ field: 'date', headerName: 'Ngày', width: 130 },
	{
		field: 'gross',
		headerName: 'Doanh Thu Gộp',
		width: 170,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'net',
		headerName: 'Doanh Thu Thuần',
		width: 170,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{ field: 'orders', headerName: 'Số Đơn', width: 110 },
	{
		field: 'aov',
		headerName: 'AOV (Giá Trị Đơn)',
		width: 160,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'refund',
		headerName: 'Hoàn Tiền',
		width: 140,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'growth',
		headerName: 'Tăng Trưởng',
		width: 130,
		renderCell: (params) => (
			<span className={params.value.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
				{params.value}
			</span>
		)
	}
];

export default function RevenueReportPage() {
	const { enqueueSnackbar } = useSnackbar();
	const [range, setRange] = useState<string>('30d');
	const { data: revenueData } = useGetRevenueSummaryQuery();

	const handleExport = () => {
		const csv = 'Date,GrossRevenue,NetRevenue,Orders\n2026-10-10,28000000,26800000,68\n2026-10-09,29000000,27500000,68';
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `Bao_Cao_Doanh_Thu_${range}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		enqueueSnackbar('Đã tải xuống file báo cáo doanh thu thành công!', { variant: 'success' });
	};

	const chartOptions: ApexCharts.ApexOptions = {
		chart: {
			type: 'area',
			toolbar: { show: false }
		},
		stroke: { curve: 'smooth', width: 3 },
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.45,
				opacityTo: 0.05,
				stops: [20, 100]
			}
		},
		colors: ['#3b82f6', '#10b981'],
		xaxis: {
			categories: ['04/10', '05/10', '06/10', '07/10', '08/10', '09/10', '10/10']
		},
		yaxis: {
			labels: {
				formatter: (val) => `${(val / 1000000).toFixed(0)}Tr`
			}
		},
		tooltip: {
			y: {
				formatter: (val) => `${val.toLocaleString('vi-VN')} đ`
			}
		}
	};

	const chartSeries = [
		{ name: 'Doanh thu gộp', data: [21000000, 24500000, 28000000, 23000000, 31000000, 29000000, 28000000] },
		{ name: 'Doanh thu thuần', data: [19800000, 23100000, 26500000, 21900000, 29200000, 27500000, 26800000] }
	];

	const channelChartOptions: ApexCharts.ApexOptions = {
		chart: { type: 'donut' },
		labels: ['Web Store', 'Sàn Shopee', 'TikTok Shop', 'Cửa Hàng POS'],
		colors: ['#3b82f6', '#f97316', '#111827', '#10b981'],
		legend: { position: 'bottom' }
	};

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Page Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Báo Cáo Doanh Thu & Tăng Trưởng (Revenue Analytics)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Phân tích hiệu suất doanh thu gộp, doanh thu thuần và cơ cấu doanh số đa kênh bán hàng
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
					<ToggleButtonGroup
						value={range}
						exclusive
						onChange={(_, val) => val && setRange(val)}
						size="small"
					>
						<ToggleButton value="7d">7 Ngày</ToggleButton>
						<ToggleButton value="30d">30 Ngày</ToggleButton>
						<ToggleButton value="90d">Quý Này</ToggleButton>
						<ToggleButton value="1y">Năm Nay</ToggleButton>
					</ToggleButtonGroup>

					<Button
						variant="contained"
						color="primary"
						startIcon={<DownloadIcon />}
						onClick={handleExport}
					>
						Xuất Báo Cáo CSV
					</Button>
				</Box>
			</Box>

			{/* KPI Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-blue-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Doanh Thu Gộp</Typography>
						<TrendingUpIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{(revenueData?.totalRevenue || 184500000).toLocaleString('vi-VN')} đ
					</Typography>
					<div className="flex items-center text-xs font-medium text-green-600">
						+14.2% so với kỳ trước
					</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-emerald-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Doanh Thu Thuần</Typography>
						<AccountBalanceWalletIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{(revenueData?.netRevenue || 172600000).toLocaleString('vi-VN')} đ
					</Typography>
					<div className="flex items-center text-xs font-medium text-green-600">
						+12.8% lợi nhuận ròng
					</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-indigo-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tổng Đơn Hàng</Typography>
						<ShoppingBagIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{(revenueData?.totalOrders || 428).toLocaleString()} đơn
					</Typography>
					<div className="flex items-center text-xs font-medium text-green-600">
						+8.5% khối lượng bán
					</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-purple-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Giá Trị Đơn Trung Bình (AOV)</Typography>
						<ReceiptLongIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{(revenueData?.averageOrderValue || 431000).toLocaleString('vi-VN')} đ
					</Typography>
					<div className="flex items-center text-xs font-medium text-green-600">
						+5.1% giá trị giỏ hàng
					</div>
				</Paper>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
				<Paper className="p-20 border rounded-xl shadow-none lg:col-span-2 flex flex-col gap-16">
					<div className="flex items-center justify-between">
						<Typography variant="h6" className="font-bold">
							Đồ Thị Biến Thiên Doanh Thu
						</Typography>
						<span className="text-xs text-gray-500">Đơn vị: VNĐ</span>
					</div>
					<ReactApexChart
						options={chartOptions}
						series={chartSeries}
						type="area"
						height={320}
					/>
				</Paper>

				<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Cơ Cấu Doanh Số Theo Kênh
					</Typography>
					<div className="flex-1 flex items-center justify-center">
						<ReactApexChart
							options={channelChartOptions}
							series={[53.4, 28.2, 14.1, 4.3]}
							type="donut"
							height={280}
						/>
					</div>
				</Paper>
			</div>

			{/* Data Grid Table */}
			<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
				<Typography variant="h6" className="font-bold">
					Bảng Kê Chi Tiết Hiệu Suất Doanh Thu Hàng Ngày
				</Typography>
				<div style={{ height: 380, width: '100%' }}>
					<DataGrid
						rows={mockDailyRows}
						columns={columns}
						pageSizeOptions={[7, 14]}
						initialState={{
							pagination: { paginationModel: { pageSize: 7, page: 0 } }
						}}
						disableRowSelectionOnClick
					/>
				</div>
			</Paper>
		</div>
	);
}
