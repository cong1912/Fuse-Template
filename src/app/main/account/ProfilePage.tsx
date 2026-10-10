import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useSnackbar } from 'notistack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LuxuryBankCardManager from './LuxuryBankCardManager';
import { selectUser } from 'src/app/auth/user/store/userSlice';

export default function ProfilePage() {
	const { enqueueSnackbar } = useSnackbar();
	const user = useSelector(selectUser);
	const [activeTab, setActiveTab] = useState(0);

	// Extract user roles and permissions
	const userRoles: string[] = Array.isArray(user?.role)
		? user.role.map((r: string) => r.toLowerCase())
		: typeof user?.role === 'string'
		? [user.role.toLowerCase()]
		: [];

	const isSuperAdmin = userRoles.includes('superadmin');
	const isAdmin = userRoles.includes('admin') || isSuperAdmin;
	const isStaff = userRoles.includes('staff');
	const isCustomer = userRoles.includes('user') || (!isAdmin && !isStaff);

	// Only SuperAdmin or Admin/Owner can manage payout bank cards
	const canManagePayouts = isAdmin;

	// Dynamic tab definition
	const tabs = [
		{
			id: 'profile',
			label: isCustomer ? 'Hồ Sơ Cá Nhân' : 'Hồ Sơ & Gian Hàng',
			icon: <PersonOutlineIcon />
		},
		...(canManagePayouts
			? [
					{
						id: 'payouts',
						label: 'Thẻ Ngân Hàng & Rút Tiền',
						icon: <CreditCardIcon />
					}
			  ]
			: []),
		{
			id: 'security',
			label: 'Bảo Mật & Mật Khẩu',
			icon: <LockOutlinedIcon />
		}
	];

	// Safety clamp for activeTab
	const safeActiveTab = activeTab >= tabs.length ? 0 : activeTab;
	const currentTabId = tabs[safeActiveTab]?.id || 'profile';

	// Personal profile state initialized from current user
	const [displayName, setDisplayName] = useState(user?.data?.displayName || 'Khách Hàng');
	const [email, setEmail] = useState(user?.data?.email || 'customer@ecommerce.vn');
	const [phone, setPhone] = useState('0912 345 678');
	const [shopName, setShopName] = useState('E-Commerce Flagship Store');

	useEffect(() => {
		if (user?.data?.displayName) {
			setDisplayName(user.data.displayName);
		}
		if (user?.data?.email) {
			setEmail(user.data.email);
		}
	}, [user]);

	// Password state
	const [currentPass, setCurrentPass] = useState('');
	const [newPass, setNewPass] = useState('');
	const [confirmPass, setConfirmPass] = useState('');
	const [twoFactor, setTwoFactor] = useState(true);

	const handleSaveProfile = (e: React.FormEvent) => {
		e.preventDefault();
		enqueueSnackbar('Đã cập nhật thông tin hồ sơ thành công!', { variant: 'success' });
	};

	const handleChangePassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPass || newPass !== confirmPass) {
			enqueueSnackbar('Mật khẩu mới và xác nhận mật khẩu không khớp!', { variant: 'error' });
			return;
		}
		setCurrentPass('');
		setNewPass('');
		setConfirmPass('');
		enqueueSnackbar('Đã đổi mật khẩu tài khoản thành công!', { variant: 'success' });
	};

	const renderRoleChip = () => {
		if (isSuperAdmin) {
			return <Chip label="Super Admin (Quản Trị Nền Tảng)" color="primary" size="small" sx={{ fontWeight: 700, height: 22 }} data-testid="user-role-chip" />;
		}
		if (isAdmin) {
			return <Chip label="Chủ Gian Hàng (Owner)" color="success" size="small" sx={{ fontWeight: 700, height: 22 }} data-testid="user-role-chip" />;
		}
		if (isStaff) {
			return <Chip label="Nhân Viên (Staff)" color="warning" size="small" sx={{ fontWeight: 700, height: 22 }} data-testid="user-role-chip" />;
		}
		return <Chip label="Khách Hàng (Customer)" color="info" size="small" sx={{ fontWeight: 700, height: 22 }} data-testid="user-role-chip" />;
	};

	return (
		<div className="p-16 sm:p-24 max-w-5xl mx-auto w-full flex flex-col gap-24">
			{/* Profile Header Card */}
			<Paper
				variant="outlined"
				sx={{
					p: 3,
					borderRadius: 4,
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: 'center',
					gap: 3,
					bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : '#f8fafc',
					border: 1,
					borderColor: 'divider'
				}}
			>
				<Box sx={{ position: 'relative' }}>
					<Avatar
						sx={{
							width: 96,
							height: 96,
							bgcolor: isCustomer ? 'info.main' : 'primary.main',
							fontSize: '2rem',
							fontWeight: 700,
							boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
						}}
					>
						{displayName ? displayName[0] : 'U'}
					</Avatar>
					<Button
						variant="contained"
						size="small"
						color="primary"
						sx={{
							position: 'absolute',
							bottom: -6,
							right: -6,
							minWidth: 32,
							width: 32,
							height: 32,
							borderRadius: '50%',
							p: 0
						}}
						onClick={() => enqueueSnackbar('Chọn ảnh đại diện mới từ thiết bị', { variant: 'info' })}
					>
						<PhotoCameraIcon sx={{ fontSize: 16 }} />
					</Button>
				</Box>

				<Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 0.5 }}>
						<Typography variant="h5" sx={{ fontWeight: 800 }}>
							{displayName}
						</Typography>
						{renderRoleChip()}
					</Box>
					<Typography variant="body2" color="text.secondary">
						{email} • {phone}
					</Typography>
					{!isCustomer && (
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
							Gian hàng: <strong>{shopName}</strong> • Múi giờ: <strong>GMT+7 (Hà Nội, TP. HCM)</strong>
						</Typography>
					)}
				</Box>
			</Paper>

			{/* Navigation Tabs - Filtered by Permissions */}
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={safeActiveTab}
					onChange={(_, val) => setActiveTab(val)}
					indicatorColor="primary"
					textColor="primary"
					data-testid="profile-tabs"
				>
					{tabs.map((tab, idx) => (
						<Tab
							key={tab.id}
							icon={tab.icon}
							iconPosition="start"
							label={tab.label}
							data-testid={`tab-${tab.id}`}
						/>
					))}
				</Tabs>
			</Box>

			{/* Tab 0: Profile Info */}
			{currentTabId === 'profile' && (
				<Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
						{isCustomer ? 'Thông Tin Cá Nhân' : 'Thông Tin Tài Khoản & Gian Hàng'}
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{isCustomer
							? 'Cập nhật thông tin định danh và tài khoản người dùng'
							: 'Cập nhật thông tin định danh người dùng và tên thương hiệu của gian hàng'}
					</Typography>

					<form onSubmit={handleSaveProfile} className="flex flex-col gap-20">
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: isCustomer ? '1fr 1fr' : '1fr 1fr' }, gap: 2.5 }}>
							<TextField
								label="Họ và tên hiển thị"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								fullWidth
								required
								data-testid="input-displayname"
							/>
							<TextField
								label="Địa chỉ Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								fullWidth
								required
								type="email"
								data-testid="input-email"
							/>
							<TextField
								label="Số điện thoại"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								fullWidth
								required
								data-testid="input-phone"
							/>
							{!isCustomer && (
								<TextField
									label="Tên Gian Hàng / Thương Hiệu"
									value={shopName}
									onChange={(e) => setShopName(e.target.value)}
									fullWidth
									required
									data-testid="input-shopname"
								/>
							)}
						</Box>

						<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								startIcon={<CheckCircleOutlineIcon />}
								sx={{ px: 3, py: 1 }}
							>
								Lưu Thay Đổi Hồ Sơ
							</Button>
						</Box>
					</form>
				</Paper>
			)}

			{/* Tab 1: Bank Cards & Payout (Only for users with payout management rights) */}
			{currentTabId === 'payouts' && canManagePayouts && (
				<LuxuryBankCardManager />
			)}

			{/* Tab 2: Security & Password */}
			{currentTabId === 'security' && (
				<Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
						Đổi Mật Khẩu & Bảo Mật 2 Lớp (2FA)
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Đảm bảo tài khoản của bạn luôn được bảo vệ bằng mật khẩu mạnh và xác thực an toàn
					</Typography>

					<form onSubmit={handleChangePassword} className="flex flex-col gap-20 max-w-md">
						<TextField
							label="Mật khẩu hiện tại"
							type="password"
							value={currentPass}
							onChange={(e) => setCurrentPass(e.target.value)}
							fullWidth
							required
						/>
						<TextField
							label="Mật khẩu mới (Tối thiểu 8 ký tự)"
							type="password"
							value={newPass}
							onChange={(e) => setNewPass(e.target.value)}
							fullWidth
							required
						/>
						<TextField
							label="Xác nhận mật khẩu mới"
							type="password"
							value={confirmPass}
							onChange={(e) => setConfirmPass(e.target.value)}
							fullWidth
							required
						/>

						<Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 2, border: 1, borderColor: 'divider' }}>
							<FormControlLabel
								control={
									<Switch
										checked={twoFactor}
										onChange={(e) => setTwoFactor(e.target.checked)}
										color="primary"
									/>
								}
								label={
									<Box>
										<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
											Xác thực hai yếu tố (2FA qua SMS / OTP)
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Bảo vệ gian hàng khỏi các lượt truy cập trái phép
										</Typography>
									</Box>
								}
							/>
						</Box>

						<Button
							type="submit"
							variant="contained"
							color="primary"
							sx={{ py: 1.2, mt: 1 }}
						>
							Cập Nhật Mật Khẩu
						</Button>
					</form>
				</Paper>
			)}
		</div>
	);
}
