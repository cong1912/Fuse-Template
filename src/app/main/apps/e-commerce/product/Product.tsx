import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import GoogleIcon from '@mui/icons-material/Google';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm, Controller, useWatch } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProductHeader from './ProductHeader';
import BasicInfoTab from './tabs/BasicInfoTab';
import InventoryTab from './tabs/InventoryTab';
import ProductImagesTab from './tabs/ProductImagesTab';
import VariantsTab from './tabs/VariantsTab';
import DigitalProductTab from './tabs/DigitalProductTab';
import SerialKeyProductTab from './tabs/SerialKeyProductTab';
import { useGetECommerceProductQuery } from '../ECommerceApi';
import ProductModel from './models/ProductModel';

/**
 * Isolated Google SEO Preview Component (prevents full product page re-renders)
 */
function GoogleSeoPreview() {
	const name = (useWatch({ name: 'name' }) as string) || 'Tên sản phẩm mẫu';
	const metaTitle = (useWatch({ name: 'metaTitle' }) as string) || `${name} - Chính Hãng Giá Tốt`;
	const metaDescription = (useWatch({ name: 'metaDescription' }) as string) || `Mua ngay ${name} chính hãng chất lượng cao. Miễn phí vận chuyển toàn quốc, cam kết đổi trả 7 ngày.`;
	const handleUrl = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'san-pham';

	return (
		<Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#fbfcfe' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
				<GoogleIcon fontSize="small" className="text-blue-500" />
				<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
					Xem Trước Kết Quả Google SEO
				</Typography>
			</Box>

			<Typography variant="body2" sx={{ color: '#1a0dab', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', mb: 0.5 }}>
				{metaTitle}
			</Typography>
			<Typography variant="caption" sx={{ color: '#006621', display: 'block', mb: 0.5 }}>
				https://eshop.vn/products/{handleUrl}
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebKitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
				{metaDescription}
			</Typography>
		</Paper>
	);
}

/**
 * Form Validation Schema
 */
const schema = z.object({
	name: z.string().nonempty('Vui lòng nhập tên sản phẩm').min(3, 'Tên sản phẩm tối thiểu 3 ký tự')
});

/**
 * The Saleor & Shopify-grade 2-column product page.
 */
function Product() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const routeParams = useParams();
	const { productId } = routeParams;

	const {
		data: product,
		isLoading,
		isError
	} = useGetECommerceProductQuery(productId, {
		skip: !productId || productId === 'new'
	});

	const [tabValue, setTabValue] = useState(0);

	const methods = useForm<any>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			status: 'active',
			isPublished: true,
			channels: ['online_store', 'shopee', 'tiktok'],
			metaTitle: '',
			metaDescription: ''
		},
		resolver: zodResolver(schema)
	});

	const { reset, control } = methods;

	useEffect(() => {
		if (productId === 'new') {
			reset({
				...ProductModel({}),
				status: 'active',
				isPublished: true,
				channels: ['online_store', 'shopee', 'tiktok'],
				metaTitle: '',
				metaDescription: ''
			});
		}
	}, [productId, reset]);

	useEffect(() => {
		if (product) {
			reset({
				...product,
				status: (product as any).status || 'active',
				isPublished: true,
				channels: ['online_store', 'shopee', 'tiktok'],
				metaTitle: (product as any).metaTitle || '',
				metaDescription: (product as any).metaDescription || ''
			});
		}
	}, [product, reset]);

	const productType = (useWatch({ control, name: 'productType' }) as string) || 'Physical';

	useEffect(() => {
		const maxIndex = productType === 'Physical' ? 3 : 2;
		if (tabValue > maxIndex) {
			setTabValue(0);
		}
	}, [productType, tabValue]);

	function handleTabChange(event: SyntheticEvent, value: number) {
		setTabValue(value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && productId !== 'new') {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-col flex-1 items-center justify-center h-full"
			>
				<Typography color="text.secondary" variant="h5">
					Không tìm thấy sản phẩm này!
				</Typography>
				<Button
					className="mt-24"
					component={Link}
					variant="outlined"
					to="/apps/e-commerce/products"
					color="inherit"
				>
					Về Trang Danh Sách Sản Phẩm
				</Button>
			</motion.div>
		);
	}

	if (product && routeParams.productId !== product.id && routeParams.productId !== 'new') {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<ProductHeader />}
				content={
					<div className="flex flex-col lg:flex-row gap-24 p-16 sm:p-24 w-full">
						{/* Left Column (2/3 Main) */}
						<div className="flex-1 min-w-0">
							{productType === 'Physical' && (
								<>
									<Tabs
										value={tabValue}
										onChange={handleTabChange}
										indicatorColor="secondary"
										textColor="secondary"
										variant="scrollable"
										scrollButtons="auto"
										classes={{ root: 'w-full border-b-1 mb-24' }}
									>
										<Tab label="Thông Tin & Giá Bán" />
										<Tab label="Thư Viện Ảnh" />
										<Tab label="Ma Trận Biến Thể" />
										<Tab label="Kho Hàng & SKU" />
									</Tabs>

									<div className={tabValue !== 0 ? 'hidden' : ''}>
										<BasicInfoTab />
									</div>

									<div className={tabValue !== 1 ? 'hidden' : ''}>
										<ProductImagesTab />
									</div>

									<div className={tabValue !== 2 ? 'hidden' : ''}>
										<VariantsTab />
									</div>

									<div className={tabValue !== 3 ? 'hidden' : ''}>
										<InventoryTab />
									</div>
								</>
							)}

							{productType === 'Digital' && (
								<>
									<Tabs
										value={tabValue}
										onChange={handleTabChange}
										indicatorColor="secondary"
										textColor="secondary"
										variant="scrollable"
										scrollButtons="auto"
										classes={{ root: 'w-full border-b-1 mb-24' }}
									>
										<Tab label="Thông Tin & Giá Bán" />
										<Tab label="Thư Viện Ảnh" />
										<Tab label="Tệp Tin & Tải Về (PDF/File)" />
									</Tabs>

									<div className={tabValue !== 0 ? 'hidden' : ''}>
										<BasicInfoTab />
									</div>

									<div className={tabValue !== 1 ? 'hidden' : ''}>
										<ProductImagesTab />
									</div>

									<div className={tabValue !== 2 ? 'hidden' : ''}>
										<DigitalProductTab />
									</div>
								</>
							)}

							{productType === 'SerialKey' && (
								<>
									<Tabs
										value={tabValue}
										onChange={handleTabChange}
										indicatorColor="secondary"
										textColor="secondary"
										variant="scrollable"
										scrollButtons="auto"
										classes={{ root: 'w-full border-b-1 mb-24' }}
									>
										<Tab label="Thông Tin & Giá Bán" />
										<Tab label="Thư Viện Ảnh" />
										<Tab label="Kho Tài Khoản & Serial Key" />
									</Tabs>

									<div className={tabValue !== 0 ? 'hidden' : ''}>
										<BasicInfoTab />
									</div>

									<div className={tabValue !== 1 ? 'hidden' : ''}>
										<ProductImagesTab />
									</div>

									<div className={tabValue !== 2 ? 'hidden' : ''}>
										<SerialKeyProductTab />
									</div>
								</>
							)}
						</div>

						{/* Right Column (1/3 Sidebar - Shopify/Saleor style) */}
						<div className="w-full lg:w-360 flex flex-col gap-24 shrink-0">
							{/* Status & Visibility Card */}
							<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
									Trạng Thái Sản Phẩm
								</Typography>

								<Controller
									name="status"
									control={control}
									defaultValue="active"
									render={({ field }) => (
										<TextField
											{...field}
											select
											fullWidth
											size="small"
											label="Trạng thái xuất bản"
											sx={{ mb: 2 }}
										>
											<MenuItem value="active">
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
													<span>Đang bán (Active)</span>
												</Box>
											</MenuItem>
											<MenuItem value="draft">
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
													<span>Bản nháp (Draft)</span>
												</Box>
											</MenuItem>
											<MenuItem value="archived">
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled' }} />
													<span>Lưu trữ (Archived)</span>
												</Box>
											</MenuItem>
										</TextField>
									)}
								/>

								<Controller
									name="isPublished"
									control={control}
									defaultValue={true}
									render={({ field }) => (
										<FormControlLabel
											control={<Switch {...field} checked={field.value} color="primary" />}
											label="Hiển thị trên Cửa hàng trực tuyến"
										/>
									)}
								/>
							</Paper>

							{/* Sales Channels Card */}
							<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
									<StorefrontIcon className="text-indigo-500" fontSize="small" />
									<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
										Kênh Phân Phối (Channels)
									</Typography>
								</Box>

								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<Typography variant="body2">Cửa hàng trực tuyến (Web)</Typography>
										<Chip label="Đang đồng bộ" color="success" size="small" icon={<CheckCircleIcon />} />
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<Typography variant="body2">Sàn Shopee Mall</Typography>
										<Chip label="Đã kết nối" color="primary" size="small" variant="outlined" />
									</Box>
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<Typography variant="body2">TikTok Shop</Typography>
										<Chip label="Đã kết nối" color="primary" size="small" variant="outlined" />
									</Box>
								</Box>
							</Paper>

							{/* Live Google SERP Snippet Preview */}
							<GoogleSeoPreview />
						</div>
					</div>
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>
		</FormProvider>
	);
}

export default Product;
