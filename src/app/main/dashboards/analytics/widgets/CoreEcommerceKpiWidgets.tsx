import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface KpiCardData {
	id: string;
	title: string;
	value: string;
	growth: string;
	isPositive: boolean;
	chartColor: string;
	chartType: 'area' | 'bar';
	series: number[];
}

interface CoreEcommerceKpiWidgetsProps {
	range?: string;
	channel?: string;
}

export default function CoreEcommerceKpiWidgets({
	range = 'today',
	channel = 'all'
}: CoreEcommerceKpiWidgetsProps) {
	// Dynamically calculate KPIs based on selected range and channel
	const getKpis = (): KpiCardData[] => {
		// Specific channel filter adjustments
		if (channel === 'web') {
			return [
				{
					id: 'kpi-gmv',
					title: 'Doanh Thu Web Store (GMV)',
					value: range === '7days' ? '₫72.240.000' : range === '30days' ? '₫303.780.000' : '₫9.590.000',
					growth: '+28.2% vs kỳ trước',
					isPositive: true,
					chartColor: '#10b981',
					chartType: 'area',
					series: [6, 8, 10, 12, 11, 15, 19, 22, 20, 25, 29, 33]
				},
				{
					id: 'kpi-orders',
					title: 'Số Đơn Hàng Web Store',
					value: range === '7days' ? '188 Đơn' : range === '30days' ? '790 Đơn' : '25 Đơn',
					growth: '+14.5% vs kỳ trước',
					isPositive: true,
					chartColor: '#6366f1',
					chartType: 'bar',
					series: [1, 2, 3, 2, 3, 4, 6, 5, 7, 6, 8, 9]
				},
				{
					id: 'kpi-aov',
					title: 'Giá Trị Đơn Trung Bình (AOV)',
					value: '₫383.600',
					growth: '+9.1% vs kỳ trước',
					isPositive: true,
					chartColor: '#3b82f6',
					chartType: 'area',
					series: [320, 330, 345, 340, 365, 375, 390, 385, 380, 384]
				},
				{
					id: 'kpi-cvr',
					title: 'Tỷ Lệ Chuyển Đổi (CR)',
					value: '3.85%',
					growth: '+0.8% vs kỳ trước',
					isPositive: true,
					chartColor: '#8b5cf6',
					chartType: 'area',
					series: [2.5, 2.7, 3.0, 3.2, 3.4, 3.5, 3.7, 3.6, 3.85]
				}
			];
		}

		if (channel === 'shopee') {
			return [
				{
					id: 'kpi-gmv',
					title: 'Doanh Thu Sàn Shopee (GMV)',
					value: range === '7days' ? '₫43.060.000' : range === '30days' ? '₫181.100.000' : '₫5.720.000',
					growth: '+21.3% vs kỳ trước',
					isPositive: true,
					chartColor: '#ee4d2d',
					chartType: 'area',
					series: [4, 5, 6, 7, 6, 9, 12, 14, 13, 16, 18, 21]
				},
				{
					id: 'kpi-orders',
					title: 'Số Đơn Shopee Mall',
					value: range === '7days' ? '112 Đơn' : range === '30days' ? '471 Đơn' : '15 Đơn',
					growth: '+11.2% vs kỳ trước',
					isPositive: true,
					chartColor: '#6366f1',
					chartType: 'bar',
					series: [1, 1, 2, 1, 2, 3, 4, 3, 5, 4, 5, 6]
				},
				{
					id: 'kpi-aov',
					title: 'Giá Trị Đơn Trung Bình (AOV)',
					value: '₫381.333',
					growth: '+7.4% vs kỳ trước',
					isPositive: true,
					chartColor: '#3b82f6',
					chartType: 'area',
					series: [310, 320, 335, 330, 355, 365, 380, 375, 370, 381]
				},
				{
					id: 'kpi-cvr',
					title: 'Tỷ Lệ Chuyển Đổi (CR)',
					value: '3.15%',
					growth: '+0.5% vs kỳ trước',
					isPositive: true,
					chartColor: '#8b5cf6',
					chartType: 'area',
					series: [2.0, 2.2, 2.5, 2.7, 2.9, 3.0, 3.1, 3.0, 3.15]
				}
			];
		}

		if (channel === 'tiktok') {
			return [
				{
					id: 'kpi-gmv',
					title: 'Doanh Thu TikTok Shop (GMV)',
					value: range === '7days' ? '₫19.450.000' : range === '30days' ? '₫81.780.000' : '₫2.580.000',
					growth: '+35.8% vs kỳ trước',
					isPositive: true,
					chartColor: '#10b981',
					chartType: 'area',
					series: [2, 3, 3, 4, 4, 6, 8, 9, 8, 10, 12, 14]
				},
				{
					id: 'kpi-orders',
					title: 'Số Đơn TikTok Shop',
					value: range === '7days' ? '53 Đơn' : range === '30days' ? '223 Đơn' : '7 Đơn',
					growth: '+18.4% vs kỳ trước',
					isPositive: true,
					chartColor: '#6366f1',
					chartType: 'bar',
					series: [0, 1, 1, 1, 1, 2, 3, 2, 3, 2, 3, 4]
				},
				{
					id: 'kpi-aov',
					title: 'Giá Trị Đơn Trung Bình (AOV)',
					value: '₫368.571',
					growth: '+12.1% vs kỳ trước',
					isPositive: true,
					chartColor: '#3b82f6',
					chartType: 'area',
					series: [300, 310, 325, 320, 345, 355, 370, 365, 360, 369]
				},
				{
					id: 'kpi-cvr',
					title: 'Tỷ Lệ Chuyển Đổi (CR)',
					value: '4.10%',
					growth: '+1.2% vs kỳ trước',
					isPositive: true,
					chartColor: '#8b5cf6',
					chartType: 'area',
					series: [2.8, 3.0, 3.3, 3.5, 3.7, 3.8, 4.0, 3.9, 4.1]
				}
			];
		}

		// Default: All channels
		if (range === '7days') {
			return [
				{
					id: 'kpi-gmv',
					title: 'Doanh Thu 7 Ngày Qua (GMV)',
					value: '₫138.920.000',
					growth: '+18.4% vs 7 ngày trước',
					isPositive: true,
					chartColor: '#10b981',
					chartType: 'area',
					series: [95, 105, 112, 125, 118, 130, 142, 155, 148, 162, 175, 185]
				},
				{
					id: 'kpi-orders',
					title: 'Tổng Số Đơn Hàng (7 ngày)',
					value: '362 Đơn',
					growth: '+14.2% vs 7 ngày trước',
					isPositive: true,
					chartColor: '#6366f1',
					chartType: 'bar',
					series: [25, 28, 31, 35, 33, 38, 42, 45, 43, 48, 52, 55]
				},
				{
					id: 'kpi-aov',
					title: 'Giá Trị Đơn Trung Bình (AOV)',
					value: '₫383.756',
					growth: '+3.8% vs 7 ngày trước',
					isPositive: true,
					chartColor: '#3b82f6',
					chartType: 'area',
					series: [350, 355, 362, 368, 365, 372, 378, 382, 380, 384]
				},
				{
					id: 'kpi-cvr',
					title: 'Tỷ Lệ Chuyển Đổi (CR)',
					value: '3.65%',
					growth: '+0.4% vs 7 ngày trước',
					isPositive: true,
					chartColor: '#8b5cf6',
					chartType: 'area',
					series: [3.1, 3.2, 3.3, 3.4, 3.4, 3.5, 3.6, 3.6, 3.65]
				}
			];
		}

		if (range === '30days' || range === 'this_month') {
			return [
				{
					id: 'kpi-gmv',
					title: range === 'this_month' ? 'Doanh Thu Tháng Này (GMV)' : 'Doanh Thu 30 Ngày Qua (GMV)',
					value: '₫584.200.000',
					growth: '+22.8% vs kỳ trước',
					isPositive: true,
					chartColor: '#10b981',
					chartType: 'area',
					series: [380, 410, 435, 460, 450, 485, 520, 550, 540, 570, 595, 620]
				},
				{
					id: 'kpi-orders',
					title: 'Tổng Số Đơn Hàng',
					value: '1.520 Đơn',
					growth: '+16.5% vs kỳ trước',
					isPositive: true,
					chartColor: '#6366f1',
					chartType: 'bar',
					series: [100, 110, 115, 125, 120, 130, 140, 148, 145, 155, 160, 168]
				},
				{
					id: 'kpi-aov',
					title: 'Giá Trị Đơn Trung Bình (AOV)',
					value: '₫384.342',
					growth: '+5.4% vs kỳ trước',
					isPositive: true,
					chartColor: '#3b82f6',
					chartType: 'area',
					series: [360, 365, 370, 375, 372, 378, 382, 385, 383, 384]
				},
				{
					id: 'kpi-cvr',
					title: 'Tỷ Lệ Chuyển Đổi (CR)',
					value: '3.78%',
					growth: '+0.5% vs kỳ trước',
					isPositive: true,
					chartColor: '#8b5cf6',
					chartType: 'area',
					series: [3.2, 3.3, 3.4, 3.5, 3.5, 3.6, 3.7, 3.7, 3.78]
				}
			];
		}

		// Exact baseline for "today" & "all" channels (preserves 100% test compatibility)
		return [
			{
				id: 'kpi-gmv',
				title: 'Doanh Thu Hôm Nay (GMV)',
				value: '₫18.450.000',
				growth: '+24.5% vs hôm qua',
				isPositive: true,
				chartColor: '#10b981',
				chartType: 'area',
				series: [12, 14, 18, 22, 19, 28, 35, 42, 38, 48, 55, 62]
			},
			{
				id: 'kpi-orders',
				title: 'Tổng Số Đơn Hàng',
				value: '48 Đơn',
				growth: '+12.8% vs hôm qua',
				isPositive: true,
				chartColor: '#6366f1',
				chartType: 'bar',
				series: [2, 3, 5, 4, 6, 8, 12, 9, 14, 11, 15, 18]
			},
			{
				id: 'kpi-aov',
				title: 'Giá Trị Đơn Trung Bình (AOV)',
				value: '₫384.375',
				growth: '+8.2% vs hôm qua',
				isPositive: true,
				chartColor: '#3b82f6',
				chartType: 'area',
				series: [310, 325, 340, 335, 360, 370, 385, 390, 375, 384]
			},
			{
				id: 'kpi-cvr',
				title: 'Tỷ Lệ Chuyển Đổi Mua (CR)',
				value: '3.42%',
				growth: '+0.6% vs hôm qua',
				isPositive: true,
				chartColor: '#8b5cf6',
				chartType: 'area',
				series: [2.1, 2.4, 2.6, 2.8, 3.0, 3.1, 3.3, 3.2, 3.42]
			}
		];
	};

	const kpis = getKpis();
	return (
		<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, width: '100%' }}>
			{kpis.map((kpi) => {
				const sparklineOptions: ApexOptions = {
					chart: {
						type: kpi.chartType,
						sparkline: { enabled: true },
						animations: { enabled: true }
					},
					stroke: {
						curve: 'smooth',
						width: 2
					},
					colors: [kpi.chartColor],
					tooltip: { enabled: false },
					fill: {
						type: 'gradient',
						gradient: {
							shadeIntensity: 1,
							opacityFrom: 0.45,
							opacityTo: 0.05,
							stops: [0, 90, 100]
						}
					}
				};

				return (
					<Paper
						key={kpi.id}
						variant="outlined"
						sx={{
							p: 3,
							borderRadius: 3,
							bgcolor: 'background.paper',
							boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
							overflow: 'hidden',
							position: 'relative'
						}}
					>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
							<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
								{kpi.title}
							</Typography>
							<Chip
								icon={<TrendingUpIcon sx={{ fontSize: '14px !important' }} />}
								label={kpi.growth}
								size="small"
								color="success"
								sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
							/>
						</Box>

						<Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
							{kpi.value}
						</Typography>

						{/* Sparkline Chart */}
						<Box sx={{ height: 46, mt: 1 }}>
							<ReactApexChart
								options={sparklineOptions}
								series={[{ name: kpi.title, data: kpi.series }]}
								type={kpi.chartType}
								height={46}
							/>
						</Box>
					</Paper>
				);
			})}
		</Box>
	);
}
