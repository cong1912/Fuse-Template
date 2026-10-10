import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ReactApexChart from 'react-apexcharts';

export default function ConversionFunnelWidget() {
	const funnelOptions: ApexCharts.ApexOptions = {
		chart: { type: 'bar', toolbar: { show: false } },
		plotOptions: {
			bar: {
				borderRadius: 4,
				horizontal: true,
				distributed: true,
				isFunnel: true
			}
		},
		colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
		xaxis: {
			categories: [
				'Lượt Truy Cập (Visitors)',
				'Xem Trang Sản Phẩm',
				'Thêm Vào Giỏ Hàng',
				'Bắt Đầu Thanh Toán',
				'Đặt Hàng Thành Công'
			]
		},
		legend: { show: false }
	};

	const funnelSeries = [
		{
			name: 'Lượt người dùng',
			data: [12450, 6820, 1450, 620, 428]
		}
	];

	return (
		<Paper className="p-20 border rounded-xl shadow-none flex flex-col gap-16 w-full">
			<div className="flex items-center justify-between flex-wrap gap-8">
				<div>
					<Typography variant="h6" className="font-bold">
						Phễu Chuyển Đổi Mua Hàng Toàn Diện (E-Commerce Funnel)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Tỷ lệ rớt đơn và hiệu quả chuyển hóa qua từng giai đoạn mua sắm
					</Typography>
				</div>
				<div className="flex items-center gap-8">
					<Chip label="CR Tổng: 3.44%" color="success" className="font-bold" />
					<Chip label="Thêm giỏ: 21.3%" color="primary" variant="outlined" />
				</div>
			</div>

			<ReactApexChart
				options={funnelOptions}
				series={funnelSeries}
				type="bar"
				height={260}
			/>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-12 pt-12 border-t">
				<div className="flex flex-col">
					<span className="text-xs text-gray-500">Xem SP / Truy cập</span>
					<span className="font-bold text-base text-blue-600">54.8%</span>
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-gray-500">Bỏ giỏ / Xem SP</span>
					<span className="font-bold text-base text-indigo-600">21.3%</span>
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-gray-500">Checkout / Giỏ hàng</span>
					<span className="font-bold text-base text-purple-600">42.8%</span>
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-gray-500">Hoàn tất / Checkout</span>
					<span className="font-bold text-base text-emerald-600">69.0%</span>
				</div>
			</div>
		</Paper>
	);
}
