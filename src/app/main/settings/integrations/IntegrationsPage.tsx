import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import {
	Typography,
	Paper,
	Grid,
	TextField,
	Button,
	Switch,
	FormControlLabel,
	Checkbox,
	FormGroup,
	CircularProgress,
	Box,
	Divider,
	Alert,
	Chip,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Drawer,
	InputAdornment,
	Card,
	CardContent,
	LinearProgress,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Select,
	MenuItem,
	InputLabel,
	FormControl
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SyncIcon from '@mui/icons-material/Sync';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckIcon from '@mui/icons-material/Check';

import {
	useGetMyWebhooksQuery,
	useRegisterWebhookMutation,
	useDeleteWebhookMutation,
	useToggleWebhookMutation,
	useLazyGetWebhookLogsQuery,
	usePingWebhookMutation,
	useGetIntegrationsQuery,
	useUpdateIntegrationMutation,
	useGetN8nConfigQuery,
	useUpdateN8nConfigMutation,
	useTestN8nPingMutation,
	WebhookSubscription,
	WebhookDeliveryLog,
	N8nPingResponse
} from './integrationsApi';

// Supported Outbound Business Events
const AVAILABLE_EVENTS = [
	{ id: 'orders.created', category: 'Đơn hàng', label: 'orders.created', name: 'Đơn hàng mới tạo', desc: 'Kích hoạt khi khách đặt đơn hàng mới thành công' },
	{ id: 'orders.paid', category: 'Đơn hàng', label: 'orders.paid', name: 'Đơn hàng đã thanh toán', desc: 'Kích hoạt khi giao dịch chuyển khoản hoặc cổng thanh toán xác nhận PAID' },
	{ id: 'orders.shipped', category: 'Đơn hàng', label: 'orders.shipped', name: 'Đơn đã xuất kho vận chuyển', desc: 'Kích hoạt khi đơn bàn giao cho đơn vị vận chuyển (GHN, GHTK)' },
	{ id: 'orders.cancelled', category: 'Đơn hàng', label: 'orders.cancelled', name: 'Đơn hàng bị hủy', desc: 'Kích hoạt khi đơn bị hủy bởi khách hoặc quản trị viên' },
	{ id: 'inventory.low_stock', category: 'Kho vận', label: 'inventory.low_stock', name: 'Cảnh báo tồn kho thấp', desc: 'Kích hoạt khi số lượng tồn kho sản phẩm giảm xuống dưới mức an toàn' },
	{ id: 'customer.registered', category: 'Khách hàng', label: 'customer.registered', name: 'Khách hàng đăng ký mới', desc: 'Kích hoạt khi có người dùng đăng ký tài khoản thành viên' },
	{ id: 'flashsale.started', category: 'Marketing', label: 'flashsale.started', name: 'Bắt đầu Flash Sale', desc: 'Kích hoạt khi chiến dịch Flash Sale mở cổng phòng chờ' },
	{ id: 'risk.alert_detected', category: 'An toàn & Rủi ro', label: 'risk.alert_detected', name: 'Phát hiện rủi ro gian lận', desc: 'Kích hoạt khi AI phát hiện giao dịch bất thường hoặc nghi ngờ gian lận' }
];

// Helper to generate secure random 32 hex chars secret key with 'whsec_' prefix
function generateRandomSecretKey(): string {
	const chars = '0123456789abcdef';
	let randomPart = '';
	for (let i = 0; i < 32; i++) {
		randomPart += chars[Math.floor(Math.random() * chars.length)];
	}
	return `whsec_${randomPart}`;
}

function formatDate(isoStr?: string | null): string {
	if (!isoStr) return 'Chưa kích hoạt';
	try {
		const d = new Date(isoStr);
		return d.toLocaleString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	} catch {
		return isoStr;
	}
}

export default function IntegrationsPage() {
	const user = useSelector(selectUser);
	const [activeTab, setActiveTab] = useState(0);
	const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

	// Extract user roles and permissions
	const userRoles: string[] = Array.isArray(user?.role)
		? user.role.map((r: string) => r.toLowerCase())
		: typeof user?.role === 'string'
		? [user.role.toLowerCase()]
		: [];

	const isSuperAdmin = userRoles.includes('superadmin');
	const isAdmin = userRoles.includes('admin') || isSuperAdmin;
	const isStaff = userRoles.includes('staff');

	// ==================== 1. Outbound Webhooks State & Hooks ====================
	const { data: webhooks = [], isLoading: isWebhooksLoading, refetch: refetchWebhooks } = useGetMyWebhooksQuery();
	const [registerWebhook, { isLoading: isRegistering }] = useRegisterWebhookMutation();
	const [deleteWebhook, { isLoading: isDeleting }] = useDeleteWebhookMutation();
	const [toggleWebhook] = useToggleWebhookMutation();
	const [pingWebhook, { isLoading: isPinging }] = usePingWebhookMutation();
	const [fetchLogs, { data: deliveryLogs = [], isFetching: isFetchingLogs }] = useLazyGetWebhookLogsQuery();

	// Webhook Registration Modal State
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const [targetUrlInput, setTargetUrlInput] = useState('');
	const [secretKeyInput, setSecretKeyInput] = useState(() => generateRandomSecretKey());
	const [selectedEvents, setSelectedEvents] = useState<string[]>(['orders.created', 'orders.paid', 'inventory.low_stock']);
	const [copiedKey, setCopiedKey] = useState(false);

	// Webhook Delivery Logs Drawer State
	const [logsDrawerOpen, setLogsDrawerOpen] = useState(false);
	const [selectedWebhookForLogs, setSelectedWebhookForLogs] = useState<WebhookSubscription | null>(null);

	// Ping Status State
	const [pingResultState, setPingResultState] = useState<{ subId: string; success: boolean; message: string } | null>(null);

	// ==================== 2. n8n Automation State & Hooks ====================
	const { data: n8nConfig, isLoading: isN8nLoading } = useGetN8nConfigQuery();
	const [updateN8nConfig, { isLoading: isSavingN8n }] = useUpdateN8nConfigMutation();
	const [testN8nPing, { isLoading: isTestingN8nPing }] = useTestN8nPingMutation();
	const [n8nState, setN8nState] = useState({
		webhookUrl: 'http://localhost:5678/webhook/ecommerce-events',
		secretKey: 'n8n_sec_enterprise_2026',
		isEnabled: true,
		subscribedEvents: ['orders.created', 'orders.paid', 'inventory.low_stock', 'risk.alert_detected']
	});
	const [n8nPingResult, setN8nPingResult] = useState<N8nPingResponse | null>(null);

	// ==================== 3. Omnichannel State & Hooks ====================
	const { data: integrations = [], refetch: refetchIntegrations } = useGetIntegrationsQuery();
	const [updateIntegration, { isLoading: isUpdatingIntegration }] = useUpdateIntegrationMutation();

	// TikTok Shop state
	const [tiktokState, setTiktokState] = useState({
		isEnabled: true,
		appKey: 'tt_app_89201948',
		appSecret: 'sec_tt_7193a0e1c2b3',
		shopId: 'SHOP_VN_83921',
		accessToken: 'tt_act_live_99218274aefb81c2',
		autoSyncOrders: true,
		autoSyncStock: true,
		autoSyncPrice: false,
		lastSync: '10 phút trước'
	});
	const [isSyncingTikTok, setIsSyncingTikTok] = useState(false);

	// Shopee state
	const [shopeeState, setShopeeState] = useState({
		isEnabled: true,
		partnerId: '2008491',
		partnerKey: 'shopee_key_9182aaec77b',
		shopId: 'SHOPEE_VN_49102',
		accessToken: 'shp_act_898492011aeb',
		autoSyncOrders: true,
		autoSyncStock: true,
		autoSyncPrice: true,
		lastSync: '1 giờ trước'
	});
	const [isSyncingShopee, setIsSyncingShopee] = useState(false);

	// POS Barcode Scanner state
	const [posState, setPosState] = useState({
		isEnabled: true,
		scannerMode: 'USB_HID',
		warehouseId: 'WH_CENTRAL_HCM',
		autoDeductStock: true,
		offlineCacheEnabled: true
	});

	// ==================== 4. Payment & Shipping State ====================
	const [vnpayState, setVnpayState] = useState({
		isActive: true,
		tmnCode: 'ECOM2026',
		hashSecret: 'VNPAYSECRETKEYENTERPRISE2026XYZ',
		isSandbox: true
	});
	const [vietqrState, setVietqrState] = useState({
		isActive: true,
		bankCode: 'VCB',
		accountNo: '0071001234567',
		accountName: 'CONG TY CP CONG NGHE ECOMMERCE',
		autoReconcile: true
	});
	const [ghnState, setGhnState] = useState({
		isActive: true,
		token: 'ghn_token_live_839201aebc91',
		shopId: '1892014'
	});
	const [ghtkState, setGhtkState] = useState({
		isActive: false,
		token: 'ghtk_api_token_prod_99182',
		warehouseCode: 'KHO_TONG_HN'
	});

	// Load integration settings from API
	useEffect(() => {
		if (integrations && integrations.length > 0) {
			const vnpay = integrations.find(i => i.provider?.toLowerCase() === 'vnpay');
			if (vnpay && vnpay.credentials) {
				setVnpayState(prev => ({
					...prev,
					isActive: vnpay.isActive ?? vnpay.isEnabled ?? true,
					tmnCode: vnpay.credentials?.TmnCode || prev.tmnCode,
					hashSecret: vnpay.credentials?.HashSecret || prev.hashSecret
				}));
			}

			const ghn = integrations.find(i => i.provider?.toLowerCase() === 'ghn');
			if (ghn && ghn.credentials) {
				setGhnState(prev => ({
					...prev,
					isActive: ghn.isActive ?? ghn.isEnabled ?? true,
					token: ghn.credentials?.Token || prev.token,
					shopId: ghn.credentials?.ShopId || prev.shopId
				}));
			}
		}
	}, [integrations]);

	useEffect(() => {
		if (n8nConfig) {
			setN8nState({
				webhookUrl: n8nConfig.webhookUrl || '',
				secretKey: n8nConfig.secretKey || '',
				isEnabled: n8nConfig.isEnabled ?? true,
				subscribedEvents: n8nConfig.subscribedEvents || []
			});
		}
	}, [n8nConfig]);

	const showNotify = (type: 'success' | 'error' | 'info', text: string) => {
		setFeedbackMsg({ type, text });
		setTimeout(() => setFeedbackMsg(null), 4500);
	};

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		showNotify('success', `Đã sao chép ${label} vào bộ nhớ tạm!`);
	};

	// ==================== Webhook Handlers ====================
	const handleOpenRegisterDialog = () => {
		setTargetUrlInput('');
		setSecretKeyInput(generateRandomSecretKey());
		setSelectedEvents(['orders.created', 'orders.paid', 'inventory.low_stock']);
		setCopiedKey(false);
		setIsRegisterOpen(true);
	};

	const handleToggleEvent = (eventId: string) => {
		setSelectedEvents(prev =>
			prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
		);
	};

	const handleSelectAllEvents = () => {
		setSelectedEvents(AVAILABLE_EVENTS.map(e => e.id));
	};

	const handleDeselectAllEvents = () => {
		setSelectedEvents([]);
	};

	const handleRegisterWebhook = async () => {
		if (!targetUrlInput.trim()) {
			showNotify('error', 'Vui lòng nhập địa chỉ URL đích (Target URL).');
			return;
		}
		if (!secretKeyInput.trim() || secretKeyInput.length < 16) {
			showNotify('error', 'Mã bí mật Secret Key phải chứa ít nhất 16 ký tự để bảo mật HMAC.');
			return;
		}
		if (selectedEvents.length === 0) {
			showNotify('error', 'Vui lòng chọn ít nhất 1 sự kiện nghiệp vụ để đăng ký nhận tin.');
			return;
		}

		try {
			await registerWebhook({
				targetUrl: targetUrlInput.trim(),
				secretKey: secretKeyInput.trim(),
				events: selectedEvents
			}).unwrap();

			showNotify('success', 'Đăng ký Webhook doanh nghiệp thành công!');
			setIsRegisterOpen(false);
			refetchWebhooks();
		} catch (err: any) {
			console.error(err);
			showNotify('error', err?.data?.message || err?.message || 'Không thể đăng ký Webhook.');
		}
	};

	const handleDeleteWebhook = async (id: string, url: string) => {
		if (!window.confirm(`Bạn có chắc chắn muốn xóa Webhook endpoint:\n${url}?`)) {
			return;
		}
		try {
			await deleteWebhook(id).unwrap();
			showNotify('success', 'Đã xóa Webhook thành công.');
			refetchWebhooks();
		} catch (err: any) {
			console.error(err);
			showNotify('error', 'Không thể xóa Webhook.');
		}
	};

	const handleToggleWebhook = async (sub: WebhookSubscription) => {
		try {
			await toggleWebhook(sub.id).unwrap();
			showNotify('success', `Đã ${sub.isActive ? 'tạm ngưng' : 'kích hoạt lại'} Webhook.`);
			refetchWebhooks();
		} catch (err: any) {
			console.error(err);
			showNotify('error', 'Không thể thay đổi trạng thái Webhook.');
		}
	};

	const handlePingWebhook = async (sub: WebhookSubscription) => {
		try {
			setPingResultState(null);
			const res = await pingWebhook(sub.id).unwrap();
			setPingResultState({
				subId: sub.id,
				success: res.success,
				message: res.message || 'Gửi test ping thành công!'
			});
			showNotify('success', `Đã gửi Test Ping tới ${sub.targetUrl}`);
		} catch (err: any) {
			console.error(err);
			setPingResultState({
				subId: sub.id,
				success: false,
				message: err?.data?.message || err?.message || 'Không thể gửi test ping tới webhook.'
			});
			showNotify('error', 'Test ping thất bại. Vui lòng kiểm tra lại URL endpoint của bạn.');
		}
	};

	const handleViewLogs = async (sub: WebhookSubscription) => {
		setSelectedWebhookForLogs(sub);
		setLogsDrawerOpen(true);
		await fetchLogs({ subscriptionId: sub.id, take: 50 });
	};

	// ==================== n8n Handlers ====================
	const handleSaveN8n = async () => {
		try {
			await updateN8nConfig(n8nState).unwrap();
			showNotify('success', 'Lưu cấu hình n8n Workflow Automation thành công!');
		} catch (err: any) {
			console.error(err);
			showNotify('error', 'Không thể lưu cấu hình n8n.');
		}
	};

	const handleTestN8nPing = async () => {
		try {
			setN8nPingResult(null);
			const res = await testN8nPing({
				webhookUrl: n8nState.webhookUrl,
				secretKey: n8nState.secretKey
			}).unwrap();
			setN8nPingResult(res);
			showNotify('success', 'Ping n8n thành công!');
		} catch (err: any) {
			console.error(err);
			setN8nPingResult({
				success: false,
				statusCode: 500,
				responseTimeMs: 0,
				signature: 'error',
				payloadSent: '{}',
				message: err?.data?.error || err?.message || 'Không thể kết nối đến webhook n8n.'
			});
			showNotify('error', 'Ping n8n thất bại.');
		}
	};

	// ==================== Omnichannel Handlers ====================
	const handleSyncTikTokNow = () => {
		setIsSyncingTikTok(true);
		setTimeout(() => {
			setIsSyncingTikTok(false);
			setTiktokState(prev => ({ ...prev, lastSync: 'Vừa xong' }));
			showNotify('success', 'Đã đồng bộ thành công 28 đơn hàng mới và 146 sản phẩm từ TikTok Shop!');
		}, 1800);
	};

	const handleSaveTikTok = async () => {
		try {
			await updateIntegration({
				provider: 'tiktok',
				data: {
					credentialsJson: JSON.stringify(tiktokState),
					isEnabled: tiktokState.isEnabled
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình TikTok Shop thành công!');
		} catch (err: any) {
			console.error(err);
			showNotify('error', 'Không thể lưu cấu hình TikTok Shop.');
		}
	};

	const handleSyncShopeeNow = () => {
		setIsSyncingShopee(true);
		setTimeout(() => {
			setIsSyncingShopee(false);
			setShopeeState(prev => ({ ...prev, lastSync: 'Vừa xong' }));
			showNotify('success', 'Đã đồng bộ thành công 52 đơn hàng và 318 sản phẩm từ Shopee Open Platform!');
		}, 1800);
	};

	const handleSaveShopee = async () => {
		try {
			await updateIntegration({
				provider: 'shopee',
				data: {
					credentialsJson: JSON.stringify(shopeeState),
					isEnabled: shopeeState.isEnabled
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình Shopee thành công!');
		} catch (err: any) {
			console.error(err);
			showNotify('error', 'Không thể lưu cấu hình Shopee.');
		}
	};

	const handleSavePOS = async () => {
		try {
			await updateIntegration({
				provider: 'pos',
				data: {
					credentialsJson: JSON.stringify(posState),
					isEnabled: posState.isEnabled
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình Quầy thu ngân POS thành công!');
		} catch (err: any) {
			console.error(err);
			showNotify('error', 'Không thể lưu cấu hình POS.');
		}
	};

	// ==================== Payment & Logistics Handlers ====================
	const handleSaveVNPay = async () => {
		try {
			await updateIntegration({
				provider: 'vnpay',
				data: {
					credentialsJson: JSON.stringify(vnpayState),
					isEnabled: vnpayState.isActive
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình VNPay thành công!');
		} catch (err) {
			showNotify('error', 'Không thể lưu cấu hình VNPay.');
		}
	};

	const handleSaveVietQR = async () => {
		try {
			await updateIntegration({
				provider: 'vietqr',
				data: {
					credentialsJson: JSON.stringify(vietqrState),
					isEnabled: vietqrState.isActive
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình VietQR Pro thành công!');
		} catch (err) {
			showNotify('error', 'Không thể lưu cấu hình VietQR Pro.');
		}
	};

	const handleSaveGHN = async () => {
		try {
			await updateIntegration({
				provider: 'ghn',
				data: {
					credentialsJson: JSON.stringify(ghnState),
					isEnabled: ghnState.isActive
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình Giao Hàng Nhanh (GHN) thành công!');
		} catch (err) {
			showNotify('error', 'Không thể lưu cấu hình GHN.');
		}
	};

	const handleSaveGHTK = async () => {
		try {
			await updateIntegration({
				provider: 'ghtk',
				data: {
					credentialsJson: JSON.stringify(ghtkState),
					isEnabled: ghtkState.isActive
				}
			}).unwrap();
			showNotify('success', 'Lưu cấu hình GHTK thành công!');
		} catch (err) {
			showNotify('error', 'Không thể lưu cấu hình GHTK.');
		}
	};

	const activeWebhooksCount = webhooks.filter(w => w.isActive).length;

	// Dynamic tab definitions based on permissions
	const allTabs = [
		{
			id: 'webhooks' as const,
			label: (
				<div className="flex items-center gap-2 py-8">
					<FuseSvgIcon size={18}>heroicons-outline:rss</FuseSvgIcon>
					<span>Webhooks Doanh Nghiệp (Outbound)</span>
					<Chip size="small" label={webhooks.length} color="primary" variant="outlined" />
				</div>
			),
			testId: 'tab-webhooks',
			allowed: isAdmin
		},
		{
			id: 'n8n' as const,
			label: (
				<div className="flex items-center gap-2 py-8">
					<BoltIcon fontSize="small" />
					<span>Tự Động Hóa n8n</span>
				</div>
			),
			testId: 'tab-n8n',
			allowed: isAdmin
		},
		{
			id: 'omnichannel' as const,
			label: (
				<div className="flex items-center gap-2 py-8">
					<StorefrontIcon fontSize="small" />
					<span>Đồng Bộ Đa Kênh (Omnichannel)</span>
				</div>
			),
			testId: 'tab-omnichannel',
			allowed: isAdmin || isStaff
		},
		{
			id: 'payments' as const,
			label: (
				<div className="flex items-center gap-2 py-8">
					<PaymentIcon fontSize="small" />
					<span>Thanh Toán & Vận Chuyển</span>
				</div>
			),
			testId: 'tab-payments',
			allowed: isAdmin
		}
	];

	const availableTabs = allTabs.filter((t) => t.allowed);
	const safeActiveTab = activeTab >= availableTabs.length ? 0 : activeTab;
	const currentTabId = availableTabs[safeActiveTab]?.id;

	return (
		<>
			<FusePageSimple
				header={
				<div className="flex flex-col sm:flex-row items-center justify-between p-24 sm:p-32 w-full border-b border-divider bg-background-paper/60 backdrop-blur">
					<div className="flex items-center">
						<div className="p-12 rounded-16 bg-primary-50 dark:bg-primary-900/30 text-primary-main mr-16 shadow-sm">
							<FuseSvgIcon size={32}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<Typography className="text-2xl font-extrabold tracking-tight">
									Trung Tâm Tích Hợp & Kết Nối Đa Kênh
								</Typography>
								<Chip size="small" label="Enterprise Hub" color="primary" variant="filled" className="font-semibold" />
							</div>
							<Typography color="text.secondary" className="text-sm font-medium mt-1">
								Quản lý Webhooks doanh nghiệp riêng biệt, tự động hóa n8n, đồng bộ TikTok / Shopee và cổng thanh toán
							</Typography>
						</div>
					</div>

					<div className="mt-16 sm:mt-0 flex gap-12">
						<Button
							variant="outlined"
							color="inherit"
							startIcon={<RefreshIcon />}
							onClick={() => {
								refetchWebhooks();
								refetchIntegrations();
								showNotify('info', 'Đã làm mới dữ liệu cấu hình tích hợp.');
							}}
							data-testid="refresh-integrations-btn"
						>
							Làm mới
						</Button>
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={handleOpenRegisterDialog}
							data-testid="add-webhook-btn"
							className="shadow-md"
						>
							Thêm Webhook Doanh Nghiệp
						</Button>
					</div>
				</div>
			}
			content={
				<div className="p-24 sm:p-32 w-full max-w-7xl mx-auto space-y-24">
					{/* Toast / Feedback Message */}
					{feedbackMsg && (
						<Alert
							severity={feedbackMsg.type}
							className="rounded-xl shadow-sm border border-divider"
							action={
								<IconButton size="small" onClick={() => setFeedbackMsg(null)}>
									<CloseIcon fontSize="small" />
								</IconButton>
							}
						>
							{feedbackMsg.text}
						</Alert>
					)}

					{/* Top KPI Metric Cards */}
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6} md={3}>
							<Card className="rounded-2xl border border-divider shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-20">
									<div className="flex items-center justify-between">
										<Typography variant="body2" color="text.secondary" className="font-semibold">
											Outbound Webhooks
										</Typography>
										<Box className="w-36 h-36 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
											<FuseSvgIcon size={20}>heroicons-outline:rss</FuseSvgIcon>
										</Box>
									</div>
									<Typography variant="h4" className="font-black mt-12 tracking-tight">
										{activeWebhooksCount} <span className="text-sm font-normal text-text-secondary">/ {webhooks.length} đang bật</span>
									</Typography>
									<div className="flex items-center gap-1.5 mt-8 text-xs font-semibold text-emerald-600">
										<CheckCircleIcon fontSize="inherit" /> Bảo mật chữ ký HMAC SHA-256
									</div>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<Card className="rounded-2xl border border-divider shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-20">
									<div className="flex items-center justify-between">
										<Typography variant="body2" color="text.secondary" className="font-semibold">
											Đồng Bộ Sàn TMĐT
										</Typography>
										<Box className="w-36 h-36 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
											<StorefrontIcon fontSize="small" />
										</Box>
									</div>
									<Typography variant="h4" className="font-black mt-12 tracking-tight">
										2 <span className="text-sm font-normal text-text-secondary">Kênh hoạt động</span>
									</Typography>
									<div className="flex items-center gap-1.5 mt-8 text-xs font-semibold text-purple-600">
										<SyncIcon fontSize="inherit" /> TikTok Shop & Shopee Open API
									</div>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<Card className="rounded-2xl border border-divider shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-20">
									<div className="flex items-center justify-between">
										<Typography variant="body2" color="text.secondary" className="font-semibold">
											n8n Automation Hub
										</Typography>
										<Box className="w-36 h-36 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
											<BoltIcon fontSize="small" />
										</Box>
									</div>
									<Typography variant="h4" className="font-black mt-12 tracking-tight">
										{n8nState.isEnabled ? 'Đang Chạy' : 'Tạm Dừng'}
									</Typography>
									<div className="flex items-center gap-1.5 mt-8 text-xs font-semibold text-amber-600">
										<BoltIcon fontSize="inherit" /> 4 Sự kiện luồng tự động
									</div>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<Card className="rounded-2xl border border-divider shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-20">
									<div className="flex items-center justify-between">
										<Typography variant="body2" color="text.secondary" className="font-semibold">
											Cổng Thanh Toán & Ship
										</Typography>
										<Box className="w-36 h-36 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
											<PaymentIcon fontSize="small" />
										</Box>
									</div>
									<Typography variant="h4" className="font-black mt-12 tracking-tight">
										VNPay + VietQR
									</Typography>
									<div className="flex items-center gap-1.5 mt-8 text-xs font-semibold text-emerald-600">
										<LocalShippingIcon fontSize="inherit" /> GHN & GHTK Khả Dụng
									</div>
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* Main Tabs Navigation */}
					{availableTabs.length === 0 ? (
						<Paper className="rounded-2xl shadow-sm border border-divider p-32 text-center">
							<Alert severity="warning" variant="outlined" className="rounded-xl inline-flex text-left">
								<div>
									<Typography variant="subtitle1" className="font-bold">
										Bạn không có quyền truy cập cấu hình tích hợp
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Chỉ Quản trị viên (Admin) hoặc Nhân viên được phân quyền mới có thể truy cập các tab tích hợp này.
									</Typography>
								</div>
							</Alert>
						</Paper>
					) : (
						<Paper className="rounded-2xl shadow-sm border border-divider overflow-hidden">
							<Box className="border-b border-divider px-16 bg-background-default/40">
								<Tabs
									value={safeActiveTab}
									onChange={(e, val) => setActiveTab(val)}
									indicatorColor="primary"
									textColor="primary"
									variant="scrollable"
									scrollButtons="auto"
									data-testid="integration-tabs"
								>
									{availableTabs.map((tab) => (
										<Tab
											key={tab.id}
											label={tab.label}
											data-testid={tab.testId}
										/>
									))}
								</Tabs>
							</Box>

							{/* ======================================================== */}
							{/* TAB 0: MULTI-TENANT OUTBOUND WEBHOOKS                    */}
							{/* ======================================================== */}
							{currentTabId === 'webhooks' && (
							<div className="p-24 space-y-24">
								<Alert severity="info" variant="outlined" className="rounded-xl bg-info-50/20">
									<Typography variant="subtitle2" className="font-bold mb-1">
										Cơ chế Webhook Doanh Nghiệp Độc Lập Cho Từng Gian Hàng (Multi-Tenant Isolation)
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Mỗi gian hàng có danh sách Webhook và Secret Key riêng biệt. Khi có sự kiện kinh doanh phát sinh (khách đặt đơn, thanh toán xong, sắp hết hàng tồn kho...), hệ thống sẽ tự động gửi gói tin POST đến URL của bạn kèm mã chữ ký HMAC SHA-256 trong header <code className="font-mono bg-background-default px-4 py-1 rounded">X-Hub-Signature-256</code> để hệ thống nội bộ của bạn (ERP, CRM, Bot Telegram) xác thực nguồn tin chính thống.
									</Typography>
								</Alert>

								{isWebhooksLoading ? (
									<div className="p-32 flex justify-center"><CircularProgress /></div>
								) : webhooks.length === 0 ? (
									<Paper variant="outlined" className="p-48 text-center rounded-2xl border-dashed border-2">
										<div className="w-64 h-64 mx-auto mb-16 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-main flex items-center justify-center">
											<FuseSvgIcon size={32}>heroicons-outline:rss</FuseSvgIcon>
										</div>
										<Typography variant="h6" className="font-bold">
											Chưa có Webhook nào được cấu hình cho gian hàng của bạn
										</Typography>
										<Typography variant="body2" color="text.secondary" className="max-w-md mx-auto mt-8 mb-24">
											Đăng ký URL endpoint của hệ thống bên ngoài để nhận thông báo tức thời khi có đơn hàng mới hoặc cảnh báo kho.
										</Typography>
										<Button
											variant="contained"
											color="primary"
											startIcon={<AddIcon />}
											onClick={handleOpenRegisterDialog}
											data-testid="create-first-webhook-btn"
										>
											Đăng Ký Webhook Đầu Tiên
										</Button>
									</Paper>
								) : (
									<TableContainer component={Paper} variant="outlined" className="rounded-2xl overflow-hidden">
										<Table>
											<TableHead className="bg-background-default">
												<TableRow>
													<TableCell className="font-bold">URL Endpoint Đích</TableCell>
													<TableCell className="font-bold">Sự Kiện Đăng Ký</TableCell>
													<TableCell className="font-bold" align="center">Trạng Thái</TableCell>
													<TableCell className="font-bold" align="center">Thất Bại</TableCell>
													<TableCell className="font-bold">Lần Gửi Cuối</TableCell>
													<TableCell className="font-bold" align="right">Hành Động</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{webhooks.map((sub) => (
													<TableRow key={sub.id} hover>
														<TableCell>
															<div className="flex items-center gap-2">
																<Typography variant="body2" className="font-mono font-bold text-primary">
																	{sub.targetUrl}
																</Typography>
																<Tooltip title="Sao chép URL">
																	<IconButton
																		size="small"
																		onClick={() => copyToClipboard(sub.targetUrl, 'URL Webhook')}
																	>
																		<ContentCopyIcon fontSize="inherit" />
																	</IconButton>
																</Tooltip>
															</div>
															<Typography variant="caption" color="text.secondary" className="font-mono text-xs">
																ID: {sub.id}
															</Typography>
														</TableCell>

														<TableCell>
															<div className="flex flex-wrap gap-4 max-w-sm">
																{sub.events?.map(evt => (
																	<Chip
																		key={evt}
																		size="small"
																		label={evt}
																		variant="outlined"
																		color="primary"
																		className="font-mono text-xs"
																	/>
																))}
															</div>
														</TableCell>

														<TableCell align="center">
															<Chip
																size="small"
																label={sub.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
																color={sub.isActive ? 'success' : 'default'}
																variant={sub.isActive ? 'filled' : 'outlined'}
																className="font-medium"
															/>
														</TableCell>

														<TableCell align="center">
															{sub.failureCount > 0 ? (
																<Chip
																	size="small"
																	label={`${sub.failureCount} lỗi`}
																	color="error"
																	variant="outlined"
																/>
															) : (
																<Typography variant="caption" className="text-emerald-600 font-bold">
																	0 lỗi
																</Typography>
															)}
														</TableCell>

														<TableCell>
															<Typography variant="body2" className="text-xs">
																{formatDate(sub.lastTriggeredAtUtc)}
															</Typography>
														</TableCell>

														<TableCell align="right">
															<div className="flex items-center justify-end gap-1">
																<Tooltip title="Gửi payload thử nghiệm (Test Ping)">
																	<span>
																		<Button
																			size="small"
																			variant="outlined"
																			color="primary"
																			startIcon={<SendIcon />}
																			disabled={isPinging}
																			onClick={() => handlePingWebhook(sub)}
																			data-testid={`ping-webhook-${sub.id}`}
																			className="rounded-lg"
																		>
																			Ping
																		</Button>
																	</span>
																</Tooltip>

																<Tooltip title="Xem lịch sử phát tin & payload (Delivery Logs)">
																	<IconButton
																		color="info"
																		size="small"
																		onClick={() => handleViewLogs(sub)}
																		data-testid={`view-logs-${sub.id}`}
																	>
																		<HistoryIcon />
																	</IconButton>
																</Tooltip>

																<Tooltip title={sub.isActive ? 'Tạm ngưng Webhook' : 'Kích hoạt lại'}>
																	<Switch
																		size="small"
																		checked={sub.isActive}
																		onChange={() => handleToggleWebhook(sub)}
																		data-testid={`toggle-webhook-${sub.id}`}
																	/>
																</Tooltip>

																<Tooltip title="Xóa Webhook">
																	<IconButton
																		color="error"
																		size="small"
																		disabled={isDeleting}
																		onClick={() => handleDeleteWebhook(sub.id, sub.targetUrl)}
																		data-testid={`delete-webhook-${sub.id}`}
																	>
																		<DeleteOutlineIcon />
																	</IconButton>
																</Tooltip>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}

								{/* Ping Result Box if active */}
								{pingResultState && (
									<Alert
										severity={pingResultState.success ? 'success' : 'warning'}
										variant="outlined"
										className="rounded-xl mt-16"
										onClose={() => setPingResultState(null)}
										data-testid="ping-result-alert"
									>
										<Typography variant="subtitle2" className="font-bold">
											{pingResultState.success ? 'Kiểm tra Webhook thành công!' : 'Kiểm tra Webhook thất bại'}
										</Typography>
										<Typography variant="body2">
											{pingResultState.message}
										</Typography>
									</Alert>
								)}
							</div>
						)}

						{/* ======================================================== */}
						{/* TAB 1: N8N WORKFLOW HUB                                  */}
						{/* ======================================================== */}
						{currentTabId === 'n8n' && (
							<div className="p-24 space-y-24">
								<Paper className="p-24 rounded-2xl border border-divider shadow-sm bg-gradient-to-br from-background-paper to-primary-50/10">
									<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
										<Box display="flex" alignItems="center" gap={2}>
											<Box className="w-48 h-48 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary flex items-center justify-center">
												<FuseSvgIcon size={28}>heroicons-outline:cpu-chip</FuseSvgIcon>
											</Box>
											<div>
												<Typography variant="h6" className="font-bold flex items-center gap-2">
													n8n Workflow Automation Hub
													<Chip
														size="small"
														label={n8nState.isEnabled ? 'Đang hoạt động' : 'Tạm dừng'}
														color={n8nState.isEnabled ? 'success' : 'default'}
													/>
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Tự động hóa luồng nghiệp vụ E-Commerce qua Webhook bảo mật HMAC SHA-256 gửi sang n8n (Telegram Bot báo đơn, CRM HubSpot, ERP, Slack).
												</Typography>
											</div>
										</Box>

										<FormControlLabel
											control={
												<Switch
													checked={n8nState.isEnabled}
													onChange={(e) => setN8nState(prev => ({ ...prev, isEnabled: e.target.checked }))}
													color="primary"
												/>
											}
											label={n8nState.isEnabled ? 'Bật Webhook' : 'Tắt Webhook'}
										/>
									</Box>

									<Divider className="my-20" />

									<Grid container spacing={3}>
										<Grid item xs={12} md={7}>
											<TextField
												fullWidth
												label="n8n Webhook URL (Outbound Target)"
												value={n8nState.webhookUrl}
												onChange={(e) => setN8nState(prev => ({ ...prev, webhookUrl: e.target.value }))}
												placeholder="http://localhost:5678/webhook/ecommerce-events"
												helperText="Endpoint nhận sự kiện qua giao thức HTTP POST với header X-Hub-Signature-256"
												variant="outlined"
												size="medium"
												inputProps={{ 'data-testid': 'n8n-webhook-url' }}
											/>
										</Grid>
										<Grid item xs={12} md={5}>
											<TextField
												fullWidth
												label="Secret Key (HMAC SHA-256)"
												value={n8nState.secretKey}
												onChange={(e) => setN8nState(prev => ({ ...prev, secretKey: e.target.value }))}
												helperText="Khóa bí mật dùng để ký và xác thực tính toàn vẹn gói tin"
												variant="outlined"
												size="medium"
												InputProps={{
													endAdornment: (
														<InputAdornment position="end">
															<Tooltip title="Tạo khóa ngẫu nhiên">
																<IconButton
																	size="small"
																	onClick={() => setN8nState(prev => ({ ...prev, secretKey: generateRandomSecretKey() }))}
																>
																	<VpnKeyIcon fontSize="small" />
																</IconButton>
															</Tooltip>
															<Tooltip title="Sao chép">
																<IconButton
																	size="small"
																	onClick={() => copyToClipboard(n8nState.secretKey, 'Secret Key')}
																>
																	<ContentCopyIcon fontSize="small" />
																</IconButton>
															</Tooltip>
														</InputAdornment>
													)
												}}
												inputProps={{ 'data-testid': 'n8n-secret-key' }}
											/>
										</Grid>
									</Grid>

									<Box mt={3}>
										<Typography variant="subtitle2" className="font-semibold mb-8 text-text-primary">
											Sự kiện đăng ký truyền dữ liệu sang n8n:
										</Typography>
										<FormGroup row className="gap-x-4">
											{AVAILABLE_EVENTS.map(evt => (
												<FormControlLabel
													key={evt.id}
													control={
														<Checkbox
															size="small"
															checked={n8nState.subscribedEvents.includes(evt.id)}
															onChange={() => {
																setN8nState(prev => {
																	const exists = prev.subscribedEvents.includes(evt.id);
																	return {
																		...prev,
																		subscribedEvents: exists
																			? prev.subscribedEvents.filter(e => e !== evt.id)
																			: [...prev.subscribedEvents, evt.id]
																	};
																});
															}}
														/>
													}
													label={
														<Typography variant="body2" className="font-medium">
															{evt.name} <span className="font-mono text-xs text-text-secondary">({evt.id})</span>
														</Typography>
													}
												/>
											))}
										</FormGroup>
									</Box>

									<Box display="flex" alignItems="center" justifyContent="space-between" mt={4} pt={2} className="border-t border-divider">
										<Button
											variant="outlined"
											color="primary"
											startIcon={<FuseSvgIcon size={18}>heroicons-outline:paper-airplane</FuseSvgIcon>}
											onClick={handleTestN8nPing}
											disabled={isTestingN8nPing || !n8nState.webhookUrl}
											data-testid="test-n8n-ping-btn"
										>
											{isTestingN8nPing ? 'Đang gửi kiểm tra...' : 'Gửi Webhook Thử Nghiệm (Test Ping)'}
										</Button>

										<Button
											variant="contained"
											color="primary"
											onClick={handleSaveN8n}
											disabled={isSavingN8n}
											data-testid="save-n8n-btn"
										>
											{isSavingN8n ? 'Đang lưu...' : 'Lưu Cấu Hình n8n'}
										</Button>
									</Box>

									{n8nPingResult && (
										<Box mt={3} data-testid="n8n-ping-result">
											<Alert
												severity={n8nPingResult.success ? 'success' : 'warning'}
												variant="outlined"
												className="rounded-xl"
											>
												<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
													<Typography variant="subtitle2" className="font-bold">
														{n8nPingResult.message}
													</Typography>
													<Box display="flex" gap={1}>
														<Chip
															size="small"
															label={`Mã HTTP: ${n8nPingResult.statusCode}`}
															color={n8nPingResult.success ? 'success' : 'default'}
														/>
														<Chip
															size="small"
															label={`Độ trễ: ${n8nPingResult.responseTimeMs} ms`}
															variant="outlined"
														/>
													</Box>
												</Box>
												<Typography variant="caption" className="font-mono text-text-secondary block">
													Chữ ký: {n8nPingResult.signature}
												</Typography>
											</Alert>
										</Box>
									)}
								</Paper>
							</div>
						)}

						{/* ======================================================== */}
						{/* TAB 2: OMNICHANNEL SYNC (TIKTOK, SHOPEE, POS)            */}
						{/* ======================================================== */}
						{currentTabId === 'omnichannel' && (
							<div className="p-24 space-y-24">
								<Alert severity="success" variant="outlined" className="rounded-xl bg-success-50/20">
									<Typography variant="subtitle2" className="font-bold mb-1">
										Đồng Bộ Bán Hàng Đa Kênh Tự Động (Omnichannel Synchronization)
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Tự động kéo đơn hàng từ TikTok Shop, Shopee về bảng điều khiển trung tâm và cập nhật tồn kho 2 chiều. Từng gian hàng cấu hình bộ khóa API độc lập và URL Webhook Callback nhận đơn riêng.
									</Typography>
								</Alert>

								<Grid container spacing={3}>
									{/* 1. TikTok Shop Card */}
									<Grid item xs={12} md={6}>
										<Card className="rounded-2xl border border-divider shadow-sm h-full flex flex-col justify-between">
											<CardContent className="p-24 space-y-20">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-40 h-40 rounded-xl bg-black text-white flex items-center justify-center font-bold">
															TT
														</div>
														<div>
															<Typography variant="h6" className="font-bold">
																TikTok Shop OpenAPI
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Đồng bộ đơn hàng, kho và trạng thái giao vận
															</Typography>
														</div>
													</div>
													<FormControlLabel
														control={
															<Switch
																checked={tiktokState.isEnabled}
																onChange={(e) => setTiktokState(prev => ({ ...prev, isEnabled: e.target.checked }))}
															/>
														}
														label={tiktokState.isEnabled ? 'Bật' : 'Tắt'}
													/>
												</div>

												<Divider />

												{/* Webhook Callback Info */}
												<Paper variant="outlined" className="p-12 rounded-xl bg-background-default/60">
													<Typography variant="caption" className="font-semibold block mb-1 text-text-secondary">
														Inbound Webhook Callback URL của Gian hàng:
													</Typography>
													<div className="flex items-center justify-between font-mono text-xs text-primary font-bold">
														<span className="truncate">https://api.ecommerce.local/api/webhooks/channels/tiktok</span>
														<Tooltip title="Sao chép URL">
															<IconButton
																size="small"
																onClick={() => copyToClipboard('https://api.ecommerce.local/api/webhooks/channels/tiktok', 'TikTok Webhook URL')}
															>
																<ContentCopyIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</div>
													<Typography variant="caption" className="text-text-secondary text-xs block mt-1">
														Header bắt buộc: <code className="font-mono">X-Tenant-Id: {'{Mã_Shop_Của_Bạn}'}</code>
													</Typography>
												</Paper>

												<Grid container spacing={2}>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="App Key"
															value={tiktokState.appKey}
															onChange={(e) => setTiktokState(prev => ({ ...prev, appKey: e.target.value }))}
															inputProps={{ 'data-testid': 'tiktok-app-key' }}
														/>
													</Grid>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="App Secret"
															type="password"
															value={tiktokState.appSecret}
															onChange={(e) => setTiktokState(prev => ({ ...prev, appSecret: e.target.value }))}
															inputProps={{ 'data-testid': 'tiktok-app-secret' }}
														/>
													</Grid>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="Shop ID (TikTok)"
															value={tiktokState.shopId}
															onChange={(e) => setTiktokState(prev => ({ ...prev, shopId: e.target.value }))}
															inputProps={{ 'data-testid': 'tiktok-shop-id' }}
														/>
													</Grid>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="Access Token"
															type="password"
															value={tiktokState.accessToken}
															onChange={(e) => setTiktokState(prev => ({ ...prev, accessToken: e.target.value }))}
															inputProps={{ 'data-testid': 'tiktok-access-token' }}
														/>
													</Grid>
												</Grid>

												<div className="space-y-1">
													<Typography variant="caption" className="font-semibold text-text-secondary block">
														Tùy chọn tự động đồng bộ (Auto-Sync Toggles):
													</Typography>
													<FormControlLabel
														control={
															<Checkbox
																size="small"
																checked={tiktokState.autoSyncOrders}
																onChange={(e) => setTiktokState(prev => ({ ...prev, autoSyncOrders: e.target.checked }))}
															/>
														}
														label={<Typography variant="body2">Tự động kéo đơn hàng mới (Real-time Order Pull)</Typography>}
													/>
													<FormControlLabel
														control={
															<Checkbox
																size="small"
																checked={tiktokState.autoSyncStock}
																onChange={(e) => setTiktokState(prev => ({ ...prev, autoSyncStock: e.target.checked }))}
															/>
														}
														label={<Typography variant="body2">Tự động trừ và cập nhật kho 2 chiều (Stock Sync)</Typography>}
													/>
												</div>

												{isSyncingTikTok && <LinearProgress className="rounded" />}

												<div className="flex items-center justify-between pt-12 border-t border-divider">
													<Typography variant="caption" color="text.secondary">
														Đồng bộ lần cuối: <strong>{tiktokState.lastSync}</strong>
													</Typography>
													<div className="flex gap-2">
														<Button
															variant="outlined"
															color="primary"
															startIcon={<SyncIcon />}
															disabled={isSyncingTikTok}
															onClick={handleSyncTikTokNow}
															data-testid="sync-tiktok-btn"
														>
															Đồng Bộ Ngay
														</Button>
														<Button
															variant="contained"
															color="primary"
															onClick={handleSaveTikTok}
															disabled={isUpdatingIntegration}
															data-testid="save-tiktok-btn"
														>
															Lưu Cấu Hình
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									</Grid>

									{/* 2. Shopee Open Platform Card */}
									<Grid item xs={12} md={6}>
										<Card className="rounded-2xl border border-divider shadow-sm h-full flex flex-col justify-between">
											<CardContent className="p-24 space-y-20">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-40 h-40 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
															SHP
														</div>
														<div>
															<Typography variant="h6" className="font-bold">
																Shopee Open Platform
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Kết nối API Shopee Partner v2 chính thức
															</Typography>
														</div>
													</div>
													<FormControlLabel
														control={
															<Switch
																checked={shopeeState.isEnabled}
																onChange={(e) => setShopeeState(prev => ({ ...prev, isEnabled: e.target.checked }))}
															/>
														}
														label={shopeeState.isEnabled ? 'Bật' : 'Tắt'}
													/>
												</div>

												<Divider />

												{/* Webhook Callback Info */}
												<Paper variant="outlined" className="p-12 rounded-xl bg-background-default/60">
													<Typography variant="caption" className="font-semibold block mb-1 text-text-secondary">
														Inbound Webhook Callback URL của Gian hàng:
													</Typography>
													<div className="flex items-center justify-between font-mono text-xs text-primary font-bold">
														<span className="truncate">https://api.ecommerce.local/api/webhooks/channels/shopee</span>
														<Tooltip title="Sao chép URL">
															<IconButton
																size="small"
																onClick={() => copyToClipboard('https://api.ecommerce.local/api/webhooks/channels/shopee', 'Shopee Webhook URL')}
															>
																<ContentCopyIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</div>
													<Typography variant="caption" className="text-text-secondary text-xs block mt-1">
														Header bắt buộc: <code className="font-mono">X-Tenant-Id: {'{Mã_Shop_Của_Bạn}'}</code>
													</Typography>
												</Paper>

												<Grid container spacing={2}>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="Partner ID"
															value={shopeeState.partnerId}
															onChange={(e) => setShopeeState(prev => ({ ...prev, partnerId: e.target.value }))}
															inputProps={{ 'data-testid': 'shopee-partner-id' }}
														/>
													</Grid>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="Partner Key"
															type="password"
															value={shopeeState.partnerKey}
															onChange={(e) => setShopeeState(prev => ({ ...prev, partnerKey: e.target.value }))}
															inputProps={{ 'data-testid': 'shopee-partner-key' }}
														/>
													</Grid>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="Shop ID (Shopee)"
															value={shopeeState.shopId}
															onChange={(e) => setShopeeState(prev => ({ ...prev, shopId: e.target.value }))}
															inputProps={{ 'data-testid': 'shopee-shop-id' }}
														/>
													</Grid>
													<Grid item xs={12} sm={6}>
														<TextField
															fullWidth
															size="small"
															label="Access Token"
															type="password"
															value={shopeeState.accessToken}
															onChange={(e) => setShopeeState(prev => ({ ...prev, accessToken: e.target.value }))}
															inputProps={{ 'data-testid': 'shopee-access-token' }}
														/>
													</Grid>
												</Grid>

												<div className="space-y-1">
													<Typography variant="caption" className="font-semibold text-text-secondary block">
														Tùy chọn tự động đồng bộ:
													</Typography>
													<FormControlLabel
														control={
															<Checkbox
																size="small"
																checked={shopeeState.autoSyncOrders}
																onChange={(e) => setShopeeState(prev => ({ ...prev, autoSyncOrders: e.target.checked }))}
															/>
														}
														label={<Typography variant="body2">Tự động kéo đơn hàng Shopee về hệ thống</Typography>}
													/>
													<FormControlLabel
														control={
															<Checkbox
																size="small"
																checked={shopeeState.autoSyncStock}
																onChange={(e) => setShopeeState(prev => ({ ...prev, autoSyncStock: e.target.checked }))}
															/>
														}
														label={<Typography variant="body2">Tự động đồng bộ tồn kho 2 chiều</Typography>}
													/>
												</div>

												{isSyncingShopee && <LinearProgress color="warning" className="rounded" />}

												<div className="flex items-center justify-between pt-12 border-t border-divider">
													<Typography variant="caption" color="text.secondary">
														Đồng bộ lần cuối: <strong>{shopeeState.lastSync}</strong>
													</Typography>
													<div className="flex gap-2">
														<Button
															variant="outlined"
															color="warning"
															startIcon={<SyncIcon />}
															disabled={isSyncingShopee}
															onClick={handleSyncShopeeNow}
															data-testid="sync-shopee-btn"
														>
															Đồng Bộ Ngay
														</Button>
														<Button
															variant="contained"
															color="primary"
															onClick={handleSaveShopee}
															disabled={isUpdatingIntegration}
															data-testid="save-shopee-btn"
														>
															Lưu Cấu Hình
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									</Grid>

									{/* 3. POS Barcode Scanner Card */}
									<Grid item xs={12}>
										<Card className="rounded-2xl border border-divider shadow-sm">
											<CardContent className="p-24 space-y-16">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Box className="w-40 h-40 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
															<FuseSvgIcon size={24}>heroicons-outline:qr-code</FuseSvgIcon>
														</Box>
														<div>
															<Typography variant="h6" className="font-bold">
																Máy Quét Mã Vạch & Bán Hàng Trực Tiếp Tại Quầy (POS Terminal)
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Kết nối máy quét mã vạch USB / Bluetooth HID và quầy thu ngân offline
															</Typography>
														</div>
													</div>

													<FormControlLabel
														control={
															<Switch
																checked={posState.isEnabled}
																onChange={(e) => setPosState(prev => ({ ...prev, isEnabled: e.target.checked }))}
															/>
														}
														label={posState.isEnabled ? 'Đang hoạt động' : 'Tắt'}
													/>
												</div>

												<Divider />

												<Grid container spacing={3}>
													<Grid item xs={12} md={4}>
														<FormControl fullWidth size="small">
															<InputLabel>Phương thức kết nối máy quét</InputLabel>
															<Select
																value={posState.scannerMode}
																label="Phương thức kết nối máy quét"
																onChange={(e) => setPosState(prev => ({ ...prev, scannerMode: e.target.value }))}
															>
																<MenuItem value="USB_HID">Đầu đọc mã vạch USB HID (Bàn phím ảo)</MenuItem>
																<MenuItem value="BLUETOOTH">Máy quét cầm tay không dây Bluetooth</MenuItem>
																<MenuItem value="CAMERA">Quét bằng Camera điện thoại / iPad</MenuItem>
															</Select>
														</FormControl>
													</Grid>

													<Grid item xs={12} md={4}>
														<FormControl fullWidth size="small">
															<InputLabel>Kho hàng mặc định xuất bán tại quầy</InputLabel>
															<Select
																value={posState.warehouseId}
																label="Kho hàng mặc định xuất bán tại quầy"
																onChange={(e) => setPosState(prev => ({ ...prev, warehouseId: e.target.value }))}
															>
																<MenuItem value="WH_CENTRAL_HCM">Kho Tổng TP.HCM (Quận 1)</MenuItem>
																<MenuItem value="WH_HN_CENTRAL">Kho Trung Tâm Hà Nội (Cầu Giấy)</MenuItem>
																<MenuItem value="WH_STORE_SHOWROOM">Kho Cửa Hàng Trực Tiếp (Showroom)</MenuItem>
															</Select>
														</FormControl>
													</Grid>

													<Grid item xs={12} md={4}>
														<div className="flex flex-col gap-1">
															<FormControlLabel
																control={
																	<Checkbox
																		size="small"
																		checked={posState.autoDeductStock}
																		onChange={(e) => setPosState(prev => ({ ...prev, autoDeductStock: e.target.checked }))}
																	/>
																}
																label={<Typography variant="body2">Trừ kho tức thời khi quét mã bán</Typography>}
															/>
															<FormControlLabel
																control={
																	<Checkbox
																		size="small"
																		checked={posState.offlineCacheEnabled}
																		onChange={(e) => setPosState(prev => ({ ...prev, offlineCacheEnabled: e.target.checked }))}
																	/>
																}
																label={<Typography variant="body2">Lưu tạm Offline khi mất mạng (Auto Sync khi có mạng)</Typography>}
															/>
														</div>
													</Grid>
												</Grid>

												<div className="flex justify-end pt-12 border-t border-divider">
													<Button
														variant="contained"
														color="primary"
														onClick={handleSavePOS}
														data-testid="save-pos-btn"
													>
														Lưu Cấu Hình POS
													</Button>
												</div>
											</CardContent>
										</Card>
									</Grid>
								</Grid>
							</div>
						)}

						{/* ======================================================== */}
						{/* TAB 3: PAYMENT & LOGISTICS                               */}
						{/* ======================================================== */}
						{currentTabId === 'payments' && (
							<div className="p-24 space-y-24">
								<Grid container spacing={3}>
									{/* VNPay */}
									<Grid item xs={12} md={6}>
										<Paper className="p-24 rounded-2xl border border-divider shadow-sm h-full flex flex-col justify-between">
											<div className="space-y-16">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-40 h-40 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
															VNP
														</div>
														<div>
															<Typography variant="h6" className="font-bold">
																Cổng Thanh Toán VNPay
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Thanh toán qua thẻ ATM / Visa / QR VNPay
															</Typography>
														</div>
													</div>
													<FormControlLabel
														control={
															<Switch
																checked={vnpayState.isActive}
																onChange={(e) => setVnpayState(prev => ({ ...prev, isActive: e.target.checked }))}
															/>
														}
														label={vnpayState.isActive ? 'Bật' : 'Tắt'}
													/>
												</div>

												<Divider />

												<Paper variant="outlined" className="p-12 rounded-xl bg-background-default/60">
													<Typography variant="caption" className="font-semibold block mb-1 text-text-secondary">
														VNPay IPN URL Callback (Webhook):
													</Typography>
													<div className="flex items-center justify-between font-mono text-xs text-primary font-bold">
														<span className="truncate">https://api.ecommerce.local/api/payment/vnpay-ipn</span>
														<Tooltip title="Sao chép">
															<IconButton
																size="small"
																onClick={() => copyToClipboard('https://api.ecommerce.local/api/payment/vnpay-ipn', 'VNPay IPN URL')}
															>
																<ContentCopyIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</div>
												</Paper>

												<TextField
													fullWidth
													label="TmnCode (Mã Định Danh Merchant)"
													value={vnpayState.tmnCode}
													onChange={(e) => setVnpayState(prev => ({ ...prev, tmnCode: e.target.value }))}
													size="small"
													inputProps={{ 'data-testid': 'vnpay-tmncode' }}
												/>

												<TextField
													fullWidth
													label="HashSecret (Chuỗi Bí Mật Tạo Checksum)"
													value={vnpayState.hashSecret}
													onChange={(e) => setVnpayState(prev => ({ ...prev, hashSecret: e.target.value }))}
													type="password"
													size="small"
													inputProps={{ 'data-testid': 'vnpay-hashsecret' }}
												/>

												<FormControlLabel
													control={
														<Checkbox
															checked={vnpayState.isSandbox}
															onChange={(e) => setVnpayState(prev => ({ ...prev, isSandbox: e.target.checked }))}
														/>
													}
													label={<Typography variant="body2">Chế độ Thử Nghiệm Sandbox (Test Mode)</Typography>}
												/>
											</div>

											<div className="flex justify-end pt-16 border-t border-divider mt-16">
												<Button
													variant="contained"
													color="primary"
													onClick={handleSaveVNPay}
													disabled={isUpdatingIntegration}
													data-testid="save-vnpay-btn"
												>
													Lưu Cấu Hình VNPay
												</Button>
											</div>
										</Paper>
									</Grid>

									{/* VietQR Pro */}
									<Grid item xs={12} md={6}>
										<Paper className="p-24 rounded-2xl border border-divider shadow-sm h-full flex flex-col justify-between">
											<div className="space-y-16">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-40 h-40 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
															VQR
														</div>
														<div>
															<Typography variant="h6" className="font-bold">
																VietQR Pro (Mã QR Tĩnh & Động)
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Chuyển khoản liên ngân hàng 24/7 đối soát tự động
															</Typography>
														</div>
													</div>
													<FormControlLabel
														control={
															<Switch
																checked={vietqrState.isActive}
																onChange={(e) => setVietqrState(prev => ({ ...prev, isActive: e.target.checked }))}
															/>
														}
														label={vietqrState.isActive ? 'Bật' : 'Tắt'}
													/>
												</div>

												<Divider />

												<Grid container spacing={2}>
													<Grid item xs={12} sm={4}>
														<FormControl fullWidth size="small">
															<InputLabel>Ngân Hàng</InputLabel>
															<Select
																value={vietqrState.bankCode}
																label="Ngân Hàng"
																onChange={(e) => setVietqrState(prev => ({ ...prev, bankCode: e.target.value }))}
															>
																<MenuItem value="VCB">Vietcombank</MenuItem>
																<MenuItem value="MB">MB Bank</MenuItem>
																<MenuItem value="TCB">Techcombank</MenuItem>
																<MenuItem value="ACB">ACB</MenuItem>
																<MenuItem value="VPB">VPBank</MenuItem>
															</Select>
														</FormControl>
													</Grid>
													<Grid item xs={12} sm={8}>
														<TextField
															fullWidth
															label="Số Tài Khoản Nhận Tiền"
															value={vietqrState.accountNo}
															onChange={(e) => setVietqrState(prev => ({ ...prev, accountNo: e.target.value }))}
															size="small"
														/>
													</Grid>
												</Grid>

												<TextField
													fullWidth
													label="Tên Chủ Tài Khoản (Không dấu)"
													value={vietqrState.accountName}
													onChange={(e) => setVietqrState(prev => ({ ...prev, accountName: e.target.value }))}
													size="small"
												/>

												<FormControlLabel
													control={
														<Checkbox
															checked={vietqrState.autoReconcile}
															onChange={(e) => setVietqrState(prev => ({ ...prev, autoReconcile: e.target.checked }))}
														/>
													}
													label={<Typography variant="body2">Tự động khớp lệnh và đổi trạng thái ĐÃ THANH TOÁN (Auto-Reconcile)</Typography>}
												/>
											</div>

											<div className="flex justify-end pt-16 border-t border-divider mt-16">
												<Button
													variant="contained"
													color="primary"
													onClick={handleSaveVietQR}
													disabled={isUpdatingIntegration}
													data-testid="save-vietqr-btn"
												>
													Lưu Cấu Hình VietQR
												</Button>
											</div>
										</Paper>
									</Grid>

									{/* Giao Hàng Nhanh (GHN) */}
									<Grid item xs={12} md={6}>
										<Paper className="p-24 rounded-2xl border border-divider shadow-sm h-full flex flex-col justify-between">
											<div className="space-y-16">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-40 h-40 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center">
															GHN
														</div>
														<div>
															<Typography variant="h6" className="font-bold">
																Giao Hàng Nhanh (GHN Express)
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Tạo vận đơn và tra cứu lộ trình bưu kiện tự động
															</Typography>
														</div>
													</div>
													<FormControlLabel
														control={
															<Switch
																checked={ghnState.isActive}
																onChange={(e) => setGhnState(prev => ({ ...prev, isActive: e.target.checked }))}
															/>
														}
														label={ghnState.isActive ? 'Bật' : 'Tắt'}
													/>
												</div>

												<Divider />

												<TextField
													fullWidth
													label="API Token"
													type="password"
													value={ghnState.token}
													onChange={(e) => setGhnState(prev => ({ ...prev, token: e.target.value }))}
													size="small"
												/>

												<TextField
													fullWidth
													label="Mã Cửa Hàng (ShopId GHN)"
													value={ghnState.shopId}
													onChange={(e) => setGhnState(prev => ({ ...prev, shopId: e.target.value }))}
													size="small"
												/>
											</div>

											<div className="flex justify-end pt-16 border-t border-divider mt-16">
												<Button
													variant="contained"
													color="primary"
													onClick={handleSaveGHN}
													disabled={isUpdatingIntegration}
													data-testid="save-ghn-btn"
												>
													Lưu Cấu Hình GHN
												</Button>
											</div>
										</Paper>
									</Grid>

									{/* Giao Hàng Tiết Kiệm (GHTK) */}
									<Grid item xs={12} md={6}>
										<Paper className="p-24 rounded-2xl border border-divider shadow-sm h-full flex flex-col justify-between">
											<div className="space-y-16">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-40 h-40 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center">
															GHTK
														</div>
														<div>
															<Typography variant="h6" className="font-bold">
																Giao Hàng Tiết Kiệm (GHTK)
															</Typography>
															<Typography variant="caption" color="text.secondary">
																Kết nối API tạo đơn và in mã vận đơn bưu cục
															</Typography>
														</div>
													</div>
													<FormControlLabel
														control={
															<Switch
																checked={ghtkState.isActive}
																onChange={(e) => setGhtkState(prev => ({ ...prev, isActive: e.target.checked }))}
															/>
														}
														label={ghtkState.isActive ? 'Bật' : 'Tắt'}
													/>
												</div>

												<Divider />

												<TextField
													fullWidth
													label="API Token GHTK"
													type="password"
													value={ghtkState.token}
													onChange={(e) => setGhtkState(prev => ({ ...prev, token: e.target.value }))}
													size="small"
												/>

												<TextField
													fullWidth
													label="Mã Kho Gửi Hàng (Warehouse Code)"
													value={ghtkState.warehouseCode}
													onChange={(e) => setGhtkState(prev => ({ ...prev, warehouseCode: e.target.value }))}
													size="small"
												/>
											</div>

											<div className="flex justify-end pt-16 border-t border-divider mt-16">
												<Button
													variant="contained"
													color="primary"
													onClick={handleSaveGHTK}
													disabled={isUpdatingIntegration}
													data-testid="save-ghtk-btn"
												>
													Lưu Cấu Hình GHTK
												</Button>
											</div>
										</Paper>
									</Grid>
								</Grid>
							</div>
						)}
					</Paper>
					)}
				</div>
			}
		/>

		{/* ======================================================== */}
			{/* DIALOG: REGISTER NEW TENANT WEBHOOK                     */}
			{/* ======================================================== */}
			<Dialog
				open={isRegisterOpen}
				onClose={() => setIsRegisterOpen(false)}
				maxWidth="md"
				fullWidth
				PaperProps={{ className: 'rounded-2xl shadow-xl' }}
				data-testid="register-webhook-dialog"
			>
				<DialogTitle className="border-b border-divider flex items-center justify-between pb-16">
					<div className="flex items-center gap-2">
						<Box className="w-36 h-36 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary flex items-center justify-center">
							<FuseSvgIcon size={20}>heroicons-outline:rss</FuseSvgIcon>
						</Box>
						<Typography variant="h6" className="font-bold">
							Đăng Ký Webhook Doanh Nghiệp Mới
						</Typography>
					</div>
					<IconButton size="small" onClick={() => setIsRegisterOpen(false)}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</DialogTitle>

				<DialogContent className="pt-24 space-y-20">
					{/* Target URL */}
					<TextField
						fullWidth
						label="Target URL Endpoint (Bắt buộc)"
						placeholder="https://erp.yourdomain.com/api/webhooks/ecommerce"
						value={targetUrlInput}
						onChange={(e) => setTargetUrlInput(e.target.value)}
						helperText="Hệ thống sẽ gửi yêu cầu HTTP POST đến địa chỉ này khi có sự kiện được chọn kích hoạt"
						variant="outlined"
						inputProps={{ 'data-testid': 'new-webhook-url' }}
					/>

					{/* Secret Key with Generator */}
					<Paper variant="outlined" className="p-16 rounded-xl bg-background-default/50 space-y-8">
						<div className="flex items-center justify-between">
							<Typography variant="subtitle2" className="font-bold flex items-center gap-1.5">
								<VpnKeyIcon fontSize="small" color="primary" />
								Mã Bí Mật Bảo Mật HMAC SHA-256 (Secret Key)
							</Typography>
							<Button
								size="small"
								variant="outlined"
								color="primary"
								startIcon={<RefreshIcon />}
								onClick={() => {
									const newKey = generateRandomSecretKey();
									setSecretKeyInput(newKey);
									setCopiedKey(false);
								}}
								data-testid="generate-secret-btn"
							>
								Tự sinh mã bảo mật ngẫu nhiên
							</Button>
						</div>

						<TextField
							fullWidth
							value={secretKeyInput}
							onChange={(e) => {
								setSecretKeyInput(e.target.value);
								setCopiedKey(false);
							}}
							helperText="Khóa bảo mật riêng của gian hàng bạn (tối thiểu 16 ký tự). Dùng để xác thực chữ ký gói tin gửi từ sàn."
							variant="outlined"
							size="small"
							InputProps={{
								className: 'font-mono text-sm',
								endAdornment: (
									<InputAdornment position="end">
										<Button
											size="small"
											variant={copiedKey ? 'contained' : 'outlined'}
											color={copiedKey ? 'success' : 'inherit'}
											startIcon={copiedKey ? <CheckIcon /> : <ContentCopyIcon />}
											onClick={() => {
												navigator.clipboard.writeText(secretKeyInput);
												setCopiedKey(true);
												setTimeout(() => setCopiedKey(false), 3000);
											}}
											data-testid="copy-secret-btn"
										>
											{copiedKey ? 'Đã chép' : 'Sao chép'}
										</Button>
									</InputAdornment>
								)
							}}
							inputProps={{ 'data-testid': 'new-webhook-secret' }}
						/>
					</Paper>

					{/* Events Multi-Selection */}
					<div>
						<div className="flex items-center justify-between mb-8">
							<Typography variant="subtitle2" className="font-bold text-text-primary">
								Sự kiện đăng ký nhận dữ liệu ({selectedEvents.length} đã chọn):
							</Typography>
							<div className="flex gap-2">
								<Button size="small" onClick={handleSelectAllEvents}>
									Chọn tất cả
								</Button>
								<Button size="small" color="inherit" onClick={handleDeselectAllEvents}>
									Bỏ chọn tất cả
								</Button>
							</div>
						</div>

						<Grid container spacing={1.5}>
							{AVAILABLE_EVENTS.map(evt => {
								const isChecked = selectedEvents.includes(evt.id);
								return (
									<Grid item xs={12} sm={6} key={evt.id}>
										<Paper
											variant="outlined"
											className={`p-12 rounded-xl cursor-pointer transition-all ${
												isChecked
													? 'border-primary bg-primary-50/10 dark:bg-primary-950/20'
													: 'hover:border-divider'
											}`}
											onClick={() => handleToggleEvent(evt.id)}
										>
											<div className="flex items-start gap-2">
												<Checkbox
													size="small"
													checked={isChecked}
													className="p-0 mt-2"
													inputProps={{ 'data-testid': `event-check-${evt.id}` } as any}
												/>
												<div>
													<Typography variant="body2" className="font-bold">
														{evt.name}
													</Typography>
													<Typography variant="caption" className="font-mono text-xs text-primary block">
														{evt.id}
													</Typography>
													<Typography variant="caption" color="text.secondary" className="text-xs block mt-2">
														{evt.desc}
													</Typography>
												</div>
											</div>
										</Paper>
									</Grid>
								);
							})}
						</Grid>
					</div>
				</DialogContent>

				<DialogActions className="border-t border-divider p-16">
					<Button onClick={() => setIsRegisterOpen(false)} color="inherit">
						Hủy bỏ
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleRegisterWebhook}
						disabled={isRegistering}
						data-testid="submit-register-webhook-btn"
						className="shadow-md"
					>
						{isRegistering ? 'Đang lưu...' : 'Đăng Ký Webhook'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ======================================================== */}
			{/* DRAWER: DELIVERY HISTORY LOGS (PAYLOAD & STATUS)         */}
			{/* ======================================================== */}
			<Drawer
				anchor="right"
				open={logsDrawerOpen}
				onClose={() => setLogsDrawerOpen(false)}
				PaperProps={{ className: 'w-full max-w-2xl p-24 space-y-20' }}
				data-testid="delivery-logs-drawer"
			>
				<div className="flex items-center justify-between border-b border-divider pb-16">
					<div className="flex items-center gap-2">
						<Box className="w-36 h-36 rounded-xl bg-info-100 dark:bg-info-950 text-info flex items-center justify-center">
							<HistoryIcon fontSize="small" />
						</Box>
						<div>
							<Typography variant="h6" className="font-bold">
								Lịch Sử Phát Tin Webhook (Delivery Logs)
							</Typography>
							<Typography variant="caption" color="text.secondary" className="font-mono">
								{selectedWebhookForLogs?.targetUrl}
							</Typography>
						</div>
					</div>

					<IconButton size="small" onClick={() => setLogsDrawerOpen(false)}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</div>

				{isFetchingLogs ? (
					<div className="p-32 flex justify-center"><CircularProgress /></div>
				) : deliveryLogs.length === 0 ? (
					<div className="p-32 text-center text-text-secondary">
						Chưa có lượt gửi tin nào được ghi nhận cho Webhook này.
					</div>
				) : (
					<div className="space-y-12 overflow-y-auto max-h-[calc(100vh-140px)] pr-4">
						{deliveryLogs.map((log, idx) => (
							<Accordion key={log.id} defaultExpanded={idx === 0} variant="outlined" className="rounded-xl overflow-hidden border border-divider">
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<div className="flex items-center justify-between w-full pr-12">
										<div className="flex items-center gap-2">
											<Chip
												size="small"
												label={log.responseStatusCode ? `HTTP ${log.responseStatusCode}` : 'Timeout'}
												color={log.isSuccess ? 'success' : 'error'}
												className="font-mono font-bold text-xs"
											/>
											<Typography variant="body2" className="font-mono font-semibold">
												{log.eventType}
											</Typography>
										</div>
										<div className="flex items-center gap-3">
											<Typography variant="caption" color="text.secondary">
												Lần thử: {log.attemptNumber}/3
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{formatDate(log.deliveredAtUtc)}
											</Typography>
										</div>
									</div>
								</AccordionSummary>
								<AccordionDetails className="bg-background-default/40 p-16 space-y-12 border-t border-divider">
									{log.errorMessage && (
										<Alert severity="error" variant="outlined" className="rounded-lg text-xs py-4">
											<strong>Lỗi:</strong> {log.errorMessage}
										</Alert>
									)}

									<div>
										<Typography variant="caption" className="font-bold block mb-4">
											Payload JSON đã gửi:
										</Typography>
										<pre className="p-12 rounded-lg bg-background-paper text-xs font-mono overflow-x-auto border border-divider">
											{(() => {
												try {
													return JSON.stringify(JSON.parse(log.payloadJson), null, 2);
												} catch {
													return log.payloadJson;
												}
											})()}
										</pre>
									</div>

									{log.responseBody && (
										<div>
											<Typography variant="caption" className="font-bold block mb-4">
												Phản hồi nhận được từ máy chủ đích (Response Body):
											</Typography>
											<pre className="p-12 rounded-lg bg-background-paper text-xs font-mono overflow-x-auto border border-divider">
												{log.responseBody}
											</pre>
										</div>
									)}
								</AccordionDetails>
							</Accordion>
						))}
					</div>
				)}
			</Drawer>
		</>
	);
}
