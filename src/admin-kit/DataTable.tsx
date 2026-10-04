import React from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export interface DataTableProps {
	data: any[];
	columns: GridColDef[];
	loading?: boolean;
	pagination?: {
		page: number;
		pageSize: number;
		rowCount: number;
		onPaginationModelChange: (model: GridPaginationModel) => void;
	};
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, loading = false, pagination }) => {
	return (
		<Box sx={{ height: 400, width: '100%' }}>
			<DataGrid
				rows={data}
				columns={columns}
				loading={loading}
				paginationMode={pagination ? 'server' : 'client'}
				rowCount={pagination?.rowCount || data.length}
				paginationModel={pagination ? { page: pagination.page, pageSize: pagination.pageSize } : undefined}
				onPaginationModelChange={pagination?.onPaginationModelChange}
				pageSizeOptions={[5, 10, 25, 50]}
				disableRowSelectionOnClick
			/>
		</Box>
	);
};

export default DataTable;
