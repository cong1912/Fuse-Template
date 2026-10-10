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
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import {
	useGetPlatformUsersQuery,
	useUpdatePlatformUserStatusMutation,
	PlatformUserDto
} from '../AdminTenantsApi';

function UsersPage() {
	const { data: rawUsers = [], isLoading, error } = useGetPlatformUsersQuery();
	const users: PlatformUserDto[] = Array.isArray(rawUsers)
		? rawUsers
		: ((rawUsers as any)?.items || []);
	const [updateUserStatus] = useUpdatePlatformUserStatusMutation();
	const [searchTerm, setSearchTerm] = useState('');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const handleToggleStatus = async (user: PlatformUserDto) => {
		const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
		try {
			await updateUserStatus({ userId: user.id, status: newStatus }).unwrap();
			setSnackbarMessage(`Đã cập nhật trạng thái người dùng ${user.email} thành ${newStatus}`);
		} catch (err) {
			console.error('Failed to update user status', err);
			setSnackbarMessage('Có lỗi xảy ra khi cập nhật trạng thái');
		}
	};

	const filteredUsers = users.filter(
		(u) =>
			u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getRoleChip = (role: string) => {
		switch (role) {
			case 'SuperAdmin':
				return <Chip label="Super Admin" size="small" color="error" className="font-bold" />;
			case 'TenantOwner':
				return <Chip label="Chủ Cửa Hàng" size="small" color="primary" variant="filled" />;
			case 'StoreManager':
				return <Chip label="Quản Lý Shop" size="small" color="secondary" variant="outlined" />;
			default:
				return <Chip label={role} size="small" variant="outlined" />;
		}
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-primary">heroicons-outline:user-group</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Quản Lý Người Dùng Toàn Nền Tảng (Global Platform Users)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Danh sách tài khoản quản trị viên, chủ cửa hàng và nhân sự trên toàn bộ hệ sinh thái đa người thuê (Multi-Tenant)
						</Typography>
					</div>
					<TextField
						placeholder="Tìm kiếm người dùng, email, shop..."
						size="small"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={20}>heroicons-outline:search</FuseSvgIcon>
								</InputAdornment>
							)
						}}
						className="w-full sm:w-280"
					/>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full">
					{isLoading && (
						<div className="flex justify-center p-48">
							<CircularProgress />
						</div>
					)}

					{error && (
						<Alert severity="error" className="mb-24">
							Không thể tải danh sách người dùng nền tảng.
						</Alert>
					)}

					{!isLoading && !error && (
						<Paper className="rounded-2xl border border-divider overflow-hidden">
							<Table>
								<TableHead className="bg-background-default">
									<TableRow>
										<TableCell className="font-bold">Người Dùng</TableCell>
										<TableCell className="font-bold">Cửa Hàng Trực Thuộc</TableCell>
										<TableCell className="font-bold">Vai Trò Quyền Hạn</TableCell>
										<TableCell className="font-bold">Ngày Khởi Tạo</TableCell>
										<TableCell className="font-bold">Trạng Thái Hoạt Động</TableCell>
										<TableCell className="font-bold text-right">Khóa / Mở Khóa</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredUsers.map((user) => (
										<TableRow key={user.id} hover>
											<TableCell>
												<div className="flex items-center space-x-12">
													<Avatar className="bg-primary text-white font-bold text-14">
														{user.fullName.charAt(0)}
													</Avatar>
													<div>
														<Typography variant="subtitle2" className="font-bold">
															{user.fullName}
														</Typography>
														<Typography variant="caption" className="text-text-secondary">
															{user.email}
														</Typography>
													</div>
												</div>
											</TableCell>
											<TableCell className="font-medium text-text-primary">
												{user.tenantName}
											</TableCell>
											<TableCell>
												{getRoleChip(user.role)}
											</TableCell>
											<TableCell className="text-13 text-text-secondary">
												{new Date(user.createdAtUtc).toLocaleDateString('vi-VN')}
											</TableCell>
											<TableCell>
												{user.status === 'Active' ? (
													<Chip label="Hoạt Động" size="small" color="success" />
												) : (
													<Chip label="Đang Khóa" size="small" color="default" />
												)}
											</TableCell>
											<TableCell className="text-right">
												<Switch
													checked={user.status === 'Active'}
													onChange={() => handleToggleStatus(user)}
													color="primary"
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Paper>
					)}

					<Snackbar
						open={Boolean(snackbarMessage)}
						autoHideDuration={4000}
						onClose={() => setSnackbarMessage(null)}
						message={snackbarMessage}
					/>
				</div>
			}
		/>
	);
}

export default UsersPage;
