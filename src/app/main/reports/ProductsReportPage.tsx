import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReactApexChart from 'react-apexcharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useGetTopProductsReportQuery, useGetCategoryRevenueReportQuery } from './ReportsApi';

const mockProductRows = [
	{ id: 'p1', name: 'Bàn phím cơ không dây RK84 RGB Hotswap', sku: 'KB-RK84', category: 'Thiết Bị Điện Tử', sold: 142, revenue: 142000000, margin: 38, stock: 65, status: 'Bán Rất Chạy' },
	{ id: 'p2', name: 'Chuột Gaming Siêu Nhẹ Pulsefire Haste', sku: 'MS-PULSE', category: 'Phụ Kiện Gaming', sold: 98, revenue: 78400000, margin: 42, stock: 28, status: 'Bán Rất Chạy' },
	{ id: 'p3', name: 'Tai nghe chụp tai Không Dây Noise Cancelling', sku: 'HP-NC700', category: 'Thiết Bị Điện Tử', sold: 76, revenue: 114000000, margin: 35, stock: 12, status: 'Ổn Định' },
	{ id: 'p4', name: 'Ghế Công Thái Học Ergonomic Pro Herman', sku: 'CH-ERGO', category: 'Bàn Ghế Công Thái Học', sold: 34, revenue: 170000000, margin: 45, stock: 8, status: 'Ổn Định' },
	{ id: 'p5', name: 'Đèn Bàn LED Chống Cận Cảm Ứng Xiaomi', sku: 'LT-DESK', category: 'Phụ Kiện Gaming', sold: 115, revenue: 46000000, margin: 50, stock: 4, status: 'Sắp Hết Hàng' },
	{ id: 'p6', name: 'Bàn Di Chuột Cỡ Lớn 900x400 Khâu Viền', sku: 'PAD-XXL', category: 'Phụ Kiện Gaming', sold: 180, revenue: 36000000, margin: 60, stock: 110, status: 'Bán Tốt' },
	{ id: 'p7', name: 'Giá Đỡ Laptop Nhôm Nguyên Khối Gập Gọn', sku: 'STD-ALU', category: 'Phụ Kiện Gaming', sold: 6, revenue: 1800000, margin: 25, stock: 45, status: 'Chậm Luân Chuyển' }
];

const columns: GridColDef[] = [
	{ field: 'sku', headerName: 'Mã SKU', width: 110 },
	{ field: 'name', headerName: 'Tên Sản Phẩm', width: 280 },
	{ field: 'category', headerName: 'Danh Mục', width: 180 },
	{ field: 'sold', headerName: 'Đã Bán', width: 100 },
	{
		field: 'revenue',
		headerName: 'Doanh Thu',
		width: 160,
		valueFormatter: (params) => `${Number(params.value).toLocaleString('vi-VN')} đ`
	},
	{
		field: 'margin',
		headerName: 'Biên LN',
		width: 100,
		valueFormatter: (params) => `${params.value}%`
	},
	{
		field: 'stock',
		headerName: 'Tồn Kho',
		width: 110,
		renderCell: (params) => (
			<span className={params.value <= 10 ? 'text-red-500 font-bold' : 'text-gray-700'}>
				{params.value} chiếc
			</span>
		)
	},
	{
		field: 'status',
		headerName: 'Đánh Giá',
		width: 150,
		renderCell: (params) => {
			let color: 'success' | 'warning' | 'error' | 'default' = 'default';
			if (params.value === 'Bán Rất Chạy' || params.value === 'Bán Tốt') color = 'success';
			else if (params.value === 'Sắp Hết Hàng') color = 'warning';
			else if (params.value === 'Chậm Luân Chuyển') color = 'error';
			return <Chip size="small" label={params.value} color={color} />;
		}
	}
];

export default function ProductsReportPage() {
	const { enqueueSnackbar } = useSnackbar();
	const { data: topProducts } = useGetTopProductsReportQuery({ topN: 5 });
	const { data: categoryStats } = useGetCategoryRevenueReportQuery({ days: 30 });

	const handleExport = () => {
		const csv = 'SKU,Name,Category,Sold,Revenue,Margin,Stock\nKB-RK84,RK84 RGB,Electronics,142,142000000,38%,65\nMS-PULSE,Pulsefire,Gaming,98,78400000,42%,28';
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'Bao_Cao_San_Pham.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		enqueueSnackbar('Đã tải xuống file báo cáo sản phẩm thành công!', { variant: 'success' });
	};

	const topBarOptions: ApexCharts.ApexOptions = {
		chart: { type: 'bar', toolbar: { show: false } },
		plotOptions: {
			bar: {
				horizontal: true,
				borderRadius: 4,
				barHeight: '60%'
			}
		},
		colors: ['#3b82f6'],
		xaxis: {
			categories: ['Xiaomi LED Desk', 'Tai Nghe NC700', 'Pulsefire Haste', 'Bàn Phím RK84', 'Ghế Ergo Pro'],
			labels: {
				formatter: (val) => `${(Number(val) / 1000000).toFixed(0)}Tr`
			}
		},
		tooltip: {
			y: { formatter: (val) => `${Number(val).toLocaleString('vi-VN')} đ` }
		}
	};

	const topBarSeries = [
		{
			name: 'Doanh thu (VNĐ)',
			data: [46000000, 114000000, 78400000, 142000000, 170000000]
		}
	];

	const categoryDonutOptions: ApexCharts.ApexOptions = {
		chart: { type: 'donut' },
		labels: ['Thiết Bị Điện Tử', 'Phụ Kiện Gaming', 'Bàn Ghế Công Thái Học', 'Khác'],
		colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
		legend: { position: 'bottom' }
	};

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Báo Cáo Sản Phẩm & Hiệu Suất Bán Lẻ (Products Intelligence)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Thống kê top sản phẩm sinh lời cao, tỷ trọng doanh thu ngành hàng và cảnh báo hàng chậm luân chuyển
					</Typography>
				</Box>

				<Button
					variant="contained"
					color="primary"
					startIcon={<DownloadIcon />}
					onClick={handleExport}
				>
					Xuất File Báo Cáo
				</Button>
			</Box>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-blue-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Mặt Hàng Đang Bán</Typography>
						<Inventory2Icon />
					</div>
					<Typography variant="h5" className="font-extrabold">38 Mã SKU</Typography>
					<div className="text-xs text-green-600 font-medium">+5 sản phẩm mới tháng này</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-amber-500">
						<Typography variant="body2" className="font-semibold text-gray-500">Top 1 Doanh Thu</Typography>
						<StarIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">Ghế Ergo Pro</Typography>
					<div className="text-xs text-gray-500">170.000.000 đ doanh thu</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-emerald-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tỷ Suất LN Trung Bình</Typography>
						<MonetizationOnIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">41.6%</Typography>
					<div className="text-xs text-green-600 font-medium">+3.4% so với quý trước</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-red-500">
						<Typography variant="body2" className="font-semibold text-gray-500">Hàng Chậm Luân Chuyển</Typography>
						<WarningAmberIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">2 Mã SKU</Typography>
					<div className="text-xs text-red-500 font-medium">Khuyến nghị tạo Flash Sale</div>
				</Paper>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
				<Paper className="p-20 border rounded-xl shadow-none lg:col-span-2 flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Top 5 Sản Phẩm Doanh Thu Cao Nhất
					</Typography>
					<ReactApexChart
						options={topBarOptions}
						series={topBarSeries}
						type="bar"
						height={290}
					/>
				</Paper>

				<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Cơ Cấu Doanh Thu Ngành Hàng
					</Typography>
					<div className="flex-1 flex items-center justify-center">
						<ReactApexChart
							options={categoryDonutOptions}
							series={[53.4, 28.2, 18.4, 0]}
							type="donut"
							height={270}
						/>
					</div>
				</Paper>
			</div>

			{/* Data Grid Table */}
			<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
				<Typography variant="h6" className="font-bold">
					Bảng Thống Kê Hiệu Quả Từng Mã Hàng (Product Performance Matrix)
				</Typography>
				<div style={{ height: 380, width: '100%' }}>
					<DataGrid
						rows={mockProductRows}
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
