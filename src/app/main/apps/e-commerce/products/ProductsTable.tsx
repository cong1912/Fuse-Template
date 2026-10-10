import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChangeEvent, MouseEvent, useState } from 'react';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Many } from 'lodash';
import { WithRouterProps } from '@fuse/core/withRouter/withRouter';
import * as React from 'react';
import { useSelector } from 'react-redux';
import Chip from '@mui/material/Chip';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import FuseUtils from '@fuse/utils';
import ProductsTableHead from './ProductsTableHead';
import { EcommerceProduct, useGetECommerceProductsQuery } from '../ECommerceApi';
import { selectSearchText } from '../store/searchTextSlice';
import { selectUser } from 'src/app/auth/user/store/userSlice';

type ProductsTableProps = WithRouterProps & {
	navigate: (path: string) => void;
};

/**
 * The products table.
 */
function ProductsTable(props: ProductsTableProps) {
	const { navigate } = props;

	const { data, isLoading, isError } = useGetECommerceProductsQuery();
	const searchText = useSelector(selectSearchText);

	const user = useSelector(selectUser);
	const isSuperAdmin = React.useMemo(() => {
		const u = user as any;
		const roles = Array.isArray(u?.role) ? u.role : [u?.role];
		return roles.includes('superadmin') || roles.includes('SuperAdmin') || u?.data?.role === 'superadmin' || u?.data?.email === 'admin@ecommerce.com';
	}, [user]);

	const [selectedTenant, setSelectedTenant] = useState<string>('all');

	// Extract unique tenants from data for the dropdown filter
	const tenantsList = React.useMemo(() => {
		if (!data) return [];
		const map = new Map<string, string>();
		data.forEach((p) => {
			if (p.tenantId) {
				map.set(p.tenantId, p.tenantName || 'Shop ' + p.tenantId.substring(0, 6));
			}
		});
		return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
	}, [data]);

	const products = React.useMemo(() => {
		if (!data) return [];
		let filtered = data;
		if (selectedTenant !== 'all') {
			filtered = filtered.filter((p) => p.tenantId === selectedTenant);
		}
		if (!searchText || searchText.trim() === '') return filtered;
		return FuseUtils.filterArrayByString<EcommerceProduct>(filtered, searchText);
	}, [data, searchText, selectedTenant]);

	const [selected, setSelected] = useState<EcommerceProduct['id'][]>([]);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [tableOrder, setTableOrder] = useState<{
		direction: 'asc' | 'desc';
		id: string;
	}>({
		direction: 'asc',
		id: ''
	});

	function handleRequestSort(event: MouseEvent<HTMLSpanElement>, property: string) {
		const newOrder: {
			direction: 'asc' | 'desc';
			id: string;
		} = { id: property, direction: 'desc' };

		if (tableOrder.id === property && tableOrder.direction === 'desc') {
			newOrder.direction = 'asc';
		}

		setTableOrder(newOrder);
	}

	function handleSelectAllClick(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.checked) {
			setSelected(products.map((n) => n.id));
			return;
		}

		setSelected([]);
	}

	function handleDeselect() {
		setSelected([]);
	}

	function handleClick(item: EcommerceProduct) {
		navigate(`/apps/e-commerce/products/${item.id}/${item.handle}`);
	}

	function handleCheck(event: ChangeEvent<HTMLInputElement>, id: string) {
		const selectedIndex = selected.indexOf(id);
		let newSelected: string[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		setSelected(newSelected);
	}

	function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
		setPage(+page);
	}

	function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
		setRowsPerPage(+event.target.value);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<FuseLoading />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col flex-1 items-center justify-center p-24 text-center h-full gap-16">
				<Typography color="error" variant="h6" sx={{ fontWeight: 700 }}>
					Không thể tải danh sách sản phẩm
				</Typography>
				<Typography color="text.secondary" variant="body2">
					Đã xảy ra sự cố khi kết nối tới máy chủ (500 Internal Server Error). Vui lòng thử lại sau.
				</Typography>
			</div>
		);
	}

	if (!products || products.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There are no products!
				</Typography>
			</motion.div>
		);
	}

	return (
		<div className="w-full flex flex-col min-h-full">
			{isSuperAdmin && (
				<Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
					<StorefrontIcon color="primary" fontSize="small" />
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						Bộ lọc Gian hàng (Super Admin):
					</Typography>
					<FormControl size="small" sx={{ minWidth: 220 }}>
						<Select
							value={selectedTenant}
							onChange={(e) => {
								setSelectedTenant(e.target.value as string);
								setPage(0);
							}}
							displayEmpty
							sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}
						>
							<MenuItem value="all">
								<em>🏢 Tất cả gian hàng ({data?.length || 0} SP)</em>
							</MenuItem>
							{tenantsList.map((t) => (
								<MenuItem key={t.id} value={t.id}>
									🏪 {t.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					{selectedTenant !== 'all' && (
						<Chip 
							label={`Đang lọc: ${tenantsList.find(t => t.id === selectedTenant)?.name}`} 
							onDelete={() => setSelectedTenant('all')} 
							size="small" 
							color="primary" 
						/>
					)}
				</Box>
			)}
			<FuseScrollbars className="grow overflow-x-auto">
				<Table
					stickyHeader
					className="min-w-xl"
					aria-labelledby="tableTitle"
				>
					<ProductsTableHead
						selectedProductIds={selected}
						tableOrder={tableOrder}
						onSelectAllClick={handleSelectAllClick}
						onRequestSort={handleRequestSort}
						rowCount={products.length}
						onMenuItemClick={handleDeselect}
						isSuperAdmin={isSuperAdmin}
					/>

					<TableBody>
						{_.orderBy(products, [tableOrder.id], [tableOrder.direction] as Many<boolean | 'asc' | 'desc'>)
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((n: EcommerceProduct) => {
								const isSelected = selected.indexOf(n.id) !== -1;
								return (
									<TableRow
										className="h-72 cursor-pointer"
										hover
										role="checkbox"
										aria-checked={isSelected}
										tabIndex={-1}
										key={n.id}
										selected={isSelected}
										onClick={() => handleClick(n)}
									>
										<TableCell
											className="w-40 md:w-64 text-center"
											padding="none"
										>
											<Checkbox
												checked={isSelected}
												onClick={(event) => event.stopPropagation()}
												onChange={(event) => handleCheck(event, n.id)}
											/>
										</TableCell>

										<TableCell
											className="w-52 px-4 md:px-0"
											component="th"
											scope="row"
											padding="none"
										>
											{n?.images?.length > 0 && n.featuredImageId ? (
												<img
													className="w-full block rounded"
													src={_.find(n.images, { id: n.featuredImageId })?.url}
													alt={n.name}
												/>
											) : (
												<img
													className="w-full block rounded"
													src="/assets/images/apps/ecommerce/product-image-placeholder.png"
													alt={n.name}
												/>
											)}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
										>
											{n.name}
										</TableCell>

										{isSuperAdmin && (
											<TableCell
												className="p-4 md:p-16"
												component="th"
												scope="row"
											>
												<Chip
													size="small"
													icon={<StorefrontIcon fontSize="small" />}
													label={n.tenantName || 'Shop Mặc định'}
													color="primary"
													variant="outlined"
													sx={{ fontWeight: 600, fontSize: '0.75rem' }}
												/>
											</TableCell>
										)}

										<TableCell
											className="p-4 md:p-16 text-center"
											component="th"
											scope="row"
										>
											{n.productType === 'Digital' ? (
												<Chip size="small" label="📄 File / PDF" color="secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
											) : n.productType === 'SerialKey' ? (
												<Chip size="small" label="🔑 Tài khoản / Key" color="warning" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
											) : (
												<Chip size="small" label="📦 Vật lý" color="default" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
											)}
										</TableCell>

										<TableCell
											className="p-4 md:p-16 truncate"
											component="th"
											scope="row"
										>
											{n.categories.join(', ')}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
											align="right"
										>
											<span>$</span>
											{n.priceTaxIncl}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
											align="right"
										>
											{n.quantity}
											<i
												className={clsx(
													'inline-block w-8 h-8 rounded mx-8',
													n.quantity <= 5 && 'bg-red',
													n.quantity > 5 && n.quantity <= 25 && 'bg-orange',
													n.quantity > 25 && 'bg-green'
												)}
											/>
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
											align="right"
										>
											{n.active ? (
												<FuseSvgIcon
													className="text-green"
													size={20}
												>
													heroicons-outline:check-circle
												</FuseSvgIcon>
											) : (
												<FuseSvgIcon
													className="text-red"
													size={20}
												>
													heroicons-outline:minus-circle
												</FuseSvgIcon>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</FuseScrollbars>

			<TablePagination
				className="shrink-0 border-t-1"
				component="div"
				count={products.length}
				rowsPerPage={rowsPerPage}
				page={page}
				backIconButtonProps={{
					'aria-label': 'Previous Page'
				}}
				nextIconButtonProps={{
					'aria-label': 'Next Page'
				}}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</div>
	);
}

export default withRouter(ProductsTable);
