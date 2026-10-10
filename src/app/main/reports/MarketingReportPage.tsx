import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import CampaignIcon from '@mui/icons-material/Campaign';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SavingsIcon from '@mui/icons-material/Savings';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ReactApexChart from 'react-apexcharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

const mockMarketingRows = [
	{ id: '1', code: 'FLASHDEAL50', campaign: 'Flash Sale 10/10 Siêu Sale', type: 'Giảm 50k', uses: 120, spent: 6000000, revenue: 38400000, roi: '6.4x', status: 'Đang Chạy' },
	{ id: '2', code: 'CHAOBANMOI', campaign: 'Khách Hàng Mới Lần Đầu', type: 'Giảm 10%', uses: 86, spent: 3440000, revenue: 25800000, roi: '7.5x', status: 'Đang Chạy' },
	{ id: '3', code: 'FREESHIP10', campaign: 'Miễn Phí Vận Chuyển Toàn Quốc', type: 'Free Shipping', uses: 64, spent: 1920000, revenue: 16000000, roi: '8.3x', status: 'Đang Chạy' },
	{ id: '4', code: 'VIPMEMBER20', campaign: 'Tri Ân Khách Hàng Thân Thiết', type: 'Giảm 20%', uses: 42, spent: 1490000, revenue: 6200000, roi: '4.2x', status: 'Hết Ngân Sách' }
];

const columns: GridColDef[] = [
	{ field: 'code', headerName: 'Mã Voucher', width: 150 },
	{ field: 'campaign', headerName: 'Tên Chiến Dịch', width: 250 },
	{ field: 'type', headerName: 'Hình Thức', width: 140 },
	{ field: 'uses', headerName: 'Đã Dùng', width: 110 },
	{
		field: 'spent',
		headerName: 'Ngân Sách Chi',
		width: 140,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'revenue',
		headerName: 'Doanh Thu Kéo Về',
		width: 170,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'roi',
		headerName: 'Hiệu Quả (ROI)',
		width: 130,
		renderCell: (params) => (
			<span className="font-bold text-emerald-600">{params.value}</span>
		)
	},
	{
		field: 'status',
		headerName: 'Trạng Thái',
		width: 140,
		renderCell: (params) => {
			const color = params.value === 'Đang Chạy' ? 'success' : 'default';
			return <Chip size="small" label={params.value} color={color} />;
		}
	}
];

export default function MarketingReportPage() {
	const { enqueueSnackbar } = useSnackbar();

	const handleExport = () => {
		const csv = 'Code,Campaign,Type,Uses,DiscountSpent,RevenueGenerated,ROI\nFLASHDEAL50,Flash Sale 10/10,Fixed,120,6000000,38400000,6.4x\nCHAOBANMOI,Welcome,Percentage,86,3440000,25800000,7.5x';
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'Bao_Cao_Marketing.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		enqueueSnackbar('Đã xuất file báo cáo marketing thành công!', { variant: 'success' });
	};

	const campaignLineOptions: ApexCharts.ApexOptions = {
		chart: { type: 'area', toolbar: { show: false } },
		stroke: { curve: 'smooth', width: 2 },
		colors: ['#8b5cf6', '#3b82f6'],
		xaxis: { categories: ['04/10', '05/10', '06/10', '07/10', '08/10', '09/10', '10/10'] },
		yaxis: {
			labels: {
				formatter: (val) => `${(val / 1000000).toFixed(0)}Tr`
			}
		}
	};

	const campaignSeries = [
		{ name: 'Doanh thu kích hoạt nhờ Voucher', data: [8000000, 11000000, 14000000, 9500000, 18000000, 13500000, 12400000] },
		{ name: 'Số tiền chiết khấu thực tế', data: [1100000, 1500000, 2100000, 1300000, 2900000, 2050000, 1900000] }
	];

	const campaignShareOptions: ApexCharts.ApexOptions = {
		chart: { type: 'donut' },
		labels: ['Sự Kiện Flash Sale', 'Mã Giảm Giá Của Shop', 'Freeship Toàn Quốc', 'Chiến Dịch Khác'],
		colors: ['#f97316', '#8b5cf6', '#10b981', '#64748b'],
		legend: { position: 'bottom' }
	};

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Báo Cáo Tiếp Thị & Hiệu Quả Khuyến Mại (Marketing Analytics)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Đo lường doanh thu đóng góp từ chương trình giảm giá, tỷ lệ thu hồi chi phí (ROI) và hiệu quả voucher
					</Typography>
				</Box>

				<Button
					variant="contained"
					color="primary"
					startIcon={<DownloadIcon />}
					onClick={handleExport}
				>
					Xuất File Báo Cáo CSV
				</Button>
			</Box>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-purple-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Doanh Thu Từ Khuyến Mãi</Typography>
						<CampaignIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">86.400.000 đ</Typography>
					<div className="text-xs text-green-600 font-medium">Chiếm 46.8% tổng doanh số</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-blue-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Lượt Áp Dụng Thành Công</Typography>
						<ConfirmationNumberIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">312 Lượt</Typography>
					<div className="text-xs text-green-600 font-medium">+18.5% so với tuần trước</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-amber-500">
						<Typography variant="body2" className="font-semibold text-gray-500">Tổng Tiền Đã Giảm Giá</Typography>
						<SavingsIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">12.850.000 đ</Typography>
					<div className="text-xs text-gray-500">Trung bình 41.100 đ / đơn</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-emerald-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Hệ Số Hoàn Vốn (ROI)</Typography>
						<AutoGraphIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">6.7x</Typography>
					<div className="text-xs text-green-600 font-medium">1đ giảm giá kéo về 6.7đ doanh thu</div>
				</Paper>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
				<Paper className="p-20 border rounded-xl shadow-none lg:col-span-2 flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Tương Quan Doanh Thu & Ngân Sách Giảm Giá
					</Typography>
					<ReactApexChart
						options={campaignLineOptions}
						series={campaignSeries}
						type="area"
						height={290}
					/>
				</Paper>

				<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Cơ Cấu Chiến Dịch Khuyến Mại
					</Typography>
					<div className="flex-1 flex items-center justify-center">
						<ReactApexChart
							options={campaignShareOptions}
							series={[44.4, 29.8, 18.5, 7.3]}
							type="donut"
							height={270}
						/>
					</div>
				</Paper>
			</div>

			{/* Data Grid Table */}
			<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
				<Typography variant="h6" className="font-bold">
					Bảng Xếp Hạng Hiệu Quả Từng Mã Voucher
				</Typography>
				<div style={{ height: 320, width: '100%' }}>
					<DataGrid
						rows={mockMarketingRows}
						columns={columns}
						pageSizeOptions={[4, 8]}
						initialState={{
							pagination: { paginationModel: { pageSize: 4, page: 0 } }
						}}
						disableRowSelectionOnClick
					/>
				</div>
			</Paper>
		</div>
	);
}
