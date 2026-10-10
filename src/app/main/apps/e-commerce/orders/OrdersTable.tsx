import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { ChangeEvent, MouseEvent, useState } from 'react';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
import { WithRouterProps } from '@fuse/core/withRouter/withRouter';
import { Many } from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';
import Chip from '@mui/material/Chip';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import FuseUtils from '@fuse/utils';
import OrdersStatus from '../order/OrdersStatus';
import OrdersTableHead from './OrdersTableHead';
import { EcommerceOrder, useGetECommerceOrdersQuery } from '../ECommerceApi';
import { selectSearchText } from '../store/searchTextSlice';
import { selectUser } from 'src/app/auth/user/store/userSlice';

type OrdersTableProps = WithRouterProps & {
	navigate: (path: string) => void;
};

/**
 * The orders table.
 */
function OrdersTable(props: OrdersTableProps) {
	const { navigate } = props;

	const { data, isLoading, isError } = useGetECommerceOrdersQuery();
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
		data.forEach((o) => {
			if (o.tenantId) {
				map.set(o.tenantId, o.tenantName || 'Shop ' + o.tenantId.substring(0, 6));
			}
		});
		return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
	}, [data]);

	const orders = React.useMemo(() => {
		if (!data) return [];
		let filtered = data;
		if (selectedTenant !== 'all') {
			filtered = filtered.filter((o) => o.tenantId === selectedTenant);
		}
		if (!searchText || searchText.trim() === '') return filtered;
		return FuseUtils.filterArrayByString<EcommerceOrder>(filtered, searchText);
	}, [data, searchText, selectedTenant]);

	const [selected, setSelected] = useState<string[]>([]);

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
			setSelected(orders.map((n) => n.id));
			return;
		}

		setSelected([]);
	}

	function handleDeselect() {
		setSelected([]);
	}

	function handleClick(item: EcommerceOrder) {
		navigate(`/apps/e-commerce/orders/${item.id}`);
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
		return <FuseLoading />;
	}

	if (isError) {
		return (
			<div className="flex flex-col flex-1 items-center justify-center p-24 text-center h-full gap-16">
				<Typography color="error" variant="h6" sx={{ fontWeight: 700 }}>
					Không thể tải danh sách đơn hàng
				</Typography>
				<Typography color="text.secondary" variant="body2">
					Đã xảy ra sự cố khi kết nối tới máy chủ (500 Internal Server Error). Vui lòng thử lại sau.
				</Typography>
			</div>
		);
	}

	if (!orders || orders.length === 0) {
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
					There are no orders!
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
								<em>🏢 Tất cả gian hàng ({data?.length || 0} Đơn)</em>
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
					<OrdersTableHead
						selectedOrderIds={selected}
						tableOrder={tableOrder}
						onSelectAllClick={handleSelectAllClick}
						onRequestSort={handleRequestSort}
						rowCount={orders.length}
						onMenuItemClick={handleDeselect}
						isSuperAdmin={isSuperAdmin}
					/>

					<TableBody>
						{_.orderBy(
							orders,
							[
								(o: EcommerceOrder) => {
									switch (o.id) {
										case 'id': {
											return parseInt(o.id, 10);
										}
										case 'customer': {
											return o.customer.firstName;
										}
										case 'payment': {
											return o.payment.method;
										}
										case 'status': {
											return o.status[0].name;
										}
										default: {
											return o.id;
										}
									}
								}
							],
							[tableOrder.direction] as Many<boolean | 'asc' | 'desc'>
						)
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((n) => {
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
											className="p-4 md:p-16"
											component="th"
											scope="row"
										>
											{n.id}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
										>
											{n.reference}
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
											className="p-4 md:p-16 truncate"
											component="th"
											scope="row"
										>
											{`${n.customer.firstName} ${n.customer.lastName}`}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
											align="right"
										>
											<span>$</span>
											{n.total}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
										>
											{n.payment.method}
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
										>
											<OrdersStatus name={n.status[0].name} />
										</TableCell>

										<TableCell
											className="p-4 md:p-16"
											component="th"
											scope="row"
										>
											{n.date}
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
				count={orders.length}
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

export default withRouter(OrdersTable);
