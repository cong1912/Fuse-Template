import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ComputerIcon from '@mui/icons-material/Computer';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGetPlatformSystemInfoQuery } from '../AdminTenantsApi';

function SystemPage() {
	const { data: systemInfo, isLoading, error, refetch } = useGetPlatformSystemInfoQuery();

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 items-start sm:items-center justify-between py-24 px-24 md:px-32 border-b bg-background-paper w-full">
					<div>
						<div className="flex items-center space-x-8">
							<FuseSvgIcon size={24} className="text-primary">heroicons-outline:cpu-chip</FuseSvgIcon>
							<Typography variant="h5" className="font-bold tracking-tight">
								Sức Khỏe Hệ Thống & Giám Sát Cụm Hạ Tầng (Cluster Diagnostics)
							</Typography>
						</div>
						<Typography variant="body2" className="text-text-secondary mt-4">
							Trạng thái hoạt động thời gian thực của Docker microservices, tiến trình nền và mức tiêu hao tài nguyên
						</Typography>
					</div>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={() => refetch()}
					>
						Làm Mới Trạng Thái
					</Button>
				</div>
			}
			content={
				<div className="p-24 md:p-32 max-w-7xl mx-auto w-full space-y-24">
					{isLoading && (
						<div className="flex justify-center p-48">
							<CircularProgress />
						</div>
					)}

					{error && (
						<Alert severity="error">
							Không thể kết nối tới dịch vụ đo kiểm sức khỏe hệ thống.
						</Alert>
					)}

					{!isLoading && systemInfo && (
						<>
							{/* Node System Metrics */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
								<Paper className="p-20 rounded-2xl border border-divider flex items-center space-x-16">
									<AccessTimeIcon color="primary" sx={{ fontSize: 40 }} />
									<div>
										<Typography variant="caption" className="text-text-secondary font-medium">
											Thời Gian Hoạt Động (Uptime)
										</Typography>
										<Typography variant="h6" className="font-extrabold text-text-primary">
											{systemInfo.uptime}
										</Typography>
									</div>
								</Paper>

								<Paper className="p-20 rounded-2xl border border-divider flex items-center space-x-16">
									<MemoryIcon color="secondary" sx={{ fontSize: 40 }} />
									<div>
										<Typography variant="caption" className="text-text-secondary font-medium">
											Bộ Nhớ Ứng Dụng (RAM)
										</Typography>
										<Typography variant="h6" className="font-extrabold text-text-primary">
											{systemInfo.memoryUsageMb} MB
										</Typography>
									</div>
								</Paper>

								<Paper className="p-20 rounded-2xl border border-divider flex items-center space-x-16">
									<ComputerIcon color="info" sx={{ fontSize: 40 }} />
									<div>
										<Typography variant="caption" className="text-text-secondary font-medium">
											Môi Trường Runtime
										</Typography>
										<Typography variant="h6" className="font-extrabold text-text-primary">
											{systemInfo.runtime}
										</Typography>
									</div>
								</Paper>

								<Paper className="p-20 rounded-2xl border border-divider flex items-center space-x-16">
									<StorageIcon color="success" sx={{ fontSize: 40 }} />
									<div>
										<Typography variant="caption" className="text-text-secondary font-medium">
											Phiên Bản Phát Hành
										</Typography>
										<Typography variant="h6" className="font-extrabold text-text-primary">
											v{systemInfo.version.split(' ')[0]}
										</Typography>
									</div>
								</Paper>
							</div>

							{/* Infrastructure Services Grid */}
							<div>
								<Typography variant="h6" className="font-bold mb-16 flex items-center space-x-8">
									<FuseSvgIcon size={20}>heroicons-outline:server</FuseSvgIcon>
									<span>Dịch Vụ Container & Cụm Cơ Sở Dữ Liệu</span>
								</Typography>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
									{systemInfo.services.map((svc, i) => (
										<Paper key={i} className="p-20 rounded-2xl border border-divider flex justify-between items-center">
											<div className="space-y-4">
												<Typography variant="subtitle2" className="font-bold text-text-primary">
													{svc.name}
												</Typography>
												<Typography variant="caption" className="text-text-secondary">
													Độ trễ phản hồi: <span className="font-semibold text-text-primary">{svc.latencyMs}ms</span>
												</Typography>
											</div>
											<Chip
												icon={<CheckCircleIcon />}
												label="Hoạt Động Tốt"
												color="success"
												size="small"
												className="font-bold"
											/>
										</Paper>
									))}
								</div>
							</div>

							{/* Background Workers Monitor */}
							<div>
								<Typography variant="h6" className="font-bold mb-16 flex items-center space-x-8">
									<FuseSvgIcon size={20}>heroicons-outline:cog</FuseSvgIcon>
									<span>Tiến Trình Ngầm Tự Động Hóa (Background Workers)</span>
								</Typography>

								<Paper className="rounded-2xl border border-divider p-20 space-y-12">
									{systemInfo.backgroundWorkers.map((w, idx) => (
										<div
											key={idx}
											className="flex justify-between items-center py-8 border-b border-divider last:border-b-0"
										>
											<div className="flex items-center space-x-12">
												<span className="w-10 h-10 rounded-full bg-success"></span>
												<span className="font-mono text-14 font-semibold">{w.name}</span>
											</div>
											<div className="flex items-center space-x-16">
												<span className="text-13 text-text-secondary">Tần suất: {w.interval}</span>
												<Chip label="Đang Chạy" size="small" color="primary" variant="outlined" />
											</div>
										</div>
									))}
								</Paper>
							</div>
						</>
					)}
				</div>
			}
		/>
	);
}

export default SystemPage;
