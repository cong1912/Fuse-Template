import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAppDispatch } from 'src/app/store/store';
import { showMessage } from '@fuse/core/FuseMessage/store/fuseMessageSlice';

export interface BookingEvent {
	id: string;
	title: string;
	start: string;
	end: string;
	allDay?: boolean;
	category: 'delivery' | 'consultation' | 'warranty' | 'showroom';
	status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	location: string;
	notes?: string;
	orderReference?: string;
	color?: string;
}

const CATEGORIES = {
	delivery: {
		label: 'Giao Hàng Hẹn Giờ',
		color: '#10b981',
		icon: LocalShippingIcon
	},
	consultation: {
		label: 'Tư Vấn VIP & Sản Phẩm',
		color: '#3b82f6',
		icon: SupportAgentIcon
	},
	warranty: {
		label: 'Bảo Hành & Kỹ Thuật',
		color: '#f59e0b',
		icon: BuildCircleIcon
	},
	showroom: {
		label: 'Trải Nghiệm Tại Showroom',
		color: '#8b5cf6',
		icon: StorefrontIcon
	}
};

const STATUS_LABELS = {
	pending: { label: 'Chờ xác nhận', color: 'warning' as const },
	confirmed: { label: 'Đã xác nhận', color: 'primary' as const },
	completed: { label: 'Hoàn tất', color: 'success' as const },
	cancelled: { label: 'Đã hủy', color: 'default' as const }
};

// Generate relative date string for today + offset days
const getRelativeDateStr = (dayOffset: number, hour: number, minute: number = 0) => {
	const d = new Date();
	d.setDate(d.getDate() + dayOffset);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
};

const INITIAL_EVENTS: BookingEvent[] = [
	{
		id: 'evt-1',
		title: 'Giao tủ lạnh Samsung Bespoke & Lắp đặt tại nhà',
		start: getRelativeDateStr(0, 9, 0),
		end: getRelativeDateStr(0, 11, 0),
		category: 'delivery',
		status: 'confirmed',
		customerName: 'Nguyễn Văn Hùng',
		customerPhone: '0988 123 456',
		location: 'Căn hộ 12B, Toà Landmark 3, Vinhomes Central Park, Q. Bình Thạnh',
		orderReference: 'ORD-9921',
		notes: 'Khách yêu cầu mang thang dây và bọc lót sàn gỗ cẩn thận.',
		color: '#10b981'
	},
	{
		id: 'evt-2',
		title: 'Tư vấn cấu hình dàn PC Workstation 4K trực tuyến',
		start: getRelativeDateStr(0, 14, 0),
		end: getRelativeDateStr(0, 15, 30),
		category: 'consultation',
		status: 'confirmed',
		customerName: 'Trần Thị Mai',
		customerPhone: '0912 345 678',
		location: 'Google Meet (Online)',
		orderReference: 'ORD-9884',
		notes: 'Khách cần dựng video render After Effects và 3Ds Max ngân sách 60 triệu.',
		color: '#3b82f6'
	},
	{
		id: 'evt-3',
		title: 'Bảo hành kiểm tra lỗi màn hình sọc xanh MacBook Pro M2',
		start: getRelativeDateStr(1, 10, 0),
		end: getRelativeDateStr(1, 11, 30),
		category: 'warranty',
		status: 'pending',
		customerName: 'Lê Hoàng Nam',
		customerPhone: '0903 888 999',
		location: 'Trung tâm bảo hành Flagship Store, 240 Hai Bà Trưng, Q.1',
		orderReference: 'ORD-9710',
		notes: 'Máy còn hạn bảo hành hãng 4 tháng, khách mang cả sạc zin.',
		color: '#f59e0b'
	},
	{
		id: 'evt-4',
		title: 'Khách VIP hẹn test dàn loa Hi-Fi Bang & Olufsen phòng nghe thử',
		start: getRelativeDateStr(1, 16, 0),
		end: getRelativeDateStr(1, 17, 30),
		category: 'showroom',
		status: 'confirmed',
		customerName: 'Đặng Tuấn Kiệt',
		customerPhone: '0938 777 666',
		location: 'Phòng trải nghiệm Acoustic VIP, Showroom Hà Nội',
		orderReference: 'ORD-9950',
		notes: 'Chuẩn bị phòng cách âm và đĩa than Jazz audiophile.',
		color: '#8b5cf6'
	},
	{
		id: 'evt-5',
		title: 'Giao hàng hỏa tốc bàn phím cơ Custom & Switch Lube',
		start: getRelativeDateStr(2, 13, 0),
		end: getRelativeDateStr(2, 14, 0),
		category: 'delivery',
		status: 'pending',
		customerName: 'Phạm Quỳnh Anh',
		customerPhone: '0977 444 333',
		location: 'Tòa nhà Bitexco, Q.1, TP.HCM',
		orderReference: 'ORD-9988',
		notes: 'Giao giờ hành chính, gọi trước 15 phút.',
		color: '#10b981'
	}
];

export default function CalendarApp() {
	const dispatch = useAppDispatch();
	const calendarRef = useRef<FullCalendar | null>(null);

	// Event list state with localStorage persistence
	const [events, setEvents] = useState<BookingEvent[]>(() => {
		try {
			const saved = localStorage.getItem('ecommerce_calendar_events');
			if (saved) return JSON.parse(saved);
		} catch (e) {
			// ignore
		}
		return INITIAL_EVENTS;
	});

	useEffect(() => {
		try {
			localStorage.setItem('ecommerce_calendar_events', JSON.stringify(events));
		} catch (e) {
			// ignore
		}
	}, [events]);

	// View and Calendar Toolbar State
	const [currentTitle, setCurrentTitle] = useState('');
	const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [selectedStatus, setSelectedStatus] = useState<string>('all');

	// Create / Edit Dialog State
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<BookingEvent | null>(null);

	// Details Dialog State
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);

	// Form fields
	const [formTitle, setFormTitle] = useState('');
	const [formCategory, setFormCategory] = useState<'delivery' | 'consultation' | 'warranty' | 'showroom'>('delivery');
	const [formStatus, setFormStatus] = useState<'confirmed' | 'pending' | 'completed' | 'cancelled'>('pending');
	const [formCustomerName, setFormCustomerName] = useState('');
	const [formCustomerPhone, setFormCustomerPhone] = useState('');
	const [formCustomerEmail, setFormCustomerEmail] = useState('');
	const [formLocation, setFormLocation] = useState('');
	const [formStartDate, setFormStartDate] = useState('');
	const [formStartTime, setFormStartTime] = useState('09:00');
	const [formEndDate, setFormEndDate] = useState('');
	const [formEndTime, setFormEndTime] = useState('10:00');
	const [formOrderRef, setFormOrderRef] = useState('');
	const [formNotes, setFormNotes] = useState('');

	// Update current title when calendar changes
	const updateTitle = () => {
		if (calendarRef.current) {
			const api = calendarRef.current.getApi();
			setCurrentTitle(api.view.title);
		}
	};

	useEffect(() => {
		// Small delay to let FullCalendar mount
		const t = setTimeout(updateTitle, 150);
		return () => clearTimeout(t);
	}, []);

	// Calendar navigation handlers
	const handlePrev = () => {
		calendarRef.current?.getApi().prev();
		updateTitle();
	};

	const handleNext = () => {
		calendarRef.current?.getApi().next();
		updateTitle();
	};

	const handleToday = () => {
		calendarRef.current?.getApi().today();
		updateTitle();
	};

	const handleChangeView = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
		calendarRef.current?.getApi().changeView(view);
		setCurrentView(view);
		updateTitle();
	};

	// Open dialog to create new booking
	const handleOpenCreate = (startDateStr?: string) => {
		const defaultDate = startDateStr || new Date().toISOString().split('T')[0];
		setEditingEvent(null);
		setFormTitle('');
		setFormCategory('delivery');
		setFormStatus('pending');
		setFormCustomerName('');
		setFormCustomerPhone('');
		setFormCustomerEmail('');
		setFormLocation('');
		setFormStartDate(defaultDate);
		setFormStartTime('09:00');
		setFormEndDate(defaultDate);
		setFormEndTime('10:30');
		setFormOrderRef('');
		setFormNotes('');
		setDialogOpen(true);
	};

	// Open dialog to edit existing booking
	const handleOpenEdit = (evt: BookingEvent) => {
		setEditingEvent(evt);
		setFormTitle(evt.title);
		setFormCategory(evt.category);
		setFormStatus(evt.status);
		setFormCustomerName(evt.customerName);
		setFormCustomerPhone(evt.customerPhone);
		setFormCustomerEmail(evt.customerEmail || '');
		setFormLocation(evt.location);

		const startD = new Date(evt.start);
		const endD = new Date(evt.end);
		setFormStartDate(startD.toISOString().split('T')[0]);
		setFormStartTime(startD.toTimeString().substring(0, 5));
		setFormEndDate(endD.toISOString().split('T')[0]);
		setFormEndTime(endD.toTimeString().substring(0, 5));

		setFormOrderRef(evt.orderReference || '');
		setFormNotes(evt.notes || '');
		setDetailsOpen(false);
		setDialogOpen(true);
	};

	// Save booking (create or update)
	const handleSaveBooking = () => {
		if (!formTitle.trim()) {
			dispatch(showMessage({ message: 'Vui lòng nhập tiêu đề lịch hẹn', variant: 'warning' }));
			return;
		}
		if (!formCustomerName.trim() || !formCustomerPhone.trim()) {
			dispatch(showMessage({ message: 'Vui lòng nhập tên và số điện thoại khách hàng', variant: 'warning' }));
			return;
		}

		const startIso = `${formStartDate}T${formStartTime}:00`;
		const endIso = `${formEndDate}T${formEndTime}:00`;
		const catColor = CATEGORIES[formCategory].color;

		if (editingEvent) {
			const updated: BookingEvent = {
				...editingEvent,
				title: formTitle.trim(),
				category: formCategory,
				status: formStatus,
				customerName: formCustomerName.trim(),
				customerPhone: formCustomerPhone.trim(),
				customerEmail: formCustomerEmail.trim() || undefined,
				location: formLocation.trim() || 'Showroom mặc định',
				start: startIso,
				end: endIso,
				orderReference: formOrderRef.trim() || undefined,
				notes: formNotes.trim() || undefined,
				color: catColor
			};
			setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)));
			dispatch(showMessage({ message: 'Đã cập nhật lịch hẹn thành công!', variant: 'success' }));
		} else {
			const newEvent: BookingEvent = {
				id: `evt-${Date.now()}`,
				title: formTitle.trim(),
				category: formCategory,
				status: formStatus,
				customerName: formCustomerName.trim(),
				customerPhone: formCustomerPhone.trim(),
				customerEmail: formCustomerEmail.trim() || undefined,
				location: formLocation.trim() || 'Showroom mặc định',
				start: startIso,
				end: endIso,
				orderReference: formOrderRef.trim() || undefined,
				notes: formNotes.trim() || undefined,
				color: catColor
			};
			setEvents((prev) => [...prev, newEvent]);
			dispatch(showMessage({ message: 'Đã tạo lịch hẹn mới thành công!', variant: 'success' }));
		}

		setDialogOpen(false);
	};

	// Handle click on calendar event
	const handleEventClick = (info: any) => {
		const found = events.find((e) => e.id === info.event.id);
		if (found) {
			setSelectedEvent(found);
			setDetailsOpen(true);
		}
	};

	// Delete booking
	const handleDeleteBooking = (id: string) => {
		if (window.confirm('Bạn có chắc chắn muốn hủy và xóa lịch hẹn này không?')) {
			setEvents((prev) => prev.filter((e) => e.id !== id));
			setDetailsOpen(false);
			dispatch(showMessage({ message: 'Đã xóa lịch hẹn thành công!', variant: 'success' }));
		}
	};

	// Change status quickly from details dialog
	const handleUpdateStatus = (id: string, newStatus: BookingEvent['status']) => {
		setEvents((prev) =>
			prev.map((e) => {
				if (e.id === id) {
					return { ...e, status: newStatus };
				}
				return e;
			})
		);
		if (selectedEvent && selectedEvent.id === id) {
			setSelectedEvent({ ...selectedEvent, status: newStatus });
		}
		dispatch(showMessage({ message: `Đã chuyển trạng thái sang "${STATUS_LABELS[newStatus].label}"`, variant: 'success' }));
	};

	// Filtered events
	const filteredEvents = events.filter((e) => {
		if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
		if (selectedStatus !== 'all' && e.status !== selectedStatus) return false;
		return true;
	});

	// Transform for FullCalendar
	const calendarEvents = filteredEvents.map((e) => ({
		id: e.id,
		title: `${e.title} (${e.customerName})`,
		start: e.start,
		end: e.end,
		allDay: e.allDay,
		backgroundColor: e.color || CATEGORIES[e.category]?.color || '#3b82f6',
		borderColor: e.color || CATEGORIES[e.category]?.color || '#3b82f6',
		extendedProps: { ...e }
	}));

	return (
		<Box className="w-full h-full flex flex-col p-16 sm:p-24 overflow-hidden">
			{/* Header Card */}
			<Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
				<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
					{/* Left: Title & Calendar Icon */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box
							sx={{
								width: 48,
								height: 48,
								borderRadius: 2.5,
								bgcolor: 'primary.main',
								color: 'white',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
							}}
						>
							<CalendarMonthIcon sx={{ fontSize: 28 }} />
						</Box>
						<div>
							<Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
								Lịch Hẹn & Đặt Chỗ (Universal Booking Calendar)
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Quản lý lịch hẹn dịch vụ, khung giờ giao hàng lắp đặt và tư vấn sản phẩm cho khách hàng
							</Typography>
						</div>
					</Box>

					{/* Right: Actions */}
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Button
							variant="contained"
							color="secondary"
							startIcon={<AddIcon />}
							onClick={() => handleOpenCreate()}
							sx={{ borderRadius: 2, fontWeight: 700, px: 2.5, py: 1 }}
						>
							Đặt Lịch Mới
						</Button>
					</Stack>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Navigation Bar & Filter Controls */}
				<Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between', gap: 2 }}>
					{/* Date Navigation */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<IconButton onClick={handlePrev} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
							<ChevronLeftIcon />
						</IconButton>
						<Button
							variant="outlined"
							size="small"
							startIcon={<TodayIcon />}
							onClick={handleToday}
							sx={{ borderRadius: 2, fontWeight: 600 }}
						>
							Hôm nay
						</Button>
						<IconButton onClick={handleNext} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
							<ChevronRightIcon />
						</IconButton>

						<Typography variant="h6" sx={{ fontWeight: 700, ml: 1.5, minWidth: 200 }}>
							{currentTitle}
						</Typography>
					</Box>

					{/* View Switchers */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Button
							variant={currentView === 'dayGridMonth' ? 'contained' : 'outlined'}
							size="small"
							startIcon={<CalendarMonthIcon fontSize="small" />}
							onClick={() => handleChangeView('dayGridMonth')}
							sx={{ borderRadius: 2 }}
						>
							Tháng
						</Button>
						<Button
							variant={currentView === 'timeGridWeek' ? 'contained' : 'outlined'}
							size="small"
							startIcon={<ViewWeekIcon fontSize="small" />}
							onClick={() => handleChangeView('timeGridWeek')}
							sx={{ borderRadius: 2 }}
						>
							Tuần
						</Button>
						<Button
							variant={currentView === 'timeGridDay' ? 'contained' : 'outlined'}
							size="small"
							startIcon={<ViewDayIcon fontSize="small" />}
							onClick={() => handleChangeView('timeGridDay')}
							sx={{ borderRadius: 2 }}
						>
							Ngày
						</Button>
					</Box>

					{/* Category & Status Filters */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<FormControl size="small" sx={{ minWidth: 170 }}>
							<InputLabel>Loại lịch hẹn</InputLabel>
							<Select
								value={selectedCategory}
								label="Loại lịch hẹn"
								onChange={(e) => setSelectedCategory(e.target.value)}
							>
								<MenuItem value="all">Tất cả loại hẹn</MenuItem>
								<MenuItem value="delivery">🚚 Giao hàng hẹn giờ</MenuItem>
								<MenuItem value="consultation">💬 Tư vấn VIP</MenuItem>
								<MenuItem value="warranty">🛠 Bảo hành kỹ thuật</MenuItem>
								<MenuItem value="showroom">🏬 Trải nghiệm Showroom</MenuItem>
							</Select>
						</FormControl>

						<FormControl size="small" sx={{ minWidth: 150 }}>
							<InputLabel>Trạng thái</InputLabel>
							<Select
								value={selectedStatus}
								label="Trạng thái"
								onChange={(e) => setSelectedStatus(e.target.value)}
							>
								<MenuItem value="all">Tất cả trạng thái</MenuItem>
								<MenuItem value="pending">Chờ xác nhận</MenuItem>
								<MenuItem value="confirmed">Đã xác nhận</MenuItem>
								<MenuItem value="completed">Hoàn tất</MenuItem>
								<MenuItem value="cancelled">Đã hủy</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>
			</Paper>

			{/* Main Calendar Viewport */}
			<Paper
				variant="outlined"
				sx={{
					p: 2,
					borderRadius: 3,
					flex: 1,
					minHeight: 0,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					'& .fc': {
						height: '100%',
						fontFamily: 'inherit'
					},
					'& .fc-header-toolbar': {
						display: 'none' // Custom header is used
					},
					'& .fc-daygrid-day-number': {
						fontWeight: 600,
						p: 1
					},
					'& .fc-event': {
						cursor: 'pointer',
						borderRadius: 1.5,
						px: 0.5,
						py: 0.25,
						boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
						fontSize: '0.82rem',
						fontWeight: 500,
						border: 'none !important'
					}
				}}
			>
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					events={calendarEvents}
					eventClick={handleEventClick}
					dateClick={(info) => handleOpenCreate(info.dateStr)}
					editable={true}
					selectable={true}
					dayMaxEvents={3}
					locale="vi"
					headerToolbar={false}
					slotMinTime="07:00:00"
					slotMaxTime="22:00:00"
				/>
			</Paper>

			{/* Booking Details Modal */}
			<Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				{selectedEvent && (
					<>
						<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Chip
									label={CATEGORIES[selectedEvent.category]?.label}
									sx={{
										bgcolor: CATEGORIES[selectedEvent.category]?.color,
										color: 'white',
										fontWeight: 700
									}}
									size="small"
								/>
								<Chip
									label={STATUS_LABELS[selectedEvent.status].label}
									color={STATUS_LABELS[selectedEvent.status].color}
									size="small"
								/>
							</Box>
							<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
								Mã: {selectedEvent.id}
							</Typography>
						</DialogTitle>

						<DialogContent dividers>
							<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
								{selectedEvent.title}
							</Typography>

							<Stack spacing={2}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<AccessTimeIcon color="action" />
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{new Date(selectedEvent.start).toLocaleString('vi-VN')} — {new Date(selectedEvent.end).toLocaleTimeString('vi-VN')}
										</Typography>
									</Box>
								</Box>

								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<PersonIcon color="action" />
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{selectedEvent.customerName}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Khách hàng đặt lịch
										</Typography>
									</Box>
								</Box>

								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<PhoneIcon color="action" />
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{selectedEvent.customerPhone}
										</Typography>
									</Box>
								</Box>

								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<LocationOnIcon color="action" />
									<Box>
										<Typography variant="body2">
											{selectedEvent.location}
										</Typography>
									</Box>
								</Box>

								{selectedEvent.orderReference && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Typography variant="caption" sx={{ fontWeight: 700, bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
											Đơn Hàng Gốc: {selectedEvent.orderReference}
										</Typography>
									</Box>
								)}

								{selectedEvent.notes && (
									<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'grey.50' }}>
										<Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
											Ghi chú đặc biệt:
										</Typography>
										<Typography variant="body2">
											{selectedEvent.notes}
										</Typography>
									</Paper>
								)}

								{/* Quick Status Action Controls */}
								<Box sx={{ pt: 1 }}>
									<Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
										Cập nhật trạng thái xử lý:
									</Typography>
									<Stack direction="row" spacing={1}>
										<Button
											size="small"
											variant={selectedEvent.status === 'confirmed' ? 'contained' : 'outlined'}
											color="primary"
											onClick={() => handleUpdateStatus(selectedEvent.id, 'confirmed')}
											sx={{ borderRadius: 2 }}
										>
											Xác Nhận
										</Button>
										<Button
											size="small"
											variant={selectedEvent.status === 'completed' ? 'contained' : 'outlined'}
											color="success"
											onClick={() => handleUpdateStatus(selectedEvent.id, 'completed')}
											sx={{ borderRadius: 2 }}
										>
											Hoàn Tất
										</Button>
										<Button
											size="small"
											variant={selectedEvent.status === 'cancelled' ? 'contained' : 'outlined'}
											color="inherit"
											onClick={() => handleUpdateStatus(selectedEvent.id, 'cancelled')}
											sx={{ borderRadius: 2 }}
										>
											Hủy Hẹn
										</Button>
									</Stack>
								</Box>
							</Stack>
						</DialogContent>

						<DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
							<Button
								color="error"
								startIcon={<DeleteOutlineIcon />}
								onClick={() => handleDeleteBooking(selectedEvent.id)}
							>
								Xóa Lịch
							</Button>
							<Box sx={{ display: 'flex', gap: 1 }}>
								<Button variant="outlined" onClick={() => handleOpenEdit(selectedEvent)}>
									Chỉnh Sửa
								</Button>
								<Button variant="contained" onClick={() => setDetailsOpen(false)}>
									Đóng
								</Button>
							</Box>
						</DialogActions>
					</>
				)}
			</Dialog>

			{/* Create / Edit Booking Modal */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle sx={{ fontWeight: 800 }}>
					{editingEvent ? 'Chỉnh Sửa Lịch Hẹn & Đặt Chỗ' : 'Tạo Lịch Hẹn / Khung Giờ Mới'}
				</DialogTitle>

				<DialogContent dividers>
					<Stack spacing={2.5} sx={{ mt: 1 }}>
						<TextField
							label="Tiêu đề lịch hẹn / Nội dung"
							value={formTitle}
							onChange={(e) => setFormTitle(e.target.value)}
							fullWidth
							required
							placeholder="VD: Giao máy giặt kèm lắp đặt tại nhà"
						/>

						<Box sx={{ display: 'flex', gap: 2 }}>
							<FormControl fullWidth>
								<InputLabel>Loại lịch hẹn</InputLabel>
								<Select
									value={formCategory}
									label="Loại lịch hẹn"
									onChange={(e) => setFormCategory(e.target.value as any)}
								>
									<MenuItem value="delivery">🚚 Giao Hàng Hẹn Giờ</MenuItem>
									<MenuItem value="consultation">💬 Tư Vấn VIP & Sản Phẩm</MenuItem>
									<MenuItem value="warranty">🛠 Bảo Hành & Kỹ Thuật</MenuItem>
									<MenuItem value="showroom">🏬 Trải Nghiệm Showroom</MenuItem>
								</Select>
							</FormControl>

							<FormControl fullWidth>
								<InputLabel>Trạng thái</InputLabel>
								<Select
									value={formStatus}
									label="Trạng thái"
									onChange={(e) => setFormStatus(e.target.value as any)}
								>
									<MenuItem value="pending">Chờ xác nhận</MenuItem>
									<MenuItem value="confirmed">Đã xác nhận</MenuItem>
									<MenuItem value="completed">Hoàn tất</MenuItem>
									<MenuItem value="cancelled">Đã hủy</MenuItem>
								</Select>
							</FormControl>
						</Box>

						<Box sx={{ display: 'flex', gap: 2 }}>
							<TextField
								label="Tên khách hàng"
								value={formCustomerName}
								onChange={(e) => setFormCustomerName(e.target.value)}
								fullWidth
								required
								placeholder="Nguyễn Văn A"
							/>
							<TextField
								label="Số điện thoại"
								value={formCustomerPhone}
								onChange={(e) => setFormCustomerPhone(e.target.value)}
								fullWidth
								required
								placeholder="0988 xxx xxx"
							/>
						</Box>

						<TextField
							label="Địa điểm / Địa chỉ giao hàng / Phòng hẹn"
							value={formLocation}
							onChange={(e) => setFormLocation(e.target.value)}
							fullWidth
							placeholder="Số nhà, đường phố hoặc Showroom chỉ định"
						/>

						<Box sx={{ display: 'flex', gap: 2 }}>
							<TextField
								label="Ngày bắt đầu"
								type="date"
								value={formStartDate}
								onChange={(e) => setFormStartDate(e.target.value)}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								label="Giờ bắt đầu"
								type="time"
								value={formStartTime}
								onChange={(e) => setFormStartTime(e.target.value)}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Box>

						<Box sx={{ display: 'flex', gap: 2 }}>
							<TextField
								label="Ngày kết thúc"
								type="date"
								value={formEndDate}
								onChange={(e) => setFormEndDate(e.target.value)}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								label="Giờ kết thúc"
								type="time"
								value={formEndTime}
								onChange={(e) => setFormEndTime(e.target.value)}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Box>

						<TextField
							label="Mã đơn hàng liên kết (nếu có)"
							value={formOrderRef}
							onChange={(e) => setFormOrderRef(e.target.value)}
							fullWidth
							placeholder="VD: ORD-9921"
						/>

						<TextField
							label="Ghi chú thêm"
							value={formNotes}
							onChange={(e) => setFormNotes(e.target.value)}
							fullWidth
							multiline
							rows={2}
							placeholder="Yêu cầu riêng của khách hàng..."
						/>
					</Stack>
				</DialogContent>

				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setDialogOpen(false)}>Hủy</Button>
					<Button variant="contained" color="secondary" onClick={handleSaveBooking} sx={{ borderRadius: 2, fontWeight: 700 }}>
						{editingEvent ? 'Lưu Thay Đổi' : 'Xác Nhận Đặt Lịch'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
