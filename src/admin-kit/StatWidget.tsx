import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

export interface StatWidgetProps {
	title: string;
	value: string | number;
	change: number; // percentage change
	chartData?: number[]; // data for mini sparkline
}

const StatWidget: React.FC<StatWidgetProps> = ({ title, value, change, chartData = [] }) => {
	const chartOptions: any = {
		chart: {
			type: 'line',
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 2
		},
		tooltip: {
			fixed: { enabled: false },
			x: { show: false },
			y: {
				title: {
					formatter: () => ''
				}
			},
			marker: { show: false }
		},
		colors: [change >= 0 ? '#4caf50' : '#f44336']
	};

	const series = [{ data: chartData }];

	return (
		<Card className="w-full">
			<CardContent>
				<Typography
					color="textSecondary"
					gutterBottom
				>
					{title}
				</Typography>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box>
						<Typography
							variant="h4"
							component="div"
						>
							{value}
						</Typography>
						<Typography
							variant="body2"
							style={{ color: change >= 0 ? '#4caf50' : '#f44336' }}
						>
							{change >= 0 ? '+' : ''}
							{change}%
						</Typography>
					</Box>
					{chartData.length > 0 && (
						<Box
							width={100}
							height={50}
						>
							<ReactApexChart
								options={chartOptions}
								series={series}
								type="line"
								height={50}
							/>
						</Box>
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default StatWidget;
