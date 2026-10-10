import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'app/store/store';
import { useLocation } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import withReducer from 'app/store/withReducer';
import FuseLoading from '@fuse/core/FuseLoading';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { closeNotificationPanel, selectNotificationPanelState, toggleNotificationPanel } from './store/stateSlice';
import reducer from './store';
import {
	useCreateNotificationMutation,
	useDeleteAllNotificationsMutation,
	useDeleteNotificationMutation,
	useGetAllNotificationsQuery
} from './NotificationApi';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
	'& .MuiDrawer-paper': {
		backgroundColor: theme.palette.background.default,
		width: 380,
		maxWidth: '90vw'
	}
}));

const sampleLiveNotifications = [
	{
		id: 'notif-1',
		category: 'order',
		title: 'Đơn hàng mới #ORD-9821',
		description: 'Khách hàng Nguyễn Minh Tú vừa đặt đơn giá trị ₫680.000 qua VietQR',
		time: '10 phút trước',
		read: false,
		icon: <ShoppingCartIcon className="text-blue-500" fontSize="small" />
	},
	{
		id: 'notif-2',
		category: 'inventory',
		title: 'Cảnh báo tồn kho thấp',
		description: 'Sản phẩm "Áo thun Polo Nam Regular Fit" chỉ còn 4 chiếc tại Kho Tân Bình',
		time: '25 phút trước',
		read: false,
		icon: <WarningAmberIcon className="text-amber-500" fontSize="small" />
	},
	{
		id: 'notif-3',
		category: 'promo',
		title: 'Áp dụng mã FREESHIP50 thành công',
		description: 'Khách hàng áp dụng trợ giá ₫30.000 từ Kịch bản Miễn phí vận chuyển',
		time: '1 giờ trước',
		read: false,
		icon: <LocalOfferIcon className="text-purple-500" fontSize="small" />
	},
	{
		id: 'notif-4',
		category: 'order',
		title: 'Giao hàng thành công #ORD-9805',
		description: 'ĐVVC Giao Hàng Nhanh (GHN) đã giao thành công kiện hàng cho khách',
		time: '3 giờ trước',
		read: true,
		icon: <CheckCircleOutlineIcon className="text-emerald-500" fontSize="small" />
	}
];

/**
 * The enhanced shop notification panel.
 */
function NotificationPanel() {
	const location = useLocation();
	const dispatch = useAppDispatch();
	const state = useSelector(selectNotificationPanelState);
	const [activeTab, setActiveTab] = useState(0);
	const [localList, setLocalList] = useState(sampleLiveNotifications);

	const [deleteNotification] = useDeleteNotificationMutation();
	const [deleteAllNotifications] = useDeleteAllNotificationsMutation();
	const { data: serverNotifications = [], isLoading } = useGetAllNotificationsQuery();
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		if (state) {
			dispatch(closeNotificationPanel());
		}
		// eslint-disable-next-line
	}, [location, dispatch]);

	const unreadCount = useMemo(() => {
		return localList.filter(n => !n.read).length;
	}, [localList]);

	const filteredList = useMemo(() => {
		if (activeTab === 1) return localList.filter(n => n.category === 'order');
		if (activeTab === 2) return localList.filter(n => n.category === 'inventory');
		if (activeTab === 3) return localList.filter(n => n.category === 'promo');
		return localList;
	}, [localList, activeTab]);

	function handleClose() {
		dispatch(closeNotificationPanel());
	}

	function handleDismiss(id: string) {
		deleteNotification(id);
		setLocalList(prev => prev.filter(n => n.id !== id));
	}

	function handleDismissAll() {
		deleteAllNotifications();
		setLocalList(prev => prev.map(n => ({ ...n, read: true })));
		enqueueSnackbar('Đã đánh dấu tất cả thông báo là đã đọc', { variant: 'success' });
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<StyledSwipeableDrawer
			open={state}
			anchor="right"
			onOpen={() => {}}
			onClose={() => dispatch(toggleNotificationPanel())}
			disableSwipeToOpen
		>
			<Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Thông Báo
					</Typography>
					{unreadCount > 0 && (
						<Chip label={`${unreadCount} mới`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
					)}
				</Box>
				<IconButton onClick={handleClose} size="small">
					<FuseSvgIcon color="action">heroicons-outline:x</FuseSvgIcon>
				</IconButton>
			</Box>

			<Box sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={activeTab}
					onChange={(_, val) => setActiveTab(val)}
					variant="scrollable"
					scrollButtons="auto"
					sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5, px: 1.5, fontSize: '0.8rem' } }}
				>
					<Tab label="Tất cả" />
					<Tab label="Đơn hàng" />
					<Tab label="Kho hàng" />
					<Tab label="Khuyến mãi" />
				</Tabs>
			</Box>

			<FuseScrollbars className="flex flex-col p-16 h-full">
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
					<Button
						size="small"
						startIcon={<DoneAllIcon fontSize="small" />}
						onClick={handleDismissAll}
						sx={{ fontSize: '0.75rem', textTransform: 'none' }}
					>
						Đánh dấu tất cả đã đọc
					</Button>
				</Box>

				{filteredList.length > 0 ? (
					<div className="flex flex-auto flex-col gap-12">
						{filteredList.map((item) => (
							<Box
								key={item.id}
								sx={{
									p: 2,
									borderRadius: 2,
									border: 1,
									borderColor: item.read ? 'divider' : 'primary.light',
									bgcolor: item.read ? 'background.paper' : (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.04)',
									transition: 'all 0.2s',
									'&:hover': {
										boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
									}
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{item.icon}
										<Typography variant="subtitle2" sx={{ fontWeight: item.read ? 500 : 700 }}>
											{item.title}
										</Typography>
									</Box>
									<IconButton size="small" onClick={() => handleDismiss(item.id)} sx={{ p: 0.5 }}>
										<FuseSvgIcon size={16} color="action">heroicons-outline:x</FuseSvgIcon>
									</IconButton>
								</Box>
								<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.82rem' }}>
									{item.description}
								</Typography>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
									<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
										{item.time}
									</Typography>
									{!item.read && (
										<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
									)}
								</Box>
							</Box>
						))}
					</div>
				) : (
					<div className="flex flex-1 items-center justify-center p-16">
						<Typography className="text-center text-14" color="text.secondary">
							Không có thông báo nào trong mục này.
						</Typography>
					</div>
				)}
			</FuseScrollbars>
		</StyledSwipeableDrawer>
	);
}

export default withReducer('notificationPanel', reducer)(NotificationPanel);
