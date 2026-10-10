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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useGetPlatformAuditLogsQuery, AuditLogDto } from '../AdminTenantsApi';

function AuditPage() {
	const { data: rawLogs = [], isLoading, error, refetch } = useGetPlatformAuditLogsQuery();
	const logs: AuditLogDto[] = Array.isArray(rawLogs)
		? rawLogs
		: ((rawLogs as any)?.items || []);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
	const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

	const actionsList = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));

	const filteredLogs = logs.filter((log) => {
		const matchesSearch =
			(log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(log.entityType && log.entityType.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(log.onBehalfOfTenantId && log.onBehalfOfTenantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(log.ipAddress && log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()));

		const matchesAction =
			selectedActionFilter === 'ALL' || log.action === selectedActionFilter;

		return matchesSearch && matchesAction;
	});

	const getActionChip = (action: string) => {
		const act = action.toUpperCase();
		if (act.includes('IMPERSONATE')) {
			return <Chip size="small" label={action} color="warning" variant="filled" />;
		}
		if (act.includes('FEATURE') || act.includes('OVERRIDE')) {
			return <Chip size="small" label={action} color="info" variant="filled" />;
		}
		if (act.includes('PLAN') || act.includes('QUOTA')) {
			return <Chip size="small" label={action} color="primary" variant="filled" />;
		}
		if (act.includes('EXPORT')) {
			return <Chip size="small" label={action} color="secondary" variant="filled" />;
		}
		if (act.includes('DELETE') || act.includes('SUSPEND')) {
			return <Chip size="small" label={action} color="error" variant="filled" />;
		}
		return <Chip size="small" label={action} variant="outlined" />;
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
								Platform Audit Trail & Compliance
							</Typography>
							<Typography color="text.secondary" className="text-sm">
								Immutable record of all administrative, tenant impersonation, and security events (SOC2 & GDPR ready)
							</Typography>
						</div>
					</div>
					<div className="mt-16 sm:mt-0 flex items-center gap-16">
						<Button
							variant="outlined"
							size="small"
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
					{/* Filter Bar */}
					<Paper className="p-20 shadow rounded-2xl flex flex-col sm:flex-row items-center gap-16">
						<TextField
							size="small"
							placeholder="Search by action, actor, tenant, IP..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="flex-1 w-full"
							InputProps={{
								startAdornment: (
									<FuseSvgIcon size={18} className="text-text-secondary mr-8">
										heroicons-outline:search
									</FuseSvgIcon>
								)
							}}
						/>

						<FormControl size="small" className="min-w-200 w-full sm:w-auto">
							<InputLabel>Filter by Action</InputLabel>
							<Select
								value={selectedActionFilter}
								label="Filter by Action"
								onChange={(e) => setSelectedActionFilter(e.target.value)}
							>
								<MenuItem value="ALL">All Actions ({logs.length})</MenuItem>
								{actionsList.map((act) => (
									<MenuItem key={act} value={act}>
										{act}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Paper>

					{/* Audit Logs Table */}
					<Paper className="shadow rounded-2xl overflow-hidden p-24">
						<div className="flex items-center justify-between mb-16">
							<Typography className="text-lg font-semibold">Security Audit Events</Typography>
							<Typography color="text.secondary" className="text-sm">
								Showing {filteredLogs.length} of {logs.length} logged entries
							</Typography>
						</div>

						{isLoading ? (
							<div className="py-48 flex justify-center items-center">
								<CircularProgress />
							</div>
						) : error ? (
							<Alert severity="error" className="my-16">
								Failed to load platform audit logs. Please verify your SuperAdmin permissions.
							</Alert>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell className="font-semibold">Timestamp (UTC)</TableCell>
											<TableCell className="font-semibold">Action</TableCell>
											<TableCell className="font-semibold">Actor / User</TableCell>
											<TableCell className="font-semibold">Tenant Context</TableCell>
											<TableCell className="font-semibold">Target Entity</TableCell>
											<TableCell className="font-semibold">IP Address</TableCell>
											<TableCell className="font-semibold text-right">Details</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredLogs.length === 0 ? (
											<TableRow>
												<TableCell colSpan={7} align="center" className="py-32 text-text-secondary">
													No audit events found matching the filter criteria.
												</TableCell>
											</TableRow>
										) : (
											filteredLogs.map((log) => (
												<TableRow key={log.id} hover>
													<TableCell className="text-sm whitespace-nowrap">
														{new Date(log.createdAtUtc).toLocaleString()}
													</TableCell>
													<TableCell>{getActionChip(log.action)}</TableCell>
													<TableCell>
														<div className="text-sm font-medium">{log.userId}</div>
														{log.actorType && (
															<Typography color="text.secondary" className="text-xs">
																{log.actorType}
															</Typography>
														)}
													</TableCell>
													<TableCell>
														{log.onBehalfOfTenantId ? (
															<Chip
																size="small"
																label={`Tenant: ${log.onBehalfOfTenantId.substring(0, 8)}...`}
																color="warning"
																variant="outlined"
															/>
														) : (
															<span className="text-text-secondary text-xs">Platform Global</span>
														)}
													</TableCell>
													<TableCell>
														<div className="text-sm">
															{log.entityType || '—'}
														</div>
														{log.entityId && (
															<Typography color="text.secondary" className="text-xs font-mono">
																{log.entityId.substring(0, 12)}
															</Typography>
														)}
													</TableCell>
													<TableCell className="font-mono text-xs">
														{log.ipAddress || 'Internal'}
													</TableCell>
													<TableCell align="right">
														<Button
															variant="outlined"
															size="small"
															color="primary"
															onClick={() => setSelectedLog(log)}
															startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-text</FuseSvgIcon>}
														>
															View
														</Button>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>
						)}
					</Paper>

					{/* Detail Modal */}
					{selectedLog && (
						<Dialog open fullWidth maxWidth="md" onClose={() => setSelectedLog(null)}>
							<DialogTitle className="flex justify-between items-center border-b border-divider">
								<div>
									<Typography className="text-xl font-bold">Audit Event Details</Typography>
									<Typography color="text.secondary" className="text-xs font-mono">
										ID: {selectedLog.id}
									</Typography>
								</div>
								<Button size="small" onClick={() => setSelectedLog(null)}>
									<FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
								</Button>
							</DialogTitle>
							<DialogContent className="p-24 space-y-16">
								<div className="grid grid-cols-2 gap-16">
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary">
											Action
										</Typography>
										<Typography className="text-sm font-semibold">{selectedLog.action}</Typography>
									</div>
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary">
											Created At (UTC)
										</Typography>
										<Typography className="text-sm font-semibold">
											{new Date(selectedLog.createdAtUtc).toUTCString()}
										</Typography>
									</div>
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary">
											Actor User ID
										</Typography>
										<Typography className="text-sm font-mono">{selectedLog.userId}</Typography>
									</div>
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary">
											On Behalf Of Tenant ID
										</Typography>
										<Typography className="text-sm font-mono">
											{selectedLog.onBehalfOfTenantId || 'None (Platform-wide)'}
										</Typography>
									</div>
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary">
											IP Address
										</Typography>
										<Typography className="text-sm font-mono">{selectedLog.ipAddress || 'Internal / N/A'}</Typography>
									</div>
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary">
											User Agent
										</Typography>
										<Typography className="text-xs text-text-secondary truncate">
											{selectedLog.userAgent || 'N/A'}
										</Typography>
									</div>
								</div>

								{selectedLog.oldValues && (
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary mb-4">
											Previous Values (Before Action)
										</Typography>
										<Paper className="p-12 bg-background-default font-mono text-xs overflow-x-auto">
											<pre>{selectedLog.oldValues}</pre>
										</Paper>
									</div>
								)}

								{selectedLog.newValues && (
									<div>
										<Typography className="text-xs uppercase font-semibold text-text-secondary mb-4">
											New Values / Recorded Changes
										</Typography>
										<Paper className="p-12 bg-background-default font-mono text-xs overflow-x-auto">
											<pre>{selectedLog.newValues}</pre>
										</Paper>
									</div>
								)}
							</DialogContent>
							<DialogActions className="p-16 border-t border-divider">
								<Button onClick={() => setSelectedLog(null)} variant="outlined">
									Close
								</Button>
							</DialogActions>
						</Dialog>
					)}
				</div>
			}
		/>
	);
}

export default AuditPage;
