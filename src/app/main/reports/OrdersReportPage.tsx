import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DownloadIcon from '@mui/icons-material/Download';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReactApexChart from 'react-apexcharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useGetOrderStatusSummaryReportQuery } from './ReportsApi';

const mockOrderRows = [
	{ id: 'ORD-9821', customer: 'Nguyễn Minh Tú', channel: 'Web Store', date: '10/10/2026 14:20', total: 1450000, status: 'Đã giao', carrier: 'GHN Express', tracking: 'GHN892183' },
	{ id: 'ORD-9820', customer: 'Trần Thị Thảo', channel: 'Shopee', date: '10/10/2026 13:45', total: 820000, status: 'Đang vận chuyển', carrier: 'Viettel Post', tracking: 'VT772190' },
	{ id: 'ORD-9819', customer: 'Lê Hoàng Nam', channel: 'TikTok Shop', date: '10/10/2026 12:15', total: 2100000, status: 'Đang đóng gói', carrier: 'GHN Express', tracking: 'GHN892182' },
	{ id: 'ORD-9818', customer: 'Phạm Quỳnh Anh', channel: 'Web Store', date: '10/10/2026 11:30', total: 650000, status: 'Đã xác nhận', carrier: 'GHTK', tracking: 'TK991201' },
	{ id: 'ORD-9817', customer: 'Đỗ Mạnh Cường', channel: 'Shopee', date: '10/10/2026 10:05', total: 3400000, status: 'Đã giao', carrier: 'GHN Express', tracking: 'GHN892181' },
	{ id: 'ORD-9816', customer: 'Vũ Bích Ngọc', channel: 'TikTok Shop', date: '09/10/2026 19:40', total: 490000, status: 'Chờ xác nhận', carrier: '-', tracking: '-' },
	{ id: 'ORD-9815', customer: 'Bùi Gia Huy', channel: 'Web Store', date: '09/10/2026 18:22', total: 1120000, status: 'Đã hủy', carrier: '-', tracking: '-' }
];

const columns: GridColDef[] = [
	{ field: 'id', headerName: 'Mã Đơn', width: 120 },
	{ field: 'customer', headerName: 'Khách Hàng', width: 170 },
	{
		field: 'channel',
		headerName: 'Kênh Bán',
		width: 140,
		renderCell: (params) => {
			const color = params.value === 'Web Store' ? 'primary' : params.value === 'Shopee' ? 'warning' : 'default';
			return <Chip size="small" label={params.value} color={color as any} variant="outlined" />;
		}
	},
	{ field: 'date', headerName: 'Thời Gian', width: 160 },
	{
		field: 'total',
		headerName: 'Tổng Tiền',
		width: 150,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'status',
		headerName: 'Trạng Thái',
		width: 150,
		renderCell: (params) => {
			let color: 'success' | 'info' | 'warning' | 'error' | 'default' = 'default';
			if (params.value === 'Đã giao') color = 'success';
			else if (params.value === 'Đang vận chuyển' || params.value === 'Đang đóng gói') color = 'info';
			else if (params.value === 'Chờ xác nhận') color = 'warning';
			else if (params.value === 'Đã hủy') color = 'error';
			return <Chip size="small" label={params.value} color={color} />;
		}
	},
	{ field: 'carrier', headerName: 'ĐVVC', width: 130 },
	{ field: 'tracking', headerName: 'Mã Vận Đơn', width: 130 }
];

export default function OrdersReportPage() {
	const { enqueueSnackbar } = useSnackbar();
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const { data: orderStats } = useGetOrderStatusSummaryReportQuery();

	const handleExport = () => {
		const csv = 'OrderId,Customer,Channel,Total,Status\nORD-9821,Nguyen Minh Tu,Web Store,1450000,Delivered\nORD-9820,Tran Thi Thao,Shopee,820000,Shipping';
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'Bao_Cao_Don_Hang.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		enqueueSnackbar('Đã tải xuống file báo cáo đơn hàng thành công!', { variant: 'success' });
	};

	const funnelChartOptions: ApexCharts.ApexOptions = {
		chart: { type: 'bar', toolbar: { show: false } },
		plotOptions: {
			bar: {
				borderRadius: 4,
				horizontal: true,
				distributed: true
			}
		},
		colors: ['#f59e0b', '#3b82f6', '#6366f1', '#06b6d4', '#10b981', '#ef4444'],
		xaxis: {
			categories: ['Chờ xác nhận', 'Đã xác nhận', 'Đang đóng gói', 'Đang giao hàng', 'Đã giao thành công', 'Đã hủy/Hoàn']
		},
		legend: { show: false }
	};

	const funnelSeries = [
		{
			name: 'Số lượng đơn',
			data: [
				orderStats?.pending || 14,
				orderStats?.confirmed || 28,
				orderStats?.processing || 45,
				orderStats?.shipped || 120,
				orderStats?.delivered || 210,
				(orderStats?.cancelled || 8) + (orderStats?.refunded || 3)
			]
		}
	];

	const carrierChartOptions: ApexCharts.ApexOptions = {
		chart: { type: 'pie' },
		labels: ['Giao Hàng Nhanh (GHN)', 'Viettel Post', 'Giao Hàng Tiết Kiệm', 'Hỏa Tốc / Khác'],
		colors: ['#ea580c', '#dc2626', '#16a34a', '#64748b'],
		legend: { position: 'bottom' }
	};

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Page Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Báo Cáo Đơn Hàng & Vận Hành (Orders Analytics)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Theo dõi tỷ lệ hoàn tất đơn hàng, phễu trạng thái vận hành và chỉ số đối soát giao vận
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Button
						variant="contained"
						color="primary"
						startIcon={<DownloadIcon />}
						onClick={handleExport}
					>
						Xuất File CSV
					</Button>
				</Box>
			</Box>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-blue-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tổng Đơn Đã Ghi Nhận</Typography>
						<LocalShippingIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{(orderStats?.total || 428).toLocaleString()} đơn
					</Typography>
					<div className="text-xs text-green-600 font-medium">98.2% đơn hợp lệ</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-emerald-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tỷ Lệ Giao Thành Công</Typography>
						<CheckCircleOutlineIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						94.2%
					</Typography>
					<div className="text-xs text-green-600 font-medium">+1.8% so với tháng trước</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-amber-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Đơn Đang Xử Lý & Giao</Typography>
						<HourglassEmptyIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						{((orderStats?.processing || 45) + (orderStats?.shipped || 120)).toLocaleString()} đơn
					</Typography>
					<div className="text-xs text-amber-600 font-medium">Cần hoàn tất đóng gói</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-red-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tỷ Lệ Hủy & Hoàn Trả</Typography>
						<CancelOutlinedIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">
						2.5%
					</Typography>
					<div className="text-xs text-green-600 font-medium">Dưới ngưỡng an toàn (5%)</div>
				</Paper>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
				<Paper className="p-20 border rounded-xl shadow-none lg:col-span-2 flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Phễu Trạng Thái Xử Lý Đơn Hàng (Order Pipeline)
					</Typography>
					<ReactApexChart
						options={funnelChartOptions}
						series={funnelSeries}
						type="bar"
						height={290}
					/>
				</Paper>

				<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Thị Phần Đơn Vị Vận Chuyển
					</Typography>
					<div className="flex-1 flex items-center justify-center">
						<ReactApexChart
							options={carrierChartOptions}
							series={[62, 22, 12, 4]}
							type="pie"
							height={270}
						/>
					</div>
				</Paper>
			</div>

			{/* Data Grid Table */}
			<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
				<div className="flex items-center justify-between flex-wrap gap-12">
					<Typography variant="h6" className="font-bold">
						Danh Sách Đơn Hàng Gần Đây
					</Typography>
					<ToggleButtonGroup
						value={statusFilter}
						exclusive
						onChange={(_, val) => val && setStatusFilter(val)}
						size="small"
					>
						<ToggleButton value="all">Tất Cả</ToggleButton>
						<ToggleButton value="delivered">Đã Giao</ToggleButton>
						<ToggleButton value="shipping">Đang Giao</ToggleButton>
						<ToggleButton value="pending">Chờ Xử Lý</ToggleButton>
					</ToggleButtonGroup>
				</div>
				<div style={{ height: 380, width: '100%' }}>
					<DataGrid
						rows={mockOrderRows}
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
