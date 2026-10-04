import React, { useEffect, useState } from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import axios from 'axios';

interface Category {
    id: string;
    name: string;
    children?: Category[];
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/admin/categories/tree');
                if (Array.isArray(response.data)) {
                    setCategories(response.data);
                } else if (response.data && Array.isArray(response.data.data)) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        fetchCategories();
    }, []);

    const renderTree = (nodes: Category) => (
        <TreeItem key={String(nodes.id)} nodeId={String(nodes.id)} label={nodes.name}>
            {Array.isArray(nodes.children)
                ? nodes.children.map((node) => renderTree(node))
                : null}
        </TreeItem>
    );

    return (
        <div className="flex flex-col w-full p-24">
            <div className="flex items-center justify-between mb-24">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Button variant="contained" color="secondary">
                    Add Category
                </Button>
            </div>
            
            <div className="flex-1 bg-white p-24 rounded-2xl shadow">
                <TreeView
                    aria-label="categories tree"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{ flexGrow: 1, overflowY: 'auto' }}
                >
                    {categories.map((category) => renderTree(category))}
                </TreeView>
            </div>
        </div>
    );
};

export default Categories;
