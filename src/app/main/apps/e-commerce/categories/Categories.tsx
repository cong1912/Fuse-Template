import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { showMessage } from '@fuse/core/FuseMessage/store/fuseMessageSlice';
import axiosClient from 'app/api/axiosClient';

interface Category {
	id: string;
	name: string;
	description?: string;
	children?: Category[];
}

interface FlatCategory {
	id: string;
	name: string;
}

const CategoryNode = ({
	category,
	level = 0,
	onEdit,
	onDelete,
	onAddSub
}: {
	category: Category;
	level?: number;
	onEdit: (cat: Category) => void;
	onDelete: (id: string, name: string) => void;
	onAddSub: (parentId: string, parentName: string) => void;
}) => {
	const hasChildren = Array.isArray(category.children) && category.children.length > 0;
	const [open, setOpen] = useState(true);

	const handleClick = () => {
		if (hasChildren) {
			setOpen(!open);
		}
	};

	return (
		<>
			<ListItem
				disablePadding
				sx={{ mb: 0.5, borderRadius: 2 }}
				secondaryAction={
					<Box sx={{ display: 'flex', gap: 0.5, pr: 1 }}>
						<Tooltip title="Thêm danh mục con">
							<IconButton
								size="small"
								color="primary"
								aria-label="Thêm danh mục con"
								onClick={() => onAddSub(category.id, category.name)}
							>
								<AddIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Chỉnh sửa danh mục">
							<IconButton
								size="small"
								color="default"
								aria-label="Chỉnh sửa danh mục"
								onClick={() => onEdit(category)}
							>
								<EditIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Xóa danh mục">
							<IconButton
								size="small"
								color="error"
								aria-label="Xóa danh mục"
								onClick={() => onDelete(category.id, category.name)}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Box>
				}
			>
				<ListItemButton
					onClick={handleClick}
					sx={{
						pl: 2 + level * 3,
						pr: 18,
						py: 1,
						borderRadius: 2,
						'&:hover': { bgcolor: 'action.hover' }
					}}
				>
					<ListItemIcon sx={{ minWidth: 36, color: hasChildren ? 'primary.main' : 'text.secondary' }}>
						{hasChildren ? (open ? <FolderOpenIcon /> : <FolderIcon />) : <CategoryIcon />}
					</ListItemIcon>
					<ListItemText
						primary={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<span style={{ fontWeight: hasChildren ? 600 : 400 }}>{category.name}</span>
								{hasChildren && (
									<Chip label={`${category.children!.length} mục con`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
								)}
							</Box>
						}
						secondary={category.description || undefined}
						primaryTypographyProps={{
							fontSize: level === 0 ? '0.95rem' : '0.875rem'
						}}
					/>
					{hasChildren ? (open ? <ExpandLess /> : <ExpandMore />) : null}
				</ListItemButton>
			</ListItem>
			{hasChildren && (
				<Collapse in={open} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{category.children!.map((child) => (
							<CategoryNode
								key={child.id}
								category={child}
								level={level + 1}
								onEdit={onEdit}
								onDelete={onDelete}
								onAddSub={onAddSub}
							/>
						))}
					</List>
				</Collapse>
			)}
		</>
	);
};

const Categories = () => {
	const dispatch = useDispatch();
	const [categories, setCategories] = useState<Category[]>([]);
	const [flatCategories, setFlatCategories] = useState<FlatCategory[]>([]);
	const [loading, setLoading] = useState(false);

	// Add Category Dialog State
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newName, setNewName] = useState('');
	const [newDesc, setNewDesc] = useState('');
	const [selectedParentId, setSelectedParentId] = useState<string>('');
	const [submitting, setSubmitting] = useState(false);

	// Edit Category Dialog State
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [editName, setEditName] = useState('');
	const [editDesc, setEditDesc] = useState('');

	const flattenCategories = (cats: Category[]): FlatCategory[] => {
		let result: FlatCategory[] = [];
		for (const cat of cats) {
			result.push({ id: cat.id, name: cat.name });
			if (cat.children && cat.children.length > 0) {
				result = result.concat(flattenCategories(cat.children));
			}
		}
		return result;
	};

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		try {
			const response = await axiosClient.get('/api/admin/categories/tree');
			let data: Category[] = [];
			if (Array.isArray(response.data)) {
				data = response.data;
			} else if (response.data && Array.isArray(response.data.data)) {
				data = response.data.data;
			}
			setCategories(data);
			setFlatCategories(flattenCategories(data));
		} catch (error: any) {
			console.error('Failed to fetch categories', error);
			dispatch(showMessage({ message: 'Không thể tải danh mục sản phẩm', variant: 'error' }));
		} finally {
			setLoading(false);
		}
	}, [dispatch]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const handleOpenAdd = (parentId: string = '', parentName?: string) => {
		setSelectedParentId(parentId);
		setNewName('');
		setNewDesc('');
		setOpenAddDialog(true);
	};

	const handleCreateCategory = async () => {
		if (!newName.trim()) {
			dispatch(showMessage({ message: 'Vui lòng nhập tên danh mục', variant: 'warning' }));
			return;
		}

		setSubmitting(true);
		try {
			await axiosClient.post('/api/admin/categories', {
				name: newName.trim(),
				description: newDesc.trim(),
				parentId: selectedParentId || null
			});

			dispatch(showMessage({ message: 'Tạo danh mục thành công!', variant: 'success' }));
			setOpenAddDialog(false);
			fetchCategories();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.response?.data?.detail || 'Lỗi khi tạo danh mục', variant: 'error' }));
		} finally {
			setSubmitting(false);
		}
	};

	const handleOpenEdit = (cat: Category) => {
		setEditingCategory(cat);
		setEditName(cat.name);
		setEditDesc(cat.description || '');
		setOpenEditDialog(true);
	};

	const handleUpdateCategory = async () => {
		if (!editingCategory) return;
		if (!editName.trim()) {
			dispatch(showMessage({ message: 'Vui lòng nhập tên danh mục', variant: 'warning' }));
			return;
		}

		setSubmitting(true);
		try {
			await axiosClient.put(`/api/admin/categories/${editingCategory.id}`, {
				name: editName.trim(),
				description: editDesc.trim()
			});

			dispatch(showMessage({ message: 'Cập nhật danh mục thành công!', variant: 'success' }));
			setOpenEditDialog(false);
			fetchCategories();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.response?.data?.detail || 'Lỗi khi cập nhật danh mục', variant: 'error' }));
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteCategory = async (id: string, name: string) => {
		if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các danh mục con có thể bị ảnh hưởng.`)) {
			return;
		}

		try {
			await axiosClient.delete(`/api/admin/categories/${id}`);
			dispatch(showMessage({ message: `Đã xóa danh mục "${name}" thành công!`, variant: 'success' }));
			fetchCategories();
		} catch (err: any) {
			dispatch(showMessage({ message: err?.response?.data?.detail || 'Không thể xóa danh mục', variant: 'error' }));
		}
	};

	return (
		<div className="flex flex-col w-full p-24 sm:p-32 max-w-6xl mx-auto space-y-24">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-16 border-b border-divider pb-20">
				<div>
					<Typography variant="h4" className="font-bold tracking-tight">
						Quản Lý Danh Mục Sản Phẩm (Categories)
					</Typography>
					<Typography color="text.secondary" className="text-sm mt-4">
						Tổ chức cây phân cấp danh mục đa tầng cho toàn bộ gian hàng
					</Typography>
				</div>
				<div className="flex items-center gap-12">
					<Button
						variant="outlined"
						color="inherit"
						size="small"
						onClick={fetchCategories}
						startIcon={<RefreshIcon />}
					>
						Làm mới
					</Button>
					<Button
						variant="contained"
						color="secondary"
						onClick={() => handleOpenAdd('')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
					>
						Thêm Danh Mục Gốc
					</Button>
				</div>
			</div>

			<Paper className="flex-1 p-24 rounded-2xl shadow">
				{loading ? (
					<div className="py-48 flex justify-center">
						<CircularProgress size={32} />
					</div>
				) : categories.length === 0 ? (
					<div className="py-48 text-center space-y-12">
						<Typography color="text.secondary">Chưa có danh mục nào.</Typography>
						<Button variant="contained" color="secondary" size="small" onClick={() => handleOpenAdd('')}>
							Tạo danh mục đầu tiên
						</Button>
					</div>
				) : (
					<List component="nav" disablePadding>
						{categories.map((category) => (
							<CategoryNode
								key={category.id}
								category={category}
								onEdit={handleOpenEdit}
								onDelete={handleDeleteCategory}
								onAddSub={(parentId) => handleOpenAdd(parentId)}
							/>
						))}
					</List>
				)}
			</Paper>

			{/* Dialog Thêm Danh Mục */}
			<Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle className="font-bold">
					{selectedParentId ? 'Thêm Danh Mục Con' : 'Thêm Danh Mục Mới'}
				</DialogTitle>
				<DialogContent dividers className="space-y-16">
					<TextField
						label="Tên danh mục *"
						fullWidth
						size="small"
						placeholder="Ví dụ: Thiết bị di động"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
					/>

					<TextField
						label="Mô tả danh mục"
						fullWidth
						multiline
						rows={2}
						size="small"
						placeholder="Mô tả vắn tắt về danh mục này..."
						value={newDesc}
						onChange={(e) => setNewDesc(e.target.value)}
					/>

					<TextField
						select
						label="Danh mục cha (Trống nếu là Danh mục gốc)"
						fullWidth
						size="small"
						value={selectedParentId}
						onChange={(e) => setSelectedParentId(e.target.value)}
					>
						<MenuItem value="">
							<em>-- Danh mục gốc (Không có cha) --</em>
						</MenuItem>
						{flatCategories.map((c) => (
							<MenuItem key={c.id} value={c.id}>
								{c.name}
							</MenuItem>
						))}
					</TextField>
				</DialogContent>
				<DialogActions className="p-16">
					<Button onClick={() => setOpenAddDialog(false)} color="inherit">
						Hủy
					</Button>
					<Button
						variant="contained"
						color="secondary"
						disabled={submitting}
						onClick={handleCreateCategory}
					>
						{submitting ? <CircularProgress size={20} /> : 'Lưu Danh Mục'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Dialog Sửa Danh Mục */}
			<Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle className="font-bold">
					Chỉnh Sửa Danh Mục
				</DialogTitle>
				<DialogContent dividers className="space-y-16">
					<TextField
						label="Tên danh mục *"
						fullWidth
						size="small"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
					/>

					<TextField
						label="Mô tả danh mục"
						fullWidth
						multiline
						rows={2}
						size="small"
						value={editDesc}
						onChange={(e) => setEditDesc(e.target.value)}
					/>
				</DialogContent>
				<DialogActions className="p-16">
					<Button onClick={() => setOpenEditDialog(false)} color="inherit">
						Hủy
					</Button>
					<Button
						variant="contained"
						color="secondary"
						disabled={submitting}
						onClick={handleUpdateCategory}
					>
						{submitting ? <CircularProgress size={20} /> : 'Cập Nhật'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Categories;
