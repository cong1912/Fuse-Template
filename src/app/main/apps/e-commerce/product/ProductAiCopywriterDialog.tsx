import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GoogleIcon from '@mui/icons-material/Google';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CircularProgress from '@mui/material/CircularProgress';

import {
	useGenerateProductDescriptionMutation,
	useGenerateSeoMetaMutation
} from '../ECommerceApi';

interface ProductAiCopywriterDialogProps {
	open: boolean;
	onClose: () => void;
	productName: string;
	onApply: (data: { description: string; metaTitle: string; metaDescription: string; tags: string[] }) => void;
}

export default function ProductAiCopywriterDialog({
	open,
	onClose,
	productName,
	onApply
}: ProductAiCopywriterDialogProps) {
	const [generateDesc] = useGenerateProductDescriptionMutation();
	const [generateSeo] = useGenerateSeoMetaMutation();

	const [name, setName] = useState(productName || '');
	const [tone, setTone] = useState('Professional');
	const [keywords, setKeywords] = useState('cao cấp, chính hãng, thoáng mát, bền đẹp');
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedData, setGeneratedData] = useState<{
		description: string;
		usps: string[];
		metaTitle: string;
		metaDescription: string;
		tags: string[];
	} | null>(null);

	React.useEffect(() => {
		if (open) {
			setName(productName || '');
			if (productName && !generatedData) {
				handleGenerate(productName);
			}
		}
	}, [open, productName]);

	const handleGenerate = async (customName?: string) => {
		const targetName = customName || name || 'Sản phẩm mới';
		setIsGenerating(true);

		try {
			const [descResult, seoResult] = await Promise.allSettled([
				generateDesc({
					name: targetName,
					category: 'Thời trang & Đời sống',
					price: 299000,
					attributes: keywords,
					toneStyle: tone
				}).unwrap(),
				generateSeo({
					name: targetName,
					category: 'Thời trang & Đời sống'
				}).unwrap()
			]);

			let desc = '';
			if (descResult.status === 'fulfilled' && descResult.value?.content) {
				desc = descResult.value.content;
			} else {
				desc = `<h3>${targetName} - Chuẩn Mực Chất Lượng Cao Cấp</h3><p>${targetName} mang lại trải nghiệm tối ưu, thiết kế hiện đại, bền đẹp và tiện dụng trong mọi hoàn cảnh.</p>`;
			}

			let metaTitle = `${targetName} - Chính Hãng Giá Tốt | E-Shop`;
			let metaDescription = `Mua ngay ${targetName} chính hãng chất lượng cao. Miễn phí vận chuyển toàn quốc, cam kết đổi trả 7 ngày!`;
			let tags = ['Chính hãng', 'Cao cấp', 'Hot trend', 'Bán chạy'];

			if (seoResult.status === 'fulfilled' && seoResult.value?.content) {
				try {
					const parsed = JSON.parse(seoResult.value.content);
					if (parsed.title) metaTitle = parsed.title;
					if (parsed.metaDescription) metaDescription = parsed.metaDescription;
					if (parsed.keywords && Array.isArray(parsed.keywords)) tags = parsed.keywords;
				} catch {
					// fallback to default tags
				}
			}

			setGeneratedData({
				description: desc,
				usps: [
					'Chất liệu cao cấp thoáng khí, hoàn thiện tinh xảo',
					'Thiết kế thông minh, tối ưu công năng sử dụng',
					'Độ bền vượt trội, an toàn và thân thiện',
					'Bảo hành chính hãng, đổi trả 7 ngày'
				],
				metaTitle,
				metaDescription,
				tags
			});
		} catch (e) {
			console.error('AI Generation error:', e);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleApply = () => {
		if (generatedData) {
			onApply({
				description: generatedData.description,
				metaTitle: generatedData.metaTitle,
				metaDescription: generatedData.metaDescription,
				tags: generatedData.tags
			});
			onClose();
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
				<AutoAwesomeIcon className="text-amber-500" />
				<Typography variant="h6" sx={{ fontWeight: 700 }}>
					AI Copywriter & SEO Generator
				</Typography>
				<Chip label="GPT-4o E-Commerce" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem', ml: 'auto' }} />
			</DialogTitle>

			<DialogContent dividers>
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
					<TextField
						label="Tên sản phẩm cần viết"
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Ví dụ: Áo polo nam cotton thoáng khí cao cấp"
						size="small"
					/>
					<TextField
						select
						label="Phong cách văn phong"
						fullWidth
						value={tone}
						onChange={(e) => setTone(e.target.value)}
						size="small"
					>
						<MenuItem value="persuasive">Thuyết phục & Thôi thúc mua hàng (E-Commerce)</MenuItem>
						<MenuItem value="luxury">Sang trọng & Đẳng cấp (Luxury / Brand)</MenuItem>
						<MenuItem value="casual">Thân thiện & Tự nhiên (GenZ / Lifestyle)</MenuItem>
						<MenuItem value="technical">Kỹ thuật & Chi tiết thông số (Specs / Tech)</MenuItem>
					</TextField>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
					<Button
						variant="contained"
						color="primary"
						startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
						onClick={() => handleGenerate()}
						disabled={isGenerating || !name.trim()}
						sx={{ px: 3 }}
					>
						{isGenerating ? 'AI Đang viết...' : 'Tạo Lại Bằng AI'}
					</Button>
				</Box>

				{generatedData && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						{/* Google SERP Snippet */}
						<Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : '#f8fafc', border: 1, borderColor: 'divider' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
								<GoogleIcon fontSize="small" className="text-blue-500" />
								<Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
									Xem trước kết quả tìm kiếm Google (Google SERP Snippet)
								</Typography>
							</Box>
							<Typography variant="body1" sx={{ color: '#1a0dab', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer' }}>
								{generatedData.metaTitle}
							</Typography>
							<Typography variant="caption" sx={{ color: '#006621', display: 'block', mb: 0.5 }}>
								https://eshop.vn/products/{name.toLowerCase().replace(/[^a-z0-9]/g, '-')}
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
								{generatedData.metaDescription}
							</Typography>
						</Box>

						{/* Bullet points */}
						<Box>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
								4 Điểm Nhấn Bán Hàng (USP Bullets):
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
								{generatedData.usps.map((usp, idx) => (
									<Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<CheckCircleOutlineIcon fontSize="small" className="text-emerald-500" />
										<Typography variant="body2">{usp}</Typography>
									</Box>
								))}
							</Box>
						</Box>

						{/* Description preview */}
						<Box>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
								Mô Tả Chi Tiết Chuẩn SEO:
							</Typography>
							<Box
								sx={{
									p: 2,
									borderRadius: 2,
									border: 1,
									borderColor: 'divider',
									maxHeight: 180,
									overflowY: 'auto',
									fontSize: '0.88rem',
									'& h3': { fontSize: '1rem', fontWeight: 700, mb: 1 },
									'& h4': { fontSize: '0.9rem', fontWeight: 600, mt: 1, mb: 0.5 },
									'& ul': { pl: 2, mb: 1 }
								}}
								dangerouslySetInnerHTML={{ __html: generatedData.description }}
							/>
						</Box>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} color="inherit">
					Hủy bỏ
				</Button>
				<Button
					onClick={handleApply}
					variant="contained"
					color="primary"
					disabled={!generatedData}
					startIcon={<CheckCircleOutlineIcon />}
				>
					Áp Dụng Vào Sản Phẩm
				</Button>
			</DialogActions>
		</Dialog>
	);
}
