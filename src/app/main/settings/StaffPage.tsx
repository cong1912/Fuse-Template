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
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Snackbar from '@mui/material/Snackbar';

interface StaffMember {
	id: string;
	fullName: string;
	email: string;
	role: 'Admin' | 'StoreManager' | 'Cashier' | 'InventoryClerk';
	status: 'Active' | 'Inactive';
	lastActive: string;
}

const INITIAL_STAFF: StaffMember[] = [
	{
		id: '1',
		fullName: 'Nguyễn Văn Quản Trị',
		email: 'admin.store@ecommerce.vn',
		role: 'Admin',
		status: 'Active',
		lastActive: '10 phút trước'
	},
	{
		id: '2',
		fullName: 'Trần Thị Thu Ngân',
		email: 'pos.cashier@ecommerce.vn',
		role: 'Cashier',
		status: 'Active',
		lastActive: '1 giờ trước'
	},
	{
		id: '3',
		fullName: 'Lê Hoàng Kho Vận',
		email: 'warehouse.lead@ecommerce.vn',
		role: 'InventoryClerk',
		status: 'Active',
		lastActive: 'Hôm qua'
	},
	{
		id: '4',
		fullName: 'Phạm Minh Điều Phối',
		email: 'operations.mgr@ecommerce.vn',
		role: 'StoreManager',
		status: 'Active',
		lastActive: '3 ngày trước'
	}
];

function StaffPage() {
	const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<'Admin' | 'StoreManager' | 'Cashier' | 'InventoryClerk'>('StoreManager');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const handleAddStaff = () => {
		if (!fullName || !email) return;
		const newStaff: StaffMember = {
			id: String(Date.now()),
			fullName,
			email,
			role,
			status: 'Active',
			lastActive: 'Vừa xong'
		};
		setStaffList([newStaff, ...staffList]);
		setIsModalOpen(false);
		setFullName('');
		setEmail('');
		setSnackbarMessage(`Đã mời nhân viên ${fullName} thành công`);
	};

	const filteredStaff = staffList.filter(
		(s) =>
			s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getRoleChip = (r: string) => {
		switch (r) {
			case 'Admin':
				return <Chip label="Quản Trị Viên" size="small" color="primary" />;
			case 'StoreManager':
				return <Chip label="Quản Lý Cửa Hàng" size="small" color="secondary" />;
			case 'Cashier':
				return <Chip label="Thu Ngân / POS" size="small" color="info" />;
			case 'InventoryClerk':
				return <Chip label="Thủ Kho" size="small" color="warning" />;
			default:
				return <Chip label={r} size="small" />;
		}
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-primary">heroicons-outline:identification</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Nhân Sự & Phân Quyền Cửa Hàng (Staff Members & Roles)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Quản lý danh sách nhân viên, gán vai trò quyền hạn và quản lý quyền truy cập phân hệ bán hàng
						</Typography>
					</div>
					<div className="flex items-center space-x-12 w-full sm:w-auto">
						<TextField
							placeholder="Tìm nhân viên..."
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
							className="w-full sm:w-220"
						/>
						<Button
							variant="contained"
							color="primary"
							className="whitespace-nowrap"
							startIcon={<FuseSvgIcon size={20}>heroicons-outline:user-add</FuseSvgIcon>}
							onClick={() => setIsModalOpen(true)}
						>
							Thêm Nhân Viên
						</Button>
					</div>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full">
					<Paper className="rounded-2xl border border-divider overflow-hidden">
						<Table>
							<TableHead className="bg-background-default">
								<TableRow>
									<TableCell className="font-bold">Nhân Viên</TableCell>
									<TableCell className="font-bold">Vai Trò</TableCell>
									<TableCell className="font-bold">Trạng Thái</TableCell>
									<TableCell className="font-bold">Hoạt Động Gần Nhất</TableCell>
									<TableCell className="font-bold text-right">Thao Tác</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredStaff.map((staff) => (
									<TableRow key={staff.id} hover>
										<TableCell>
											<div className="flex items-center space-x-12">
												<Avatar className="bg-primary text-white font-bold text-14">
													{staff.fullName.charAt(0)}
												</Avatar>
												<div>
													<Typography variant="subtitle2" className="font-bold">
														{staff.fullName}
													</Typography>
													<Typography variant="caption" className="text-text-secondary">
														{staff.email}
													</Typography>
												</div>
											</div>
										</TableCell>
										<TableCell>
											{getRoleChip(staff.role)}
										</TableCell>
										<TableCell>
											<Chip
												label={staff.status === 'Active' ? 'Đang Làm Việc' : 'Tạm Nghỉ'}
												size="small"
												color={staff.status === 'Active' ? 'success' : 'default'}
											/>
										</TableCell>
										<TableCell className="text-13 text-text-secondary">
											{staff.lastActive}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="text"
												color="error"
												size="small"
												onClick={() => {
													setStaffList(staffList.filter((s) => s.id !== staff.id));
													setSnackbarMessage(`Đã xóa nhân viên ${staff.fullName}`);
												}}
											>
												Xóa
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Paper>

					{/* Add Staff Dialog */}
					<Dialog
						open={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						maxWidth="xs"
						fullWidth
					>
						<DialogTitle className="border-b font-bold">
							Thêm Nhân Viên Mới Vào Cửa Hàng
						</DialogTitle>
						<DialogContent className="pt-24 space-y-16">
							<TextField
								label="Họ Và Tên"
								fullWidth
								variant="outlined"
								placeholder="Nguyễn Văn A"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
							/>
							<TextField
								label="Email Làm Việc"
								fullWidth
								type="email"
								variant="outlined"
								placeholder="nhanvien@shop.vn"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<FormControl fullWidth variant="outlined">
								<InputLabel>Vai Trò Quyền Hạn</InputLabel>
								<Select
									value={role}
									label="Vai Trò Quyền Hạn"
									onChange={(e) => setRole(e.target.value as any)}
								>
									<MenuItem value="Admin">Quản Trị Viên (Toàn quyền cửa hàng)</MenuItem>
									<MenuItem value="StoreManager">Quản Lý Cửa Hàng (Sản phẩm, Đơn hàng)</MenuItem>
									<MenuItem value="Cashier">Thu Ngân / Nhân Viên POS</MenuItem>
									<MenuItem value="InventoryClerk">Thủ Kho (Xuất nhập tồn kho)</MenuItem>
								</Select>
							</FormControl>
						</DialogContent>
						<DialogActions className="border-t p-16">
							<Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
							<Button
								variant="contained"
								color="primary"
								disabled={!fullName || !email}
								onClick={handleAddStaff}
							>
								Thêm Nhân Viên
							</Button>
						</DialogActions>
					</Dialog>

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

export default StaffPage;
