import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import DevicesIcon from '@mui/icons-material/Devices';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ComputerIcon from '@mui/icons-material/Computer';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useSnackbar } from 'notistack';

import {
	useGetThemeSettingsQuery,
	useUpdateThemeSettingsMutation,
	ThemeSettingsDto
} from './themeApi';

const COLOR_PRESETS = [
	{ name: 'Xanh Hiện Đại (Default)', primary: '#2563eb', secondary: '#7c3aed', accent: '#f59e0b' },
	{ name: 'Xanh Lá Tươi Mát (Emerald)', primary: '#10b981', secondary: '#059669', accent: '#f97316' },
	{ name: 'Tím Hoàng Gia (Royal Purple)', primary: '#7c3aed', secondary: '#4f46e5', accent: '#ec4899' },
	{ name: 'Hổ Phách Sang Trọng (Amber Gold)', primary: '#d97706', secondary: '#b45309', accent: '#2563eb' },
	{ name: 'Đỏ Ruby Quyến Rũ (Crimson)', primary: '#dc2626', secondary: '#991b1b', accent: '#3b82f6' }
];

const BANNER_PRESETS = [
	'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
	'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
	'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80'
];

export default function ThemeCustomizerPage() {
	const { enqueueSnackbar } = useSnackbar();
	const { data: serverSettings, isLoading, refetch } = useGetThemeSettingsQuery();
	const [updateSettings, { isLoading: isSaving }] = useUpdateThemeSettingsMutation();

	const [form, setForm] = useState<ThemeSettingsDto>({
		storeName: 'E-Shop Modern Store',
		slogan: 'Mua sắm thông minh, giao hàng hỏa tốc',
		logoUrl: '/assets/images/logo/logo.svg',
		faviconUrl: '/favicon.ico',
		primaryColor: '#2563eb',
		secondaryColor: '#7c3aed',
		accentColor: '#f59e0b',
		isDarkMode: false,
		heroTitle: 'Bộ Sưu Tập Đỉnh Cao 2026',
		heroSubtitle: 'Khám phá hàng ngàn sản phẩm chính hãng với ưu đãi giảm giá lên đến 50%. Miễn phí vận chuyển toàn quốc cho mọi đơn hàng từ 500k.',
		heroBannerUrl: BANNER_PRESETS[0],
		heroCtaText: 'Khám Phá Ngay',
		heroCtaLink: '/apps/e-commerce/products',
		promotionalBadge: '🔥 KHUYẾN MÃI MÙA HÈ - GIẢM ĐẾN 50%',
		announcementText: '🎉 Chào mừng bạn đến với cửa hàng! Nhập mã CHAOBAN để giảm ngay 10% cho đơn đầu tiên.',
		announcementEnabled: true,
		announcementLink: '/apps/e-commerce/promotions',
		hotline: '1900 6868',
		supportEmail: 'support@eshop.vn',
		storeAddress: 'Tòa nhà Innovation Hub, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
		facebookUrl: 'https://facebook.com',
		zaloUrl: 'https://zalo.me',
		tikTokUrl: 'https://tiktok.com',
		copyrightText: '© 2026 E-Commerce Enterprise Platform. All rights reserved.'
	});

	const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

	useEffect(() => {
		if (serverSettings) {
			setForm(serverSettings);
		}
	}, [serverSettings]);

	const handleChange = (field: keyof ThemeSettingsDto, value: any) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
		setForm((prev) => ({
			...prev,
			primaryColor: preset.primary,
			secondaryColor: preset.secondary,
			accentColor: preset.accent
		}));
		enqueueSnackbar(`Đã áp dụng bảng màu '${preset.name}'!`, { variant: 'info', autoHideDuration: 2000 });
	};

	const handleSave = async () => {
		try {
			await updateSettings(form).unwrap();
			enqueueSnackbar('Lưu và xuất bản giao diện thành công!', { variant: 'success' });
			refetch();
		} catch (err: any) {
			enqueueSnackbar(err?.data?.detail || err?.data?.message || 'Có lỗi xảy ra khi lưu giao diện', { variant: 'error' });
		}
	};

	const handleReset = () => {
		if (serverSettings) {
			setForm(serverSettings);
			enqueueSnackbar('Đã khôi phục cài đặt lưu gần nhất', { variant: 'info' });
		}
	};

	if (isLoading) {
		return (
			<Box className="flex items-center justify-center h-full min-h-400">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box className="flex flex-col flex-auto min-w-0 bg-background-default">
			{/* Top App Header */}
			<Paper elevation={1} sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<PaletteIcon color="primary" sx={{ fontSize: 32 }} />
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Tùy Biến Giao Diện Cửa Hàng (Theme Customizer)
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Chỉnh sửa nhận diện thương hiệu, màu sắc, biểu ngữ và xem trước trực quan tức thì theo thời gian thực (Shopify-Grade)
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					{/* Device Switcher */}
					<Paper variant="outlined" sx={{ display: 'flex', p: 0.5, borderRadius: 2 }}>
						<Tooltip title="Chế độ xem Máy tính (Desktop)">
							<IconButton
								size="small"
								color={previewDevice === 'desktop' ? 'primary' : 'default'}
								onClick={() => setPreviewDevice('desktop')}
								sx={{ bgcolor: previewDevice === 'desktop' ? 'primary.light' : 'transparent' }}
							>
								<ComputerIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Chế độ xem Điện thoại (Mobile)">
							<IconButton
								size="small"
								color={previewDevice === 'mobile' ? 'primary' : 'default'}
								onClick={() => setPreviewDevice('mobile')}
								sx={{ bgcolor: previewDevice === 'mobile' ? 'primary.light' : 'transparent' }}
							>
								<SmartphoneIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Paper>

					<Button
						variant="outlined"
						color="inherit"
						startIcon={<RefreshIcon />}
						onClick={handleReset}
						disabled={isSaving}
					>
						Khôi Phục
					</Button>

					<Button
						variant="contained"
						color="secondary"
						startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
						onClick={handleSave}
						disabled={isSaving}
						sx={{ px: 3, fontWeight: 700, borderRadius: 2 }}
					>
						{isSaving ? 'Đang Lưu...' : 'Lưu & Xuất Bản'}
					</Button>
				</Box>
			</Paper>

			{/* Main Split-Screen Container */}
			<Box className="flex flex-col lg:flex-row flex-1 p-16 sm:p-24 gap-24 overflow-hidden">
				{/* Left Sidebar: Controls & Accordion Editors (420px width) */}
				<Box sx={{ width: { xs: '100%', lg: 440 }, maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }} className="flex flex-col gap-16 pr-4">
					{/* Section 1: Brand & Logo */}
					<Accordion defaultExpanded elevation={1} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<StorefrontIcon color="primary" />
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									1. Nhận Diện Thương Hiệu & Logo
								</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<TextField
								label="Tên Cửa Hàng (Store Name)"
								value={form.storeName}
								onChange={(e) => handleChange('storeName', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Khẩu Hiệu / Slogan"
								value={form.slogan}
								onChange={(e) => handleChange('slogan', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Đường dẫn Logo (URL)"
								value={form.logoUrl}
								onChange={(e) => handleChange('logoUrl', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Favicon (Biểu tượng thanh trình duyệt)"
								value={form.faviconUrl}
								onChange={(e) => handleChange('faviconUrl', e.target.value)}
								fullWidth
								size="small"
							/>
						</AccordionDetails>
					</Accordion>

					{/* Section 2: Color Palette */}
					<Accordion defaultExpanded elevation={1} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<PaletteIcon color="secondary" />
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									2. Bảng Màu Sắc Chủ Đạo (Color Palette)
								</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
							<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
								BẢNG MÀU PHỐI SẴN THEO XU HƯỚNG:
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{COLOR_PRESETS.map((preset, idx) => (
									<Chip
										key={idx}
										label={preset.name}
										onClick={() => handleApplyPreset(preset)}
										variant={form.primaryColor === preset.primary ? 'filled' : 'outlined'}
										color={form.primaryColor === preset.primary ? 'primary' : 'default'}
										sx={{
											cursor: 'pointer',
											fontWeight: 600,
											borderColor: preset.primary
										}}
									/>
								))}
							</Box>

							<Divider />

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<input
									type="color"
									value={form.primaryColor}
									onChange={(e) => handleChange('primaryColor', e.target.value)}
									style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
								/>
								<TextField
									label="Màu Chủ Đạo (Primary Color)"
									value={form.primaryColor}
									onChange={(e) => handleChange('primaryColor', e.target.value)}
									fullWidth
									size="small"
								/>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<input
									type="color"
									value={form.secondaryColor}
									onChange={(e) => handleChange('secondaryColor', e.target.value)}
									style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
								/>
								<TextField
									label="Màu Phụ Trợ (Secondary Color)"
									value={form.secondaryColor}
									onChange={(e) => handleChange('secondaryColor', e.target.value)}
									fullWidth
									size="small"
								/>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<input
									type="color"
									value={form.accentColor}
									onChange={(e) => handleChange('accentColor', e.target.value)}
									style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
								/>
								<TextField
									label="Màu Nhấn (Accent / Badges)"
									value={form.accentColor}
									onChange={(e) => handleChange('accentColor', e.target.value)}
									fullWidth
									size="small"
								/>
							</Box>
						</AccordionDetails>
					</Accordion>

					{/* Section 3: Announcement Bar */}
					<Accordion elevation={1} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<CampaignIcon color="warning" />
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									3. Thanh Thông Báo Đầu Trang (Announcement Bar)
								</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<FormControlLabel
								control={
									<Switch
										checked={form.announcementEnabled}
										onChange={(e) => handleChange('announcementEnabled', e.target.checked)}
										color="primary"
									/>
								}
								label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Bật thanh thông báo</Typography>}
							/>
							<TextField
								label="Nội dung thông báo"
								value={form.announcementText}
								onChange={(e) => handleChange('announcementText', e.target.value)}
								fullWidth
								size="small"
								multiline
								rows={2}
							/>
							<TextField
								label="Liên kết điều hướng (Link)"
								value={form.announcementLink}
								onChange={(e) => handleChange('announcementLink', e.target.value)}
								fullWidth
								size="small"
							/>
						</AccordionDetails>
					</Accordion>

					{/* Section 4: Hero Showcase */}
					<Accordion elevation={1} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<ViewCarouselIcon color="info" />
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									4. Biểu Ngữ Trang Chủ (Hero Banner Showcase)
								</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<TextField
								label="Huy Hiệu Khuyến Mãi (Badge)"
								value={form.promotionalBadge}
								onChange={(e) => handleChange('promotionalBadge', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Tiêu Đề Lớn (Hero Headline)"
								value={form.heroTitle}
								onChange={(e) => handleChange('heroTitle', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Mô Tả Phụ (Subtitle)"
								value={form.heroSubtitle}
								onChange={(e) => handleChange('heroSubtitle', e.target.value)}
								fullWidth
								size="small"
								multiline
								rows={2}
							/>
							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
								<TextField
									label="Nút Kêu Gọi (CTA Text)"
									value={form.heroCtaText}
									onChange={(e) => handleChange('heroCtaText', e.target.value)}
									fullWidth
									size="small"
								/>
								<TextField
									label="Liên kết nút (CTA Link)"
									value={form.heroCtaLink}
									onChange={(e) => handleChange('heroCtaLink', e.target.value)}
									fullWidth
									size="small"
								/>
							</Box>
							<TextField
								label="Đường dẫn ảnh nền (Hero Banner Image URL)"
								value={form.heroBannerUrl}
								onChange={(e) => handleChange('heroBannerUrl', e.target.value)}
								fullWidth
								size="small"
							/>
						</AccordionDetails>
					</Accordion>

					{/* Section 5: Contact & Footer */}
					<Accordion elevation={1} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<ContactSupportIcon color="success" />
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
									5. Thông Tin Liên Hệ & Chân Trang (Footer)
								</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<TextField
								label="Hotline tư vấn"
								value={form.hotline}
								onChange={(e) => handleChange('hotline', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Email hỗ trợ"
								value={form.supportEmail}
								onChange={(e) => handleChange('supportEmail', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Địa chỉ trụ sở"
								value={form.storeAddress}
								onChange={(e) => handleChange('storeAddress', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Facebook Fanpage URL"
								value={form.facebookUrl}
								onChange={(e) => handleChange('facebookUrl', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="TikTok Shop URL"
								value={form.tikTokUrl}
								onChange={(e) => handleChange('tikTokUrl', e.target.value)}
								fullWidth
								size="small"
							/>
							<TextField
								label="Dòng chữ bản quyền (Copyright)"
								value={form.copyrightText}
								onChange={(e) => handleChange('copyrightText', e.target.value)}
								fullWidth
								size="small"
							/>
						</AccordionDetails>
					</Accordion>
				</Box>

				{/* Right Column: Live Interactive Storefront Preview */}
				<Box className="flex-1 flex flex-col items-center justify-start overflow-hidden">
					<Paper
						elevation={4}
						sx={{
							width: previewDevice === 'mobile' ? 385 : '100%',
							maxWidth: '100%',
							height: 'calc(100vh - 150px)',
							borderRadius: previewDevice === 'mobile' ? '36px' : '16px',
							border: previewDevice === 'mobile' ? '8px solid #1e293b' : '1px solid #e2e8f0',
							overflowY: 'auto',
							display: 'flex',
							flexDirection: 'column',
							bgcolor: '#ffffff',
							color: '#0f172a',
							transition: 'all 0.3s ease',
							boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
						}}
					>
						{/* 1. Live Announcement Bar */}
						{form.announcementEnabled && (
							<Box
								sx={{
									bgcolor: form.primaryColor,
									color: '#ffffff',
									py: 1,
									px: 2,
									textAlign: 'center',
									fontSize: '0.8rem',
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 1
								}}
							>
								<span>{form.announcementText}</span>
							</Box>
						)}

						{/* 2. Store Header Navbar */}
						<Box
							sx={{
								p: 2,
								px: 3,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								borderBottom: '1px solid #f1f5f9',
								bgcolor: '#ffffff'
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<Box
									sx={{
										width: 36,
										height: 36,
										borderRadius: '10px',
										bgcolor: form.primaryColor,
										color: '#ffffff',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontWeight: 900,
										fontSize: '1.2rem'
									}}
								>
									{form.storeName ? form.storeName[0].toUpperCase() : 'E'}
								</Box>
								<Box>
									<Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#0f172a' }}>
										{form.storeName}
									</Typography>
									<Typography variant="caption" sx={{ color: '#64748b' }}>
										{form.slogan}
									</Typography>
								</Box>
							</Box>

							{previewDevice === 'desktop' && (
								<Box sx={{ display: 'flex', gap: 3, fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
									<span style={{ color: form.primaryColor, cursor: 'pointer' }}>Trang Chủ</span>
									<span style={{ cursor: 'pointer' }}>Sản Phẩm</span>
									<span style={{ cursor: 'pointer' }}>Khuyến Mãi</span>
									<span style={{ cursor: 'pointer' }}>Về Chúng Tôi</span>
								</Box>
							)}

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<IconButton size="small">
									<SearchIcon fontSize="small" />
								</IconButton>
								<Box
									sx={{
										p: 0.8,
										borderRadius: '50%',
										bgcolor: `${form.primaryColor}15`,
										color: form.primaryColor,
										display: 'flex',
										alignItems: 'center',
										cursor: 'pointer'
									}}
								>
									<ShoppingBagIcon fontSize="small" />
								</Box>
							</Box>
						</Box>

						{/* 3. Hero Showcase Section */}
						<Box
							sx={{
								position: 'relative',
								minHeight: previewDevice === 'mobile' ? 240 : 340,
								backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url(${form.heroBannerUrl})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: previewDevice === 'mobile' ? 'center' : 'flex-start',
								textAlign: previewDevice === 'mobile' ? 'center' : 'left',
								p: previewDevice === 'mobile' ? 3 : 6,
								color: '#ffffff'
							}}
						>
							{form.promotionalBadge && (
								<Chip
									label={form.promotionalBadge}
									size="small"
									sx={{
										bgcolor: form.accentColor,
										color: '#ffffff',
										fontWeight: 800,
										fontSize: '0.75rem',
										mb: 2
									}}
								/>
							)}
							<Typography variant={previewDevice === 'mobile' ? 'h5' : 'h3'} sx={{ fontWeight: 900, mb: 1.5, maxWidth: 650 }}>
								{form.heroTitle}
							</Typography>
							<Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 550, mb: 3 }}>
								{form.heroSubtitle}
							</Typography>
							<Button
								variant="contained"
								sx={{
									bgcolor: form.primaryColor,
									color: '#ffffff',
									fontWeight: 700,
									px: 3,
									py: 1,
									borderRadius: 2,
									textTransform: 'none',
									fontSize: '0.95rem',
									'&:hover': { bgcolor: form.secondaryColor }
								}}
							>
								{form.heroCtaText} →
							</Button>
						</Box>

						{/* 4. Featured Products Section */}
						<Box sx={{ p: previewDevice === 'mobile' ? 2 : 4, bgcolor: '#f8fafc', flex: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
										Sản Phẩm Nổi Bật
									</Typography>
									<Typography variant="caption" sx={{ color: '#64748b' }}>
										Sản phẩm được lựa chọn nhiều nhất trong tuần
									</Typography>
								</Box>
								<Typography variant="caption" sx={{ color: form.primaryColor, fontWeight: 700, cursor: 'pointer' }}>
									Xem tất cả →
								</Typography>
							</Box>

							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: previewDevice === 'mobile' ? '1fr 1fr' : 'repeat(3, 1fr)',
									gap: 2
								}}
							>
								{/* Demo Card 1 */}
								<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: '#ffffff', overflow: 'hidden' }}>
									<Box
										sx={{
											height: previewDevice === 'mobile' ? 110 : 160,
											borderRadius: 2,
											bgcolor: '#f1f5f9',
											backgroundImage: 'url(https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80)',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											mb: 1.5,
											position: 'relative'
										}}
									>
										<Chip label="-35%" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: form.accentColor, color: '#ffffff', fontWeight: 800, fontSize: '0.65rem' }} />
									</Box>
									<Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
										Áo Thun Cotton Premium
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
										<Typography variant="subtitle2" sx={{ fontWeight: 800, color: form.primaryColor }}>
											299.000₫
										</Typography>
										<Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
											450.000₫
										</Typography>
									</Box>
									<Button
										variant="contained"
										fullWidth
										size="small"
										sx={{
											bgcolor: form.primaryColor,
											color: '#ffffff',
											fontWeight: 700,
											fontSize: '0.75rem',
											borderRadius: 1.5,
											'&:hover': { bgcolor: form.secondaryColor }
										}}
									>
										Thêm Vào Giỏ
									</Button>
								</Paper>

								{/* Demo Card 2 */}
								<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: '#ffffff', overflow: 'hidden' }}>
									<Box
										sx={{
											height: previewDevice === 'mobile' ? 110 : 160,
											borderRadius: 2,
											bgcolor: '#f1f5f9',
											backgroundImage: 'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80)',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											mb: 1.5,
											position: 'relative'
										}}
									>
										<Chip label="BÁN CHẠY" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: form.primaryColor, color: '#ffffff', fontWeight: 800, fontSize: '0.65rem' }} />
									</Box>
									<Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
										Giày Thể Thao Pro Runner
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
										<Typography variant="subtitle2" sx={{ fontWeight: 800, color: form.primaryColor }}>
											890.000₫
										</Typography>
										<Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
											1.200.000₫
										</Typography>
									</Box>
									<Button
										variant="contained"
										fullWidth
										size="small"
										sx={{
											bgcolor: form.primaryColor,
											color: '#ffffff',
											fontWeight: 700,
											fontSize: '0.75rem',
											borderRadius: 1.5,
											'&:hover': { bgcolor: form.secondaryColor }
										}}
									>
										Thêm Vào Giỏ
									</Button>
								</Paper>

								{/* Demo Card 3 (Desktop Only) */}
								{previewDevice === 'desktop' && (
									<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: '#ffffff', overflow: 'hidden' }}>
										<Box
											sx={{
												height: 160,
												borderRadius: 2,
												bgcolor: '#f1f5f9',
												backgroundImage: 'url(https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80)',
												backgroundSize: 'cover',
												backgroundPosition: 'center',
												mb: 1.5,
												position: 'relative'
											}}
										>
											<Chip label="MỚI VỀ" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: form.secondaryColor, color: '#ffffff', fontWeight: 800, fontSize: '0.65rem' }} />
										</Box>
										<Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
											Tai Nghe Bluetooth Hi-Fi
										</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
											<Typography variant="subtitle2" sx={{ fontWeight: 800, color: form.primaryColor }}>
												1.450.000₫
											</Typography>
											<Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
												1.800.000₫
											</Typography>
										</Box>
										<Button
											variant="contained"
											fullWidth
											size="small"
											sx={{
												bgcolor: form.primaryColor,
												color: '#ffffff',
												fontWeight: 700,
												fontSize: '0.75rem',
												borderRadius: 1.5,
												'&:hover': { bgcolor: form.secondaryColor }
											}}
										>
											Thêm Vào Giỏ
										</Button>
									</Paper>
								)}
							</Box>
						</Box>

						{/* 5. Live Store Footer */}
						<Box sx={{ p: 3, bgcolor: '#0f172a', color: '#f8fafc', fontSize: '0.8rem' }}>
							<Box sx={{ display: 'flex', flexDirection: previewDevice === 'mobile' ? 'column' : 'row', justifyContent: 'space-between', gap: 2, mb: 2 }}>
								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
										{form.storeName}
									</Typography>
									<Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
										{form.slogan}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#cbd5e1', fontSize: '0.75rem', mb: 0.5 }}>
										<PhoneIcon fontSize="inherit" sx={{ color: form.accentColor }} />
										<span>Hotline: {form.hotline}</span>
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#cbd5e1', fontSize: '0.75rem' }}>
										<EmailIcon fontSize="inherit" sx={{ color: form.accentColor }} />
										<span>Email: {form.supportEmail}</span>
									</Box>
								</Box>

								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>
										Trụ Sở Cửa Hàng
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, color: '#cbd5e1', fontSize: '0.75rem' }}>
										<LocationOnIcon fontSize="inherit" sx={{ color: form.accentColor, mt: 0.3 }} />
										<span>{form.storeAddress}</span>
									</Box>
								</Box>
							</Box>
							<Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1.5 }} />
							<Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', display: 'block' }}>
								{form.copyrightText}
							</Typography>
						</Box>
					</Paper>
				</Box>
			</Box>
		</Box>
	);
}
