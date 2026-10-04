import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const mockVariants = [
	{ id: 1, sku: 'SKU-001', price: 29.99, stock: 150, attributes: { "Color": "Red", "Size": "M" } },
	{ id: 2, sku: 'SKU-002', price: 34.99, stock: 85, attributes: { "Color": "Blue", "Size": "L" } },
	{ id: 3, sku: 'SKU-003', price: 25.99, stock: 200, attributes: { "Color": "Green", "Size": "S" } },
	{ id: 4, sku: 'SKU-004', price: 39.99, stock: 40, attributes: { "Color": "Black", "Size": "XL", "Material": "Cotton" } },
	{ id: 5, sku: 'SKU-005', price: 29.99, stock: 120, attributes: { "Color": "White", "Size": "M" } },
];

function VariantsTab() {
	const [rows] = useState(mockVariants);

	const { columns, flatRows } = useMemo(() => {
		const baseColumns: GridColDef[] = [
			{ field: 'sku', headerName: 'SKU', width: 150 },
		];

		const attributeKeys = new Set<string>();
		rows.forEach(row => {
			if (row.attributes) {
				Object.keys(row.attributes).forEach(key => attributeKeys.add(key));
			}
		});

		const attributeColumns: GridColDef[] = Array.from(attributeKeys).map(key => ({
			field: `attr_${key}`,
			headerName: key,
			width: 130,
		}));

		const endColumns: GridColDef[] = [
			{
				field: 'price',
				headerName: 'Price',
				type: 'number',
				width: 130,
				valueFormatter: (params: any) => {
					// Fallback for different MUI X versions
					const val = params?.value ?? params;
					if (val == null) {
						return '';
					}
					return `$${Number(val).toFixed(2)}`;
				},
			},
			{
				field: 'stock',
				headerName: 'Stock',
				type: 'number',
				width: 130,
			},
		];

		const cols = [...baseColumns, ...attributeColumns, ...endColumns];

		const flRows = rows.map(row => {
			const flatRow: any = { ...row };
			if (row.attributes) {
				Object.entries(row.attributes).forEach(([key, val]) => {
					flatRow[`attr_${key}`] = val;
				});
			}
			return flatRow;
		});

		return { columns: cols, flatRows: flRows };
	}, [rows]);

	return (
		<div>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 2 }}>
				<Button
					variant="contained"
					color="primary"
					startIcon={<AutoFixHighIcon />}
					onClick={() => console.log('Generate variants')}
				>
					Generate Variants
				</Button>
			</Box>
			<Box sx={{ height: 400, width: '100%' }}>
				<DataGrid
					rows={flatRows}
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
