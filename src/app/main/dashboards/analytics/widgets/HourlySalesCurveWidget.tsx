import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
const todaySales = [120, 80, 50, 90, 450, 890, 1450, 1120, 1340, 1890, 2450, 1680]; // in thousands VND
const yesterdaySales = [100, 60, 40, 70, 380, 750, 1200, 980, 1100, 1450, 1900, 1320];

interface HourlySalesCurveWidgetProps {
	range?: string;
	channel?: string;
}

export default function HourlySalesCurveWidget({
	range = 'today',
	channel = 'all'
}: HourlySalesCurveWidgetProps) {
	const [activeTab, setActiveTab] = useState(0);

	const factor = channel === 'web' ? 0.52 : channel === 'shopee' ? 0.31 : channel === 'tiktok' ? 0.14 : 1.0;
	const currentTodaySales = todaySales.map(v => Math.round(v * factor));
	const currentYesterdaySales = yesterdaySales.map(v => Math.round(v * factor));

	const chartOptions: ApexOptions = {
		chart: {
			type: 'area',
			height: 320,
			toolbar: { show: false },
			fontFamily: 'inherit'
		},
		colors: ['#6366f1', '#94a3b8'],
		stroke: {
			curve: 'smooth',
			width: [3, 2],
			dashArray: [0, 4]
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: [0.4, 0.05],
				opacityTo: [0.05, 0.0],
				stops: [0, 90, 100]
			}
		},
		dataLabels: { enabled: false },
		xaxis: {
			categories: hours,
			labels: {
				style: { colors: '#94a3b8', fontSize: '11px' }
			},
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: {
			labels: {
				formatter: (val) => `${(val / 1000).toFixed(1)}M ₫`,
				style: { colors: '#94a3b8', fontSize: '11px' }
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'right',
			fontSize: '12px',
			markers: { width: 8, height: 8, radius: 4 }
		},
		tooltip: {
			y: {
				formatter: (val) => `₫${(val * 1000).toLocaleString('vi-VN')}`
			}
		},
		grid: {
			borderColor: 'rgba(148, 163, 184, 0.1)',
			strokeDashArray: 4
		}
	};

	const chartSeries = [
		{ name: 'Hôm nay', data: currentTodaySales },
		{ name: 'Hôm qua', data: currentYesterdaySales }
	];

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 3,
				borderRadius: 3,
				boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
				bgcolor: 'background.paper',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between'
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1, mb: 2 }}>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<AccessTimeIcon className="text-indigo-500" fontSize="small" />
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Đường Cong Doanh Thu Theo Giờ (Real-time Hourly GMV)
						</Typography>
					</Box>
					<Typography variant="body2" color="text.secondary">
						So sánh tốc độ tạo doanh số theo từng mốc 2 giờ giữa Hôm nay và Hôm qua
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Chip
						label="Đỉnh 20h - 22h: ₫2.45M/h"
						color="primary"
						size="small"
						icon={<TrendingUpIcon />}
						sx={{ fontWeight: 700 }}
					/>
				</Box>
			</Box>

			<Box sx={{ height: 320, width: '100%' }}>
				<ReactApexChart
					options={chartOptions}
					series={chartSeries}
					type="area"
					height={320}
				/>
			</Box>
		</Paper>
	);
}
