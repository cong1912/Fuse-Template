import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { showMessage } from '@fuse/core/FuseMessage/store/fuseMessageSlice';
import {
	EcommerceProduct,
	useCreateECommerceProductMutation,
	useDeleteECommerceProductMutation,
	useUpdateECommerceProductMutation
} from '../ECommerceApi';

/**
 * The product header.
 */
function ProductHeader() {
	const routeParams = useParams();
	const { productId } = routeParams;
	const dispatch = useDispatch();

	const [createProduct, { isLoading: isCreating }] = useCreateECommerceProductMutation();
	const [saveProduct, { isLoading: isSaving }] = useUpdateECommerceProductMutation();
	const [removeProduct, { isLoading: isRemoving }] = useDeleteECommerceProductMutation();

	const methods = useFormContext();
	const { watch, getValues } = methods;

	const theme = useTheme();
	const navigate = useNavigate();

	const { name, images, featuredImageId } = (watch() || {}) as EcommerceProduct;

	const isFormSubmittable = Boolean(name && name.trim().length >= 2);

	function handleSaveProduct() {
		const values = { ...(getValues() as EcommerceProduct) };
		if (!values.sku) {
			values.sku = `PROD-${Date.now().toString().slice(-6)}`;
		}
		saveProduct(values)
			.unwrap()
			.then(() => {
				dispatch(showMessage({ message: 'Lưu thông tin sản phẩm thành công!', variant: 'success' }));
			})
			.catch((err: any) => {
				dispatch(showMessage({ message: err?.data?.detail || err?.data?.message || err?.message || 'Có lỗi khi lưu sản phẩm', variant: 'error' }));
			});
	}

	function handleCreateProduct() {
		const values = { ...(getValues() as EcommerceProduct) };
		if (!values.name || values.name.trim().length < 2) {
			dispatch(showMessage({ message: 'Vui lòng nhập tên sản phẩm', variant: 'warning' }));
			return;
		}
		if (!values.sku) {
			values.sku = `SKU-${Date.now().toString().slice(-6)}`;
		}
		createProduct(values)
			.unwrap()
			.then((data: any) => {
				dispatch(showMessage({ message: 'Tạo sản phẩm mới thành công!', variant: 'success' }));
				const newId = data?.id || data;
				navigate(`/apps/e-commerce/products/${newId}`);
			})
			.catch((err: any) => {
				dispatch(showMessage({ message: err?.data?.detail || err?.data?.message || err?.message || 'Có lỗi khi tạo sản phẩm', variant: 'error' }));
			});
	}

	function handleRemoveProduct() {
		if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
			removeProduct(productId)
				.unwrap()
				.then(() => {
					dispatch(showMessage({ message: 'Đã xóa sản phẩm thành công!', variant: 'success' }));
					navigate('/apps/e-commerce/products');
				})
				.catch((err: any) => {
					dispatch(showMessage({ message: err?.data?.detail || err?.data?.message || err?.message || 'Có lỗi khi xóa sản phẩm', variant: 'error' }));
				});
		}
	}

	return (
		<div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-24 sm:py-32 px-24 md:px-32">
			<div className="flex flex-col items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
				<motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
				>
					<Typography
						className="flex items-center sm:mb-12"
						component={Link}
						role="button"
						to="/apps/e-commerce/products"
						color="inherit"
					>
						<FuseSvgIcon size={20}>
							{theme.direction === 'ltr'
								? 'heroicons-outline:arrow-sm-left'
								: 'heroicons-outline:arrow-sm-right'}
						</FuseSvgIcon>
						<span className="flex mx-4 font-medium">Danh Sách Sản Phẩm</span>
					</Typography>
				</motion.div>

				<div className="flex items-center max-w-full">
					<motion.div
						className="hidden sm:flex"
						initial={{ scale: 0 }}
						animate={{ scale: 1, transition: { delay: 0.3 } }}
					>
						{images && images.length > 0 && featuredImageId ? (
							<img
								className="w-32 sm:w-48 h-32 sm:h-48 object-cover rounded shadow"
								src={_.find(images, { id: featuredImageId })?.url}
								alt={name}
							/>
						) : (
							<img
								className="w-32 sm:w-48 h-32 sm:h-48 object-cover rounded shadow"
								src="/assets/images/apps/ecommerce/product-image-placeholder.png"
								alt={name}
							/>
						)}
					</motion.div>
					<motion.div
						className="flex flex-col min-w-0 mx-8 sm:mx-16"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="text-16 sm:text-20 truncate font-semibold">
							{name || 'Sản Phẩm Mới'}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							Chi Tiết Sản Phẩm & Phân Phối Đa Kênh
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex flex-1 w-full justify-end"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{productId !== 'new' ? (
					<>
						<Button
							className="whitespace-nowrap mx-4"
							variant="outlined"
							color="error"
							disabled={isRemoving}
							onClick={handleRemoveProduct}
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>}
						>
							Xóa Sản Phẩm
						</Button>
						<Button
							className="whitespace-nowrap mx-4"
							variant="contained"
							color="secondary"
							disabled={!isFormSubmittable || isSaving}
							onClick={handleSaveProduct}
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:save</FuseSvgIcon>}
						>
							{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
						</Button>
					</>
				) : (
					<Button
						className="whitespace-nowrap mx-4"
						variant="contained"
						color="secondary"
						disabled={!isFormSubmittable || isCreating}
						onClick={handleCreateProduct}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
					>
						{isCreating ? 'Đang tạo...' : 'Tạo Sản Phẩm'}
					</Button>
				)}
			</motion.div>
		</div>
	);
}

export default ProductHeader;
