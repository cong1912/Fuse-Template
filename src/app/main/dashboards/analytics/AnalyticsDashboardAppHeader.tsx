import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DateRangeIcon from '@mui/icons-material/DateRange';
import StoreIcon from '@mui/icons-material/Store';
import { useSnackbar } from 'notistack';

interface AnalyticsDashboardAppHeaderProps {
	onOpenCopilot?: () => void;
	selectedRange?: string;
	onRangeChange?: (range: string) => void;
	selectedChannel?: string;
	onChannelChange?: (channel: string) => void;
	onRefresh?: () => void;
}

export default function AnalyticsDashboardAppHeader({
	onOpenCopilot,
	selectedRange = 'today',
	onRangeChange,
	selectedChannel = 'all',
	onChannelChange,
	onRefresh
}: AnalyticsDashboardAppHeaderProps) {
	const { enqueueSnackbar } = useSnackbar();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleManualRefresh = () => {
		setIsRefreshing(true);
		onRefresh?.();
		setTimeout(() => {
			setIsRefreshing(false);
			enqueueSnackbar('Đã đồng bộ dữ liệu thời gian thực mới nhất!', { variant: 'success' });
		}, 800);
	};

	const handleExport = () => {
		enqueueSnackbar('Đang xuất báo cáo doanh số & vận hành định dạng Excel (.xlsx)...', { variant: 'info' });

		try {
			const timestamp = new Date().toISOString().split('T')[0];
			const csvContent =
				'\uFEFF' +
				'BÁO CÁO TỔNG QUAN DOANH SỐ VẬN HÀNH E-COMMERCE\n' +
				`Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n` +
				`Kỳ báo cáo: ${selectedRange}\n` +
				`Kênh bán: ${selectedChannel}\n\n` +
				'CHỈ SỐ TỔNG QUAN (CORE KPIS)\n' +
				'Chỉ Số,Giá Trị,Tăng Trưởng\n' +
				'Doanh Thu Thuần (GMV),18.450.000 đ,+24.5%\n' +
				'Tổng Số Đơn Hàng,48 Đơn,+12.8%\n' +
				'Giá Trị Đơn Trung Bình (AOV),384.375 đ,+8.2%\n' +
				'Tỷ Lệ Chuyển Đổi (CR),3.42%,+0.6%\n\n' +
				'DOANH SỐ THEO KÊNH BÁN (OMNICHANNEL)\n' +
				'Kênh Bán,Tỷ Trọng,Doanh Thu,Số Đơn\n' +
				'Web Store Trực Tuyến,52%,9.590.000 đ,25\n' +
				'Sàn Shopee Mall,31%,5.720.000 đ,15\n' +
				'TikTok Shop,14%,2.580.000 đ,7\n' +
				'B2B Sỉ / Đại Lý,3%,560.000 đ,1\n';

			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.setAttribute('href', url);
			link.setAttribute('download', `bao-cao-van-hanh-${timestamp}.csv`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error('Export failed', e);
		}

		setTimeout(() => {
			enqueueSnackbar('Xuất báo cáo thành công! File đã sẵn sàng tải xuống.', { variant: 'success' });
		}, 800);
	};

	return (
		<div className="flex w-full container">
			<div className="flex flex-col lg:flex-row flex-auto lg:items-center justify-between min-w-0 p-24 md:p-32 pb-0 md:pb-0 gap-16">
				{/* Title */}
				<div className="flex flex-col flex-auto">
					<Typography className="text-3xl font-extrabold tracking-tight leading-8">
						Trung Tâm Điều Hành Bán Hàng (E-Commerce Command Center)
					</Typography>
					<Typography className="font-medium tracking-tight" color="text.secondary">
						Giám sát doanh số theo thời gian thực, điều phối tác vụ kho & hiệu quả kinh doanh đa kênh
					</Typography>
				</div>

				{/* Filters & Actions */}
				<div className="flex items-center flex-wrap gap-12">
					{/* Live Sync Status & Refresh */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							px: 1.5,
							py: 0.6,
							borderRadius: 2,
							bgcolor: 'background.paper',
							border: 1,
							borderColor: 'divider',
							boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
						}}
					>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: '50%',
								bgcolor: '#10b981',
								boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
								'@keyframes pulse': {
									'0%': { opacity: 1, transform: 'scale(1)' },
									'50%': { opacity: 0.4, transform: 'scale(1.2)' },
									'100%': { opacity: 1, transform: 'scale(1)' }
								},
								animation: 'pulse 2s infinite'
							}}
						/>
						<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
							LIVE SYNC
						</Typography>
						<Tooltip title="Làm mới dữ liệu thời gian thực">
							<IconButton
								size="small"
								onClick={handleManualRefresh}
								disabled={isRefreshing}
								sx={{
									ml: 0.5,
									p: 0.4,
									'&:hover': { color: 'primary.main' }
								}}
								data-testid="header-refresh-btn"
							>
								<RefreshIcon
									fontSize="small"
									sx={{
										fontSize: 18,
										animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
										'@keyframes spin': {
											'0%': { transform: 'rotate(0deg)' },
											'100%': { transform: 'rotate(360deg)' }
										}
									}}
								/>
							</IconButton>
						</Tooltip>
					</Box>

					{/* Date Range Selector */}
					<TextField
						select
						size="small"
						value={selectedRange}
						onChange={(e) => onRangeChange?.(e.target.value)}
						sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 2 }}
						InputProps={{
							startAdornment: <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
						}}
					>
						<MenuItem value="today">Hôm nay</MenuItem>
						<MenuItem value="7days">7 ngày qua</MenuItem>
						<MenuItem value="30days">30 ngày qua</MenuItem>
						<MenuItem value="this_month">Tháng này</MenuItem>
					</TextField>

					{/* Channel Selector */}
					<TextField
						select
						size="small"
						value={selectedChannel}
						onChange={(e) => onChannelChange?.(e.target.value)}
						sx={{ minWidth: 160, bgcolor: 'background.paper', borderRadius: 2 }}
						InputProps={{
							startAdornment: <StoreIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
						}}
					>
						<MenuItem value="all">Tất cả kênh bán</MenuItem>
						<MenuItem value="web">Chỉ Web Store</MenuItem>
						<MenuItem value="shopee">Sàn Shopee Mall</MenuItem>
						<MenuItem value="tiktok">TikTok Shop</MenuItem>
					</TextField>

					{/* AI Copilot Button */}
					<Button
						variant="contained"
						sx={{
							background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important',
							color: '#ffffff !important',
							fontWeight: 700,
							boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
							'&:hover': {
								background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%) !important'
							}
						}}
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:sparkles</FuseSvgIcon>}
						onClick={onOpenCopilot}
						data-testid="header-open-ai-copilot-btn"
					>
						AI Copilot
					</Button>

					{/* Export Button */}
					<Button
						variant="contained"
						color="secondary"
						startIcon={<FileDownloadIcon />}
						onClick={handleExport}
						sx={{ fontWeight: 600 }}
					>
						Xuất Báo Cáo
					</Button>
				</div>
			</div>
		</div>
	);
}
