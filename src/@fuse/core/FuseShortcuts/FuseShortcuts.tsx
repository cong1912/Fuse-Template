import { amber } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { memo, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import _ from '@lodash';
import FuseSvgIcon from '../FuseSvgIcon';
import { FuseFlatNavItemType } from '../FuseNavigation/types/FuseNavItemType';

type FuseShortcutsProps = {
	className?: string;
	navigation: FuseFlatNavItemType[];
	onChange: (T: string[]) => void;
	shortcuts?: string[];
	variant?: 'horizontal' | 'vertical';
};

/**
 * The FuseShortcuts component is responsible for rendering a list of shortcuts based on the navigation and shortcuts props.
 * It uses various MUI components to render the list items and search input.
 * The component is memoized to prevent unnecessary re-renders.
 */
function FuseShortcuts(props: FuseShortcutsProps) {
	const { navigation = [], shortcuts = [], onChange, variant = 'horizontal', className = '' } = props;

	const searchInputRef = useRef<HTMLInputElement>(null);
	const [addMenu, setAddMenu] = useState<HTMLElement | null>(null);
	const [searchText, setSearchText] = useState('');

	const navigableItems = useMemo(() => {
		return (navigation || []).filter((item) => item && item.type === 'item' && item.url);
	}, [navigation]);

	const pinnedItems = useMemo(() => {
		return (shortcuts || [])
			.map((id) => _.find(navigableItems, { id }))
			.filter(Boolean) as FuseFlatNavItemType[];
	}, [shortcuts, navigableItems]);

	const otherItems = useMemo(() => {
		return navigableItems.filter((item) => !(shortcuts || []).includes(item.id));
	}, [navigableItems, shortcuts]);

	const searchResults = useMemo(() => {
		if (!searchText.trim()) return [];
		const query = searchText.toLowerCase().trim();
		return navigableItems.filter(
			(item) => item?.title?.toLowerCase()?.includes(query) || item?.id?.toLowerCase()?.includes(query)
		);
	}, [searchText, navigableItems]);

	function addMenuClick(event: React.MouseEvent<HTMLElement>) {
		setAddMenu(event.currentTarget);
	}

	function addMenuClose() {
		setAddMenu(null);
		setSearchText('');
	}

	function toggleInShortcuts(id: string) {
		let newShortcuts = [...shortcuts];
		newShortcuts = _.xor(newShortcuts, [id]);
		onChange(newShortcuts);
	}

	return (
		<div className={clsx('flex flex-1', variant === 'vertical' && 'shrink grow-0 flex-col', className)}>
			<div className={clsx('flex flex-1 items-center', variant === 'vertical' && 'flex-col')}>
				{pinnedItems.map((_item) => (
					<Link
						to={_item.url}
						key={_item.id}
						role="button"
					>
						<Tooltip
							title={_item.title}
							placement={variant === 'horizontal' ? 'bottom' : 'left'}
						>
							<IconButton
								className="h-40 w-40 p-0"
								size="large"
							>
								{_item.icon ? (
									<FuseSvgIcon>{_item.icon}</FuseSvgIcon>
								) : (
									<span className="text-20 font-semibold uppercase">
										{_item.title?.[0] || 'P'}
									</span>
								)}
							</IconButton>
						</Tooltip>
					</Link>
				))}

				<Tooltip
					title="Quản lý lối tắt (Ghim trang)"
					placement={variant === 'horizontal' ? 'bottom' : 'left'}
				>
					<IconButton
						className="h-40 w-40 p-0"
						aria-haspopup="true"
						onClick={addMenuClick}
						size="large"
					>
						<FuseSvgIcon sx={{ color: amber[600] }}>heroicons-solid:star</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</div>

			<Menu
				id="add-menu"
				anchorEl={addMenu}
				open={Boolean(addMenu)}
				onClose={addMenuClose}
				PaperProps={{
					elevation: 8,
					className: 'bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 rounded-xl'
				}}
				classes={{
					paper: 'min-w-320 max-w-360 py-0 bg-white dark:bg-slate-900'
				}}
				TransitionProps={{
					onEntered: () => {
						searchInputRef?.current?.focus();
					},
					onExited: () => {
						setSearchText('');
					}
				}}
			>
				<div className="p-12 pb-8 flex items-center gap-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60">
					<FuseSvgIcon size={18} color="disabled">heroicons-outline:search</FuseSvgIcon>
					<Input
						inputRef={searchInputRef}
						value={searchText}
						onChange={(ev) => setSearchText(ev.target.value)}
						placeholder="Tìm trang để ghim..."
						fullWidth
						inputProps={{
							'aria-label': 'Search shortcuts'
						}}
						disableUnderline
						className="text-14"
					/>
					{searchText && (
						<IconButton size="small" onClick={() => setSearchText('')}>
							<FuseSvgIcon size={16}>heroicons-outline:x</FuseSvgIcon>
						</IconButton>
					)}
				</div>

				<div className="max-h-380 overflow-y-auto py-4 bg-white dark:bg-slate-900">
					{searchText.trim().length > 0 ? (
						searchResults.length > 0 ? (
							searchResults.map((_item) => (
								<ShortcutMenuItem
									key={_item.id}
									item={_item}
									isPinned={shortcuts.includes(_item.id)}
									onToggle={() => toggleInShortcuts(_item.id)}
									onNavigate={addMenuClose}
								/>
							))
						) : (
							<Typography
								color="text.secondary"
								className="p-16 text-center text-13"
							>
								Không tìm thấy trang phù hợp..
							</Typography>
						)
					) : (
						<>
							{pinnedItems.length > 0 && (
								<>
									<ListSubheader className="text-11 font-semibold uppercase tracking-wider text-text-secondary bg-gray-50 dark:bg-slate-800/80 px-16 py-6 leading-none">
										Đã ghim ({pinnedItems.length})
									</ListSubheader>
									{pinnedItems.map((_item) => (
										<ShortcutMenuItem
											key={_item.id}
											item={_item}
											isPinned={true}
											onToggle={() => toggleInShortcuts(_item.id)}
											onNavigate={addMenuClose}
										/>
									))}
								</>
							)}

							{otherItems.length > 0 && (
								<>
									{pinnedItems.length > 0 && <Divider className="my-6" />}
									<ListSubheader className="text-11 font-semibold uppercase tracking-wider text-text-secondary bg-gray-50 dark:bg-slate-800/80 px-16 py-6 leading-none">
										Tất cả các trang ({otherItems.length})
									</ListSubheader>
									{otherItems.map((_item) => (
										<ShortcutMenuItem
											key={_item.id}
											item={_item}
											isPinned={false}
											onToggle={() => toggleInShortcuts(_item.id)}
											onNavigate={addMenuClose}
										/>
									))}
								</>
							)}
						</>
					)}
				</div>
			</Menu>
		</div>
	);
}

function ShortcutMenuItem(props: {
	item: FuseFlatNavItemType;
	isPinned: boolean;
	onToggle: () => void;
	onNavigate: () => void;
}) {
	const { item, isPinned, onToggle, onNavigate } = props;

	if (!item || !item.id) {
		return null;
	}

	return (
		<MenuItem
			key={item.id}
			className="px-12 py-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5"
		>
			<Link
				to={item.url || ''}
				role="button"
				onClick={onNavigate}
				className="flex items-center flex-1 min-w-0 mr-8 text-inherit no-underline"
			>
				<ListItemIcon className="min-w-36">
					{item.icon ? (
						<FuseSvgIcon size={20}>{item.icon}</FuseSvgIcon>
					) : (
						<span className="text-center text-16 font-semibold uppercase text-text-secondary">
							{item.title?.[0] || 'P'}
						</span>
					)}
				</ListItemIcon>
				<ListItemText
					primary={item.title}
					primaryTypographyProps={{ className: 'truncate text-13 font-medium' }}
				/>
			</Link>
			<Tooltip title={isPinned ? 'Bỏ ghim' : 'Ghim lối tắt'}>
				<IconButton
					onClick={(ev) => {
						ev.preventDefault();
						ev.stopPropagation();
						onToggle();
					}}
					size="small"
					className="p-6"
				>
					<FuseSvgIcon size={20} sx={{ color: isPinned ? amber[600] : 'text.disabled' }}>
						{isPinned ? 'heroicons-solid:star' : 'heroicons-outline:star'}
					</FuseSvgIcon>
				</IconButton>
			</Tooltip>
		</MenuItem>
	);
}

export default memo(FuseShortcuts);
