import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import LanguageIcon from '@mui/icons-material/Language';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import BusinessIcon from '@mui/icons-material/Business';

const channels = [
	{ id: 'web', name: 'Web Store Trực Tuyến', percent: 52, gmv: '₫9.590.000', orders: 25, color: '#6366f1', icon: <LanguageIcon className="text-indigo-500" fontSize="small" /> },
	{ id: 'shopee', name: 'Sàn Shopee Mall', percent: 31, gmv: '₫5.720.000', orders: 15, color: '#ee4d2d', icon: <StorefrontIcon sx={{ color: '#ee4d2d' }} fontSize="small" /> },
	{ id: 'tiktok', name: 'TikTok Shop', percent: 14, gmv: '₫2.580.000', orders: 7, color: '#000000', icon: <MusicNoteIcon fontSize="small" /> },
	{ id: 'b2b', name: 'B2B Sỉ / Đại Lý', percent: 3, gmv: '₫560.000', orders: 1, color: '#10b981', icon: <BusinessIcon className="text-emerald-500" fontSize="small" /> }
];

interface OmnichannelSalesBreakdownWidgetProps {
	range?: string;
	channel?: string;
}

export default function OmnichannelSalesBreakdownWidget({
	range = 'today',
	channel = 'all'
}: OmnichannelSalesBreakdownWidgetProps) {
	const chartOptions: ApexOptions = {
		chart: {
			type: 'donut',
			height: 240,
			fontFamily: 'inherit'
		},
		labels: channels.map(c => c.name),
		colors: channels.map(c => c.color),
		legend: { show: false },
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: '72%',
					labels: {
						show: true,
						name: { show: false },
						value: {
							show: true,
							fontSize: '18px',
							fontWeight: 800,
							formatter: () => '₫18.45M'
						},
						total: {
							show: true,
							label: 'Tổng GMV',
							fontSize: '12px',
							color: '#94a3b8',
							formatter: () => '₫18.45M'
						}
					}
				}
			}
		},
		stroke: { width: 0 }
	};

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
			<Box sx={{ mb: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					Doanh Số Đa Kênh (Omnichannel Share)
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Tỷ trọng đóng góp doanh thu giữa Web, Shopee, TikTok Shop và B2B
				</Typography>
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
				<ReactApexChart
					options={chartOptions}
					series={channels.map(c => c.percent)}
					type="donut"
					height={220}
				/>
			</Box>

			{/* Channel List */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
				{channels.map((c) => {
					const isSelected = channel === c.id;
					return (
						<Box
							key={c.id}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								p: 1.2,
								borderRadius: 2,
								border: isSelected ? 2 : 1,
								borderColor: isSelected ? c.color : 'transparent',
								bgcolor: (theme) => isSelected
									? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(99, 102, 241, 0.05)')
									: (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
								transition: 'all 0.2s'
							}}
						>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							{c.icon}
							<Box>
								<Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
									{c.name}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{c.orders} đơn hàng
								</Typography>
							</Box>
						</Box>

						<Box sx={{ textAlign: 'right' }}>
							<Typography variant="body2" sx={{ fontWeight: 700 }}>
								{c.gmv}
							</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
								{c.percent}%
							</Typography>
						</Box>
						</Box>
					);
				})}
			</Box>
		</Paper>
	);
}
