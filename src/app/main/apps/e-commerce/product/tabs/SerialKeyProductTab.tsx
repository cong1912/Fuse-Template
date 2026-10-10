import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useGetProductSerialKeysQuery, useAddSerialKeysMutation } from '../../ECommerceApi';

/**
 * Tab quản lý Kho Tài Khoản & Mã Bản Quyền (Serial Key Pool)
 */
function SerialKeyProductTab() {
	const { productId } = useParams();
	const isNew = !productId || productId === 'new';

	const methods = useFormContext();
	const { watch, setValue } = methods;

	// For new product, keys are stored in form state 'serialKeys'
	const formKeys: string[] = watch('serialKeys') || [];

	// For existing product, fetch from backend API
	const { data: dbKeys, isLoading, refetch } = useGetProductSerialKeysQuery(productId as string, {
		skip: isNew
	});

	const [addSerialKeysMutation, { isLoading: isAdding }] = useAddSerialKeysMutation();

	const [singleKeyInput, setSingleKeyInput] = useState('');
	const [bulkKeysInput, setBulkKeysInput] = useState('');
	const [showKeys, setShowKeys] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
	const keyFileInputRef = useRef<HTMLInputElement>(null);

	// Handle generating sample keys
	const handleGenerateSampleKeys = async (type: 'netflix' | 'spotify' | 'win11') => {
		const rand = Math.floor(1000 + Math.random() * 9000);
		let sampleKeys: string[] = [];
		if (type === 'netflix') {
			sampleKeys = [
				`netflix_vip_${rand}_01@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_02@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_03@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_04@eshop.vn:Pass@2026Netf`,
				`netflix_vip_${rand}_05@eshop.vn:Pass@2026Netf`
			];
		} else if (type === 'spotify') {
			sampleKeys = [
				`spotify_prem_${rand}_01@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_02@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_03@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_04@eshop.vn:Spot2026@Pass`,
				`spotify_prem_${rand}_05@eshop.vn:Spot2026@Pass`
			];
		} else {
			sampleKeys = [
				`W11P-${rand}-A4B2-C8D9-X01A`,
				`W11P-${rand}-E5F6-G7H8-X02B`,
				`W11P-${rand}-I9J0-K1L2-X03C`,
				`W11P-${rand}-M3N4-O5P6-X04D`,
				`W11P-${rand}-Q7R8-S9T0-X05E`
			];
		}

		if (isNew) {
			const updated = [...formKeys, ...sampleKeys];
			setValue('serialKeys', updated, { shouldDirty: true });
			setValue('quantity', updated.length, { shouldDirty: true });
			setFeedbackMsg({ text: `Đã nạp nhanh ${sampleKeys.length} tài khoản/key mẫu! Tổng kho: ${updated.length} key.`, type: 'success' });
		} else {
			try {
				await addSerialKeysMutation({ productId: productId as string, keys: sampleKeys }).unwrap();
				refetch();
				setFeedbackMsg({ text: `Đã nạp nhanh ${sampleKeys.length} tài khoản/key mẫu vào kho thành công!`, type: 'success' });
			} catch (err: any) {
				setFeedbackMsg({ text: 'Không thể nạp key. Vui lòng thử lại.', type: 'error' });
			}
		}
	};

	// Handle importing keys from .txt file
	const handleTextFileKeyImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (event) => {
			const content = event.target?.result as string;
			if (!content) return;
			const lines = content
				.split(/\r?\n/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0);

			if (lines.length === 0) return;

			if (isNew) {
				const updated = [...formKeys, ...lines];
				setValue('serialKeys', updated, { shouldDirty: true });
				setValue('quantity', updated.length, { shouldDirty: true });
				setFeedbackMsg({ text: `Đã nạp ${lines.length} key từ tệp ${file.name}. Tổng kho: ${updated.length} key.`, type: 'success' });
			} else {
				try {
					await addSerialKeysMutation({ productId: productId as string, keys: lines }).unwrap();
					refetch();
					setFeedbackMsg({ text: `Đã nạp ${lines.length} key từ tệp ${file.name} vào kho thành công!`, type: 'success' });
				} catch (err: any) {
					setFeedbackMsg({ text: 'Không thể nạp danh sách key từ file.', type: 'error' });
				}
			}
		};
		reader.readAsText(file);
		if (keyFileInputRef.current) keyFileInputRef.current.value = '';
	};

	// Handle adding a single key
	const handleAddSingleKey = async () => {
		const val = singleKeyInput.trim();
		if (!val) return;

		if (isNew) {
			const updated = [...formKeys, val];
			setValue('serialKeys', updated, { shouldDirty: true });
			setValue('quantity', updated.length, { shouldDirty: true });
			setSingleKeyInput('');
			setFeedbackMsg({ text: 'Đã thêm 1 tài khoản/key vào danh sách khởi tạo.', type: 'success' });
		} else {
			try {
				await addSerialKeysMutation({ productId: productId as string, keys: [val] }).unwrap();
				setSingleKeyInput('');
				refetch();
				setFeedbackMsg({ text: 'Đã nạp 1 tài khoản/key vào kho thành công!', type: 'success' });
			} catch (err: any) {
				setFeedbackMsg({ text: 'Không thể nạp key. Vui lòng thử lại.', type: 'error' });
			}
		}
	};

	// Handle bulk paste keys (split by newlines)
	const handleAddBulkKeys = async () => {
		const lines = bulkKeysInput
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		if (lines.length === 0) return;

		if (isNew) {
			const updated = [...formKeys, ...lines];
			setValue('serialKeys', updated, { shouldDirty: true });
			setValue('quantity', updated.length, { shouldDirty: true });
			setBulkKeysInput('');
			setFeedbackMsg({ text: `Đã nạp hàng loạt ${lines.length} tài khoản/key vào danh sách khởi tạo.`, type: 'success' });
		} else {
			try {
				await addSerialKeysMutation({ productId: productId as string, keys: lines }).unwrap();
				setBulkKeysInput('');
				refetch();
				setFeedbackMsg({ text: `Đã nạp hàng loạt ${lines.length} tài khoản/key vào kho thành công!`, type: 'success' });
			} catch (err: any) {
				setFeedbackMsg({ text: 'Không thể nạp danh sách key. Vui lòng thử lại.', type: 'error' });
			}
		}
	};

	// Statistics
	const totalCount = isNew ? formKeys.length : (dbKeys?.length || 0);
	const usedCount = isNew ? 0 : (dbKeys?.filter((k) => k.isUsed).length || 0);
	const availableCount = isNew ? formKeys.length : (dbKeys?.filter((k) => !k.isUsed).length || 0);

	return (
		<div className="flex flex-col gap-24">
			{/* Alert Hướng dẫn */}
			<Alert severity="info" icon={<VpnKeyIcon fontSize="inherit" />} sx={{ borderRadius: 3 }}>
				<strong>Mô hình Kho Tài Khoản / Serial Key (Automated Delivery Pool):</strong> Mỗi dòng đại diện cho một thông tin tài khoản (ví dụ: <code>username:password</code> hoặc <code>netflix_user@gmail.com:Pass999</code>) hoặc mã bản quyền (<code>WIN11-PRO-XXXX</code>). Khi khách hàng thanh toán thành công, hệ thống tự động bốc 1 key còn trống và chuyển trạng thái sang <strong>Đã cấp</strong>.
			</Alert>

			{feedbackMsg && (
				<Alert severity={feedbackMsg.type} onClose={() => setFeedbackMsg(null)} sx={{ borderRadius: 2 }}>
					{feedbackMsg.text}
				</Alert>
			)}

			{/* Thống kê tồn kho Key */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
						<VpnKeyIcon />
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
							TỔNG SỐ KEY NẠP
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{totalCount}
						</Typography>
					</Box>
				</Paper>

				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.main', display: 'flex' }}>
						<CheckCircleIcon />
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
							CÒN SẴN (SẴN SÀNG CẤP)
						</Typography>
						<Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
							{availableCount}
						</Typography>
					</Box>
				</Paper>

				<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main', display: 'flex' }}>
						<RemoveCircleIcon />
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
							ĐÃ XUẤT CHO ĐƠN HÀNG
						</Typography>
						<Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
							{usedCount}
						</Typography>
					</Box>
				</Paper>
			</div>

			{/* Khu vực nạp tài khoản / key */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
					Nạp Thêm Tài Khoản / Serial Key Vào Kho
				</Typography>

				{/* 1-Click Sample Generators */}
				<Box sx={{ mb: 3, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fef9c3', borderRadius: 2, border: 1, borderColor: 'warning.light' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
						<FlashOnIcon color="warning" fontSize="small" />
						<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
							Tạo Nhanh Tài Khoản Mẫu (1-Click Generator):
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
						<Button
							size="small"
							variant="contained"
							color="warning"
							disabled={isAdding}
							onClick={() => handleGenerateSampleKeys('netflix')}
							sx={{ borderRadius: 2, textTransform: 'none' }}
						>
							+ 5 Tài Khoản Netflix Premium
						</Button>
						<Button
							size="small"
							variant="contained"
							color="warning"
							disabled={isAdding}
							onClick={() => handleGenerateSampleKeys('spotify')}
							sx={{ borderRadius: 2, textTransform: 'none' }}
						>
							+ 5 Tài Khoản Spotify Cá Nhân
						</Button>
						<Button
							size="small"
							variant="contained"
							color="warning"
							disabled={isAdding}
							onClick={() => handleGenerateSampleKeys('win11')}
							sx={{ borderRadius: 2, textTransform: 'none' }}
						>
							+ 5 Key Bản Quyền Win 11 Pro
						</Button>
						<Button
							size="small"
							variant="outlined"
							color="inherit"
							disabled={isAdding}
							onClick={() => keyFileInputRef.current?.click()}
							sx={{ borderRadius: 2, textTransform: 'none' }}
						>
							📁 Nạp từ File Text (.txt)
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-24">
					{/* Nhập đơn lẻ */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>
							1. Nhập Đơn Lẻ (Từng tài khoản / Key)
						</Typography>
						<Box sx={{ display: 'flex', gap: 1 }}>
							<TextField
								size="small"
								fullWidth
								placeholder="Ví dụ: netflix_pro@mail.com:Password@123"
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
								color="primary"
								onClick={handleAddSingleKey}
								disabled={!singleKeyInput.trim() || isAdding}
								startIcon={isAdding ? <CircularProgress size={16} /> : <PlaylistAddIcon />}
								sx={{ minWidth: 120, borderRadius: 2 }}
							>
								Thêm Key
							</Button>
						</Box>
					</Box>

					{/* Dán hàng loạt (Bulk paste) */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>
							2. Dán Hàng Loạt (Bulk Import - Mỗi dòng một Key)
						</Typography>
						<TextField
							size="small"
							fullWidth
							multiline
							rows={3}
							placeholder="KEY-2026-AAAA-BBBB&#10;KEY-2026-CCCC-DDDD&#10;user1@mail.com:Pass1"
							value={bulkKeysInput}
							onChange={(e) => setBulkKeysInput(e.target.value)}
						/>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								variant="outlined"
								color="secondary"
								size="small"
								onClick={handleAddBulkKeys}
								disabled={!bulkKeysInput.trim() || isAdding}
								startIcon={isAdding ? <CircularProgress size={16} /> : <PlaylistAddIcon />}
								sx={{ borderRadius: 2 }}
							>
								Nạp Hàng Loạt
							</Button>
						</Box>
					</Box>
				</div>
			</Paper>

			{/* Bảng danh sách Keys trong kho */}
			<Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
				<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<VpnKeyIcon fontSize="small" color="action" />
						<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
							Danh Sách Tài Khoản / Key Trong Kho ({totalCount})
						</Typography>
					</Box>
					<Button
						size="small"
						startIcon={showKeys ? <VisibilityOffIcon /> : <VisibilityIcon />}
						onClick={() => setShowKeys(!showKeys)}
					>
						{showKeys ? 'Ẩn Mã Bản Quyền' : 'Hiển Thị Mã Đầy Đủ'}
					</Button>
				</Box>

				{isLoading ? (
					<Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
						<CircularProgress size={30} />
					</Box>
				) : totalCount === 0 ? (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<Typography color="text.secondary" variant="body2">
							Chưa có mã key hoặc tài khoản nào trong kho. Hãy nhập thêm ở mục phía trên.
						</Typography>
					</Box>
				) : (
					<Table size="small">
						<TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ width: 60, fontWeight: 700 }}>#</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Mã Key / Thông Tin Tài Khoản</TableCell>
								<TableCell sx={{ width: 150, fontWeight: 700 }}>Trạng Thái</TableCell>
								<TableCell sx={{ width: 180, fontWeight: 700 }}>Mã Đơn Hàng Cấp</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{isNew
								? formKeys.map((k, idx) => (
										<TableRow key={idx} hover>
											<TableCell>{idx + 1}</TableCell>
											<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
												{showKeys ? k : `${k.substring(0, Math.min(6, k.length))}••••••••`}
											</TableCell>
											<TableCell>
												<Chip size="small" label="🟢 Sẵn sàng cấp" color="success" variant="outlined" />
											</TableCell>
											<TableCell sx={{ color: 'text.secondary' }}>Chờ đặt hàng</TableCell>
										</TableRow>
								  ))
								: (dbKeys || []).map((k, idx) => (
										<TableRow key={k.id} hover>
											<TableCell>{idx + 1}</TableCell>
											<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
												{showKeys ? k.keyString : `${k.keyString.substring(0, Math.min(6, k.keyString.length))}••••••••`}
											</TableCell>
											<TableCell>
												{k.isUsed ? (
													<Chip size="small" label="🔴 Đã xuất đơn" color="warning" />
												) : (
													<Chip size="small" label="🟢 Sẵn sàng cấp" color="success" variant="outlined" />
												)}
											</TableCell>
											<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
												{k.usedByOrderId ? k.usedByOrderId.substring(0, 8).toUpperCase() : '—'}
											</TableCell>
										</TableRow>
								  ))}
						</TableBody>
					</Table>
				)}
			</Paper>
		</div>
	);
}

export default SerialKeyProductTab;
