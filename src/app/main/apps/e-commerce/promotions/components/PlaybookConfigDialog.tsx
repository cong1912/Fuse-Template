import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PromotionPlaybookDto, useUpdatePlaybookConfigMutation } from '../PromotionsApi';

type PlaybookConfigDialogProps = {
	open: boolean;
	playbook: PromotionPlaybookDto | null;
	onClose: () => void;
};

export default function PlaybookConfigDialog({ open, playbook, onClose }: PlaybookConfigDialogProps) {
	const [updateConfig, { isLoading }] = useUpdatePlaybookConfigMutation();

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [badgeText, setBadgeText] = useState('');
	const [budgetLimit, setBudgetLimit] = useState<string>('');
	const [configJson, setConfigJson] = useState('{}');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (playbook) {
			setName(playbook.name || '');
			setDescription(playbook.description || '');
			setBadgeText(playbook.badgeText || '');
			setBudgetLimit(playbook.budgetLimit ? playbook.budgetLimit.toString() : '');
			try {
				const parsed = JSON.parse(playbook.configurationJson || '{}');
				setConfigJson(JSON.stringify(parsed, null, 2));
			} catch {
				setConfigJson(playbook.configurationJson || '{}');
			}
			setError(null);
		}
	}, [playbook]);

	const handleSave = async () => {
		if (!playbook) return;
		try {
			// Validate JSON
			JSON.parse(configJson);
		} catch (e: any) {
			setError('Cấu hình JSON không hợp lệ: ' + e.message);
			return;
		}

		try {
			await updateConfig({
				id: playbook.id,
				name,
				description,
				badgeText,
				configurationJson: configJson,
				budgetLimit: budgetLimit ? parseFloat(budgetLimit) : null
			}).unwrap();

			onClose();
		} catch (e: any) {
			setError(e?.data?.message || 'Không thể lưu cấu hình kịch bản');
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth data-testid="dialog-playbook-config">
			<DialogTitle className="flex items-center justify-between border-b pb-12">
				<div className="flex items-center gap-8">
					<FuseSvgIcon size={24} className="text-primary-main">
						heroicons-outline:adjustments
					</FuseSvgIcon>
					<Typography variant="h6" className="font-bold">
						Tùy Biến Kịch Bản: {playbook?.code}
					</Typography>
				</div>
				<Button size="small" onClick={onClose} color="inherit" data-testid="dialog-close-btn">
					Đóng
				</Button>
			</DialogTitle>

			<DialogContent className="pt-20 space-y-16">
				{error && (
					<Alert severity="error" onClose={() => setError(null)}>
						{error}
					</Alert>
				)}

				<TextField
					label="Tên kịch bản hiển thị"
					fullWidth
					value={name}
					onChange={(e) => setName(e.target.value)}
					variant="outlined"
					size="small"
					helperText="Tên gợi nhớ cho shop quản lý"
				/>

				<TextField
					label="Mô tả quyền lợi / Quy tắc"
					fullWidth
					multiline
					rows={2}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					variant="outlined"
					size="small"
					helperText="Khách hàng sẽ nhìn thấy tóm tắt này khi mua sắm"
				/>

				<div className="grid grid-cols-2 gap-16">
					<TextField
						label="Nhãn hiệu quả (Badge)"
						fullWidth
						value={badgeText}
						onChange={(e) => setBadgeText(e.target.value)}
						variant="outlined"
						size="small"
						placeholder="VD: Tăng AOV +35%"
					/>

					<TextField
						label="Trần ngân sách bảo vệ (VND)"
						fullWidth
						type="number"
						value={budgetLimit}
						onChange={(e) => setBudgetLimit(e.target.value)}
						variant="outlined"
						size="small"
						helperText="Tự dừng khi chạm trần ngân sách"
						placeholder="Để trống nếu không giới hạn"
					/>
				</div>

				<Box className="mt-8">
					<Typography variant="subtitle2" className="font-semibold mb-6 text-text-secondary">
						Tham số cấu hình chi tiết (JSON Config)
					</Typography>
					<TextField
						fullWidth
						multiline
						rows={6}
						value={configJson}
						onChange={(e) => setConfigJson(e.target.value)}
						variant="outlined"
						size="small"
						sx={{
							fontFamily: 'monospace',
							'& textarea': { fontFamily: 'monospace', fontSize: 13 }
						}}
						helperText="Tùy biến mốc bậc thang, tỷ lệ giảm %, hoặc hạn mức trợ giá vận chuyển"
					/>
				</Box>
			</DialogContent>

			<DialogActions className="border-t p-16">
				<Button onClick={onClose} color="inherit">
					Hủy Bỏ
				</Button>
				<Button
					variant="contained"
					color="primary"
					onClick={handleSave}
					disabled={isLoading}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
				>
					{isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
