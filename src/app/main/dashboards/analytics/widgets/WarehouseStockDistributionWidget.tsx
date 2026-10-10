import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import ReactApexChart from 'react-apexcharts';

export default function WarehouseStockDistributionWidget() {
	const donutOptions: ApexCharts.ApexOptions = {
		chart: { type: 'donut' },
		labels: ['Kho Tổng Hà Nội (Miền Bắc)', 'Kho Tân Bình (Miền Nam)', 'Kho Đà Nẵng (Miền Trung)'],
		colors: ['#3b82f6', '#10b981', '#f59e0b'],
		legend: { position: 'bottom' }
	};

	const warehouses = [
		{ name: 'Kho Tổng Hà Nội (Khu CN Sài Đồng)', stock: 1350, capacity: 2000, percentage: 67.5, status: 'Ổn Định', color: 'primary' },
		{ name: 'Kho Tân Bình HCM (Đường Cộng Hòa)', stock: 850, capacity: 1000, percentage: 85.0, status: 'Gần Đầy', color: 'warning' },
		{ name: 'Kho Đà Nẵng (Đường Nguyễn Hữu Thọ)', stock: 250, capacity: 500, percentage: 50.0, status: 'Còn Chỗ', color: 'success' }
	];

	return (
		<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-20">
			<div className="flex items-center justify-between">
				<div>
					<Typography variant="h6" className="font-bold">
						Mạng Lưới & Sức Chứa Kho Hàng Đa Chi Nhánh
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Tỷ lệ lấp đầy kho bãi và số lượng sản phẩm lưu trữ theo địa lý
					</Typography>
				</div>
				<Chip label="3 Điểm Kho Hoạt Động" color="success" size="small" variant="outlined" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-center">
				<div className="lg:col-span-1 flex items-center justify-center">
					<ReactApexChart
						options={donutOptions}
						series={[55.1, 34.7, 10.2]}
						type="donut"
						height={260}
					/>
				</div>

				<div className="lg:col-span-2 flex flex-col gap-16">
					{warehouses.map((wh, idx) => (
						<div key={idx} className="flex flex-col gap-6 p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-sm">{wh.name}</span>
								<div className="flex items-center gap-8">
									<span className="text-xs font-bold text-gray-500">{wh.stock} / {wh.capacity} SP ({wh.percentage}%)</span>
									<Chip size="small" label={wh.status} color={wh.color as any} />
								</div>
							</div>
							<LinearProgress variant="determinate" value={wh.percentage} color={wh.color as any} sx={{ height: 8, borderRadius: 4 }} />
						</div>
					))}
				</div>
			</div>
		</Paper>
	);
}
