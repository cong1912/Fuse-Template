import { useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {
	useGetAdminTenantsQuery,
	useGetTenantDetailsQuery,
	useSetFeatureOverrideMutation,
	useDeleteFeatureOverrideMutation,
	useUpdateTenantPlanAndQuotasMutation,
	useImpersonateTenantMutation,
	useExportTenantDataMutation,
	AdminTenantDto
} from '../AdminTenantsApi';

const AVAILABLE_FEATURES = [
	{ id: 13, name: 'VirtualWaitingRoom', label: 'Flash Sale Virtual Waiting Room (High Concurrency)' },
	{ id: 12, name: 'B2BWholesale', label: 'B2B Wholesale & Quoting RFQ Engine' },
	{ id: 11, name: 'JevAiDecision', label: 'Jev AI Micro-Decisions (No-Show & Smart Refund)' },
	{ id: 7, name: 'TikTokShopSync', label: 'TikTok Shop Multi-Channel Sync' },
	{ id: 8, name: 'PosBarcodeCheckout', label: 'POS Barcode Scanner Checkout' },
	{ id: 9, name: 'AdvancedBooking', label: 'Spa/Clinic Appointment Booking' },
	{ id: 10, name: 'AffiliateProgram', label: 'Affiliate Partner Program' },
	{ id: 14, name: 'EInvoiceMisa', label: 'E-Invoice MISA Integration' }
];

function ShopsPage() {
	const { data: rawTenants = [], isLoading, error } = useGetAdminTenantsQuery();
	const tenants: AdminTenantDto[] = Array.isArray(rawTenants)
		? rawTenants
		: ((rawTenants as any)?.items || []);

	const [impersonateTenant, { isLoading: isImpersonating }] = useImpersonateTenantMutation();
	const [impersonatingTenantId, setImpersonatingTenantId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTenant, setSelectedTenant] = useState<AdminTenantDto | null>(null);

	const handleImpersonate = async (tenant: AdminTenantDto) => {
		try {
			setImpersonatingTenantId(tenant.id);
			const res = await impersonateTenant({ tenantId: tenant.id }).unwrap();
			const originalToken = localStorage.getItem('jwt_access_token') || '';
			localStorage.setItem(
				'impersonation_info',
				JSON.stringify({
					tenantId: res.tenantId,
					tenantName: res.tenantName,
					subdomain: res.subdomain,
					originalToken: originalToken,
					expiresAt: res.expiresAt
				})
			);
			localStorage.setItem('jwt_access_token', res.accessToken);
			window.location.href = '/dashboards/analytics';
		} catch (err) {
			console.error('Failed to impersonate tenant', err);
		} finally {
			setImpersonatingTenantId(null);
		}
	};

	const filteredTenants = tenants.filter(
		(t) =>
			(t?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			(t?.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getPlanChip = (plan: string) => {
		switch (plan?.toLowerCase()) {
			case 'enterprise':
				return <Chip size="small" label="Enterprise" color="primary" variant="filled" />;
			case 'pro':
				return <Chip size="small" label="Pro" color="secondary" variant="filled" />;
			case 'standard':
				return <Chip size="small" label="Standard" color="info" variant="outlined" />;
			default:
				return <Chip size="small" label="Free" variant="outlined" />;
		}
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row items-center justify-between p-24 sm:p-32 w-full border-b border-divider">
					<div className="flex items-center">
						<FuseSvgIcon size={32} className="text-primary-main mr-16">
							heroicons-outline:shield-check
						</FuseSvgIcon>
						<div>
							<Typography className="text-2xl font-bold tracking-tight">
								Super Admin Control Center
							</Typography>
							<Typography color="text.secondary" className="text-sm">
								Manage tenant plans, custom quotas, and granular feature gating
							</Typography>
						</div>
					</div>
					<div className="mt-16 sm:mt-0 flex items-center gap-16">
						<TextField
							size="small"
							placeholder="Search shops & subdomains..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<FuseSvgIcon size={18} className="text-text-secondary mr-8">
										heroicons-outline:search
									</FuseSvgIcon>
								)
							}}
						/>
					</div>
				</div>
			}
			content={
				<div className="p-24 sm:p-32 w-full max-w-7xl mx-auto space-y-24">
					{/* KPI Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-24">
						<Paper className="p-20 flex items-center gap-16 shadow rounded-2xl">
							<div className="p-12 rounded-xl bg-primary-light text-primary-contrastText">
								<FuseSvgIcon size={24}>heroicons-outline:office-building</FuseSvgIcon>
							</div>
							<div>
								<Typography color="text.secondary" className="text-xs uppercase font-semibold">
									Total Tenants
								</Typography>
								<Typography className="text-2xl font-bold">{tenants.length}</Typography>
							</div>
						</Paper>

						<Paper className="p-20 flex items-center gap-16 shadow rounded-2xl">
							<div className="p-12 rounded-xl bg-green-500 text-white">
								<FuseSvgIcon size={24}>heroicons-outline:check-circle</FuseSvgIcon>
							</div>
							<div>
								<Typography color="text.secondary" className="text-xs uppercase font-semibold">
									Active Accounts
								</Typography>
								<Typography className="text-2xl font-bold">
									{tenants.filter((t) => t.isActive).length}
								</Typography>
							</div>
						</Paper>

						<Paper className="p-20 flex items-center gap-16 shadow rounded-2xl">
							<div className="p-12 rounded-xl bg-secondary-main text-secondary-contrastText">
								<FuseSvgIcon size={24}>heroicons-outline:sparkles</FuseSvgIcon>
							</div>
							<div>
								<Typography color="text.secondary" className="text-xs uppercase font-semibold">
									Enterprise Tier
								</Typography>
								<Typography className="text-2xl font-bold">
									{tenants.filter((t) => t.plan?.toLowerCase() === 'enterprise').length}
								</Typography>
							</div>
						</Paper>
					</div>

					{/* Main Tenants Table */}
					<Paper className="shadow rounded-2xl overflow-hidden p-24">
						<div className="flex items-center justify-between mb-16">
							<Typography className="text-lg font-semibold">Tenants & Shop Accounts</Typography>
							<Typography color="text.secondary" className="text-sm">
								Showing {filteredTenants.length} of {tenants.length} tenants
							</Typography>
						</div>

						{isLoading ? (
							<div className="py-48 flex justify-center items-center">
								<CircularProgress />
							</div>
						) : error ? (
							<Alert severity="error" className="my-16">
								Failed to load tenants. Please verify your SuperAdmin permissions.
							</Alert>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell className="font-semibold">Shop / Tenant Name</TableCell>
											<TableCell className="font-semibold">Subdomain</TableCell>
											<TableCell className="font-semibold">Plan</TableCell>
											<TableCell className="font-semibold">Status</TableCell>
											<TableCell className="font-semibold">Feature Overrides</TableCell>
											<TableCell className="font-semibold text-right">Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredTenants.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} align="center" className="py-32 text-text-secondary">
													No shops match your search criteria.
												</TableCell>
											</TableRow>
										) : (
											filteredTenants.map((tenant) => (
												<TableRow key={tenant.id} hover>
													<TableCell className="font-medium text-text-primary">
														{tenant.name}
													</TableCell>
													<TableCell className="text-text-secondary text-sm">
														{tenant.subdomain}.domain.com
													</TableCell>
													<TableCell>{getPlanChip(tenant.plan)}</TableCell>
													<TableCell>
														{tenant.isActive ? (
															<Chip size="small" label="Active" color="success" variant="outlined" />
														) : (
															<Chip size="small" label="Suspended" color="error" variant="outlined" />
														)}
													</TableCell>
													<TableCell>
														{tenant.activeFeatureOverridesCount > 0 ? (
															<Chip
																size="small"
																label={`${tenant.activeFeatureOverridesCount} Overrides`}
																color="warning"
															/>
														) : (
															<Typography color="text.secondary" className="text-xs">
																Default Plan
															</Typography>
														)}
													</TableCell>
													<TableCell align="right">
														<div className="flex items-center justify-end gap-8">
															<Button
																variant="contained"
																size="small"
																color="warning"
																onClick={() => handleImpersonate(tenant)}
																disabled={isImpersonating && impersonatingTenantId === tenant.id}
																startIcon={<FuseSvgIcon size={16}>heroicons-outline:login</FuseSvgIcon>}
																sx={{ fontWeight: 600 }}
															>
																{isImpersonating && impersonatingTenantId === tenant.id ? 'Connecting...' : 'Login as Shop'}
															</Button>
															<Button
																variant="outlined"
																size="small"
																color="primary"
																onClick={() => setSelectedTenant(tenant)}
																startIcon={
																	<FuseSvgIcon size={16}>
																		heroicons-outline:adjustments
																	</FuseSvgIcon>
																}
															>
																Configure
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>
						)}
					</Paper>

					{/* Feature & Quota Control Dialog */}
					{selectedTenant && (
						<TenantControlDialog
							tenant={selectedTenant}
							onClose={() => setSelectedTenant(null)}
						/>
					)}
				</div>
			}
		/>
	);
}

function TenantControlDialog({
	tenant,
	onClose
}: {
	tenant: AdminTenantDto;
	onClose: () => void;
}) {
	const { data: details, isLoading } = useGetTenantDetailsQuery(tenant.id);
	const [setOverride] = useSetFeatureOverrideMutation();
	const [deleteOverride] = useDeleteFeatureOverrideMutation();
	const [updatePlanQuotas] = useUpdateTenantPlanAndQuotasMutation();
	const [exportTenantData, { isLoading: isExporting }] = useExportTenantDataMutation();

	const [plan, setPlan] = useState<number>(tenant.planTier ?? 0);
	const [maxProducts, setMaxProducts] = useState<string>(tenant.customMaxProducts?.toString() || '');
	const [maxStaff, setMaxStaff] = useState<string>(tenant.customMaxStaff?.toString() || '');
	const [maxCoupons, setMaxCoupons] = useState<string>(tenant.customMaxCoupons?.toString() || '');
	const [reason, setReason] = useState<string>('Super Admin custom override');
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [exportSuccess, setExportSuccess] = useState(false);

	const handleExport = async () => {
		try {
			const res = await exportTenantData(tenant.id).unwrap();
			const blob = new Blob([res.jsonData], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = res.fileName || `${tenant.subdomain}_snapshot.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setExportSuccess(true);
			setTimeout(() => setExportSuccess(false), 3000);
		} catch (e) {
			console.error('Failed to export tenant data', e);
		}
	};

	const handleToggleFeature = async (featureId: number, currentlyEnabled: boolean) => {
		try {
			await setOverride({
				tenantId: tenant.id,
				feature: featureId,
				isEnabled: !currentlyEnabled,
				reason: reason.trim()
			}).unwrap();
		} catch (e) {
			console.error('Failed to toggle feature', e);
		}
	};

	const handleResetFeature = async (featureId: number) => {
		try {
			await deleteOverride({
				tenantId: tenant.id,
				feature: featureId
			}).unwrap();
		} catch (e) {
			console.error('Failed to reset feature override', e);
		}
	};

	const handleSavePlanAndQuotas = async () => {
		setIsSaving(true);
		try {
			await updatePlanQuotas({
				tenantId: tenant.id,
				plan: plan,
				customMaxProducts: maxProducts ? parseInt(maxProducts, 10) : null,
				customMaxStaff: maxStaff ? parseInt(maxStaff, 10) : null,
				customMaxCoupons: maxCoupons ? parseInt(maxCoupons, 10) : null
			}).unwrap();
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (e) {
			console.error('Failed to save plan and quotas', e);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open fullWidth maxWidth="md" onClose={onClose}>
			<DialogTitle className="flex justify-between items-center border-b border-divider">
				<div>
					<Typography className="text-xl font-bold">Configure Tenant: {tenant.name}</Typography>
					<Typography color="text.secondary" className="text-xs">
						ID: {tenant.id} • Subdomain: {tenant.subdomain}
					</Typography>
				</div>
				<Button size="small" onClick={onClose}>
					<FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
				</Button>
			</DialogTitle>

			<DialogContent className="p-24 space-y-24">
				{isLoading ? (
					<div className="py-48 flex justify-center">
						<CircularProgress />
					</div>
				) : (
					<>
						{saveSuccess && (
							<Alert severity="success" className="mb-16">
								Plan tier and quotas updated successfully!
							</Alert>
						)}

						{exportSuccess && (
							<Alert severity="success" className="mb-16">
								Store data snapshot exported and downloaded successfully!
							</Alert>
						)}

						{/* Plan & Quotas Section */}
						<div className="space-y-16">
							<Typography className="text-base font-semibold border-b border-divider pb-8">
								Subscription Plan & Custom Quotas
							</Typography>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
								<FormControl fullWidth size="small">
									<InputLabel>Subscription Plan</InputLabel>
									<Select
										value={plan}
										label="Subscription Plan"
										onChange={(e) => setPlan(Number(e.target.value))}
									>
										<MenuItem value={0}>Free Plan (Default limits)</MenuItem>
										<MenuItem value={1}>Standard Plan (Growing shops)</MenuItem>
										<MenuItem value={2}>Pro Plan (High volume)</MenuItem>
										<MenuItem value={3}>Enterprise Plan (Unlimited)</MenuItem>
									</Select>
								</FormControl>

								<TextField
									fullWidth
									size="small"
									label="Custom Max Products (override)"
									placeholder="Leave empty for plan default"
									value={maxProducts}
									onChange={(e) => setMaxProducts(e.target.value)}
									type="number"
								/>

								<TextField
									fullWidth
									size="small"
									label="Custom Max Staff Accounts"
									placeholder="Leave empty for plan default"
									value={maxStaff}
									onChange={(e) => setMaxStaff(e.target.value)}
									type="number"
								/>

								<TextField
									fullWidth
									size="small"
									label="Custom Max Coupons"
									placeholder="Leave empty for plan default"
									value={maxCoupons}
									onChange={(e) => setMaxCoupons(e.target.value)}
									type="number"
								/>
							</div>

							<div className="flex justify-end pt-8">
								<Button
									variant="contained"
									color="primary"
									size="small"
									onClick={handleSavePlanAndQuotas}
									disabled={isSaving}
								>
									{isSaving ? 'Saving...' : 'Apply Plan & Quota Changes'}
								</Button>
							</div>
						</div>

						{/* Feature Overrides Matrix */}
						<div className="space-y-16">
							<div className="flex justify-between items-center border-b border-divider pb-8">
								<Typography className="text-base font-semibold">
									Granular Feature Gating (Per-Account Overrides)
								</Typography>
								<Typography color="text.secondary" className="text-xs">
									Overrides take immediate effect in real-time
								</Typography>
							</div>

							<TextField
								fullWidth
								size="small"
								label="Audit Reason for Override"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								className="mb-8"
							/>

							<div className="divide-y divide-divider border border-divider rounded-xl">
								{AVAILABLE_FEATURES.map((feat) => {
									const override = details?.featureOverrides?.find(
										(o) => o.feature === feat.name || o.featureId === feat.id
									);
									const isEnabled = override
										? override.isEnabled
										: details?.enabledFeatures?.includes(feat.name) ?? false;
									const hasOverride = override !== undefined;

									return (
										<div
											key={feat.id}
											className="p-16 flex items-center justify-between hover:bg-background-default"
										>
											<div>
												<div className="flex items-center gap-8">
													<Typography className="font-medium text-sm">
														{feat.label}
													</Typography>
													{hasOverride && (
														<Chip
															size="small"
															label={override.isEnabled ? 'Force Enabled' : 'Force Disabled'}
															color={override.isEnabled ? 'success' : 'error'}
															variant="outlined"
														/>
													)}
												</div>
												<Typography color="text.secondary" className="text-xs">
													Feature Key: <code>{feat.name}</code> (ID: {feat.id})
													{override?.reason && ` • Reason: "${override.reason}"`}
												</Typography>
											</div>

											<div className="flex items-center gap-8">
												<FormControlLabel
													control={
														<Switch
															checked={isEnabled}
															onChange={() => handleToggleFeature(feat.id, isEnabled)}
															color="primary"
														/>
													}
													label={isEnabled ? 'ON' : 'OFF'}
													labelPlacement="start"
												/>
												{hasOverride && (
													<Button
														size="small"
														color="inherit"
														variant="text"
														onClick={() => handleResetFeature(feat.id)}
														title="Reset to default plan"
													>
														Reset
													</Button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</>
				)}
			</DialogContent>

			<DialogActions className="p-16 border-t border-divider flex justify-between items-center w-full">
				<Button
					variant="outlined"
					color="secondary"
					onClick={handleExport}
					disabled={isExporting}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:download</FuseSvgIcon>}
				>
					{isExporting ? 'Exporting...' : 'Export Store Data (JSON)'}
				</Button>
				<Button onClick={onClose} variant="outlined" color="inherit">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ShopsPage;
