import React, { useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useFormContext } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';
import ProductAiCopywriterDialog from '../ProductAiCopywriterDialog';
import { useGetECommerceCategoriesQuery } from '../../ECommerceApi';

const standardCategories = ['Thời trang Nam', 'Thời trang Nữ', 'Phụ kiện', 'Giày dép', 'Đồ gia dụng', 'Thiết bị điện tử'];
const standardTags = ['Chính hãng', 'Hot trend', 'Bán chạy', 'Khuyến mãi', 'Hàng mới về'];

/**
 * The basic info tab with AI Copywriter & Profit Margin Calculator.
 */
function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, watch, setValue } = methods;
	const { errors } = formState;

	const { data: dbCategories = [] } = useGetECommerceCategoriesQuery();

	const [isAiOpen, setIsAiOpen] = useState(false);

	const productName = watch('name') || '';
	const productType = watch('productType') || 'Physical';
	const downloadUrl = watch('downloadUrl') || '';
	const serialKeys: string[] = watch('serialKeys') || [];

	const [isUploadingFile, setIsUploadingFile] = useState(false);
	const [previewPdfOpen, setPreviewPdfOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const keyFileInputRef = useRef<HTMLInputElement>(null);

	const [singleKeyInput, setSingleKeyInput] = useState('');
	const [bulkKeyInput, setBulkKeyInput] = useState('');
	const [feedbackAlert, setFeedbackAlert] = useState<{ text: string; severity: 'success' | 'info' | 'warning' | 'error' } | null>(null);

	const price = Number(watch('price') || 0);
	const compareAtPrice = Number(watch('compareAtPrice') || 0);
	const costPerItem = Number(watch('costPerItem') || 0);

	const profit = price > costPerItem ? price - costPerItem : 0;
	const marginPercent = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

	const handleApplyAi = (data: { description: string; metaTitle: string; metaDescription: string; tags: string[] }) => {
		setValue('description', data.description, { shouldDirty: true });
		setValue('metaTitle', data.metaTitle, { shouldDirty: true });
		setValue('metaDescription', data.metaDescription, { shouldDirty: true });
		const currentTags = watch('tags') || [];
		const mergedTags = Array.from(new Set([...currentTags, ...data.tags]));
		setValue('tags', mergedTags, { shouldDirty: true });
	};

	const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploadingFile(true);
		setFeedbackAlert(null);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const token = localStorage.getItem('jwt_access_token');
			const res = await fetch('/api/files/upload?folder=documents', {
				method: 'POST',
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				body: formData
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.detail || err.title || `Lỗi tải tệp: ${res.status}`);
			}

			const data = await res.json();
			const url = data.url;
			setValue('downloadUrl', url, { shouldDirty: true });
			setValue('fileSizeMb', (file.size / (1024 * 1024)).toFixed(2), { shouldDirty: true });
			setValue('quantity', 9999, { shouldDirty: true });
			setFeedbackAlert({
				text: `Tải tệp tin lên máy chủ thành công: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`,
				severity: 'success'
			});
		} catch (err: any) {
			setFeedbackAlert({
				text: err.message || 'Không thể tải tệp tin lên máy chủ.',
				severity: 'error'
			});
		} finally {
			setIsUploadingFile(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleSamplePdf = () => {
		const sampleUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
		setValue('downloadUrl', sampleUrl, { shouldDirty: true });
		setValue('fileSizeMb', '1.2', { shouldDirty: true });
		setValue('quantity', 9999, { shouldDirty: true });
		setFeedbackAlert({
			text: 'Đã gán liên kết tài liệu PDF mẫu (W3C Sample) thành công!',
			severity: 'info'
		});
	};

	const handleGenerateSampleKeys = (type: 'netflix' | 'spotify' | 'win11') => {
		const rand = Math.floor(1000 + Math.random() * 9000);
		let newKeys: string[] = [];
		if (type === 'netflix') {
			newKeys = [
				`netflix_vip_${rand}_01@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_02@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_03@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_04@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_05@eshop.vn:Pass@2026Netf`
			];
		} else if (type === 'spotify') {
			newKeys = [
				`spotify_prem_${rand}_01@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_02@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_03@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_04@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_05@eshop.vn:Spot2026@Pass`
			];
		} else {
			newKeys = [
				`W11P-${rand}-A4B2-C8D9-X01A`,
				`W11P-${rand}-E5F6-G7H8-X02B`,
				`W11P-${rand}-I9J0-K1L2-X03C`,
				`W11P-${rand}-M3N4-O5P6-X04D`,
				`W11P-${rand}-Q7R8-S9T0-X05E`
			];
		}
		const merged = [...serialKeys, ...newKeys];
		setValue('serialKeys', merged, { shouldDirty: true });
		setValue('quantity', merged.length, { shouldDirty: true });
		setFeedbackAlert({
			text: `Đã nạp nhanh ${newKeys.length} tài khoản/key mẫu! Kho hiện có: ${merged.length} key sẵn sàng.`,
			severity: 'success'
		});
	};

	const handleAddSingleKey = () => {
		const trimmed = singleKeyInput.trim();
		if (!trimmed) return;
		const merged = [...serialKeys, trimmed];
		setValue('serialKeys', merged, { shouldDirty: true });
		setValue('quantity', merged.length, { shouldDirty: true });
		setSingleKeyInput('');
		setFeedbackAlert({ text: 'Đã thêm 1 tài khoản/key vào kho.', severity: 'success' });
	};

	const handleAddBulkKeys = () => {
		const lines = bulkKeyInput
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		if (lines.length === 0) return;
		const merged = [...serialKeys, ...lines];
		setValue('serialKeys', merged, { shouldDirty: true });
		setValue('quantity', merged.length, { shouldDirty: true });
		setBulkKeyInput('');
		setFeedbackAlert({
			text: `Đã nạp ${lines.length} key vào kho! Kho hiện có: ${merged.length} key sẵn sàng.`,
			severity: 'success'
		});
	};

	const handleTextFileKeyImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			if (!content) return;
			const lines = content
				.split(/\r?\n/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			if (lines.length > 0) {
				const merged = [...serialKeys, ...lines];
				setValue('serialKeys', merged, { shouldDirty: true });
				setValue('quantity', merged.length, { shouldDirty: true });
				setFeedbackAlert({
					text: `Đã nhập ${lines.length} key từ file ${file.name}. Tổng: ${merged.length} key.`,
					severity: 'success'
				});
			}
		};
		reader.readAsText(file);
		if (keyFileInputRef.current) keyFileInputRef.current.value = '';
	};

	return (
		<div className="flex flex-col gap-24">
			{/* Product Type Selector */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
						Loại Hình Sản Phẩm (Product Type)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Chọn mô hình kinh doanh phù hợp để hệ thống tự động cấu hình giao diện quản lý biến thể, kho hàng hoặc cấp phát tài liệu số.
					</Typography>
				</Box>

				<Controller
					name="productType"
					control={control}
					defaultValue="Physical"
					render={({ field }) => (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-16">
							{/* Option 1: Physical */}
							<Paper
								variant="outlined"
								onClick={() => {
									field.onChange('Physical');
									if (!watch('quantity') || watch('quantity') === 9999) {
										setValue('quantity', 100, { shouldDirty: true });
									}
								}}
								sx={{
									p: 2.5,
									borderRadius: 2.5,
									cursor: 'pointer',
									borderWidth: field.value === 'Physical' || !field.value ? 2 : 1,
									borderColor: field.value === 'Physical' || !field.value ? 'primary.main' : 'divider',
									bgcolor: field.value === 'Physical' || !field.value ? 'primary.light' : 'background.paper',
									transition: 'all 0.2s ease',
									'&:hover': { borderColor: 'primary.main' }
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Inventory2OutlinedIcon color={field.value === 'Physical' || !field.value ? 'primary' : 'action'} />
										<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
											Hàng Vật Lý
										</Typography>
									</Box>
									<Radio checked={field.value === 'Physical' || !field.value} value="Physical" size="small" />
								</Box>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
									Hàng hóa thông thường cần quản lý kích thước, cân nặng, kho bãi và giao vận (Thời trang, Gia dụng, Điện tử).
								</Typography>
							</Paper>

							{/* Option 2: Digital PDF */}
							<Paper
								variant="outlined"
								onClick={() => {
									field.onChange('Digital');
									setValue('quantity', 9999, { shouldDirty: true });
									setValue('weightInGrams', 0, { shouldDirty: true });
								}}
								sx={{
									p: 2.5,
									borderRadius: 2.5,
									cursor: 'pointer',
									borderWidth: field.value === 'Digital' ? 2 : 1,
									borderColor: field.value === 'Digital' ? 'secondary.main' : 'divider',
									bgcolor: field.value === 'Digital' ? 'secondary.light' : 'background.paper',
									transition: 'all 0.2s ease',
									'&:hover': { borderColor: 'secondary.main' }
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<PictureAsPdfOutlinedIcon color={field.value === 'Digital' ? 'secondary' : 'action'} />
										<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
											Tệp Tin / Tài Liệu PDF
										</Typography>
									</Box>
									<Radio checked={field.value === 'Digital'} value="Digital" size="small" color="secondary" />
								</Box>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
									E-book, tài liệu hướng dẫn, khóa học, phần mềm tải về. Tồn kho vô hạn, khách tải file ngay sau khi thanh toán.
								</Typography>
							</Paper>

							{/* Option 3: Serial Key */}
							<Paper
								variant="outlined"
								onClick={() => {
									field.onChange('SerialKey');
									setValue('quantity', serialKeys.length, { shouldDirty: true });
									setValue('weightInGrams', 0, { shouldDirty: true });
								}}
								sx={{
									p: 2.5,
									borderRadius: 2.5,
									cursor: 'pointer',
									borderWidth: field.value === 'SerialKey' ? 2 : 1,
									borderColor: field.value === 'SerialKey' ? 'warning.main' : 'divider',
									bgcolor: field.value === 'SerialKey' ? 'warning.light' : 'background.paper',
									transition: 'all 0.2s ease',
									'&:hover': { borderColor: 'warning.main' }
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<VpnKeyOutlinedIcon color={field.value === 'SerialKey' ? 'warning' : 'action'} />
										<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
											Tài Khoản & Serial Key
										</Typography>
									</Box>
									<Radio checked={field.value === 'SerialKey'} value="SerialKey" size="small" color="warning" />
								</Box>
								<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
									Kho tài khoản (username:pass) hoặc mã kích hoạt bản quyền. Hệ thống tự động bốc 1 key xuất cho khách theo đơn hàng.
								</Typography>
							</Paper>
						</div>
					)}
				/>
			</Paper>

			{/* Inline Notification Banner */}
			{feedbackAlert && (
				<Alert severity={feedbackAlert.severity} onClose={() => setFeedbackAlert(null)} sx={{ borderRadius: 2.5 }}>
					{feedbackAlert.text}
				</Alert>
			)}

			{/* Dedicated Inline Card: Digital PDF Asset Setup */}
			{productType === 'Digital' && (
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 3,
						borderColor: 'secondary.main',
						bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.05)' : '#faf5ff'
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<Box sx={{ p: 1, borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.main', display: 'flex' }}>
								<PictureAsPdfIcon />
							</Box>
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'secondary.main' }}>
									Thiết Lập Tệp Tin & Tài Liệu PDF (Digital Product Asset)
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Tải trực tiếp tài liệu từ máy tính hoặc dán URL lưu trữ đám mây. Tồn kho tự động thiết lập vô hạn (9,999).
								</Typography>
							</Box>
						</Box>
						<Chip label="Tồn kho: Vô hạn (Auto 9999)" color="secondary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
					</Box>

					<Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
						Khách hàng sau khi thanh toán thành công sẽ nhận được liên kết tải xuống bảo mật gửi về Email và xuất hiện tại trang Lịch sử Đơn hàng.
					</Alert>

					{/* File Upload Controls */}
					<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
						<input
							type="file"
							ref={fileInputRef}
							style={{ display: 'none' }}
							accept=".pdf,.zip,.epub,.docx,.txt"
							onChange={handleDirectFileUpload}
						/>
						<Button
							variant="contained"
							color="secondary"
							startIcon={isUploadingFile ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
							disabled={isUploadingFile}
							onClick={() => fileInputRef.current?.click()}
							sx={{ borderRadius: 2, px: 2.5 }}
						>
							{isUploadingFile ? 'Đang tải tệp tin lên server...' : 'Tải Tệp PDF / ZIP Từ Máy Tính'}
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							startIcon={<PictureAsPdfIcon />}
							onClick={handleSamplePdf}
							sx={{ borderRadius: 2 }}
						>
							Gán Link PDF Mẫu (Test W3C)
						</Button>
						{downloadUrl && (
							<Button
								variant="outlined"
								color="primary"
								startIcon={<VisibilityIcon />}
								onClick={() => setPreviewPdfOpen(true)}
								sx={{ borderRadius: 2 }}
							>
								Xem Trước PDF
							</Button>
						)}
					</Box>

					{/* Download URL Input */}
					<Controller
						name="downloadUrl"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Đường dẫn tệp tin tải về (Download URL)"
								placeholder="https://storage.googleapis.com/.../tai-lieu.pdf hoặc tải trực tiếp từ máy"
								variant="outlined"
								fullWidth
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<AttachFileIcon color={downloadUrl ? 'secondary' : 'action'} />
										</InputAdornment>
									)
								}}
								helperText="Hệ thống hỗ trợ tệp .pdf, .zip, .epub tải lên trực tiếp hoặc URL bên ngoài (Google Drive, AWS S3, Dropbox)."
							/>
						)}
					/>

					{downloadUrl && (
						<Box sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff', borderRadius: 2, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
								<CheckCircleOutlineIcon color="success" />
								<Box sx={{ minWidth: 0 }}>
									<Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
										{downloadUrl}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Đã sẵn sàng cấp phát — Tệp tin sẽ tự động gửi tới khách sau khi đơn hoàn tất.
									</Typography>
								</Box>
							</Box>
							<Chip label="Đã Xác Thực" color="success" size="small" />
						</Box>
					)}
				</Paper>
			)}

			{/* Dedicated Inline Card: Serial Key & Account Pool Setup */}
			{productType === 'SerialKey' && (
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 3,
						borderColor: 'warning.main',
						bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.05)' : '#fffdfa'
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main', display: 'flex' }}>
								<VpnKeyIcon />
							</Box>
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.dark' }}>
									Kho Tài Khoản & Serial Key (Cấp Phát Tự Động)
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Tồn kho tự động đồng bộ theo số lượng key có sẵn trong kho ({serialKeys.length} key hiện tại).
								</Typography>
							</Box>
						</Box>
						<Chip
							label={`Tồn kho: ${serialKeys.length} key có sẵn`}
							color={serialKeys.length > 0 ? 'success' : 'warning'}
							size="small"
							variant="outlined"
							sx={{ fontWeight: 700 }}
						/>
					</Box>

					<Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
						Mỗi đơn hàng thành công, hệ thống tự động bốc 1 key trong kho gửi cho khách và giảm tồn kho tương ứng.
					</Alert>

					{/* 1-Click Sample Generators */}
					<Box sx={{ mb: 2.5, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fef9c3', borderRadius: 2, border: 1, borderColor: 'warning.light' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
							<FlashOnIcon color="warning" fontSize="small" />
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
								Tạo Nhanh Tài Khoản & Key Mẫu (1-Click Generator):
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							<Button
								size="small"
								variant="contained"
								color="warning"
								onClick={() => handleGenerateSampleKeys('netflix')}
								sx={{ borderRadius: 2, textTransform: 'none' }}
							>
								+ 5 Tài Khoản Netflix Premium
							</Button>
							<Button
								size="small"
								variant="contained"
								color="warning"
								onClick={() => handleGenerateSampleKeys('spotify')}
								sx={{ borderRadius: 2, textTransform: 'none' }}
							>
								+ 5 Tài Khoản Spotify Cá Nhân
							</Button>
							<Button
								size="small"
								variant="contained"
								color="warning"
								onClick={() => handleGenerateSampleKeys('win11')}
								sx={{ borderRadius: 2, textTransform: 'none' }}
							>
								+ 5 Key Bản Quyền Win 11 Pro
							</Button>
							<Button
								size="small"
								variant="outlined"
								color="inherit"
								onClick={() => keyFileInputRef.current?.click()}
								sx={{ borderRadius: 2, textTransform: 'none' }}
							>
								📁 Nạp từ File .txt
							</Button>
							<input
								type="file"
								ref={keyFileInputRef}
								style={{ display: 'none' }}
								accept=".txt"
								onChange={handleTextFileKeyImport}
							/>
						</Box>
					</Box>

					{/* Single and Bulk Entry */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
						<Box>
							<Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
								1. Nhập đơn lẻ (username:password hoặc Key):
							</Typography>
							<Box sx={{ display: 'flex', gap: 1 }}>
								<TextField
									size="small"
									fullWidth
									placeholder="user@mail.com:Password123 hoặc KEY-XXXX"
									value={singleKeyInput}
									onChange={(e) => setSingleKeyInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddSingleKey();
										}
									}}
								/>
								<Button
									variant="contained"
									color="warning"
									onClick={handleAddSingleKey}
									disabled={!singleKeyInput.trim()}
									sx={{ minWidth: 90, borderRadius: 2 }}
								>
									Thêm
								</Button>
							</Box>
						</Box>

						<Box>
							<Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
								2. Dán hàng loạt (Mỗi dòng một key):
							</Typography>
							<TextField
								size="small"
								fullWidth
								multiline
								rows={2}
								placeholder="acc1@mail.com:pass1&#10;acc2@mail.com:pass2"
								value={bulkKeyInput}
								onChange={(e) => setBulkKeyInput(e.target.value)}
							/>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
								<Button
									size="small"
									variant="outlined"
									color="warning"
									onClick={handleAddBulkKeys}
									disabled={!bulkKeyInput.trim()}
									sx={{ borderRadius: 1.5 }}
								>
									Nạp Danh Sách
								</Button>
							</Box>
						</Box>
					</Box>

					{/* Key Pool Preview Chips */}
					{serialKeys.length > 0 && (
						<Box sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff', borderRadius: 2, border: 1, borderColor: 'divider' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									Danh Sách Key Sẵn Sàng Cấp ({serialKeys.length} key):
								</Typography>
								<Button
									size="small"
									color="error"
									onClick={() => {
										setValue('serialKeys', [], { shouldDirty: true });
										setValue('quantity', 0, { shouldDirty: true });
									}}
								>
									Xóa Tất Cả Key
								</Button>
							</Box>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{serialKeys.slice(0, 10).map((k: string, i: number) => (
									<Chip
										key={i}
										label={k}
										size="small"
										variant="outlined"
										onDelete={() => {
											const nextKeys = serialKeys.filter((_: any, idx: number) => idx !== i);
											setValue('serialKeys', nextKeys, { shouldDirty: true });
											setValue('quantity', nextKeys.length, { shouldDirty: true });
										}}
										sx={{ fontFamily: 'monospace' }}
									/>
								))}
								{serialKeys.length > 10 && (
									<Chip label={`+${serialKeys.length - 10} key khác...`} size="small" color="primary" variant="outlined" />
								)}
							</Box>
						</Box>
					)}
				</Paper>
			)}

			{/* Product Name & AI Generator */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
						Thông Tin Chung
					</Typography>
					<Button
						variant="outlined"
						color="secondary"
						size="small"
						startIcon={<AutoAwesomeIcon />}
						onClick={() => setIsAiOpen(true)}
						sx={{ borderRadius: 2 }}
					>
						✨ AI Viết Mô Tả & SEO
					</Button>
				</Box>

				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							required
							label="Tên sản phẩm"
							placeholder="Ví dụ: Áo thun Polo nam cotton dệt tổ ong cao cấp"
							autoFocus
							id="name"
							variant="outlined"
							fullWidth
							error={!!errors.name}
							helperText={errors?.name?.message as string}
							sx={{ mb: 3 }}
						/>
					)}
				/>

				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<div>
							<Typography className="mb-8 font-medium" color="text.secondary">
								Mô tả sản phẩm (Chi tiết & Đặc tính)
							</Typography>
							<WYSIWYGEditor {...field} />
						</div>
					)}
				/>
			</Paper>

			{/* Pricing & Profit Margin Calculator */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
					Thiết Lập Giá & Tính Toán Lợi Nhuận
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Kiểm soát giá bán lẻ, giá so sánh kích cầu và tỷ suất lợi nhuận thực tế
				</Typography>

				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
					<Controller
						name="price"
						control={control}
						defaultValue={299000}
						render={({ field }) => (
							<TextField
								{...field}
								type="number"
								label="Giá bán lẻ (₫)"
								variant="outlined"
								fullWidth
								InputProps={{
									startAdornment: <InputAdornment position="start">₫</InputAdornment>
								}}
							/>
						)}
					/>

					<Controller
						name="compareAtPrice"
						control={control}
						defaultValue={450000}
						render={({ field }) => (
							<TextField
								{...field}
								type="number"
								label="Giá gốc niêm yết (₫)"
								helperText="Tạo cảm giác giảm giá tâm lý"
								variant="outlined"
								fullWidth
								InputProps={{
									startAdornment: <InputAdornment position="start">₫</InputAdornment>
								}}
							/>
						)}
					/>

					<Controller
						name="costPerItem"
						control={control}
						defaultValue={140000}
						render={({ field }) => (
							<TextField
								{...field}
								type="number"
								label="Giá vốn sản phẩm (₫)"
								helperText="Khách hàng không nhìn thấy giá này"
								variant="outlined"
								fullWidth
								InputProps={{
									startAdornment: <InputAdornment position="start">₫</InputAdornment>
								}}
							/>
						)}
					/>
				</Box>

				{/* Profit Margin Preview Card */}
				<Box
					sx={{
						p: 2,
						borderRadius: 2,
						bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
						border: 1,
						borderColor: 'emerald.200',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						flexWrap: 'wrap',
						gap: 2
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<TrendingUpIcon className="text-emerald-600" />
						<Box>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'emerald.700' }}>
								Lợi Nhuận Gộp Ước Tính: ₫{profit.toLocaleString('vi-VN')} / sản phẩm
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Tỷ suất lợi nhuận gộp (Profit Margin): <strong>{marginPercent}%</strong>
							</Typography>
						</Box>
					</Box>

					{compareAtPrice > price && (
						<Chip
							label={`Tiết kiệm cho khách: -${(((compareAtPrice - price) / compareAtPrice) * 100).toFixed(0)}%`}
							color="success"
							size="small"
							sx={{ fontWeight: 600 }}
						/>
					)}
				</Box>

				{/* Weight & Stock for Physical Products */}
				{productType === 'Physical' && (
					<Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
							<Controller
								name="weightInGrams"
								control={control}
								defaultValue={500}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label="Trọng lượng đóng gói (gram)"
										helperText="Dùng để tự động tính phí vận chuyển theo biểu phí bưu cục (Mặc định 500g)"
										variant="outlined"
										fullWidth
										InputProps={{
											endAdornment: <InputAdornment position="end">g</InputAdornment>
										}}
									/>
								)}
							/>
							<Controller
								name="quantity"
								control={control}
								defaultValue={100}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label="Số lượng tồn kho ban đầu"
										helperText="Tự động cập nhật vào quản lý kho bãi"
										variant="outlined"
										fullWidth
									/>
								)}
							/>
						</Box>
					</Box>
				)}
			</Paper>

			{/* Categories & Tags */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
					Phân Loại Danh Mục & Thẻ Tìm Kiếm
				</Typography>

				{/* Real Store Category Selector */}
				{dbCategories && dbCategories.length > 0 && (
					<Controller
						name="categoryId"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								fullWidth
								label="Danh mục chính (Cửa hàng)"
								helperText="Chọn danh mục chuẩn trong hệ thống để tự động gom nhóm sản phẩm"
								className="mb-16"
								value={field.value || ''}
								onChange={(e) => {
									const catId = e.target.value;
									field.onChange(catId);
									const matched = dbCategories.find((c: any) => c.id === catId);
									if (matched) {
										setValue('categories', [matched.name], { shouldDirty: true });
									}
								}}
							>
								<MenuItem value="">
									<em>-- Mặc định (Tự động sắp xếp) --</em>
								</MenuItem>
								{dbCategories.map((cat: any) => (
									<MenuItem key={cat.id} value={cat.id}>
										{cat.name}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				)}

				<Controller
					name="tags"
					control={control}
					defaultValue={['Chính hãng', 'Hot trend']}
					render={({ field: { onChange, value } }) => (
						<Autocomplete
							multiple
							freeSolo
							options={standardTags}
							value={value || []}
							onChange={(_, newValue) => onChange(newValue)}
							renderInput={(params) => (
								<TextField
									{...params}
									placeholder="Thêm thẻ tag..."
									label="Thẻ (Tags)"
									variant="outlined"
								/>
							)}
						/>
					)}
				/>
			</Paper>

			{/* Modal Xem Trước PDF */}
			<Dialog
				open={previewPdfOpen}
				onClose={() => setPreviewPdfOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<PictureAsPdfIcon color="error" />
						<Typography variant="h6" sx={{ fontWeight: 700 }}>
							Xem Trước Tài Liệu PDF
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', gap: 1 }}>
						{downloadUrl && (
							<Button
								size="small"
								variant="outlined"
								color="primary"
								onClick={() => window.open(downloadUrl, '_blank')}
								sx={{ borderRadius: 1.5 }}
							>
								Mở Trong Tab Mới ↗
							</Button>
						)}
						<Button size="small" onClick={() => setPreviewPdfOpen(false)}>
							Đóng
						</Button>
					</Box>
				</DialogTitle>
				<DialogContent dividers sx={{ height: 600, p: 0, bgcolor: '#525659' }}>
					{downloadUrl ? (
						<object
							data={downloadUrl}
							type="application/pdf"
							width="100%"
							height="100%"
							style={{ display: 'block', border: 'none' }}
						>
							<iframe
								src={downloadUrl}
								title="PDF Preview"
								width="100%"
								height="100%"
								style={{ border: 'none' }}
							>
								<Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
									<Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
										Xem Tài Liệu PDF
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
										Bấm nút bên dưới để mở hoặc tải tệp tài liệu trong tab mới.
									</Typography>
									<Button
										variant="contained"
										color="primary"
										onClick={() => window.open(downloadUrl, '_blank')}
									>
										Mở trong Tab Mới ↗
									</Button>
								</Box>
							</iframe>
						</object>
					) : (
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.paper' }}>
							<Typography color="text.secondary">Chưa có liên kết tài liệu để xem trước</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button variant="contained" color="primary" onClick={() => window.open(downloadUrl, '_blank')}>
						Mở trong Tab Mới ↗
					</Button>
				</DialogActions>
			</Dialog>

			<ProductAiCopywriterDialog
				open={isAiOpen}
				onClose={() => setIsAiOpen(false)}
				productName={productName}
				onApply={handleApplyAi}
			/>
		</div>
	);
}

export default BasicInfoTab;
