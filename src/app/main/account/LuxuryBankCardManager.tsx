import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'notistack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactlessIcon from '@mui/icons-material/Contactless';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const vietnamBanks = [
	{ code: 'VCB', name: 'Vietcombank - Ngân hàng Ngoại thương Việt Nam' },
	{ code: 'MB', name: 'MBBank - Ngân hàng Quân Đội' },
	{ code: 'TCB', name: 'Techcombank - Ngân hàng Kỹ Thương Việt Nam' },
	{ code: 'ACB', name: 'ACB - Ngân hàng Á Châu' },
	{ code: 'VPB', name: 'VPBank - Ngân hàng Việt Nam Thịnh Vượng' },
	{ code: 'BIDV', name: 'BIDV - Ngân hàng Đầu tư và Phát triển Việt Nam' },
	{ code: 'TPB', name: 'TPBank - Ngân hàng Tiên Phong' }
];

interface BankAccount {
	id: string;
	bankCode: string;
	bankName: string;
	accountNumber: string;
	accountHolder: string;
	branch: string;
	isDefault: boolean;
	cardTheme: 'obsidian' | 'emerald' | 'navy';
}

export default function LuxuryBankCardManager() {
	const { enqueueSnackbar } = useSnackbar();
	const [accounts, setAccounts] = useState<BankAccount[]>([
		{
			id: 'bank-1',
			bankCode: 'VCB',
			bankName: 'Vietcombank',
			accountNumber: '9704 3600 1289 8899',
			accountHolder: 'NGUYEN MINH TU',
			branch: 'Chi nhánh Sở Giao Dịch TP. HCM',
			isDefault: true,
			cardTheme: 'obsidian'
		},
		{
			id: 'bank-2',
			bankCode: 'MB',
			bankName: 'MBBank',
			accountNumber: '8888 9999 6666 1122',
			accountHolder: 'NGUYEN MINH TU',
			branch: 'Chi nhánh Quận 1',
			isDefault: false,
			cardTheme: 'navy'
		}
	]);

	const [isAddOpen, setIsAddOpen] = useState(false);
	const [newBankCode, setNewBankCode] = useState('TCB');
	const [newAccountNumber, setNewAccountNumber] = useState('');
	const [newAccountHolder, setNewAccountHolder] = useState('NGUYEN MINH TU');
	const [newBranch, setNewBranch] = useState('Chi nhánh Sài Gòn');
	const [isDefaultAccount, setIsDefaultAccount] = useState(false);

	const handleAddAccount = () => {
		if (!newAccountNumber.trim()) {
			enqueueSnackbar('Vui lòng nhập số tài khoản ngân hàng', { variant: 'error' });
			return;
		}

		const bankObj = vietnamBanks.find(b => b.code === newBankCode);
		const newAcc: BankAccount = {
			id: `bank-${Date.now()}`,
			bankCode: newBankCode,
			bankName: bankObj ? bankObj.name.split(' - ')[0] : 'Techcombank',
			accountNumber: newAccountNumber.replace(/(\d{4})(?=\d)/g, '$1 '),
			accountHolder: newAccountHolder.toUpperCase(),
			branch: newBranch,
			isDefault: isDefaultAccount || accounts.length === 0,
			cardTheme: accounts.length % 2 === 0 ? 'emerald' : 'navy'
		};

		if (newAcc.isDefault) {
			setAccounts(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAcc));
		} else {
			setAccounts(prev => [...prev, newAcc]);
		}

		setIsAddOpen(false);
		setNewAccountNumber('');
		enqueueSnackbar('Thêm tài khoản ngân hàng nhận tiền thành công!', { variant: 'success' });
	};

	const handleSetDefault = (id: string) => {
		setAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
		enqueueSnackbar('Đã đổi tài khoản nhận tiền mặc định thành công!', { variant: 'info' });
	};

	const handleDelete = (id: string) => {
		setAccounts(prev => prev.filter(a => a.id !== id));
		enqueueSnackbar('Đã xóa tài khoản ngân hàng.', { variant: 'default' });
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Tài Khoản Ngân Hàng & Thẻ Nhận Tiền Doanh Thu (Payout Accounts)
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Tiền bán hàng sau khi đơn hoàn tất sẽ được tự động quyết toán vào tài khoản chính của bạn
					</Typography>
				</Box>
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddCircleOutlineIcon />}
					onClick={() => setIsAddOpen(true)}
				>
					Thêm Tài Khoản Ngân Hàng
				</Button>
			</Box>

			{/* Cards Grid */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
				{accounts.map((acc) => (
					<Box
						key={acc.id}
						sx={{
							borderRadius: 4,
							p: 3,
							color: '#ffffff',
							position: 'relative',
							overflow: 'hidden',
							boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
							background: acc.cardTheme === 'obsidian'
								? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
								: acc.cardTheme === 'navy'
								? 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 50%, #0284c7 100%)'
								: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
							border: '1px solid rgba(255, 255, 255, 0.15)',
							minHeight: 220,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between'
						}}
					>
						{/* Card Header */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<AccountBalanceIcon sx={{ fontSize: 28, color: '#f8fafc' }} />
								<Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
									{acc.bankName}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<ContactlessIcon sx={{ fontSize: 24, opacity: 0.8 }} />
								{acc.isDefault ? (
									<Chip
										label="Tài Khoản Chính"
										size="small"
										sx={{ bgcolor: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontWeight: 700, border: '1px solid #10b981' }}
										icon={<CheckCircleIcon sx={{ color: '#6ee7b7 !important', fontSize: '14px !important' }} />}
									/>
								) : (
									<Button
										size="small"
										sx={{ color: '#cbd5e1', fontSize: '0.7rem', textTransform: 'none' }}
										onClick={() => handleSetDefault(acc.id)}
									>
										Đặt làm chính
									</Button>
								)}
							</Box>
						</Box>

						{/* EMV Chip & Number */}
						<Box sx={{ my: 2 }}>
							{/* Realistic Gold Chip */}
							<Box
								sx={{
									width: 44,
									height: 32,
									borderRadius: 1,
									background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
									border: '1px solid #b45309',
									mb: 2,
									position: 'relative',
									boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
								}}
							/>
							<Typography
								variant="h5"
								sx={{
									fontFamily: 'monospace',
									letterSpacing: 3,
									fontWeight: 700,
									textShadow: '0 2px 4px rgba(0,0,0,0.5)',
									fontSize: { xs: '1.1rem', sm: '1.25rem' }
								}}
							>
								{acc.accountNumber}
							</Typography>
						</Box>

						{/* Card Footer */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
							<Box>
								<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>
									Chủ tài khoản
								</Typography>
								<Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: 1 }}>
									{acc.accountHolder}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
									{acc.branch}
								</Typography>
								{!acc.isDefault && (
									<IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)' }} onClick={() => handleDelete(acc.id)}>
										<DeleteOutlineIcon fontSize="small" />
									</IconButton>
								)}
							</Box>
						</Box>
					</Box>
				))}
			</Box>

			{/* Add Account Modal */}
			<Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
					<AccountBalanceIcon color="primary" />
					Thêm Tài Khoản Ngân Hàng Nhận Doanh Thu
				</DialogTitle>
				<DialogContent dividers>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
						<TextField
							select
							label="Ngân hàng thụ hưởng"
							fullWidth
							value={newBankCode}
							onChange={(e) => setNewBankCode(e.target.value)}
						>
							{vietnamBanks.map((b) => (
								<MenuItem key={b.code} value={b.code}>
									{b.name}
								</MenuItem>
							))}
						</TextField>

						<TextField
							label="Số tài khoản ngân hàng"
							placeholder="Ví dụ: 1903658899201"
							fullWidth
							value={newAccountNumber}
							onChange={(e) => setNewAccountNumber(e.target.value)}
						/>

						<TextField
							label="Tên chủ tài khoản (Viết hoa không dấu)"
							placeholder="Ví dụ: NGUYEN MINH TU"
							fullWidth
							value={newAccountHolder}
							onChange={(e) => setNewAccountHolder(e.target.value.toUpperCase())}
						/>

						<TextField
							label="Chi nhánh ngân hàng"
							placeholder="Ví dụ: Chi nhánh TP. Hồ Chí Minh"
							fullWidth
							value={newBranch}
							onChange={(e) => setNewBranch(e.target.value)}
						/>

						<FormControlLabel
							control={
								<Switch
									checked={isDefaultAccount}
									onChange={(e) => setIsDefaultAccount(e.target.checked)}
									color="primary"
								/>
							}
							label="Đặt làm tài khoản quyết toán doanh thu mặc định"
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setIsAddOpen(false)} color="inherit">
						Hủy bỏ
					</Button>
					<Button onClick={handleAddAccount} variant="contained" color="primary">
						Xác Thực & Thêm Tài Khoản
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
