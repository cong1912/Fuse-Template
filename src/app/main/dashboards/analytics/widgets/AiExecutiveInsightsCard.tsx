import React from 'react';
import {
	Paper,
	Typography,
	Box,
	Button,
	Chip,
	LinearProgress,
	Divider,
	Tooltip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router-dom';
import { useGetRfmSummaryQuery, useGetLowStockRiskQuery } from '../AiDashboardApi';

interface AiExecutiveInsightsCardProps {
	onOpenCopilot: (initialPrompt?: string) => void;
}

export default function AiExecutiveInsightsCard({ onOpenCopilot }: AiExecutiveInsightsCardProps) {
	const navigate = useNavigate();
	const { data: rfmSummary } = useGetRfmSummaryQuery();
	const { data: lowStockRisks } = useGetLowStockRiskQuery();

	const totalCustomers = rfmSummary?.total || 100;
	const championsPercent = Math.round(((rfmSummary?.champions || 15) / totalCustomers) * 100);
	const loyalPercent = Math.round(((rfmSummary?.loyal || 30) / totalCustomers) * 100);
	const atRiskPercent = Math.round(((rfmSummary?.atRisk || 20) / totalCustomers) * 100);

	const criticalStockItems = (lowStockRisks || []).slice(0, 2);

	return (
		<Paper className="p-24 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5">
			{/* Header */}
			<Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2} mb={3}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box
						sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: '#ffffff' }}
						className="w-48 h-48 rounded-2xl flex items-center justify-center shadow-md"
					>
						<FuseSvgIcon size={28}>heroicons-outline:sparkles</FuseSvgIcon>
					</Box>
					<div>
						<Box display="flex" alignItems="center" gap={1}>
							<Typography variant="h6" className="font-extrabold tracking-tight">
								AI Executive Decision Center
							</Typography>
							<Chip
								size="small"
								label="Autonomous Agent"
								color="secondary"
								variant="outlined"
								sx={{ fontWeight: 600, height: 22 }}
							/>
						</Box>
						<Typography variant="body2" color="text.secondary">
							Dự báo nhu cầu, phân tích phân khúc khách hàng & kiến nghị hành động tăng trưởng thời gian thực.
						</Typography>
					</div>
				</Box>

				<Button
					variant="contained"
					sx={{
						background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important',
						color: '#ffffff !important',
						fontWeight: 700,
						boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
						'&:hover': {
							background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%) !important',
							boxShadow: '0 6px 20px rgba(124, 58, 237, 0.6)'
						}
					}}
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>}
					onClick={() => onOpenCopilot()}
					data-testid="open-copilot-from-card"
				>
					Hỏi AI Copilot
				</Button>
			</Box>

			{/* 3 Insight Pillars */}
			<Box className="grid grid-cols-1 md:grid-cols-3 gap-20">
				{/* Pillar 1: Demand & Stock Alert */}
				<Paper
					elevation={0}
					className="p-16 rounded-2xl border border-divider bg-background-paper/80 flex flex-col justify-between"
				>
					<div>
						<Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
							<Box display="flex" alignItems="center" gap={1}>
								<FuseSvgIcon size={20} className="text-amber-500">
									heroicons-outline:exclamation-triangle
								</FuseSvgIcon>
								<Typography variant="subtitle2" className="font-bold">
									Cảnh Báo Chuỗi Cung Ứng
								</Typography>
							</Box>
							<Chip size="small" label="AI Forecast" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
						</Box>

						{criticalStockItems.length > 0 ? (
							<Box className="space-y-2 mb-3">
								{criticalStockItems.map((item) => (
									<Box key={item.productId} className="p-8 rounded-lg bg-amber-500/10 border border-amber-500/20">
										<Box display="flex" justifyContent="space-between" alignItems="center">
											<Typography variant="caption" className="font-semibold truncate max-w-[170px]">
												{item.productName}
											</Typography>
											<Chip
												size="small"
												label={`Còn ${item.estimatedDaysUntilStockout} ngày`}
												color={item.urgencyLevel === 'Critical' ? 'error' : 'warning'}
												sx={{ height: 18, fontSize: '0.6rem' }}
											/>
										</Box>
										<Typography variant="caption" color="text.secondary" className="block text-[11px]">
											Tồn kho thực tế: {item.currentStock} cái
										</Typography>
									</Box>
								))}
							</Box>
						) : (
							<Box className="p-12 rounded-lg bg-green-500/10 border border-green-500/20 mb-3">
								<Typography variant="caption" className="text-green-600 dark:text-green-400 font-medium">
									Tất cả sản phẩm trọng yếu đều duy trì mức tồn kho trên 30 ngày an toàn.
								</Typography>
							</Box>
						)}
					</div>

					<Box display="flex" gap={1} mt={1}>
						<Button
							size="small"
							variant="outlined"
							fullWidth
							onClick={() => navigate('/apps/e-commerce/products')}
							startIcon={<FuseSvgIcon size={14}>heroicons-outline:cube</FuseSvgIcon>}
						>
							Kho Hàng
						</Button>
						<Button
							size="small"
							color="secondary"
							variant="text"
							onClick={() => onOpenCopilot('⚠️ Sản phẩm nào nguy cấp sắp hết hàng cần bổ sung?')}
						>
							Phân tích
						</Button>
					</Box>
				</Paper>

				{/* Pillar 2: RFM Customer Retention */}
				<Paper
					elevation={0}
					className="p-16 rounded-2xl border border-divider bg-background-paper/80 flex flex-col justify-between"
				>
					<div>
						<Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
							<Box display="flex" alignItems="center" gap={1}>
								<FuseSvgIcon size={20} className="text-indigo-500">
									heroicons-outline:user-group
								</FuseSvgIcon>
								<Typography variant="subtitle2" className="font-bold">
									Khách Hàng & Giữ Chân (RFM)
								</Typography>
							</Box>
							<Chip size="small" label="Retention" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
						</Box>

						<Box className="space-y-2 mb-3">
							<div>
								<Box display="flex" justifyContent="space-between" mb={0.5}>
									<Typography variant="caption">VIP & Champions</Typography>
									<Typography variant="caption" className="font-bold">{championsPercent}%</Typography>
								</Box>
								<LinearProgress variant="determinate" value={championsPercent} color="secondary" className="rounded-full h-6" />
							</div>

							<div>
								<Box display="flex" justifyContent="space-between" mb={0.5}>
									<Typography variant="caption">Khách hàng Trung thành</Typography>
									<Typography variant="caption" className="font-bold">{loyalPercent}%</Typography>
								</Box>
								<LinearProgress variant="determinate" value={loyalPercent} color="primary" className="rounded-full h-6" />
							</div>

							<div>
								<Box display="flex" justifyContent="space-between" mb={0.5}>
									<Typography variant="caption" className="text-amber-500">Nguy cơ rời bỏ (At-Risk)</Typography>
									<Typography variant="caption" className="font-bold text-amber-500">{atRiskPercent}%</Typography>
								</Box>
								<LinearProgress variant="determinate" value={atRiskPercent} color="warning" className="rounded-full h-6" />
							</div>
						</Box>
					</div>

					<Box display="flex" gap={1} mt={1}>
						<Button
							size="small"
							variant="outlined"
							fullWidth
							onClick={() => navigate('/settings/integrations')}
							startIcon={<FuseSvgIcon size={14}>heroicons-outline:bolt</FuseSvgIcon>}
						>
							Tự Động Hóa n8n
						</Button>
						<Button
							size="small"
							color="secondary"
							variant="text"
							onClick={() => onOpenCopilot('👥 Phân tích nhóm khách hàng At-Risk có nguy cơ rời bỏ?')}
						>
							Kích hoạt
						</Button>
					</Box>
				</Paper>

				{/* Pillar 3: Growth Opportunity & Flash Sale */}
				<Paper
					elevation={0}
					className="p-16 rounded-2xl border border-divider bg-background-paper/80 flex flex-col justify-between"
				>
					<div>
						<Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
							<Box display="flex" alignItems="center" gap={1}>
								<FuseSvgIcon size={20} className="text-emerald-500">
									heroicons-outline:arrow-trending-up
								</FuseSvgIcon>
								<Typography variant="subtitle2" className="font-bold">
									Đề Xuất Tăng Trưởng
								</Typography>
							</Box>
							<Chip size="small" label="+28% Rev" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
						</Box>

						<Box className="p-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
							<Typography variant="body2" className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
								Khung Giờ Vàng Mua Sắm: 20h - 23h
							</Typography>
							<Typography variant="caption" color="text.secondary">
								AI nhận diện tỷ lệ nhấp trang chi tiết sản phẩm tăng vọt 34% vào tối thứ Bảy & Chủ Nhật. Kích hoạt Flash Sale để tối đa hóa doanh thu.
							</Typography>
						</Box>
					</div>

					<Box display="flex" gap={1} mt={1}>
						<Button
							size="small"
							variant="contained"
							color="primary"
							fullWidth
							onClick={() => navigate('/marketing/flash-sales')}
							startIcon={<FuseSvgIcon size={14}>heroicons-outline:fire</FuseSvgIcon>}
						>
							Tạo Flash Sale
						</Button>
						<Button
							size="small"
							color="secondary"
							variant="text"
							onClick={() => onOpenCopilot('🎯 Đề xuất chiến dịch Flash Sale tối ưu cuối tuần?')}
						>
							Tối ưu
						</Button>
					</Box>
				</Paper>
			</Box>
		</Paper>
	);
}
