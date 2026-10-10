import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCreateCouponMutation } from '../PromotionsApi';

type CreateCouponDialogProps = {
	open: boolean;
	onClose: () => void;
};

export default function CreateCouponDialog({ open, onClose }: CreateCouponDialogProps) {
	const [createCoupon, { isLoading }] = useCreateCouponMutation();

	const [code, setCode] = useState('');
	const [description, setDescription] = useState('');
	const [type, setType] = useState('Percentage');
	const [value, setValue] = useState('10');
	const [maxUses, setMaxUses] = useState('100');
	const [error, setError] = useState<string | null>(null);

	const handleCreate = async () => {
		if (!code.trim()) {
			setError('Vui lòng nhập mã giảm giá.');
			return;
		}

		try {
			const now = new Date();
			const thirtyDaysLater = new Date();
			thirtyDaysLater.setDate(now.getDate() + 30);

			await createCoupon({
				code: code.trim().toUpperCase(),
				description: description.trim(),
				type,
				value: parseFloat(value) || 0,
				maxUses: parseInt(maxUses, 10) || 100,
				validFrom: now.toISOString(),
				validTo: thirtyDaysLater.toISOString()
			}).unwrap();

			setCode('');
			setDescription('');
			setError(null);
			onClose();
		} catch (e: any) {
			setError(e?.data?.message || 'Không thể tạo mã giảm giá.');
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle className="flex items-center justify-between border-b pb-12">
				<div className="flex items-center gap-8">
					<FuseSvgIcon size={24} className="text-secondary-main">
						heroicons-outline:ticket
					</FuseSvgIcon>
					<Typography variant="h6" className="font-bold">
						Tạo Mã Giảm Giá Mới
					</Typography>
				</div>
				<Button size="small" onClick={onClose} color="inherit">
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
					label="Mã Voucher (Code)"
					fullWidth
					value={code}
					onChange={(e) => setCode(e.target.value.toUpperCase())}
					placeholder="VD: SHOPVIP20"
					size="small"
					autoFocus
				/>

				<TextField
					label="Mô tả"
					fullWidth
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Giảm 20% cho khách hàng thân thiết"
					size="small"
				/>

				<div className="grid grid-cols-2 gap-16">
					<TextField
						select
						label="Loại giảm giá"
						fullWidth
						value={type}
						onChange={(e) => setType(e.target.value)}
						size="small"
					>
						<MenuItem value="Percentage">Phần trăm (%)</MenuItem>
						<MenuItem value="FixedAmount">Số tiền cố định (₫)</MenuItem>
						<MenuItem value="FreeShipping">Miễn phí ship</MenuItem>
					</TextField>

					<TextField
						label={type === 'Percentage' ? 'Mức giảm (%)' : 'Số tiền giảm (₫)'}
						fullWidth
						type="number"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						size="small"
					/>
				</div>

				<TextField
					label="Số lượng lượt dùng tối đa"
					fullWidth
					type="number"
					value={maxUses}
					onChange={(e) => setMaxUses(e.target.value)}
					size="small"
					helperText="Hiệu lực 30 ngày kể từ lúc tạo"
				/>
			</DialogContent>

			<DialogActions className="border-t p-16">
				<Button onClick={onClose} color="inherit">
					Hủy Bỏ
				</Button>
				<Button
					variant="contained"
					color="secondary"
					onClick={handleCreate}
					disabled={isLoading}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
				>
					{isLoading ? 'Đang tạo...' : 'Tạo Voucher'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
