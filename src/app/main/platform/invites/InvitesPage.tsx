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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Snackbar from '@mui/material/Snackbar';
import {
	useGetPlatformInvitesQuery,
	useCreatePlatformInviteMutation,
	PlatformInviteDto
} from '../AdminTenantsApi';

function InvitesPage() {
	const { data: rawInvites = [], isLoading, error } = useGetPlatformInvitesQuery();
	const invites: PlatformInviteDto[] = Array.isArray(rawInvites)
		? rawInvites
		: ((rawInvites as any)?.items || []);
	const [createInvite, { isLoading: isCreating }] = useCreatePlatformInviteMutation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('SuperAdmin');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const handleSendInvite = async () => {
		if (!email) return;
		try {
			await createInvite({ email, role }).unwrap();
			setIsModalOpen(false);
			setEmail('');
			setSnackbarMessage(`Đã gửi thư mời tham gia thành công tới ${email}`);
		} catch (err) {
			console.error('Failed to create invite', err);
			setSnackbarMessage('Có lỗi xảy ra khi gửi lời mời');
		}
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-primary">heroicons-outline:mail-open</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Quản Lý Lời Mời Quản Trị & Nhân Sự (Platform Invitations)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Tạo và cấp phát quyền truy cập có thời hạn cho quản trị viên sàn, chuyên viên kiểm toán và nhân sự kỹ thuật
						</Typography>
					</div>
					<Button
						variant="contained"
						color="primary"
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
						onClick={() => setIsModalOpen(true)}
					>
						Gửi Lời Mời Mới
					</Button>
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
							Không thể tải danh sách lời mời.
						</Alert>
					)}

					{!isLoading && !error && (
						<Paper className="rounded-2xl border border-divider overflow-hidden">
							<Table>
								<TableHead className="bg-background-default">
									<TableRow>
										<TableCell className="font-bold">Email Được Mời</TableCell>
										<TableCell className="font-bold">Vai Trò Đề Xuất</TableCell>
										<TableCell className="font-bold">Phạm Vi Cửa Hàng / Tenant</TableCell>
										<TableCell className="font-bold">Thời Gian Gửi</TableCell>
										<TableCell className="font-bold">Thời Hạn Kích Hoạt</TableCell>
										<TableCell className="font-bold">Trạng Thái</TableCell>
										<TableCell className="font-bold text-right">Thao Tác</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{invites.map((inv) => (
										<TableRow key={inv.id} hover>
											<TableCell className="font-semibold text-text-primary">
												{inv.email}
											</TableCell>
											<TableCell>
												<Chip label={inv.role} size="small" color="primary" variant="outlined" />
											</TableCell>
											<TableCell className="text-13 text-text-secondary">
												{inv.tenantName}
											</TableCell>
											<TableCell className="text-13">
												{new Date(inv.sentAtUtc).toLocaleDateString('vi-VN')}
											</TableCell>
											<TableCell className="text-13">
												{new Date(inv.expiresAtUtc).toLocaleDateString('vi-VN')}
											</TableCell>
											<TableCell>
												<Chip label={inv.status} size="small" color="warning" />
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="text"
													color="error"
													size="small"
													onClick={() => setSnackbarMessage(`Đã thu hồi lời mời gửi tới ${inv.email}`)}
												>
													Thu Hồi
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Paper>
					)}

					{/* Send Invite Dialog */}
					<Dialog
						open={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						maxWidth="xs"
						fullWidth
					>
						<DialogTitle className="border-b font-bold">
							Gửi Lời Mời Gia Nhập Nền Tảng
						</DialogTitle>
						<DialogContent className="pt-24 space-y-16">
							<TextField
								label="Địa Chỉ Email"
								fullWidth
								variant="outlined"
								type="email"
								placeholder="admin@domain.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<FormControl fullWidth variant="outlined">
								<InputLabel>Vai Trò Quyền Hạn</InputLabel>
								<Select
									value={role}
									label="Vai Trò Quyền Hạn"
									onChange={(e) => setRole(e.target.value)}
								>
									<MenuItem value="SuperAdmin">Super Administrator (Toàn quyền)</MenuItem>
									<MenuItem value="Auditor">Kiểm toán viên (Chỉ xem log & tài chính)</MenuItem>
									<MenuItem value="OperationsManager">Quản lý Vận hành & Cửa hàng</MenuItem>
								</Select>
							</FormControl>
						</DialogContent>
						<DialogActions className="border-t p-16">
							<Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
							<Button
								variant="contained"
								color="primary"
								disabled={isCreating || !email}
								onClick={handleSendInvite}
							>
								{isCreating ? 'Đang gửi...' : 'Gửi Lời Mời'}
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

export default InvitesPage;
