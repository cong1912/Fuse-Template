import React, { useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import FuseLoading from '@fuse/core/FuseLoading';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsDashboardAppHeader from './AnalyticsDashboardAppHeader';
import OperationsActionCenterWidget from './widgets/OperationsActionCenterWidget';
import CoreEcommerceKpiWidgets from './widgets/CoreEcommerceKpiWidgets';
import HourlySalesCurveWidget from './widgets/HourlySalesCurveWidget';
import OmnichannelSalesBreakdownWidget from './widgets/OmnichannelSalesBreakdownWidget';
import InventoryHealthAlertWidget from './widgets/InventoryHealthAlertWidget';
import VisitorsOverviewWidget from './widgets/VisitorsOverviewWidget';
import ConversionsWidget from './widgets/ConversionsWidget';
import ImpressionsWidget from './widgets/ImpressionsWidget';
import VisitsWidget from './widgets/VisitsWidget';
import WarehouseStockDistributionWidget from './widgets/WarehouseStockDistributionWidget';
import ConversionFunnelWidget from './widgets/ConversionFunnelWidget';
import NewVsReturningWidget from './widgets/NewVsReturningWidget';
import AgeWidget from './widgets/AgeWidget';
import LanguageWidget from './widgets/LanguageWidget';
import GenderWidget from './widgets/GenderWidget';
import RecentOrdersWidget from './widgets/RecentOrdersWidget';
import TopProductsWidget from './widgets/TopProductsWidget';
import AiExecutiveInsightsCard from './widgets/AiExecutiveInsightsCard';
import AiCopilotDrawer from './AiCopilotDrawer';
import OperationsActionDrilldownDrawer, { ActionCategory } from './OperationsActionDrilldownDrawer';
import { useGetAnalyticsDashboardWidgetsQuery } from './AnalyticsDashboardApi';

const container = {
	show: {
		transition: {
			staggerChildren: 0.04
		}
	}
};

const item = {
	hidden: { opacity: 0, y: 15 },
	show: { opacity: 1, y: 0 }
};

export default function AnalyticsDashboardApp() {
	const { isLoading, refetch } = useGetAnalyticsDashboardWidgetsQuery();
	const [copilotOpen, setCopilotOpen] = useState(false);
	const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
	const [activeTab, setActiveTab] = useState(0);
	const [selectedRange, setSelectedRange] = useState('today');
	const [selectedChannel, setSelectedChannel] = useState('all');
	const [selectedAction, setSelectedAction] = useState<ActionCategory | null>(null);

	const handleOpenCopilot = (prompt?: string) => {
		setInitialPrompt(prompt);
		setCopilotOpen(true);
	};

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<>
			<FusePageSimple
				header={
					<AnalyticsDashboardAppHeader
						onOpenCopilot={() => handleOpenCopilot()}
						selectedRange={selectedRange}
						onRangeChange={setSelectedRange}
						selectedChannel={selectedChannel}
						onChannelChange={setSelectedChannel}
						onRefresh={() => refetch()}
					/>
				}
				content={
					<div className="w-full p-24 md:p-32 flex flex-col gap-24">
						{/* Specialized Navigation Tabs */}
						<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
							<Tabs
								value={activeTab}
								onChange={(_, val) => setActiveTab(val)}
								indicatorColor="primary"
								textColor="primary"
								sx={{ minHeight: 48 }}
							>
								<Tab icon={<ShoppingBagIcon />} iconPosition="start" label="Bán Hàng & Vận Hành (Sales & Real-time Operations)" sx={{ fontWeight: 700 }} />
								<Tab icon={<WarehouseIcon />} iconPosition="start" label="Kho Hàng & Chuỗi Cung Ứng (Inventory & Supply Chain)" sx={{ fontWeight: 700 }} />
								<Tab icon={<PeopleIcon />} iconPosition="start" label="Khách Hàng & Lưu Lượng (Audience & Traffic)" sx={{ fontWeight: 700 }} />
							</Tabs>
						</Box>

						{/* TAB 0: Sales & Operations */}
						{activeTab === 0 && (
							<motion.div
								className="flex flex-col gap-24 w-full"
								variants={container}
								initial="hidden"
								animate="show"
							>
								{/* 1. AI Executive Decision Hub */}
								<motion.div variants={item}>
									<AiExecutiveInsightsCard onOpenCopilot={handleOpenCopilot} />
								</motion.div>

								{/* 2. Real-time Operations Action Center (To-Do list for staff) */}
								<motion.div variants={item}>
									<OperationsActionCenterWidget onSelectAction={(item) => setSelectedAction(item)} />
								</motion.div>

								{/* 3. Core E-Commerce KPI Cards with Sparklines */}
								<motion.div variants={item}>
									<CoreEcommerceKpiWidgets range={selectedRange} channel={selectedChannel} />
								</motion.div>

								{/* 4. Hourly Sales Curve & Omnichannel Breakdown */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-24 w-full">
									<motion.div variants={item} className="lg:col-span-2">
										<HourlySalesCurveWidget range={selectedRange} channel={selectedChannel} />
									</motion.div>
									<motion.div variants={item} className="lg:col-span-1">
										<OmnichannelSalesBreakdownWidget range={selectedRange} channel={selectedChannel} />
									</motion.div>
								</div>

								{/* 5. Live Recent Orders & Top Selling Products */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-24 w-full">
									<motion.div variants={item} className="lg:col-span-2">
										<RecentOrdersWidget />
									</motion.div>
									<motion.div variants={item} className="lg:col-span-1">
										<TopProductsWidget />
									</motion.div>
								</div>
							</motion.div>
						)}

						{/* TAB 1: Inventory & Supply Chain */}
						{activeTab === 1 && (
							<motion.div
								className="flex flex-col gap-24 w-full"
								variants={container}
								initial="hidden"
								animate="show"
							>
								{/* Critical Stock Alert */}
								<motion.div variants={item}>
									<InventoryHealthAlertWidget />
								</motion.div>

								<motion.div variants={item}>
									<WarehouseStockDistributionWidget />
								</motion.div>
							</motion.div>
						)}

						{/* TAB 2: Audience & Traffic Analytics */}
						{activeTab === 2 && (
							<motion.div
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24 w-full"
								variants={container}
								initial="hidden"
								animate="show"
							>
								<motion.div variants={item} className="sm:col-span-2 lg:col-span-3">
									<ConversionFunnelWidget />
								</motion.div>

								<motion.div variants={item} className="sm:col-span-2 lg:col-span-3">
									<VisitorsOverviewWidget />
								</motion.div>

								<motion.div variants={item}>
									<ConversionsWidget />
								</motion.div>
								<motion.div variants={item}>
									<ImpressionsWidget />
								</motion.div>
								<motion.div variants={item}>
									<VisitsWidget />
								</motion.div>

								<div className="w-full mt-16 sm:col-span-3">
									<Typography className="text-xl font-bold tracking-tight">
										Phân Tích Độc Giả & Khách Mua Hàng
									</Typography>
									<Typography color="text.secondary">
										Nhân khẩu học và thói quen truy cập
									</Typography>
								</div>

								<div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 w-full">
									<motion.div variants={item}><NewVsReturningWidget /></motion.div>
									<motion.div variants={item}><GenderWidget /></motion.div>
									<motion.div variants={item}><AgeWidget /></motion.div>
									<motion.div variants={item}><LanguageWidget /></motion.div>
								</div>
							</motion.div>
						)}
					</div>
				}
			/>

			{/* Enterprise AI Copilot Drawer */}
			<AiCopilotDrawer
				open={copilotOpen}
				onClose={() => setCopilotOpen(false)}
				initialPrompt={initialPrompt}
			/>

			{/* Contextual Operations Action Drill-down Drawer */}
			<OperationsActionDrilldownDrawer
				open={Boolean(selectedAction)}
				onClose={() => setSelectedAction(null)}
				action={selectedAction}
			/>
		</>
	);
}
