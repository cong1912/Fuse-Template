import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CheckIcon from '@mui/icons-material/Check';
import PaletteIcon from '@mui/icons-material/Palette';
import SaveIcon from '@mui/icons-material/Save';
import {
	useGetTenantSiteLayoutQuery,
	useUpdateTenantThemeMutation,
	ThemeTokensDto
} from '../../AdminTenantsApi';

const PRIMARY_PRESETS = [
	{ label: 'Royal Indigo', value: '#4F46E5' },
	{ label: 'Emerald Mint', value: '#10B981' },
	{ label: 'Ocean Sky', value: '#0284C7' },
	{ label: 'Rose Passion', value: '#F43F5E' },
	{ label: 'Amethyst Violet', value: '#8B5CF6' },
	{ label: 'Amber Gold', value: '#F59E0B' },
	{ label: 'Dark Slate', value: '#1E293B' }
];

const RADIUS_PRESETS = [
	{ label: 'Sharp (0px)', value: '0px' },
	{ label: 'Subtle (4px)', value: '4px' },
	{ label: 'Modern (8px)', value: '8px' },
	{ label: 'Rounded (16px)', value: '16px' },
	{ label: 'Pill (9999px)', value: '9999px' }
];

const FONT_PRESETS = ['Inter', 'Roboto', 'Plus Jakarta Sans', 'Outfit'];

export function TenantBrandingTab() {
	const { data: layoutData, isLoading, refetch } = useGetTenantSiteLayoutQuery();
	const [updateTenantTheme, { isLoading: isSaving }] = useUpdateTenantThemeMutation();

	const [tokens, setTokens] = useState<ThemeTokensDto>({
		primaryColor: '#4F46E5',
		accentColor: '#8B5CF6',
		backgroundColor: '#FFFFFF',
		fontFamily: 'Inter',
		borderRadius: '8px',
		darkMode: false
	});

	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useEffect(() => {
		if (layoutData?.themeTokens) {
			setTokens({
				primaryColor: layoutData.themeTokens.primaryColor || '#4F46E5',
				accentColor: layoutData.themeTokens.accentColor || '#8B5CF6',
				backgroundColor: layoutData.themeTokens.backgroundColor || '#FFFFFF',
				fontFamily: layoutData.themeTokens.fontFamily || 'Inter',
				borderRadius: layoutData.themeTokens.borderRadius || '8px',
				darkMode: Boolean(layoutData.themeTokens.darkMode)
			});
		}
	}, [layoutData]);

	const handleSave = async () => {
		try {
			setErrorMsg(null);
			setSuccessMsg(null);
			await updateTenantTheme(tokens).unwrap();
			setSuccessMsg('Đã lưu cấu hình thương hiệu cửa hàng (Theme Tokens) thành công!');
			refetch();
		} catch (err: any) {
			setErrorMsg(err?.data?.detail || err?.message || 'Lỗi khi lưu cấu hình thương hiệu.');
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center p-48">
				<CircularProgress />
			</div>
		);
	}

	return (
		<Paper className="p-24 rounded-2xl border border-divider space-y-24">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-16 pb-16 border-b border-divider">
				<div>
					<Typography variant="h6" className="font-bold flex items-center gap-8">
						<PaletteIcon color="primary" />
						<span>Tùy Biến Thương Hiệu Cửa Hàng (White-Labeling & Theme Tokens)</span>
					</Typography>
					<Typography variant="body2" color="text.secondary" className="mt-4">
						Cá nhân hóa màu sắc, font chữ và phong cách bo góc cho Storefront và Dashboard của cửa hàng.
					</Typography>
				</div>
				<Button
					variant="contained"
					color="primary"
					startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
					disabled={isSaving}
					onClick={handleSave}
					data-testid="save-theme-tokens-btn"
				>
					{isSaving ? 'Đang Lưu...' : 'Lưu Nhận Diện Thương Hiệu'}
				</Button>
			</div>

			{successMsg && (
				<Alert severity="success" onClose={() => setSuccessMsg(null)}>
					{successMsg}
				</Alert>
			)}

			{errorMsg && (
				<Alert severity="error" onClose={() => setErrorMsg(null)}>
					{errorMsg}
				</Alert>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
				{/* Controls Column */}
				<div className="space-y-24">
					{/* Primary Brand Color */}
					<div>
						<Typography variant="subtitle2" className="font-bold mb-8 text-text-primary">
							Màu Sắc Nhận Diện Chính (Primary Brand Color)
						</Typography>
						<div className="flex flex-wrap gap-8 mb-12">
							{PRIMARY_PRESETS.map((preset) => {
								const isSelected = tokens.primaryColor.toLowerCase() === preset.value.toLowerCase();
								return (
									<button
										key={preset.value}
										type="button"
										onClick={() => setTokens({ ...tokens, primaryColor: preset.value })}
										className="flex items-center gap-6 px-12 py-6 rounded-lg border text-12 font-medium transition hover:shadow-sm"
										style={{
											borderColor: isSelected ? preset.value : '#e2e8f0',
											backgroundColor: isSelected ? `${preset.value}15` : 'transparent'
										}}
									>
										<span
											className="w-16 h-16 rounded-full inline-block border border-black/10"
											style={{ backgroundColor: preset.value }}
										/>
										<span>{preset.label}</span>
										{isSelected && <CheckIcon sx={{ fontSize: 16, color: preset.value }} />}
									</button>
								);
							})}
						</div>
						<div className="flex items-center gap-12">
							<TextField
								label="Mã màu HEX"
								size="small"
								value={tokens.primaryColor}
								onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
								className="w-180"
							/>
							<input
								type="color"
								value={tokens.primaryColor.startsWith('#') ? tokens.primaryColor : '#4F46E5'}
								onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
								className="w-40 h-40 rounded cursor-pointer border border-divider p-0"
							/>
						</div>
					</div>

					{/* Border Radius */}
					<div>
						<Typography variant="subtitle2" className="font-bold mb-8 text-text-primary">
							Độ Bo Góc Giao Diện (Border Radius)
						</Typography>
						<div className="flex flex-wrap gap-8">
							{RADIUS_PRESETS.map((preset) => {
								const isSelected = tokens.borderRadius === preset.value;
								return (
									<Chip
										key={preset.value}
										label={preset.label}
										onClick={() => setTokens({ ...tokens, borderRadius: preset.value })}
										color={isSelected ? 'primary' : 'default'}
										variant={isSelected ? 'filled' : 'outlined'}
										className="cursor-pointer"
									/>
								);
							})}
						</div>
					</div>

					{/* Font Family */}
					<div>
						<Typography variant="subtitle2" className="font-bold mb-8 text-text-primary">
							Phông Chữ Tiêu Chuẩn (Font Family)
						</Typography>
						<div className="flex flex-wrap gap-8">
							{FONT_PRESETS.map((font) => {
								const isSelected = tokens.fontFamily === font;
								return (
									<Chip
										key={font}
										label={font}
										onClick={() => setTokens({ ...tokens, fontFamily: font })}
										color={isSelected ? 'primary' : 'default'}
										variant={isSelected ? 'filled' : 'outlined'}
										className="cursor-pointer"
										style={{ fontFamily: font }}
									/>
								);
							})}
						</div>
					</div>
				</div>

				{/* Live Preview Column */}
				<div className="bg-background-default p-24 rounded-2xl border border-divider space-y-20">
					<Typography variant="subtitle1" className="font-bold flex items-center gap-8 text-text-primary">
						<FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
						<span>Bản Xem Trước Trực Quan (Live Interactive Preview)</span>
					</Typography>

					<div
						className="p-20 bg-background-paper border border-divider space-y-16 shadow-sm transition-all"
						style={{
							borderRadius: tokens.borderRadius,
							fontFamily: tokens.fontFamily
						}}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-8">
								<div
									className="w-12 h-12 rounded-full"
									style={{ backgroundColor: tokens.primaryColor }}
								/>
								<Typography variant="subtitle2" className="font-bold">
									Cửa Hàng Trực Tuyến
								</Typography>
							</div>
							<span
								className="text-11 px-8 py-2 font-bold"
								style={{
									backgroundColor: `${tokens.primaryColor}20`,
									color: tokens.primaryColor,
									borderRadius: tokens.borderRadius
								}}
							>
								PRO VERIFIED
							</span>
						</div>

						<Typography variant="body2" color="text.secondary">
							Giao diện được render với màu chủ đạo{' '}
							<strong style={{ color: tokens.primaryColor }}>{tokens.primaryColor}</strong>, bo góc{' '}
							<strong>{tokens.borderRadius}</strong> và font chữ <strong>{tokens.fontFamily}</strong>.
						</Typography>

						<div className="flex items-center gap-12 pt-8">
							<button
								type="button"
								className="px-16 py-8 text-white font-semibold text-13 shadow-sm transition hover:opacity-90"
								style={{
									backgroundColor: tokens.primaryColor,
									borderRadius: tokens.borderRadius
								}}
							>
								Mua Ngay
							</button>

							<button
								type="button"
								className="px-16 py-8 font-semibold text-13 border transition hover:bg-black/5"
								style={{
									borderColor: tokens.primaryColor,
									color: tokens.primaryColor,
									borderRadius: tokens.borderRadius
								}}
							>
								Xem Chi Tiết
							</button>
						</div>
					</div>
				</div>
			</div>
		</Paper>
	);
}

export default TenantBrandingTab;
