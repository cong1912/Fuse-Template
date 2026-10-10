import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import WarningIcon from '@mui/icons-material/Warning';
import LoopIcon from '@mui/icons-material/Loop';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReactApexChart from 'react-apexcharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

const mockInventoryRows = [
	{ id: '1', sku: 'KB-RK84', name: 'Bàn phím cơ không dây RK84 RGB', warehouse: 'Kho Tổng Hà Nội', stock: 65, reserved: 12, minAlert: 20, doi: 14, suggestion: 50, status: 'Đủ Hàng' },
	{ id: '2', sku: 'MS-PULSE', name: 'Chuột Gaming Siêu Nhẹ Pulsefire Haste', warehouse: 'Kho Bình Tân HCM', stock: 28, reserved: 8, minAlert: 15, doi: 9, suggestion: 30, status: 'Ổn Định' },
	{ id: '3', sku: 'HP-NC700', name: 'Tai nghe chụp tai Không Dây Noise Cancelling', warehouse: 'Kho Tổng Hà Nội', stock: 12, reserved: 4, minAlert: 15, doi: 5, suggestion: 40, status: 'Sắp Hết Hàng' },
	{ id: '4', sku: 'CH-ERGO', name: 'Ghế Công Thái Học Ergonomic Pro Herman', warehouse: 'Kho Bình Tân HCM', stock: 8, reserved: 3, minAlert: 10, doi: 4, suggestion: 25, status: 'Sắp Hết Hàng' },
	{ id: '5', sku: 'LT-DESK', name: 'Đèn Bàn LED Chống Cận Cảm Ứng Xiaomi', warehouse: 'Kho Đà Nẵng', stock: 4, reserved: 2, minAlert: 10, doi: 2, suggestion: 60, status: 'Khẩn Cấp' },
	{ id: '6', sku: 'PAD-XXL', name: 'Bàn Di Chuột Cỡ Lớn 900x400 Khâu Viền', warehouse: 'Kho Tổng Hà Nội', stock: 110, reserved: 15, minAlert: 30, doi: 22, suggestion: 0, status: 'Đủ Hàng' }
];

const columns: GridColDef[] = [
	{ field: 'sku', headerName: 'Mã SKU', width: 110 },
	{ field: 'name', headerName: 'Tên Sản Phẩm', width: 260 },
	{ field: 'warehouse', headerName: 'Vị Trí Kho', width: 160 },
	{
		field: 'stock',
		headerName: 'Tồn Thực Tế',
		width: 120,
		renderCell: (params) => (
			<span className={params.value <= 10 ? 'text-red-500 font-bold' : 'text-gray-800'}>
				{params.value} chiếc
			</span>
		)
	},
	{ field: 'reserved', headerName: 'Tạm Giữ (Đang Đóng)', width: 150 },
	{ field: 'doi', headerName: 'Số Ngày Còn Hàng', width: 140, renderCell: (params) => `${params.value} ngày` },
	{
		field: 'suggestion',
		headerName: 'Gợi Ý Nhập Thêm',
		width: 150,
		renderCell: (params) => (
			params.value > 0 ? (
				<Chip size="small" label={`+${params.value} cái`} color="warning" variant="outlined" />
			) : (
				<span className="text-gray-400">Đã đủ tồn</span>
			)
		)
	},
	{
		field: 'status',
		headerName: 'Tình Trạng',
		width: 140,
		renderCell: (params) => {
			const color = params.value === 'Đủ Hàng' ? 'success' : params.value === 'Ổn Định' ? 'primary' : params.value === 'Sắp Hết Hàng' ? 'warning' : 'error';
			return <Chip size="small" label={params.value} color={color as any} />;
		}
	}
];

export default function InventoryReportPage() {
	const { enqueueSnackbar } = useSnackbar();

	const handleExport = () => {
		const csv = 'SKU,Name,Warehouse,Stock,DaysRemaining,ReorderSuggestion\nKB-RK84,RK84,Hanoi,65,14,50\nLT-DESK,Xiaomi LED,Danang,4,2,60';
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'Bao_Cao_Ton_Kho.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		enqueueSnackbar('Đã xuất file báo cáo tồn kho thành công!', { variant: 'success' });
	};

	const handleCreatePO = () => {
		enqueueSnackbar('Đã tự động tạo phiếu đề xuất nhập hàng (Purchase Order) cho 3 mặt hàng sắp hết!', { variant: 'success' });
	};

	const warehouseShareOptions: ApexCharts.ApexOptions = {
		chart: { type: 'donut' },
		labels: ['Kho Tổng Hà Nội (Miền Bắc)', 'Kho Bình Tân (Miền Nam)', 'Kho Đà Nẵng (Miền Trung)'],
		colors: ['#3b82f6', '#10b981', '#f59e0b'],
		legend: { position: 'bottom' }
	};

	const healthBarOptions: ApexCharts.ApexOptions = {
		chart: { type: 'bar', stacked: true, toolbar: { show: false } },
		plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 } },
		colors: ['#10b981', '#f59e0b', '#ef4444'],
		xaxis: { categories: ['Điện Tử', 'Gaming', 'Công Thái Học', 'Phụ Kiện'] },
		legend: { position: 'top' }
	};

	const healthSeries = [
		{ name: 'Đủ hàng an toàn', data: [45, 60, 25, 80] },
		{ name: 'Sắp hết hàng', data: [8, 12, 5, 10] },
		{ name: 'Đã hết hàng', data: [1, 2, 0, 1] }
	];

	return (
		<div className="p-16 sm:p-24 w-full flex flex-col gap-24">
			{/* Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Báo Cáo Tồn Kho & Dự Báo Cung Ứng (Inventory Intelligence)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Theo dõi giá trị tồn kho đa điểm, cảnh báo sản phẩm chạm điểm an toàn và tự động đề xuất đơn nhập hàng (PO)
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
					<Button
						variant="outlined"
						startIcon={<AddShoppingCartIcon />}
						onClick={handleCreatePO}
					>
						Tạo Lệnh Nhập Gợi Ý
					</Button>
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

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-blue-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tổng Giá Trị Tồn Kho</Typography>
						<WarehouseIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">845.200.000 đ</Typography>
					<div className="text-xs text-gray-500">Tính theo giá vốn nhập kho</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-emerald-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Tổng Sản Phẩm Lưu Kho</Typography>
						<WarehouseIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">2.450 chiếc</Typography>
					<div className="text-xs text-green-600 font-medium">Phân bổ tại 3 kho chi nhánh</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-amber-500">
						<Typography variant="body2" className="font-semibold text-gray-500">Cảnh Báo Sắp Hết Hàng</Typography>
						<WarningIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">3 Mặt Hàng</Typography>
					<div className="text-xs text-amber-600 font-medium">Tồn kho dưới 10 sản phẩm</div>
				</Paper>

				<Paper className="p-16 flex flex-col gap-8 border rounded-xl shadow-none">
					<div className="flex items-center justify-between text-purple-600">
						<Typography variant="body2" className="font-semibold text-gray-500">Hệ Số Vòng Quay Kho</Typography>
						<LoopIcon />
					</div>
					<Typography variant="h5" className="font-extrabold">6.2 lần / năm</Typography>
					<div className="text-xs text-green-600 font-medium">Hiệu suất luân chuyển cao</div>
				</Paper>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
				<Paper className="p-20 border rounded-xl shadow-none lg:col-span-2 flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Tình Trạng Sức Khỏe Tồn Kho Theo Ngành Hàng
					</Typography>
					<ReactApexChart
						options={healthBarOptions}
						series={healthSeries}
						type="bar"
						height={290}
					/>
				</Paper>

				<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
					<Typography variant="h6" className="font-bold">
						Phân Bổ Tồn Kho Theo Điểm Kho
					</Typography>
					<div className="flex-1 flex items-center justify-center">
						<ReactApexChart
							options={warehouseShareOptions}
							series={[55, 35, 10]}
							type="donut"
							height={270}
						/>
					</div>
				</Paper>
			</div>

			{/* Data Grid Table */}
			<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16">
				<Typography variant="h6" className="font-bold">
					Danh Sách Tồn Kho & Dự Báo Nhập Bổ Sung (Reorder Matrix)
				</Typography>
				<div style={{ height: 350, width: '100%' }}>
					<DataGrid
						rows={mockInventoryRows}
						columns={columns}
						pageSizeOptions={[6, 12]}
						initialState={{
							pagination: { paginationModel: { pageSize: 6, page: 0 } }
						}}
						disableRowSelectionOnClick
					/>
				</div>
			</Paper>
		</div>
	);
}
