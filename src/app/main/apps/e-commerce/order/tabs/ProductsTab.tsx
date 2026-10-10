import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Link, useParams } from 'react-router-dom';
import { useGetECommerceOrderQuery } from '../../ECommerceApi';

/**
 * The enhanced products tab for Order details.
 */
function ProductsTab() {
	const routeParams = useParams();
	const { orderId } = routeParams;

	const { data: order } = useGetECommerceOrderQuery(orderId, {
		skip: !orderId
	});

	const products = order?.products || [];

	const totalItems = products.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0);
	const totalAmount = products.reduce((acc: number, item: any) => {
		const price = Number(item.price) || 0;
		const qty = Number(item.quantity) || 1;
		return acc + (price * qty);
	}, 0);

	if (!products || products.length === 0) {
		return (
			<Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
				<ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
				<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
					Không Có Sản Phẩm Trong Đơn Hàng Này
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Đơn hàng chưa ghi nhận chi tiết sản phẩm nào hoặc đang ở trạng thái nháp khởi tạo.
				</Typography>
				<Button
					component={Link}
					to="/apps/e-commerce/orders"
					variant="outlined"
					color="inherit"
					size="small"
				>
					Về Trang Danh Sách Đơn Hàng
				</Button>
			</Paper>
		);
	}

	return (
		<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<ShoppingBagOutlinedIcon color="primary" />
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Sản Phẩm Trong Đơn Hàng ({products.length} mặt hàng • {totalItems} sản phẩm)
					</Typography>
				</Box>
				<Chip
					label={`Tổng giá trị: ₫${totalAmount.toLocaleString('vi-VN')}`}
					color="primary"
					variant="outlined"
					sx={{ fontWeight: 700 }}
				/>
			</Box>

			<TableContainer>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
							<TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Sản Phẩm</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 120 }}>Số Lượng</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 160 }}>Đơn Giá</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 180 }}>Thành Tiền</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 120 }}>Thao Tác</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{products.map((product: any, idx: number) => {
							const price = Number(product.price) || 0;
							const qty = Number(product.quantity) || 1;
							const lineTotal = price * qty;
							const shortId = product.id ? String(product.id).substring(0, 8).toUpperCase() : `SKU-${idx + 1}`;

							return (
								<TableRow hover key={product.id || idx}>
									<TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
										{idx + 1}
									</TableCell>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<Avatar
												variant="rounded"
												sx={{
													width: 52,
													height: 52,
													bgcolor: idx % 2 === 0 ? 'primary.light' : 'secondary.light',
													border: '1px solid',
													borderColor: 'divider'
												}}
												src={product.image || '/assets/images/apps/ecommerce/product-image-placeholder.png'}
											>
												<ShoppingBagOutlinedIcon fontSize="small" />
											</Avatar>
											<Box sx={{ minWidth: 0 }}>
												<Typography
													variant="subtitle2"
													component={Link}
													to={`/apps/e-commerce/products/${product.id}`}
													sx={{
														fontWeight: 700,
														color: 'inherit',
														textDecoration: 'none',
														display: 'block',
														'&:hover': { color: 'primary.main', textDecoration: 'underline' }
													}}
												>
													{product.name}
												</Typography>
												<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
													Mã SP: <code>{shortId}</code> • UUID: <code>{String(product.id).slice(0, 18)}...</code>
												</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>
										<Chip
											label={`x${qty}`}
											size="small"
											sx={{ fontWeight: 700, minWidth: 44, bgcolor: 'action.hover' }}
										/>
									</TableCell>
									<TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
										₫{price.toLocaleString('vi-VN')}
									</TableCell>
									<TableCell sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>
										₫{lineTotal.toLocaleString('vi-VN')}
									</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>
										<Tooltip title="Xem chi tiết sản phẩm này">
											<Button
												component={Link}
												to={`/apps/e-commerce/products/${product.id}`}
												size="small"
												variant="outlined"
												color="inherit"
												startIcon={<OpenInNewIcon fontSize="small" />}
												sx={{ borderRadius: 2, textTransform: 'none', py: 0.5 }}
											>
												Chi tiết
											</Button>
										</Tooltip>
									</TableCell>
								</TableRow>
							);
						})}

						{/* Summary Row */}
						<TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }}>
							<TableCell colSpan={2} sx={{ fontWeight: 700, py: 2 }}>
								TỔNG CỘNG TIỀN HÀNG:
							</TableCell>
							<TableCell sx={{ textAlign: 'center', fontWeight: 800, py: 2 }}>
								{totalItems} món
							</TableCell>
							<TableCell sx={{ py: 2 }} />
							<TableCell sx={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: 'primary.main', py: 2 }}>
								₫{totalAmount.toLocaleString('vi-VN')}
							</TableCell>
							<TableCell sx={{ py: 2 }} />
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
	);
}

export default ProductsTab;
