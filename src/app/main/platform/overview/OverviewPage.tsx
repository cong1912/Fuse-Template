import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { PageHeader, StatWidget, DataTable } from 'src/admin-kit';

function OverviewPage() {
	const data = [
		{ id: 1, name: 'Shop A', revenue: '$1000' },
		{ id: 2, name: 'Shop B', revenue: '$2000' }
	];

	const columns = [
		{ field: 'id', headerName: 'ID' },
		{ field: 'name', headerName: 'Shop Name' },
		{ field: 'revenue', headerName: 'Revenue' }
	];

	return (
		<Box p={3}>
			<PageHeader
				title="Platform Overview"
				breadcrumbs={[{ label: 'Platform' }, { label: 'Overview' }]}
			/>
			<Grid
				container
				spacing={3}
				mt={2}
			>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatWidget
						title="Total Shops"
						value="1,200"
						change={5}
						chartData={[10, 15, 12, 20]}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatWidget
						title="Active Users"
						value="3,400"
						change={2}
						chartData={[5, 10, 15, 12]}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatWidget
						title="Revenue"
						value="$50k"
						change={10}
						chartData={[20, 25, 30, 35]}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatWidget
						title="Risk Alerts"
						value="12"
						change={-5}
						chartData={[12, 10, 5, 2]}
					/>
				</Grid>
			</Grid>
			<Box mt={4}>
				<DataTable data={data}
					columns={columns}
				/>
			</Box>
		</Box>
	);
}

export default OverviewPage;




