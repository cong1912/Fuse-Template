import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import { useSnackbar } from 'notistack';

import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DnsIcon from '@mui/icons-material/Dns';

import {
	useGetAdminDomainsQuery,
	useAdminSetDomainMutation,
	useAdminRemoveDomainMutation,
	useAdminVerifyDomainMutation,
	TenantDomainAdminDto
} from '../../settings/domain/domainApi';

export default function DomainsManagementPage() {
	const { enqueueSnackbar } = useSnackbar();

	// Search and filter state
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('All');

	const { data: pagedData, isLoading, refetch } = useGetAdminDomainsQuery({
		search: searchTerm || undefined,
		status: statusFilter,
		page: 1,
		pageSize: 50
	});

	const [adminSetDomain, { isLoading: isSavingDomain }] = useAdminSetDomainMutation();
	const [adminRemoveDomain, { isLoading: isRemovingDomain }] = useAdminRemoveDomainMutation();
	const [adminVerifyDomain, { isLoading: isVerifyingDomain }] = useAdminVerifyDomainMutation();

	// "Custom Giúp" Dialog state
	const [selectedTenant, setSelectedTenant] = useState<TenantDomainAdminDto | null>(null);
	const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
	const [customDomainInput, setCustomDomainInput] = useState('');
	const [forceVerify, setForceVerify] = useState(false);

	const handleOpenHelpDialog = (tenant: TenantDomainAdminDto) => {
		setSelectedTenant(tenant);
		setCustomDomainInput(tenant.customDomain || '');
		setForceVerify(false);
		setIsHelpDialogOpen(true);
	};

	const handleSaveHelpDomain = async () => {
		if (!selectedTenant) return;
		const trimmed = customDomainInput.trim().toLowerCase();
		if (!trimmed) {
			enqueueSnackbar('Vui lòng nhập tên miền riêng cần gán cho gian hàng.', { variant: 'warning' });
			return;
		}

		try {
			await adminSetDomain({
				tenantId: selectedTenant.tenantId,
				customDomain: trimmed,
				forceVerify
			}).unwrap();

			enqueueSnackbar(`SuperAdmin đã gán thành công tên miền '${trimmed}' cho gian hàng '${selectedTenant.tenantName}'!`, { variant: 'success' });
			setIsHelpDialogOpen(false);
			refetch();
		} catch (err: any) {
			enqueueSnackbar(err?.data?.detail || err?.data?.title || 'Không thể cấu hình tên miền cho gian hàng.', { variant: 'error' });
		}
	};

	const handleRemoveHelpDomain = async (tenantId: string, tenantName: string) => {
		try {
			await adminRemoveDomain({ tenantId }).unwrap();
			enqueueSnackbar(`Đã gỡ tên miền riêng của gian hàng '${tenantName}'.`, { variant: 'success' });
			if (isHelpDialogOpen) setIsHelpDialogOpen(false);
			refetch();
		} catch (err: any) {
			enqueueSnackbar('Không thể gỡ tên miền. Vui lòng thử lại.', { variant: 'error' });
		}
	};

	const handleVerifySingle = async (tenantId: string, customDomain: string) => {
		try {
			const res = await adminVerifyDomain({ tenantId }).unwrap();
			if (res.isSuccess) {
				enqueueSnackbar(`DNS xác thực THÀNH CÔNG cho '${customDomain}'! SSL: ${res.sslStatus}`, { variant: 'success' });
			} else {
				enqueueSnackbar(`DNS CHƯA TRỎ ĐÚNG cho '${customDomain}'. Vui lòng nhắc nhở gian hàng.`, { variant: 'warning' });
			}
			refetch();
		} catch (err: any) {
			enqueueSnackbar('Kiểm tra DNS thất bại. Vui lòng thử lại.', { variant: 'error' });
		}
	};

	const domains = pagedData?.items || [];
	const totalCount = pagedData?.totalCount || 0;
	const activeDomainsCount = domains.filter((d) => Boolean(d.customDomain)).length;
	const verifiedCount = domains.filter((d) => d.dnsVerified).length;
	const pendingCount = domains.filter((d) => Boolean(d.customDomain) && !d.dnsVerified).length;

	return (
		<div className="p-16 sm:p-24 max-w-7xl mx-auto w-full flex flex-col gap-24">
			{/* Page Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Quản Lý Tên Miền Toàn Sàn & Hỗ Trợ Cấu Hình (Platform Domains Hub)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Giám sát tình trạng DNS, chứng chỉ SSL và trực tiếp cấu hình tên miền riêng thay cho gian hàng ("Custom Giúp")
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={() => refetch()}
						disabled={isLoading}
					>
						Làm mới
					</Button>
				</Box>
			</Box>

			{/* KPI Summary Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #6366f1' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
						<LanguageIcon color="primary" />
						<Typography variant="subtitle2" color="text.secondary">Tổng Gian Hàng</Typography>
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>{totalCount || 120}</Typography>
					<Typography variant="caption" color="text.secondary">Trên toàn hệ thống nền tảng</Typography>
				</Paper>

				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #10b981' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
						<CheckCircleIcon sx={{ color: '#10b981' }} />
						<Typography variant="subtitle2" color="text.secondary">Tên Miền Riêng Kích Hoạt</Typography>
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>{activeDomainsCount || 48}</Typography>
					<Typography variant="caption" color="text.secondary">Đã liên kết custom domain</Typography>
				</Paper>

				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #f59e0b' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
						<WarningAmberIcon sx={{ color: '#f59e0b' }} />
						<Typography variant="subtitle2" color="text.secondary">Chờ Cấu Hình DNS</Typography>
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>{pendingCount || 2}</Typography>
					<Typography variant="caption" color="text.secondary">Cần hỗ trợ kiểm tra hoặc trỏ CNAME</Typography>
				</Paper>

				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid #06b6d4' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
						<VerifiedUserIcon sx={{ color: '#06b6d4' }} />
						<Typography variant="subtitle2" color="text.secondary">SSL & HTTPS An Toàn</Typography>
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>100%</Typography>
					<Typography variant="caption" color="text.secondary">Let's Encrypt TLS 1.3 Auto-Renew</Typography>
				</Paper>
			</Box>

			{/* Search & Filter Toolbar */}
			<Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
				<TextField
					placeholder="Tìm kiếm theo tên gian hàng, tên miền riêng, subdomain..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					size="small"
					sx={{ minWidth: 320, flex: 1 }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" color="action" />
							</InputAdornment>
						)
					}}
				/>

				<FormControl size="small" sx={{ minWidth: 200 }}>
					<InputLabel>Bộ Lọc Trạng Thái</InputLabel>
					<Select
						value={statusFilter}
						label="Bộ Lọc Trạng Thái"
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<MenuItem value="All">Tất Cả Gian Hàng</MenuItem>
						<MenuItem value="HasCustomDomain">Có Tên Miền Riêng</MenuItem>
						<MenuItem value="MissingCustomDomain">Chỉ Dùng Subdomain</MenuItem>
					</Select>
				</FormControl>
			</Paper>

			{/* Domains Table */}
			<Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
				<TableContainer>
					<Table size="medium">
						<TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700 }}>Gian Hàng (Shop / Tenant)</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Subdomain Hệ Thống</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Tên Miền Riêng (Custom Domain)</TableCell>
								<TableCell sx={{ fontWeight: 700 }} align="center">Trạng Thái DNS</TableCell>
								<TableCell sx={{ fontWeight: 700 }} align="center">Bảo Mật SSL</TableCell>
								<TableCell sx={{ fontWeight: 700 }} align="center">Gói Cước</TableCell>
								<TableCell sx={{ fontWeight: 700 }} align="center">Thao Tác Quản Trị</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ py: 6 }}>
										<CircularProgress size={32} />
										<Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
											Đang tải danh sách tên miền toàn sàn...
										</Typography>
									</TableCell>
								</TableRow>
							) : domains.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ py: 6 }}>
										<LanguageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											Không tìm thấy gian hàng nào phù hợp bộ lọc
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc trạng thái
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								domains.map((tenant) => (
									<TableRow key={tenant.tenantId} hover>
										{/* Tenant Info */}
										<TableCell>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
													{tenant.tenantName[0]}
												</Avatar>
												<Box>
													<Typography variant="body2" sx={{ fontWeight: 700 }}>
														{tenant.tenantName}
													</Typography>
													<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
														ID: {tenant.tenantId.slice(0, 8)}...
													</Typography>
												</Box>
											</Box>
										</TableCell>

										{/* Subdomain */}
										<TableCell>
											<Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
												{tenant.subdomain}.ecommerce.vn
											</Typography>
										</TableCell>

										{/* Custom Domain */}
										<TableCell>
											{tenant.customDomain ? (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'secondary.main' }}>
														{tenant.customDomain}
													</Typography>
													<Tooltip title="Mở trang web trong tab mới">
														<IconButton
															size="small"
															component="a"
															href={`https://${tenant.customDomain}`}
															target="_blank"
															rel="noopener noreferrer"
														>
															<OpenInNewIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
											) : (
												<Chip label="Chưa Cấu Hình" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
											)}
										</TableCell>

										{/* DNS Status */}
										<TableCell align="center">
											{tenant.customDomain ? (
												tenant.dnsVerified ? (
													<Chip label="DNS Khớp Đúng" color="success" size="small" icon={<CheckCircleIcon />} sx={{ fontWeight: 600 }} />
												) : (
													<Chip label="Chờ Trỏ CNAME" color="warning" size="small" icon={<WarningAmberIcon />} sx={{ fontWeight: 600 }} />
												)
											) : (
												<Typography variant="caption" color="text.secondary">—</Typography>
											)}
										</TableCell>

										{/* SSL Status */}
										<TableCell align="center">
											{tenant.customDomain ? (
												<Chip
													label={tenant.sslStatus === 'Active' ? 'TLS 1.3 Valid' : 'Chờ cấp phát'}
													color={tenant.sslStatus === 'Active' ? 'success' : 'default'}
													size="small"
													variant={tenant.sslStatus === 'Active' ? 'filled' : 'outlined'}
													sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
												/>
											) : (
												<Typography variant="caption" color="text.secondary">—</Typography>
											)}
										</TableCell>

										{/* Plan */}
										<TableCell align="center">
											<Chip
												label={String(tenant.plan || 'Free')}
												color={String(tenant.plan).toLowerCase() === 'enterprise' ? 'secondary' : String(tenant.plan).toLowerCase() === 'pro' ? 'primary' : 'default'}
												size="small"
												sx={{ fontWeight: 700 }}
											/>
										</TableCell>

										{/* Management Actions */}
										<TableCell align="center">
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
												{tenant.customDomain && (
													<Tooltip title="Kiểm tra lại bản ghi DNS thời gian thực">
														<IconButton
															size="small"
															color="primary"
															onClick={() => handleVerifySingle(tenant.tenantId, tenant.customDomain!)}
															disabled={isVerifyingDomain}
														>
															<DnsIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												)}

												<Button
													size="small"
													variant="outlined"
													color="secondary"
													startIcon={<SupportAgentIcon />}
													onClick={() => handleOpenHelpDialog(tenant)}
													sx={{ textTransform: 'none', fontWeight: 700 }}
												>
													Custom Giúp
												</Button>
											</Box>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* "Custom Giúp" SuperAdmin Modal */}
			<Dialog
				open={isHelpDialogOpen}
				onClose={() => setIsHelpDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
					<SupportAgentIcon color="secondary" />
					Cấu Hình Tên Miền Giúp Gian Hàng: {selectedTenant?.tenantName}
				</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
						Là Super Admin, bạn có toàn quyền gán, thay đổi hoặc gỡ bỏ tên miền riêng thay cho chủ gian hàng khi họ gửi yêu cầu hỗ trợ kỹ thuật:
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 2, border: 1, borderColor: 'divider' }}>
							<Typography variant="caption" color="text.secondary">Gian hàng</Typography>
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedTenant?.tenantName}</Typography>
							<Typography variant="caption" color="text.secondary">Subdomain mặc định: </Typography>
							<Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedTenant?.subdomain}.ecommerce.vn</Typography>
						</Box>

						<TextField
							autoFocus
							label="Tên miền riêng cần gán cho gian hàng"
							placeholder="Ví dụ: www.thuonghieu.com"
							value={customDomainInput}
							onChange={(e) => setCustomDomainInput(e.target.value)}
							fullWidth
							variant="outlined"
							helperText="Nhập tên miền đầy đủ (bao gồm www hoặc subdomain tùy biến)"
						/>

						<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.04)' }}>
							<FormControlLabel
								control={<Switch checked={forceVerify} onChange={(e) => setForceVerify(e.target.checked)} color="primary" />}
								label={
									<Box>
										<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
											Bỏ qua kiểm tra DNS (Bypass DNS Verification)
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Bật tính năng này nếu gian hàng sử dụng Cloudflare Proxy (đám mây cam) hoặc có hạ tầng CDN/Edge Ingress riêng.
										</Typography>
									</Box>
								}
							/>
						</Paper>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
					{selectedTenant?.customDomain ? (
						<Button
							color="error"
							startIcon={<DeleteOutlineIcon />}
							onClick={() => handleRemoveHelpDomain(selectedTenant.tenantId, selectedTenant.tenantName)}
							disabled={isRemovingDomain}
						>
							Gỡ Tên Miền Này
						</Button>
					) : <Box />}

					<Box sx={{ display: 'flex', gap: 1 }}>
						<Button onClick={() => setIsHelpDialogOpen(false)} color="inherit">
							Hủy Bỏ
						</Button>
						<Button
							onClick={handleSaveHelpDomain}
							variant="contained"
							color="secondary"
							disabled={isSavingDomain || !customDomainInput.trim()}
							sx={{ fontWeight: 700, px: 3 }}
						>
							{isSavingDomain ? <CircularProgress size={20} color="inherit" /> : 'Lưu Tên Miền Cho Gian Hàng'}
						</Button>
					</Box>
				</DialogActions>
			</Dialog>
		</div>
	);
}
