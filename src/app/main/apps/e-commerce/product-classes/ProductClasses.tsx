import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductClasses = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductClasses = async () => {
            try {
                const response = await axios.get('/api/admin/product-classes');
                setRows(response.data);
            } catch (error) {
                // Fallback to mock data if 404 or any other error
                setRows([{ id: '1', name: 'Laptop', hasVariants: true }]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductClasses();
    }, []);

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'hasVariants', headerName: 'Has Variants', type: 'boolean', flex: 1 },
        { 
            field: 'actions', 
            headerName: 'Actions', 
            sortable: false,
            renderCell: () => (
                <>
                    <IconButton size="small">
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <Box className="p-24 flex flex-col w-full h-full min-h-screen">
            <Box className="flex items-center justify-between mb-24">
                <Typography variant="h4" className="font-bold">Product Classes</Typography>
                <Button variant="contained" color="secondary">New Class</Button>
            </Box>
            
            <Box className="flex-1 w-full bg-paper rounded-xl shadow overflow-hidden">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    autoHeight
                />
            </Box>
        </Box>
    );
};

export default ProductClasses;
