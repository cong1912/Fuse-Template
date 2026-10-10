import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { showMessage } from '@fuse/core/FuseMessage/store/fuseMessageSlice';
import { useAppDispatch } from 'src/app/store/store';
import {
	useInitSupportChannelMutation,
	useGetMyChatChannelsQuery,
	useGetChannelMessagesQuery,
	useSendChatMessageMutation,
	useMarkChannelReadMutation,
	ChatChannelDto
} from './inboxApi';

function InboxApp() {
	const user = useSelector(selectUser);
	const dispatch = useAppDispatch();
	const isSuperAdmin = user?.role?.includes('superadmin') || user?.role?.includes('SuperAdmin');

	// Active Channel State
	const [activeChannelId, setActiveChannelId] = useState<string>('');
	const [supportAdminInfo, setSupportAdminInfo] = useState<{
		name: string;
		email: string;
		isOnline: boolean;
	}>({
		name: 'Đội ngũ Kỹ thuật & Vận hành',
		email: 'admin@ecommerce.com',
		isOnline: true
	});

	// Message Input State
	const [messageText, setMessageText] = useState('');
	const [searchFilter, setSearchFilter] = useState('');

	// Bug Report Dialog State
	const [openBugDialog, setOpenBugDialog] = useState(false);
	const [bugSeverity, setBugSeverity] = useState('Medium');
	const [bugUrl, setBugUrl] = useState(window.location.pathname);
	const [bugDescription, setBugDescription] = useState('');

	// API Hooks
	const [initSupportChannel, { isLoading: isInitializing }] = useInitSupportChannelMutation();
	const { data: channelList = [], refetch: refetchChannels, isLoading: isLoadingChannels } = useGetMyChatChannelsQuery(undefined, {
		pollingInterval: 5000
	});

	const { data: messages = [], isLoading: isLoadingMessages, refetch: refetchMessages } = useGetChannelMessagesQuery(
		{ channelId: activeChannelId },
		{ skip: !activeChannelId, pollingInterval: 3000 }
	);

	const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();
	const [markChannelRead] = useMarkChannelReadMutation();

	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	// Scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Auto initialize support channel on load for non-superadmin
	useEffect(() => {
		if (!isSuperAdmin && !activeChannelId) {
			initSupportChannel()
				.unwrap()
				.then((res) => {
					if (res?.channelId) {
						setActiveChannelId(res.channelId);
						setSupportAdminInfo({
							name: res.supportName || 'Đội ngũ Kỹ thuật & Vận hành',
							email: res.supportEmail || 'admin@ecommerce.com',
							isOnline: res.isOnline
						});
					}
				})
				.catch((err) => {
					console.error('Failed to init support channel', err);
				});
		} else if (isSuperAdmin && channelList.length > 0 && !activeChannelId) {
			setActiveChannelId(channelList[0].id);
		}
	}, [isSuperAdmin, activeChannelId, channelList, initSupportChannel]);

	// Mark as read when activeChannelId changes
	useEffect(() => {
		if (activeChannelId) {
			markChannelRead(activeChannelId);
		}
	}, [activeChannelId, markChannelRead]);

	// Handler: Send standard message
	const handleSendMessage = async () => {
		if (!messageText.trim() || !activeChannelId || isSending) return;

		const textToSend = messageText.trim();
		setMessageText('');

		try {
			await sendMessage({
				channelId: activeChannelId,
				content: textToSend
			}).unwrap();
		} catch (error) {
			dispatch(
				showMessage({
					message: 'Không thể gửi tin nhắn. Vui lòng thử lại!',
					variant: 'error'
				})
			);
		}
	};

	// Handler: Send Structured Bug Report
	const handleSendBugReport = async () => {
		if (!bugDescription.trim() || !activeChannelId) return;

		const formattedReport = [
			`🚨 **[BÁO CÁO SỰ CỐ KỸ THUẬT]**`,
			`• **Mức độ**: ${bugSeverity === 'High' ? '🔴 Khẩn cấp' : bugSeverity === 'Medium' ? '🟡 Trung bình' : '🟢 Thấp'}`,
			`• **Trang gặp lỗi**: \`${bugUrl || '/'}\``,
			`• **Người báo cáo**: ${user?.data?.displayName || user?.data?.email} (${user?.role?.toString()})`,
			`• **Thời gian**: ${new Date().toLocaleTimeString('vi-VN')} ${new Date().toLocaleDateString('vi-VN')}`,
			`• **Chi tiết lỗi**:`,
			bugDescription.trim()
		].join('\n');

		try {
			await sendMessage({
				channelId: activeChannelId,
				content: formattedReport
			}).unwrap();

			setOpenBugDialog(false);
			setBugDescription('');
			dispatch(
				showMessage({
					message: 'Đã gửi báo cáo lỗi thành công đến Đội ngũ Kỹ thuật!',
					variant: 'success'
				})
			);
		} catch (err) {
			dispatch(
				showMessage({
					message: 'Gửi báo lỗi thất bại. Vui lòng thử lại!',
					variant: 'error'
				})
			);
		}
	};

	// Filtered channel list for Admin mode
	const filteredChannels = channelList.filter((c: ChatChannelDto) => {
		if (!searchFilter.trim()) return true;
		const query = searchFilter.toLowerCase();
		return (
			c.otherParticipantName?.toLowerCase().includes(query) ||
			c.otherParticipantEmail?.toLowerCase().includes(query) ||
			c.lastMessage?.toLowerCase().includes(query) ||
			c.id.toLowerCase().includes(query)
		);
	});

	const activeChannel = channelList.find((c) => c.id === activeChannelId);

	return (
		<Box className="flex flex-col flex-auto min-h-screen bg-gray-50 dark:bg-gray-900 p-16 md:p-24">
			{/* Top Header Banner */}
			<Paper className="p-20 md:p-24 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-16">
				<Box className="flex items-center gap-16">
					<Avatar
						sx={{
							bgcolor: 'primary.main',
							width: 52,
							height: 52,
							boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
						}}
					>
						<FuseSvgIcon size={28} className="text-white">
							heroicons-outline:chat-alt-2
						</FuseSvgIcon>
					</Avatar>
					<Box>
						<Typography variant="h5" className="font-bold tracking-tight text-gray-900 dark:text-gray-100">
							Hộp Thư & Hỗ Trợ Kỹ Thuật (Live Helpdesk & Support Inbox)
						</Typography>
						<Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-2">
							{isSuperAdmin
								? 'Trung tâm tiếp nhận & giải quyết sự cố kỹ thuật từ toàn bộ Gian hàng và Khách hàng'
								: 'Kênh chat hỗ trợ trực tiếp với Super Admin & Đội ngũ vận hành hệ thống'}
						</Typography>
					</Box>
				</Box>

				<Box className="flex items-center gap-12 w-full md:w-auto">
					{!isSuperAdmin && (
						<Button
							data-testid="btn-open-bug-report"
							variant="contained"
							color="error"
							startIcon={<FuseSvgIcon size={20}>heroicons-outline:exclamation-circle</FuseSvgIcon>}
							onClick={() => {
								setBugUrl(window.location.pathname);
								setOpenBugDialog(true);
							}}
							className="rounded-xl shadow-md font-semibold px-20 py-10"
						>
							Báo Lỗi Kỹ Thuật
						</Button>
					)}
					<Button
						variant="outlined"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:refresh</FuseSvgIcon>}
						onClick={() => {
							refetchChannels();
							refetchMessages();
						}}
						className="rounded-xl"
					>
						Làm mới
					</Button>
				</Box>
			</Paper>

			{/* Main Workspace */}
			<Box className="flex-auto grid grid-cols-1 md:grid-cols-12 gap-16 min-h-[620px]">
				{/* Left Sidebar: Conversations List (Always visible for SuperAdmin, compact toggle for users) */}
				{isSuperAdmin && (
					<Paper className="md:col-span-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
						{/* Search channels */}
						<Box className="p-16 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
							<TextField
								fullWidth
								size="small"
								placeholder="Tìm kiếm shop, user, tin nhắn..."
								value={searchFilter}
								onChange={(e) => setSearchFilter(e.target.value)}
								InputProps={{
									startAdornment: (
										<FuseSvgIcon size={18} className="text-gray-400 mr-8">
											heroicons-outline:search
										</FuseSvgIcon>
									)
								}}
								className="bg-white dark:bg-gray-700 rounded-xl"
							/>
						</Box>

						{/* Channel items */}
						<Box className="flex-auto overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
							{isLoadingChannels ? (
								<Box className="flex justify-center items-center py-40">
									<CircularProgress size={28} />
								</Box>
							) : filteredChannels.length === 0 ? (
								<Box className="text-center py-40 px-16 text-gray-400">
									<FuseSvgIcon size={36} className="mx-auto mb-8 text-gray-300">
										heroicons-outline:mail-open
									</FuseSvgIcon>
									<Typography variant="body2">Chưa có hội thoại nào</Typography>
								</Box>
							) : (
								filteredChannels.map((c) => {
									const isSelected = c.id === activeChannelId;
									const otherId = c.otherParticipantId || c.otherUserId || c.id;
									const isChannelOnline = c.isOnline ?? c.isOtherUserOnline ?? false;
									const participantTitle = c.otherParticipantName || c.otherParticipantEmail || `Khách hàng #${otherId.slice(0, 8)}`;

									return (
										<Box
											key={c.id}
											data-testid="channel-item"
											onClick={() => setActiveChannelId(c.id)}
											className={`p-16 cursor-pointer transition-colors flex items-start gap-12 ${
												isSelected
													? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
													: 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
											}`}
										>
											<Badge
												overlap="circular"
												anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
												variant="dot"
												color={isChannelOnline ? 'success' : 'default'}
											>
												<Avatar sx={{ bgcolor: 'secondary.main' }}>
													{c.otherParticipantName?.[0] || 'K'}
												</Avatar>
											</Badge>

											<Box className="flex-auto min-w-0">
												<Box className="flex items-center justify-between">
													<Typography
														variant="subtitle2"
														className="font-semibold text-gray-900 dark:text-gray-100 truncate"
													>
														{participantTitle}
													</Typography>
													{c.lastMessageAt && (
														<Typography variant="caption" className="text-gray-400 text-10">
															{new Date(c.lastMessageAt).toLocaleTimeString('vi-VN', {
																hour: '2-digit',
																minute: '2-digit'
															})}
														</Typography>
													)}
												</Box>

												<Typography
													variant="body2"
													className="text-gray-500 dark:text-gray-400 text-12 truncate mt-2"
												>
													{c.lastMessage || 'Chưa có tin nhắn'}
												</Typography>
											</Box>

											{c.unreadCount > 0 && (
												<Chip
													label={c.unreadCount}
													color="primary"
													size="small"
													className="h-20 min-w-20 px-4 text-10 font-bold"
												/>
											)}
										</Box>
									);
								})
							)}
						</Box>
					</Paper>
				)}

				{/* Chat Conversation View Area */}
				<Paper
					className={`${
						isSuperAdmin ? 'md:col-span-8' : 'md:col-span-12'
					} rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col overflow-hidden`}
				>
					{/* Active Chat Header */}
					<Box className="px-20 py-16 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/80">
						<Box className="flex items-center gap-12">
							<Badge
								overlap="circular"
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								variant="dot"
								color={
									isSuperAdmin
										? activeChannel?.isOnline
											? 'success'
											: 'default'
										: supportAdminInfo.isOnline
											? 'success'
											: 'default'
								}
							>
								<Avatar
									sx={{
										bgcolor: isSuperAdmin ? 'secondary.main' : 'primary.main',
										width: 44,
										height: 44
									}}
								>
									{isSuperAdmin ? (
										<FuseSvgIcon size={22} className="text-white">
											heroicons-outline:user
										</FuseSvgIcon>
									) : (
										<FuseSvgIcon size={22} className="text-white">
											heroicons-outline:support
										</FuseSvgIcon>
									)}
								</Avatar>
							</Badge>

							<Box>
								<Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-gray-100">
									{isSuperAdmin
										? activeChannel?.otherParticipantName ||
											activeChannel?.otherParticipantEmail ||
											`Khách hàng #${(activeChannel?.otherParticipantId || activeChannel?.otherUserId || activeChannel?.id || 'Chưa chọn').slice(0, 8)}`
										: supportAdminInfo.name}
								</Typography>
								<Box className="flex items-center gap-6 mt-1">
									<Box
										className={`w-8 h-8 rounded-full ${
											(isSuperAdmin ? (activeChannel?.isOnline ?? activeChannel?.isOtherUserOnline) : supportAdminInfo.isOnline)
												? 'bg-green-500 animate-pulse'
												: 'bg-gray-300'
										}`}
									/>
									<Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
										{(isSuperAdmin ? (activeChannel?.isOnline ?? activeChannel?.isOtherUserOnline) : supportAdminInfo.isOnline)
											? 'Trực tuyến sẵn sàng hỗ trợ'
											: 'Ngoại tuyến (Phản hồi trong 15p)'}
									</Typography>
								</Box>
							</Box>
						</Box>

						{isSuperAdmin && activeChannel && (
							<Box className="flex items-center gap-8">
								<Tooltip title="Đánh dấu hỗ trợ hoàn tất">
									<Button
										variant="outlined"
										size="small"
										color="success"
										startIcon={<FuseSvgIcon size={16}>heroicons-outline:check-circle</FuseSvgIcon>}
										onClick={() => {
											dispatch(
												showMessage({
													message: 'Đã cập nhật trạng thái: Sự cố đã giải quyết!',
													variant: 'success'
												})
											);
										}}
										className="rounded-lg text-12 font-medium"
									>
										Đã xử lý
									</Button>
								</Tooltip>
							</Box>
						)}
					</Box>

					{/* Messages Body */}
					<Box className="flex-auto p-20 overflow-y-auto space-y-16 bg-gray-50/30 dark:bg-gray-900/30">
						{/* Welcome / System Info Banner */}
						<Box className="mx-auto max-w-lg p-16 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
							<FuseSvgIcon size={24} className="text-blue-500 mx-auto mb-6">
								heroicons-outline:shield-check
							</FuseSvgIcon>
							<Typography variant="subtitle2" className="font-semibold text-blue-900 dark:text-blue-200">
								Kênh Hỗ Trợ Kỹ Thuật Bảo Mật 1:1
							</Typography>
							<Typography variant="caption" className="text-blue-700 dark:text-blue-300 block mt-2">
								Mọi thông tin sự cố, log kỹ thuật và yêu cầu tính năng được tiếp nhận trực tiếp bởi đội ngũ
								vận hành. Thời gian phản hồi tiêu chuẩn dưới 5 phút.
							</Typography>
						</Box>

						{/* Messages list */}
						{isLoadingMessages || isInitializing ? (
							<Box className="flex justify-center items-center py-40">
								<CircularProgress size={32} />
							</Box>
						) : messages.length === 0 ? (
							<Box className="text-center py-60 text-gray-400">
								<FuseSvgIcon size={48} className="mx-auto mb-12 text-gray-300">
									heroicons-outline:chat-alt
								</FuseSvgIcon>
								<Typography variant="body1" className="font-medium">
									Chưa có tin nhắn nào trong kênh hỗ trợ này
								</Typography>
								<Typography variant="body2" className="text-gray-400 text-12 mt-4">
									Hãy gửi tin nhắn hoặc bấm &quot;Báo Lỗi Kỹ Thuật&quot; để trao đổi với chúng tôi
								</Typography>
							</Box>
						) : (
							messages.map((m) => {
								const isMe = m.senderId === user?.uid || m.senderId === (user as any)?.id;
								const isBugReport = m.content.includes('[BÁO CÁO SỰ CỐ KỸ THUẬT]');

								return (
									<Box
										key={m.id}
										className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
									>
										<Box
											className={`max-w-[85%] md:max-w-[70%] p-14 rounded-2xl shadow-sm ${
												isMe
													? 'bg-primary-600 text-white rounded-br-none'
													: isBugReport
														? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
														: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-none'
											}`}
										>
											{/* Formatted Message rendering */}
											<Typography
												variant="body2"
												className="whitespace-pre-wrap leading-relaxed text-13"
											>
												{m.content}
											</Typography>
										</Box>

										<Typography
											variant="caption"
											className="text-gray-400 dark:text-gray-500 text-10 mt-4 px-4"
										>
											{new Date(m.sentAt).toLocaleTimeString('vi-VN', {
												hour: '2-digit',
												minute: '2-digit'
											})}{' '}
											• {isMe ? 'Bạn' : 'Hỗ trợ'}
										</Typography>
									</Box>
								);
							})
						)}
						<div ref={messagesEndRef} />
					</Box>

					{/* Input Box Area */}
					<Box className="p-16 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
						<Box className="flex items-center gap-12">
							<TextField
								data-testid="chat-message-input"
								fullWidth
								multiline
								maxRows={4}
								placeholder="Nhập tin nhắn trao đổi hoặc câu hỏi kỹ thuật (Nhấn Enter để gửi)..."
								value={messageText}
								onChange={(e) => setMessageText(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage();
									}
								}}
								disabled={!activeChannelId || isSending}
								className="bg-gray-50 dark:bg-gray-700 rounded-xl"
								size="small"
							/>

							<Button
								data-testid="btn-send-message"
								variant="contained"
								color="primary"
								onClick={handleSendMessage}
								disabled={!messageText.trim() || !activeChannelId || isSending}
								className="min-w-52 h-44 rounded-xl px-16 shadow-md"
							>
								{isSending ? (
									<CircularProgress size={20} color="inherit" />
								) : (
									<FuseSvgIcon size={20}>heroicons-outline:paper-airplane</FuseSvgIcon>
								)}
							</Button>
						</Box>
					</Box>
				</Paper>
			</Box>

			{/* Bug Report Modal Dialog */}
			<Dialog
				open={openBugDialog}
				onClose={() => setOpenBugDialog(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ className: 'rounded-2xl p-8' }}
			>
				<DialogTitle className="flex items-center gap-12 font-bold text-gray-900 pb-8">
					<Avatar sx={{ bgcolor: 'error.main', width: 38, height: 38 }}>
						<FuseSvgIcon size={22} className="text-white">
							heroicons-outline:exclamation-circle
						</FuseSvgIcon>
					</Avatar>
					<Box>
						<Typography variant="h6" className="font-bold">
							Báo Cáo Sự Cố Kỹ Thuật (Bug Report)
						</Typography>
						<Typography variant="caption" className="text-gray-500">
							Thông tin sẽ được gửi ngay đến Đội ngũ Kỹ thuật & Super Admin
						</Typography>
					</Box>
				</DialogTitle>

				<DialogContent className="space-y-16 pt-12">
					<Box className="grid grid-cols-2 gap-12">
						<FormControl fullWidth size="small">
							<InputLabel>Mức độ nghiêm trọng</InputLabel>
							<Select
								value={bugSeverity}
								label="Mức độ nghiêm trọng"
								onChange={(e) => setBugSeverity(e.target.value)}
							>
								<MenuItem value="Low">🟢 Thấp (Giao diện / Hỏi đáp)</MenuItem>
								<MenuItem value="Medium">🟡 Trung bình (Tính năng chậm / lỗi phụ)</MenuItem>
								<MenuItem value="High">🔴 Khẩn cấp (Lỗi đơn / Không thanh toán được)</MenuItem>
							</Select>
						</FormControl>

						<TextField
							label="Đường dẫn trang lỗi (URL)"
							size="small"
							value={bugUrl}
							onChange={(e) => setBugUrl(e.target.value)}
							fullWidth
						/>
					</Box>

					<TextField
						label="Mô tả sự cố bạn đang gặp phải *"
						placeholder="Ví dụ: Khi tôi bấm nút xác nhận đơn hàng #1234 thì hệ thống báo lỗi 500 hoặc không phản hồi..."
						multiline
						rows={4}
						value={bugDescription}
						onChange={(e) => setBugDescription(e.target.value)}
						fullWidth
						required
					/>

					<Box className="p-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-12 text-gray-600 dark:text-gray-400 space-y-4">
						<Typography variant="caption" className="font-semibold text-gray-700 dark:text-gray-300 block">
							Hệ thống tự động đính kèm thông tin chẩn đoán:
						</Typography>
						<Typography variant="caption" className="block text-11">
							• Trình duyệt: {navigator.userAgent.slice(0, 70)}...
						</Typography>
						<Typography variant="caption" className="block text-11">
							• Tài khoản: {user?.data?.email} | Role: {user?.role?.toString()}
						</Typography>
					</Box>
				</DialogContent>

				<DialogActions className="p-16 pt-8 gap-8">
					<Button onClick={() => setOpenBugDialog(false)} className="rounded-xl">
						Hủy bỏ
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleSendBugReport}
						disabled={!bugDescription.trim()}
						className="rounded-xl px-20 font-semibold shadow-md"
					>
						Gửi Báo Lỗi Ngay
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default InboxApp;
