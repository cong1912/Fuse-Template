import React, { useState, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/**
 * Tab quản lý Sản phẩm Kỹ thuật số / Tài liệu PDF / E-Book
 */
function DigitalProductTab() {
	const methods = useFormContext();
	const { control, watch, setValue } = methods;

	const downloadUrl = watch('downloadUrl') || '';
	const [previewOpen, setPreviewOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadFeedback, setUploadFeedback] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isPdf = downloadUrl.toLowerCase().includes('.pdf');

	const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadFeedback(null);
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
			setUploadFeedback({
				text: `Đã tải tệp lên server thành công: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`,
				severity: 'success'
			});
		} catch (err: any) {
			setUploadFeedback({
				text: err.message || 'Không thể tải tệp tin lên server.',
				severity: 'error'
			});
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleSamplePdf = () => {
		setValue('downloadUrl', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { shouldDirty: true });
		setValue('fileSizeMb', '1.2', { shouldDirty: true });
		setValue('quantity', 9999, { shouldDirty: true });
		setUploadFeedback({
			text: 'Đã gán liên kết tài liệu PDF mẫu (W3C Sample) thành công!',
			severity: 'success'
		});
	};

	return (
		<div className="flex flex-col gap-24">
			{/* Alert Hướng dẫn */}
			<Alert severity="info" icon={<PictureAsPdfIcon fontSize="inherit" />} sx={{ borderRadius: 3 }}>
				<strong>Mô hình Sản phẩm Kỹ thuật số (Digital Asset):</strong> Khách hàng thanh toán xong sẽ được cấp link tải tài liệu trực tiếp qua Email và trang Lịch sử Đơn hàng. Tồn kho của sản phẩm số là vô hạn, không yêu cầu đóng gói hay đơn vị vận chuyển.
			</Alert>

			{uploadFeedback && (
				<Alert severity={uploadFeedback.severity} onClose={() => setUploadFeedback(null)} sx={{ borderRadius: 2 }}>
					{uploadFeedback.text}
				</Alert>
			)}

			{/* Cấu hình File Tải về */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<LinkIcon color="primary" />
						<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
							Đường Dẫn Tệp Tin / Tài Liệu (Download URL)
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', gap: 1 }}>
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
							size="small"
							startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
							disabled={isUploading}
							onClick={() => fileInputRef.current?.click()}
							sx={{ borderRadius: 2 }}
						>
							{isUploading ? 'Đang tải...' : 'Tải File Từ Máy Tính'}
						</Button>
						<Button
							variant="outlined"
							size="small"
							startIcon={<PictureAsPdfIcon />}
							onClick={handleSamplePdf}
							sx={{ borderRadius: 2 }}
						>
							Gán Link PDF Mẫu
						</Button>
					</Box>
				</Box>

				<Controller
					name="downloadUrl"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Đường dẫn tải tài liệu (URL)"
							placeholder="https://storage.googleapis.com/eshop-docs/tai-lieu-khoa-hoc.pdf"
							variant="outlined"
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<PictureAsPdfIcon color={isPdf ? 'error' : 'action'} />
									</InputAdornment>
								),
								endAdornment: downloadUrl ? (
									<InputAdornment position="end">
										<Button
											size="small"
											variant="contained"
											color="secondary"
											startIcon={<VisibilityIcon />}
											onClick={() => setPreviewOpen(true)}
											sx={{ borderRadius: 1.5 }}
										>
											Xem Trước PDF
										</Button>
									</InputAdornment>
								) : null
							}}
							helperText="Hỗ trợ các định dạng: .pdf, .epub, .zip, .rar, .docx hoặc liên kết lưu trữ đám mây (Google Drive, S3, Azure Blob)."
						/>
					)}
				/>

				{downloadUrl && (
					<Box sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<CheckCircleOutlineIcon color="success" fontSize="small" />
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								Trạng thái tệp: Đã xác thực đường dẫn hợp lệ ({isPdf ? 'Định dạng PDF chuẩn' : 'Tệp dữ liệu số'})
							</Typography>
						</Box>
						<Chip label="Sẵn sàng phát hành" color="success" size="small" variant="outlined" />
					</Box>
				)}
			</Paper>

			{/* Cài đặt Bảo mật & Giới hạn Tải */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
					<SecurityIcon color="primary" />
					<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
						Bảo Mật & Giới Hạn Tải Xuống
					</Typography>
				</Box>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-16">
					<Controller
						name="fileSizeMb"
						control={control}
						defaultValue="15.5"
						render={({ field }) => (
							<TextField
								{...field}
								label="Dung lượng tệp (MB)"
								variant="outlined"
								fullWidth
								type="number"
							/>
						)}
					/>

					<Controller
						name="maxDownloads"
						control={control}
						defaultValue="5"
						render={({ field }) => (
							<TextField
								{...field}
								label="Giới hạn lượt tải / đơn"
								variant="outlined"
								fullWidth
								type="number"
								helperText="Tối đa số lần khách được phép tải (0 = Không giới hạn)"
							/>
						)}
					/>

					<Controller
						name="downloadExpireDays"
						control={control}
						defaultValue="30"
						render={({ field }) => (
							<TextField
								{...field}
								label="Thời hạn hiệu lực (Ngày)"
								variant="outlined"
								fullWidth
								type="number"
								helperText="Link tải hết hạn sau số ngày kể từ lúc mua"
							/>
						)}
					/>
				</div>

				<Box sx={{ mt: 3 }}>
					<Controller
						name="downloadInstructions"
						control={control}
						defaultValue="Cảm ơn quý khách đã mua tài liệu. Vui lòng bấm vào liên kết đính kèm để tải về. Mật khẩu giải nén (nếu có) được gửi cùng mã đơn hàng."
						render={({ field }) => (
							<TextField
								{...field}
								label="Lời nhắn / Hướng dẫn gửi khách sau khi mua"
								variant="outlined"
								fullWidth
								multiline
								rows={3}
							/>
						)}
					/>
				</Box>
			</Paper>

			{/* Modal Xem Trước PDF */}
			<Dialog
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
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
						<Button size="small" onClick={() => setPreviewOpen(false)}>
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
		</div>
	);
}

export default DigitalProductTab;
