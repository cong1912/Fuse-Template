import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import { useGetPlatformFinancialsQuery } from '../AdminTenantsApi';

function formatVnd(amount: number) {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0
	}).format(amount || 0);
}

function OverviewPage() {
	const navigate = useNavigate();
	const { data: financials, isLoading, error, refetch } = useGetPlatformFinancialsQuery();

	const totalShops = financials?.totalShops || 0;
	const activeShops = financials?.activeShops || 0;
	const activePercent = totalShops > 0 ? Math.round((activeShops / totalShops) * 100) : 100;

	const plans = financials?.plans || { free: 0, basic: 0, pro: 0, enterprise: 0 };
	const planTotal = (plans.free + plans.basic + plans.pro + plans.enterprise) || 1;

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row items-center justify-between p-24 sm:p-32 w-full border-b border-divider">
					<div className="flex items-center">
						<FuseSvgIcon size={32} className="text-primary-main mr-16">
							heroicons-outline:chart-pie
						</FuseSvgIcon>
						<div>
							<Typography className="text-2xl font-bold tracking-tight">
								Platform Economics & Financials
							</Typography>
							<Typography color="text.secondary" className="text-sm">
								Global GMV, Platform Take-Rate, MRR/ARR, and multi-tenant fleet health
							</Typography>
						</div>
					</div>
					<div className="mt-16 sm:mt-0 flex items-center gap-12">
						<Button
							variant="outlined"
							size="small"
							onClick={() => navigate('/platform/shops')}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:office-building</FuseSvgIcon>}
						>
							Manage Tenants
						</Button>
						<Button
							variant="outlined"
							size="small"
							onClick={() => navigate('/platform/audit')}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:shield-check</FuseSvgIcon>}
						>
							Audit Trail
						</Button>
						<Button
							variant="contained"
							size="small"
							color="primary"
							onClick={() => refetch()}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:refresh</FuseSvgIcon>}
						>
							Refresh
						</Button>
					</div>
				</div>
			}
			content={
				<div className="p-24 sm:p-32 w-full max-w-7xl mx-auto space-y-24">
					{isLoading ? (
						<div className="py-64 flex justify-center items-center">
							<CircularProgress />
						</div>
					) : error ? (
						<Alert severity="error">
							Failed to load platform financial metrics. Please ensure you have Super Admin permissions.
						</Alert>
					) : (
						<>
							{/* Top 4 Financial & Health KPI Cards */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24">
								{/* Global GMV */}
								<Paper className="p-24 shadow rounded-2xl flex flex-col justify-between border-t-4 border-primary-main">
									<div className="flex items-center justify-between mb-16">
										<Typography color="text.secondary" className="text-xs uppercase font-bold tracking-wider">
											Global Fleet GMV
										</Typography>
										<div className="p-8 rounded-lg bg-primary-light text-primary-contrastText">
											<FuseSvgIcon size={20}>heroicons-outline:currency-dollar</FuseSvgIcon>
										</div>
									</div>
									<div>
										<Typography className="text-2xl font-bold tracking-tight text-text-primary">
											{formatVnd(financials?.totalGmvVnd || 0)}
										</Typography>
										<Typography color="text.secondary" className="text-xs mt-4">
											Gross merchandise processed across all tenants
										</Typography>
									</div>
								</Paper>

								{/* Platform Take-Rate Revenue */}
								<Paper className="p-24 shadow rounded-2xl flex flex-col justify-between border-t-4 border-green-500">
									<div className="flex items-center justify-between mb-16">
										<Typography color="text.secondary" className="text-xs uppercase font-bold tracking-wider">
											Platform Take-Rate (1.5%)
										</Typography>
										<div className="p-8 rounded-lg bg-green-500 text-white">
											<FuseSvgIcon size={20}>heroicons-outline:cash</FuseSvgIcon>
										</div>
									</div>
									<div>
										<Typography className="text-2xl font-bold tracking-tight text-green-600">
											{formatVnd(financials?.platformTakeRateVnd || 0)}
										</Typography>
										<Typography color="text.secondary" className="text-xs mt-4">
											Platform transaction monetization
										</Typography>
									</div>
								</Paper>

								{/* MRR / ARR */}
								<Paper className="p-24 shadow rounded-2xl flex flex-col justify-between border-t-4 border-secondary-main">
									<div className="flex items-center justify-between mb-16">
										<Typography color="text.secondary" className="text-xs uppercase font-bold tracking-wider">
											SaaS MRR / ARR
										</Typography>
										<div className="p-8 rounded-lg bg-secondary-main text-secondary-contrastText">
											<FuseSvgIcon size={20}>heroicons-outline:trending-up</FuseSvgIcon>
										</div>
									</div>
									<div>
										<Typography className="text-2xl font-bold tracking-tight text-secondary-main">
											{formatVnd(financials?.mrrVnd || 0)}
										</Typography>
										<Typography color="text.secondary" className="text-xs mt-4">
											ARR: {formatVnd(financials?.arrVnd || 0)} (Annualized)
										</Typography>
									</div>
								</Paper>

								{/* Active Tenants Fleet */}
								<Paper className="p-24 shadow rounded-2xl flex flex-col justify-between border-t-4 border-amber-500">
									<div className="flex items-center justify-between mb-16">
										<Typography color="text.secondary" className="text-xs uppercase font-bold tracking-wider">
											Tenant Fleet Health
										</Typography>
										<div className="p-8 rounded-lg bg-amber-500 text-white">
											<FuseSvgIcon size={20}>heroicons-outline:office-building</FuseSvgIcon>
										</div>
									</div>
									<div>
										<div className="flex items-baseline gap-8">
											<Typography className="text-2xl font-bold tracking-tight">
												{activeShops} / {totalShops}
											</Typography>
											<Chip size="small" label={`${activePercent}% Active`} color="success" variant="outlined" />
										</div>
										<Typography color="text.secondary" className="text-xs mt-4">
											{financials?.suspendedShops || 0} suspended accounts
										</Typography>
									</div>
								</Paper>
							</div>

							{/* Plan Distribution & Platform Controls */}
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
								{/* Subscription Tier Distribution */}
								<Paper className="p-24 shadow rounded-2xl lg:col-span-2 space-y-20">
									<div className="flex justify-between items-center border-b border-divider pb-12">
										<div>
											<Typography className="text-lg font-bold">Subscription Plan Distribution</Typography>
											<Typography color="text.secondary" className="text-xs">
												Breakdown of platform shops by billing tier
											</Typography>
										</div>
										<Chip size="small" label={`${totalShops} Total Shops`} color="primary" />
									</div>

									{/* Enterprise */}
									<div className="space-y-6">
										<div className="flex justify-between text-sm">
											<span className="font-semibold text-primary-main">Enterprise Tier</span>
											<span className="font-mono text-text-secondary">
												{plans.enterprise} shops ({Math.round((plans.enterprise / planTotal) * 100)}%)
											</span>
										</div>
										<LinearProgress
											variant="determinate"
											value={(plans.enterprise / planTotal) * 100}
											color="primary"
											className="h-8 rounded"
										/>
									</div>

									{/* Pro */}
									<div className="space-y-6">
										<div className="flex justify-between text-sm">
											<span className="font-semibold text-secondary-main">Pro Tier</span>
											<span className="font-mono text-text-secondary">
												{plans.pro} shops ({Math.round((plans.pro / planTotal) * 100)}%)
											</span>
										</div>
										<LinearProgress
											variant="determinate"
											value={(plans.pro / planTotal) * 100}
											color="secondary"
											className="h-8 rounded"
										/>
									</div>

									{/* Basic */}
									<div className="space-y-6">
										<div className="flex justify-between text-sm">
											<span className="font-semibold text-info-main">Basic Tier</span>
											<span className="font-mono text-text-secondary">
												{plans.basic} shops ({Math.round((plans.basic / planTotal) * 100)}%)
											</span>
										</div>
										<LinearProgress
											variant="determinate"
											value={(plans.basic / planTotal) * 100}
											color="info"
											className="h-8 rounded"
										/>
									</div>

									{/* Free */}
									<div className="space-y-6">
										<div className="flex justify-between text-sm">
											<span className="font-semibold text-text-secondary">Free Tier</span>
											<span className="font-mono text-text-secondary">
												{plans.free} shops ({Math.round((plans.free / planTotal) * 100)}%)
											</span>
										</div>
										<LinearProgress
											variant="determinate"
											value={(plans.free / planTotal) * 100}
											color="inherit"
											className="h-8 rounded"
										/>
									</div>
								</Paper>

								{/* Platform Control Shortcuts & Security Checklist */}
								<Paper className="p-24 shadow rounded-2xl flex flex-col justify-between space-y-16">
									<div>
										<Typography className="text-lg font-bold border-b border-divider pb-12">
											Enterprise Governance
										</Typography>
										<div className="space-y-12 mt-16 text-sm">
											<div className="flex items-center gap-12">
												<FuseSvgIcon size={20} className="text-green-500">
													heroicons-outline:check-circle
												</FuseSvgIcon>
												<span>Tenant Data Isolation (Query Filter)</span>
											</div>
											<div className="flex items-center gap-12">
												<FuseSvgIcon size={20} className="text-green-500">
													heroicons-outline:check-circle
												</FuseSvgIcon>
												<span>Tiered Rate Limiting (60 - 5000 req/min)</span>
											</div>
											<div className="flex items-center gap-12">
												<FuseSvgIcon size={20} className="text-green-500">
													heroicons-outline:check-circle
												</FuseSvgIcon>
												<span>Audited Impersonation (SOC2 Safe)</span>
											</div>
											<div className="flex items-center gap-12">
												<FuseSvgIcon size={20} className="text-green-500">
													heroicons-outline:check-circle
												</FuseSvgIcon>
												<span>Data Export & Portability (JSON Snapshot)</span>
											</div>
										</div>
									</div>

									<div className="pt-16 border-t border-divider space-y-8">
										<Button
											fullWidth
											variant="contained"
											color="primary"
											onClick={() => navigate('/platform/shops')}
											startIcon={<FuseSvgIcon size={16}>heroicons-outline:login</FuseSvgIcon>}
										>
											Tenant Impersonation & Control
										</Button>
										<Button
											fullWidth
											variant="outlined"
											onClick={() => navigate('/platform/audit')}
											startIcon={<FuseSvgIcon size={16}>heroicons-outline:shield-check</FuseSvgIcon>}
										>
											View Audit Trail
										</Button>
									</div>
								</Paper>
							</div>
						</>
					)}
				</div>
			}
		/>
	);
}

export default OverviewPage;
