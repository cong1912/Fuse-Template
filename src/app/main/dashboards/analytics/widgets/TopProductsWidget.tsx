import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';
import { useGetECommerceProductsQuery } from '../../../apps/e-commerce/ECommerceApi';

function TopProductsWidget() {
	const { data: products = [], isLoading } = useGetECommerceProductsQuery();

	const topProducts = products.slice(0, 5);

	return (
		<Paper className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden p-24">
			<div className="flex items-center justify-between mb-16">
				<div>
					<Typography className="text-xl font-semibold tracking-tight">Top Products</Typography>
					<Typography color="text.secondary" className="text-sm">
						Catalog inventory & active pricing
					</Typography>
				</div>
				<Button
					component={Link}
					to="/apps/e-commerce/products"
					variant="text"
					size="small"
					endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-narrow-right</FuseSvgIcon>}
				>
					Catalog
				</Button>
			</div>

			<List className="divide-y divide-divider p-0">
				{topProducts.length === 0 ? (
					<Typography color="text.secondary" className="py-24 text-center">
						{isLoading ? 'Loading products...' : 'No products found.'}
					</Typography>
				) : (
					topProducts.map((prod) => (
						<ListItem
							key={prod.id}
							className="px-0 py-12"
							component={Link}
							to={`/apps/e-commerce/products/${prod.id}`}
							button
						>
							<ListItemAvatar>
								<Avatar
									src={prod.images?.[0]?.url}
									alt={prod.name}
									variant="rounded"
									className="w-48 h-48 bg-primary-light text-primary-contrastText"
								>
									<FuseSvgIcon size={24}>heroicons-outline:cube</FuseSvgIcon>
								</Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={
									<Typography className="font-medium text-sm truncate max-w-xs">
										{prod.name}
									</Typography>
								}
								secondary={
									<Typography color="text.secondary" className="text-xs">
										SKU: {prod.sku || 'N/A'} • {Number(prod.priceTaxIncl || prod.priceTaxExcl || 0).toLocaleString()} đ
									</Typography>
								}
							/>
							<div className="ml-12 text-right">
								{prod.quantity <= 5 ? (
									<Chip
										size="small"
										label={`Low: ${prod.quantity}`}
										color="error"
										variant="outlined"
									/>
								) : (
									<Chip
										size="small"
										label={`Stock: ${prod.quantity}`}
										color="success"
										variant="outlined"
									/>
								)}
							</div>
						</ListItem>
					))
				)}
			</List>
		</Paper>
	);
}

export default TopProductsWidget;
