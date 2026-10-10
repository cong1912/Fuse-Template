import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { useSnackbar } from 'notistack';

import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import {
	useGetTenantDomainQuery,
	useUpdateSubdomainMutation,
	useSetCustomDomainMutation,
	useRemoveCustomDomainMutation,
	useVerifyCustomDomainMutation,
	DomainVerificationResultDto
} from './domainApi';

export default function DomainSettingsPage() {
	const { enqueueSnackbar } = useSnackbar();
	const { data: domainData, isLoading, refetch } = useGetTenantDomainQuery();

	const [updateSubdomain, { isLoading: isUpdatingSubdomain }] = useUpdateSubdomainMutation();
	const [setCustomDomain, { isLoading: isSettingCustomDomain }] = useSetCustomDomainMutation();
	const [removeCustomDomain, { isLoading: isRemovingCustomDomain }] = useRemoveCustomDomainMutation();
	const [verifyCustomDomain, { isLoading: isVerifying }] = useVerifyCustomDomainMutation();

	// Local states
	const [customDomainInput, setCustomDomainInput] = useState('');
	const [isSubdomainDialogOpen, setIsSubdomainDialogOpen] = useState(false);
	const [newSubdomainInput, setNewSubdomainInput] = useState('');
	const [verificationResult, setVerificationResult] = useState<DomainVerificationResultDto | null>(null);

	// Sync local input with API data once loaded
	React.useEffect(() => {
		if (domainData?.customDomain) {
			setCustomDomainInput(domainData.customDomain);
		}
		if (domainData?.subdomain) {
			setNewSubdomainInput(domainData.subdomain);
		}
	}, [domainData]);

	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		enqueueSnackbar(`Đã sao chép ${label}!`, { variant: 'info', autoHideDuration: 2000 });
	};

	const handleSaveCustomDomain = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = customDomainInput.trim().toLowerCase();
		if (!trimmed) {
			enqueueSnackbar('Vui lòng nhập tên miền riêng hợp lệ (ví dụ: www.cuahang.vn)', { variant: 'warning' });
			return;
		}

		try {
			await setCustomDomain({ customDomain: trimmed }).unwrap();
			enqueueSnackbar(`Đã lưu tên miền riêng '${trimmed}'! Vui lòng trỏ bản ghi DNS theo hướng dẫn bên dưới.`, { variant: 'success' });
			refetch();
		} catch (err: any) {
			enqueueSnackbar(err?.data?.detail || err?.data?.title || 'Không thể lưu tên miền. Vui lòng kiểm tra lại.', { variant: 'error' });
		}
	};

	const handleRemoveCustomDomain = async () => {
		try {
			await removeCustomDomain().unwrap();
			setCustomDomainInput('');
			setVerificationResult(null);
			enqueueSnackbar('Đã gỡ tên miền riêng khỏi gian hàng. Hệ thống chuyển về sử dụng subdomain mặc định.', { variant: 'success' });
			refetch();
		} catch (err: any) {
			enqueueSnackbar('Không thể gỡ tên miền. Vui lòng thử lại.', { variant: 'error' });
		}
	};

	const handleVerifyDns = async () => {
		try {
			const res = await verifyCustomDomain().unwrap();
			setVerificationResult(res);
			if (res.isSuccess) {
				enqueueSnackbar(res.message, { variant: 'success' });
			} else {
				enqueueSnackbar(res.message, { variant: 'warning' });
			}
			refetch();
		} catch (err: any) {
			enqueueSnackbar(err?.data?.detail || 'Không thể kiểm tra DNS lúc này. Vui lòng thử lại.', { variant: 'error' });
		}
	};

	const handleSaveSubdomain = async () => {
		const trimmed = newSubdomainInput.trim().toLowerCase();
		if (!trimmed || !/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(trimmed)) {
			enqueueSnackbar('Subdomain chỉ được chứa chữ cái thường (a-z), chữ số (0-9) và dấu gạch nối (-), từ 3 đến 63 ký tự.', { variant: 'error' });
			return;
		}

		try {
			await updateSubdomain({ subdomain: trimmed }).unwrap();
			enqueueSnackbar(`Đã đổi Subdomain thành công: ${trimmed}.ecommerce.vn!`, { variant: 'success' });
			setIsSubdomainDialogOpen(false);
			refetch();
		} catch (err: any) {
			enqueueSnackbar(err?.data?.detail || err?.data?.title || 'Subdomain đã tồn tại hoặc không hợp lệ.', { variant: 'error' });
		}
	};

	const currentSubdomain = domainData?.subdomain || 'my-shop';
	const fullSubdomainUrl = domainData?.fullSubdomainUrl || `https://${currentSubdomain}.ecommerce.vn`;
	const activeCustomDomain = domainData?.customDomain;
	const isDnsVerified = domainData?.dnsVerified ?? false;
	const sslStatus = domainData?.sslStatus || 'NotConfigured';
	const cnameTarget = domainData?.cnameTarget || 'cname.ecommerce.vn';
	const serverIp = domainData?.serverIp || '103.142.26.88';
	const txtRecord = domainData?.txtVerificationRecord || `ecommerce-verify=${domainData?.tenantId || 'tenant'}`;

	return (
		<div className="p-16 sm:p-24 max-w-7xl mx-auto w-full flex flex-col gap-24">
			{/* Page Header */}
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>
						Cài Đặt Tên Miền & Subdomain (Domain & Subdomain Management)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Định danh thương hiệu trực tuyến: Tùy biến subdomain hệ thống hoặc kết nối tên miền riêng bạn đã mua
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
					<Button
						variant="contained"
						color="primary"
						startIcon={<OpenInNewIcon />}
						component="a"
						href={activeCustomDomain && isDnsVerified ? `https://${activeCustomDomain}` : fullSubdomainUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						Xem Gian Hàng Trực Tuyến
					</Button>
				</Box>
			</Box>

			{/* Status Banner */}
			{activeCustomDomain ? (
				isDnsVerified ? (
					<Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
						Tên miền riêng <strong>{activeCustomDomain}</strong> đang hoạt động và được bảo mật bởi chứng chỉ SSL Let's Encrypt TLS 1.3! Khách hàng có thể truy cập gian hàng trực tiếp qua địa chỉ này.
					</Alert>
				) : (
					<Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
						Tên miền riêng <strong>{activeCustomDomain}</strong> đang chờ cấu hình bản ghi DNS. Vui lòng tạo bản ghi CNAME hoặc A theo hướng dẫn bên dưới tại nhà cung cấp tên miền của bạn.
					</Alert>
				)
			) : (
				<Alert severity="info" icon={<LanguageIcon />} sx={{ borderRadius: 2 }}>
					Bạn đang sử dụng subdomain mặc định <strong>{fullSubdomainUrl}</strong>. Bạn có thể kết nối tên miền riêng (.vn, .com, .net,...) để gia tăng uy tín thương hiệu và tăng trưởng doanh số!
				</Alert>
			)}

			{/* Main 2-Column Grid */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
				{/* Left Column (Subdomain & Custom Domain Configuration) */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* Card 1: Subdomain Mặc Định */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<PublicIcon color="primary" />
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
									Subdomain Hệ Thống Mặc Định
								</Typography>
							</Box>
							<Chip label="Đang hoạt động" color="success" size="small" sx={{ fontWeight: 600 }} />
						</Box>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Địa chỉ web mặc định do nền tảng cung cấp miễn phí, luôn khả dụng và sẵn sàng nhận đơn đặt hàng:
						</Typography>

						<Box sx={{
							display: 'flex',
							flexDirection: { xs: 'column', sm: 'row' },
							alignItems: { sm: 'center' },
							justifyContent: 'space-between',
							p: 2,
							bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : '#f1f5f9',
							borderRadius: 2,
							border: 1,
							borderColor: 'divider',
							gap: 2
						}}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<LockIcon sx={{ fontSize: 18, color: '#10b981' }} />
								<Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>
									{fullSubdomainUrl}
								</Typography>
							</Box>

							<Box sx={{ display: 'flex', gap: 1 }}>
								<Button
									size="small"
									variant="outlined"
									startIcon={<ContentCopyIcon />}
									onClick={() => handleCopy(fullSubdomainUrl, 'Địa chỉ Subdomain')}
								>
									Sao chép
								</Button>
								<Button
									size="small"
									variant="contained"
									color="primary"
									startIcon={<EditIcon />}
									onClick={() => setIsSubdomainDialogOpen(true)}
								>
									Đổi Subdomain
								</Button>
							</Box>
						</Box>
					</Paper>

					{/* Card 2: Tên Miền Riêng (Custom Domain) */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<LanguageIcon color="secondary" />
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
									Tên Miền Riêng Của Bạn (Custom Domain)
								</Typography>
							</Box>

							{activeCustomDomain ? (
								isDnsVerified ? (
									<Chip label="Đã Xác Thực & Kích Hoạt" color="success" size="small" icon={<CheckCircleIcon />} sx={{ fontWeight: 700 }} />
								) : (
									<Chip label="Chờ Trỏ Bản Ghi DNS" color="warning" size="small" icon={<WarningAmberIcon />} sx={{ fontWeight: 700 }} />
								)
							) : (
								<Chip label="Chưa Cấu Hình" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
							)}
						</Box>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Kết nối tên miền bạn đã mua từ các nhà cung cấp như Mắt Bão, PA Việt Nam, Cloudflare, GoDaddy, Namecheap:
						</Typography>

						<form onSubmit={handleSaveCustomDomain} className="flex flex-col gap-16">
							<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
								<TextField
									placeholder="Ví dụ: www.cuahang.vn hoặc shop.thuonghieu.com"
									label="Tên miền riêng của bạn"
									value={customDomainInput}
									onChange={(e) => setCustomDomainInput(e.target.value)}
									fullWidth
									required
									variant="outlined"
									helperText="Hỗ trợ tên miền phụ (subdomain) và tên miền gốc (apex domain)"
								/>
								<Button
									type="submit"
									variant="contained"
									color="secondary"
									disabled={isSettingCustomDomain || !customDomainInput.trim()}
									sx={{ minWidth: 160, height: 54 }}
								>
									{isSettingCustomDomain ? <CircularProgress size={24} color="inherit" /> : 'Lưu Tên Miền'}
								</Button>
							</Box>

							{activeCustomDomain && (
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 2 }}>
									<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
										<Button
											variant="contained"
											color="primary"
											startIcon={isVerifying ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
											onClick={handleVerifyDns}
											disabled={isVerifying}
										>
											{isVerifying ? 'Đang kiểm tra DNS...' : 'Kiểm Tra Bản Ghi DNS Ngay'}
										</Button>
										<Button
											variant="outlined"
											color="error"
											startIcon={<DeleteOutlineIcon />}
											onClick={handleRemoveCustomDomain}
											disabled={isRemovingCustomDomain}
										>
											Gỡ Tên Miền
										</Button>
									</Box>

									<FormControlLabel
										control={<Switch checked={domainData?.autoHttpsRedirect ?? true} disabled />}
										label={<Typography variant="caption">Tự động chuyển hướng sang HTTPS</Typography>}
									/>
								</Box>
							)}
						</form>

						{/* Diagnostic Verification Result */}
						{verificationResult && (
							<Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: verificationResult.isSuccess ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', border: 1, borderColor: verificationResult.isSuccess ? 'success.main' : 'warning.main' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
									{verificationResult.isSuccess ? <CheckCircleIcon color="success" /> : <WarningAmberIcon color="warning" />}
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										Kết Quả Kiểm Tra DNS ({new Date(verificationResult.checkedAtUtc).toLocaleTimeString('vi-VN')}):
									</Typography>
								</Box>
								<Typography variant="body2" sx={{ mb: 1 }}>
									{verificationResult.message}
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, textAlign: 'center', mt: 1 }}>
									<Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Bản ghi CNAME</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, color: verificationResult.cnameMatched ? 'success.main' : 'error.main' }}>
											{verificationResult.cnameMatched ? 'Khớp Đúng' : 'Chưa Khớp'}
										</Typography>
									</Box>
									<Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Địa chỉ IP Ingress</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, color: verificationResult.aRecordMatched ? 'success.main' : 'error.main' }}>
											{verificationResult.aRecordMatched ? 'Trỏ Đúng' : 'Chưa Nhận'}
										</Typography>
									</Box>
									<Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Chứng chỉ SSL</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, color: verificationResult.sslStatus === 'Active' ? 'success.main' : 'warning.main' }}>
											{verificationResult.sslStatus}
										</Typography>
									</Box>
								</Box>
							</Box>
						)}
					</Paper>

					{/* Card 3: Bảng Hướng Dẫn Cấu Hình DNS */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
							<HelpOutlineIcon color="primary" />
							<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
								Hướng Dẫn Trỏ Bản Ghi DNS Tại Nhà Cung Cấp Tên Miền
							</Typography>
						</Box>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Đăng nhập vào trang quản trị tên miền của bạn (Mắt Bão, Cloudflare, GoDaddy,...) và thêm các bản ghi sau:
						</Typography>

						<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
							<Table size="small">
								<TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>Loại bản ghi</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Tên (Host / Name)</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Giá trị đích (Value / Points to)</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="center">Thao tác</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow hover>
										<TableCell>
											<Chip label="CNAME" color="primary" size="small" sx={{ fontWeight: 700 }} />
										</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>www</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>{cnameTarget}</TableCell>
										<TableCell align="center">
											<Tooltip title="Sao chép giá trị đích CNAME">
												<IconButton size="small" onClick={() => handleCopy(cnameTarget, 'Giá trị CNAME')}>
													<ContentCopyIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
									<TableRow hover>
										<TableCell>
											<Chip label="A Record" color="secondary" size="small" sx={{ fontWeight: 700 }} />
										</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>@</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'secondary.main' }}>{serverIp}</TableCell>
										<TableCell align="center">
											<Tooltip title="Sao chép địa chỉ IP">
												<IconButton size="small" onClick={() => handleCopy(serverIp, 'Địa chỉ IP Ingress')}>
													<ContentCopyIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
									<TableRow hover>
										<TableCell>
											<Chip label="TXT" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
										</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>_ecommerce-verify</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.8rem' }}>{txtRecord}</TableCell>
										<TableCell align="center">
											<Tooltip title="Sao chép mã xác thực TXT">
												<IconButton size="small" onClick={() => handleCopy(txtRecord, 'Mã xác thực TXT')}>
													<ContentCopyIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>

						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
							* Lưu ý: Bản ghi DNS thường mất từ <strong>5 phút đến 24 giờ</strong> để lan truyền hoàn toàn trên toàn thế giới. Sau khi trỏ xong, hãy bấm <em>"Kiểm Tra Bản Ghi DNS Ngay"</em> ở trên.
						</Typography>
					</Paper>
				</Box>

				{/* Right Column (SSL Health & Provider Guides) */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* SSL Security Status */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderLeft: '4px solid #10b981' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
							<VerifiedUserIcon sx={{ color: '#10b981', fontSize: 28 }} />
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
									Bảo Mật SSL & HTTPS
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Chứng chỉ Let's Encrypt Tự Động
								</Typography>
							</Box>
						</Box>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" color="text.secondary">Trạng thái chứng chỉ</Typography>
								<Chip
									label={sslStatus === 'Active' ? 'Đang Hoạt Động (Valid)' : sslStatus === 'Pending' ? 'Đang Chờ Kích Hoạt' : 'Chưa Cấu Hình'}
									color={sslStatus === 'Active' ? 'success' : sslStatus === 'Pending' ? 'warning' : 'default'}
									size="small"
									sx={{ fontWeight: 600 }}
								/>
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" color="text.secondary">Giao thức mã hóa</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>TLS 1.3 / HTTP/2</Typography>
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" color="text.secondary">Tự động gia hạn</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>BẬT (Auto-Renew)</Typography>
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" color="text.secondary">Hạn bảo mật</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>
									{domainData?.sslExpiresAt ? new Date(domainData.sslExpiresAt).toLocaleDateString('vi-VN') : '90 ngày kể từ kích hoạt'}
								</Typography>
							</Box>
						</Box>

						<Divider sx={{ my: 2 }} />

						<Typography variant="caption" color="text.secondary">
							Hệ thống tự động kích hoạt chứng chỉ SSL miễn phí trọn đời ngay khi bản ghi DNS CNAME/A được trỏ chính xác về nền tảng.
						</Typography>
					</Paper>

					{/* Provider Quick Tips */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
							Hướng Dẫn Theo Từng Nhà Cung Cấp
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: 1, borderColor: 'divider' }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f97316' }}>Cloudflare</Typography>
								<Typography variant="caption" color="text.secondary">
									Tắt Proxy Status (để biểu tượng đám mây màu xám - DNS Only) khi lần đầu kích hoạt SSL.
								</Typography>
							</Box>

							<Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: 1, borderColor: 'divider' }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0284c7' }}>Mắt Bão & PA Việt Nam</Typography>
								<Typography variant="caption" color="text.secondary">
									Vào Quản lý DNS ➔ Thêm bản ghi CNAME cho host 'www' và bản ghi A cho host '@'.
								</Typography>
							</Box>

							<Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: 1, borderColor: 'divider' }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6366f1' }}>GoDaddy & Namecheap</Typography>
								<Typography variant="caption" color="text.secondary">
									Xóa bản ghi CNAME hoặc Forwarding cũ trước khi trỏ bản ghi CNAME mới.
								</Typography>
							</Box>
						</Box>
					</Paper>
				</Box>
			</Box>

			{/* Subdomain Change Dialog */}
			<Dialog
				open={isSubdomainDialogOpen}
				onClose={() => setIsSubdomainDialogOpen(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 800 }}>Đổi Subdomain Hệ Thống</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Nhập định danh subdomain mới cho gian hàng của bạn. Sau khi đổi, các đường link cũ sẽ tự động chuyển hướng sang subdomain mới:
					</Typography>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<TextField
							autoFocus
							value={newSubdomainInput}
							onChange={(e) => setNewSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
							placeholder="ten-gian-hang"
							fullWidth
							variant="outlined"
							size="small"
						/>
						<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', whiteSpace: 'nowrap' }}>
							.ecommerce.vn
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setIsSubdomainDialogOpen(false)} color="inherit">
						Hủy
					</Button>
					<Button
						onClick={handleSaveSubdomain}
						variant="contained"
						color="primary"
						disabled={isUpdatingSubdomain || !newSubdomainInput.trim()}
					>
						{isUpdatingSubdomain ? <CircularProgress size={20} color="inherit" /> : 'Xác Nhận Đổi'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
