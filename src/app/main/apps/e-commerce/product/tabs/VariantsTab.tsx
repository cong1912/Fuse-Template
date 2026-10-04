import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const initialRows = [
	{ id: 1, sku: 'SKU-001', color: 'Red', size: 'M', price: 29.99, stock: 150 },
	{ id: 2, sku: 'SKU-002', color: 'Blue', size: 'L', price: 34.99, stock: 85 },
	{ id: 3, sku: 'SKU-003', color: 'Green', size: 'S', price: 25.99, stock: 200 },
	{ id: 4, sku: 'SKU-004', color: 'Black', size: 'XL', price: 39.99, stock: 40 },
	{ id: 5, sku: 'SKU-005', color: 'White', size: 'M', price: 29.99, stock: 120 },
];

const columns: GridColDef[] = [
	{ field: 'sku', headerName: 'SKU', width: 150 },
	{ field: 'color', headerName: 'Color', width: 130 },
	{ field: 'size', headerName: 'Size', width: 130 },
	{
		field: 'price',
		headerName: 'Price',
		type: 'number',
		width: 130,
		valueFormatter: (params) => {
			if (params.value == null) {
				return '';
			}
			return `$${params.value.toFixed(2)}`;
		},
	},
	{
		field: 'stock',
		headerName: 'Stock',
		type: 'number',
		width: 130,
	},
];

function VariantsTab() {
	const [rows] = useState(initialRows);

	return (
		<div>
			<Box sx={{ height: 400, width: '100%', mt: 2 }}>
				<DataGrid
					rows={rows}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: { page: 0, pageSize: 5 },
						},
					}}
					pageSizeOptions={[5, 10]}
					checkboxSelection
					disableRowSelectionOnClick
				/>
			</Box>
		</div>
	);
}

export default VariantsTab;
