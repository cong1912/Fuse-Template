import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TuneIcon from '@mui/icons-material/Tune';

interface OptionGroup {
	id: string;
	name: string;
	values: string[];
	inputValue: string;
}

interface GeneratedVariant {
	id: string;
	name: string;
	sku: string;
	price: number;
	stock: number;
	active: boolean;
	attributes: Record<string, string>;
}

export default function VariantsTab() {
	const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([
		{ id: 'opt-1', name: 'Màu sắc', values: ['Đỏ Ruby', 'Xanh Navy', 'Đen Tuyển'], inputValue: '' },
		{ id: 'opt-2', name: 'Kích thước', values: ['S', 'M', 'L', 'XL'], inputValue: '' }
	]);

	const [bulkPrice, setBulkPrice] = useState<string>('299000');
	const [bulkStock, setBulkStock] = useState<string>('50');

	// Initial sample variants generated from above options
	const [variants, setVariants] = useState<GeneratedVariant[]>([
		{ id: 'var-1', name: 'Đỏ Ruby / S', sku: 'POLO-RED-S', price: 299000, stock: 50, active: true, attributes: { 'Màu sắc': 'Đỏ Ruby', 'Kích thước': 'S' } },
		{ id: 'var-2', name: 'Đỏ Ruby / M', sku: 'POLO-RED-M', price: 299000, stock: 45, active: true, attributes: { 'Màu sắc': 'Đỏ Ruby', 'Kích thước': 'M' } },
		{ id: 'var-3', name: 'Đỏ Ruby / L', sku: 'POLO-RED-L', price: 299000, stock: 30, active: true, attributes: { 'Màu sắc': 'Đỏ Ruby', 'Kích thước': 'L' } },
		{ id: 'var-4', name: 'Đỏ Ruby / XL', sku: 'POLO-RED-XL', price: 319000, stock: 20, active: true, attributes: { 'Màu sắc': 'Đỏ Ruby', 'Kích thước': 'XL' } },
		{ id: 'var-5', name: 'Xanh Navy / S', sku: 'POLO-BLU-S', price: 299000, stock: 60, active: true, attributes: { 'Màu sắc': 'Xanh Navy', 'Kích thước': 'S' } },
		{ id: 'var-6', name: 'Xanh Navy / M', sku: 'POLO-BLU-M', price: 299000, stock: 55, active: true, attributes: { 'Màu sắc': 'Xanh Navy', 'Kích thước': 'M' } },
		{ id: 'var-7', name: 'Đen Tuyển / M', sku: 'POLO-BLK-M', price: 299000, stock: 80, active: true, attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích thước': 'M' } },
		{ id: 'var-8', name: 'Đen Tuyển / L', sku: 'POLO-BLK-L', price: 299000, stock: 70, active: true, attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích thước': 'L' } }
	]);

	const handleAddValue = (groupId: string) => {
		setOptionGroups(prev => prev.map(g => {
			if (g.id === groupId && g.inputValue.trim()) {
				if (!g.values.includes(g.inputValue.trim())) {
					return { ...g, values: [...g.values, g.inputValue.trim()], inputValue: '' };
				}
				return { ...g, inputValue: '' };
			}
			return g;
		}));
	};

	const handleRemoveValue = (groupId: string, valToRemove: string) => {
		setOptionGroups(prev => prev.map(g => {
			if (g.id === groupId) {
				return { ...g, values: g.values.filter(v => v !== valToRemove) };
			}
			return g;
		}));
	};

	const handleAddOptionGroup = () => {
		const newId = `opt-${Date.now()}`;
		setOptionGroups(prev => [...prev, { id: newId, name: 'Chất liệu', values: ['Cotton 100%'], inputValue: '' }]);
	};

	const handleRemoveOptionGroup = (groupId: string) => {
		setOptionGroups(prev => prev.filter(g => g.id !== groupId));
	};

	const handleGenerateMatrix = () => {
		if (optionGroups.length === 0) return;

		// Cartesian product
		const cartesian = (arrays: string[][]): string[][] => {
			return arrays.reduce((acc, curr) => {
				return acc.flatMap(a => curr.map(b => [...a, b]));
			}, [[]] as string[][]);
		};

		const groupValues = optionGroups.map(g => g.values.length > 0 ? g.values : ['Tiêu chuẩn']);
		const combinations = cartesian(groupValues);

		const defaultP = Number(bulkPrice) || 299000;
		const defaultS = Number(bulkStock) || 50;

		const generated: GeneratedVariant[] = combinations.map((combo, idx) => {
			const name = combo.join(' / ');
			const sku = `SKU-${combo.map(c => c.slice(0, 3).toUpperCase()).join('-')}-${idx + 1}`;
			const attrs: Record<string, string> = {};
			optionGroups.forEach((g, gIdx) => {
				attrs[g.name] = combo[gIdx] || '';
			});

			return {
				id: `gen-${idx + 1}`,
				name,
				sku,
				price: defaultP,
				stock: defaultS,
				active: true,
				attributes: attrs
			};
		});

		setVariants(generated);
	};

	const handleApplyBulkPrice = () => {
		const p = Number(bulkPrice);
		if (isNaN(p)) return;
		setVariants(prev => prev.map(v => ({ ...v, price: p })));
	};

	const handleApplyBulkStock = () => {
		const s = Number(bulkStock);
		if (isNaN(s)) return;
		setVariants(prev => prev.map(v => ({ ...v, stock: s })));
	};

	const handleUpdateVariant = (id: string, field: keyof GeneratedVariant, value: any) => {
		setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
	};

	const handleDeleteVariant = (id: string) => {
		setVariants(prev => prev.filter(v => v.id !== id));
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			{/* Option Groups Config (Shopify/Saleor style) */}
			<Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700 }}>
							Thuộc Tính & Phân Loại Biến Thể
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Thêm các tùy chọn như Màu sắc, Kích cỡ, Chất liệu để hệ thống tự động sinh ma trận biến thể
						</Typography>
					</Box>
					<Button
						variant="outlined"
						size="small"
						startIcon={<AddCircleOutlineIcon />}
						onClick={handleAddOptionGroup}
						disabled={optionGroups.length >= 3}
					>
						Thêm Thuộc Tính
					</Button>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{optionGroups.map((group) => (
						<Box
							key={group.id}
							sx={{
								p: 2,
								borderRadius: 2,
								bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
								border: 1,
								borderColor: 'divider'
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
								<TextField
									label="Tên thuộc tính"
									size="small"
									value={group.name}
									onChange={(e) => {
										const val = e.target.value;
										setOptionGroups(prev => prev.map(g => g.id === group.id ? { ...g, name: val } : g));
									}}
									sx={{ width: 220 }}
								/>
								<IconButton size="small" color="error" onClick={() => handleRemoveOptionGroup(group.id)}>
									<DeleteOutlineIcon fontSize="small" />
								</IconButton>
							</Box>

							{/* Value chips */}
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
								{group.values.map(val => (
									<Chip
										key={val}
										label={val}
										onDelete={() => handleRemoveValue(group.id, val)}
										color="primary"
										variant="outlined"
										size="small"
										sx={{ fontWeight: 500 }}
									/>
								))}

								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<TextField
										placeholder={`Thêm giá trị ${group.name}...`}
										size="small"
										value={group.inputValue}
										onChange={(e) => {
											const val = e.target.value;
											setOptionGroups(prev => prev.map(g => g.id === group.id ? { ...g, inputValue: val } : g));
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleAddValue(group.id);
											}
										}}
										sx={{ width: 180, '& input': { py: 0.6, fontSize: '0.85rem' } }}
									/>
									<Button
										size="small"
										variant="contained"
										onClick={() => handleAddValue(group.id)}
										sx={{ minWidth: 60, height: 32 }}
									>
										Thêm
									</Button>
								</Box>
							</Box>
						</Box>
					))}
				</Box>

				<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
					<Button
						variant="contained"
						color="primary"
						startIcon={<AutoFixHighIcon />}
						onClick={handleGenerateMatrix}
						sx={{ px: 3, py: 1 }}
					>
						Tạo Ma Trận Biến Thể ({optionGroups.reduce((acc, g) => acc * (g.values.length || 1), 1)} Biến Thể)
					</Button>
				</Box>
			</Paper>

			{/* Bulk Actions Bar */}
			<Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<TuneIcon className="text-indigo-500" fontSize="small" />
					<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
						Chỉnh Sửa Hàng Loạt ({variants.length} biến thể)
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<TextField
							size="small"
							label="Giá chung (₫)"
							value={bulkPrice}
							onChange={(e) => setBulkPrice(e.target.value)}
							sx={{ width: 140 }}
						/>
						<Button size="small" variant="outlined" onClick={handleApplyBulkPrice}>
							Áp Dụng
						</Button>
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<TextField
							size="small"
							label="Tồn kho chung"
							value={bulkStock}
							onChange={(e) => setBulkStock(e.target.value)}
							sx={{ width: 120 }}
						/>
						<Button size="small" variant="outlined" onClick={handleApplyBulkStock}>
							Áp Dụng
						</Button>
					</Box>
				</Box>
			</Paper>

			{/* Variant Matrix Table */}
			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
				<Table size="small">
					<TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Biến Thể</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Mã SKU</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Giá Bán (₫)</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Tồn Kho</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Bán</TableCell>
							<TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Xóa</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{variants.map((v) => (
							<TableRow key={v.id} hover>
								<TableCell sx={{ fontWeight: 600 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Chip label={v.name} size="small" sx={{ fontWeight: 600 }} />
									</Box>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										value={v.sku}
										onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
										sx={{ width: 160, '& input': { py: 0.5, fontSize: '0.85rem' } }}
									/>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										type="number"
										value={v.price}
										onChange={(e) => handleUpdateVariant(v.id, 'price', Number(e.target.value))}
										InputProps={{
											startAdornment: <InputAdornment position="start">₫</InputAdornment>
										}}
										sx={{ width: 140, '& input': { py: 0.5, fontSize: '0.85rem' } }}
									/>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										type="number"
										value={v.stock}
										onChange={(e) => handleUpdateVariant(v.id, 'stock', Number(e.target.value))}
										sx={{ width: 100, '& input': { py: 0.5, fontSize: '0.85rem' } }}
									/>
								</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>
									<Switch
										size="small"
										checked={v.active}
										onChange={(e) => handleUpdateVariant(v.id, 'active', e.target.checked)}
										color="primary"
									/>
								</TableCell>
								<TableCell sx={{ textAlign: 'center' }}>
									<IconButton size="small" color="error" onClick={() => handleDeleteVariant(v.id)}>
										<DeleteOutlineIcon fontSize="small" />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
