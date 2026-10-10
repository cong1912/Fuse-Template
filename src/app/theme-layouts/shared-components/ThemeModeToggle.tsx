import { MouseEvent, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'app/store/store';
import {
	selectThemeMode,
	setThemeMode,
	ThemeModeType
} from '@fuse/core/FuseSettings/store/fuseSettingsSlice';

type ThemeModeToggleProps = {
	className?: string;
};

const themeModeOptions: { mode: ThemeModeType; label: string; icon: string }[] = [
	{ mode: 'light', label: 'Light', icon: 'heroicons-outline:sun' },
	{ mode: 'dark', label: 'Dark', icon: 'heroicons-outline:moon' },
	{ mode: 'system', label: 'System', icon: 'heroicons-outline:desktop-computer' }
];

/**
 * Modern Enterprise SaaS 3-Way Theme Mode Switcher [Light | Dark | System].
 */
function ThemeModeToggle(props: ThemeModeToggleProps) {
	const { className = '' } = props;
	const dispatch = useAppDispatch();
	const themeMode = useSelector(selectThemeMode);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelectMode = (mode: ThemeModeType) => {
		dispatch(setThemeMode(mode));
		handleClose();
	};

	const currentIcon =
		themeMode === 'dark'
			? 'heroicons-outline:moon'
			: themeMode === 'light'
				? 'heroicons-outline:sun'
				: 'heroicons-outline:desktop-computer';

	const currentLabel =
		themeMode === 'dark' ? 'Dark' : themeMode === 'light' ? 'Light' : 'System';

	return (
		<div>
			<Tooltip
				title={`Theme: ${currentLabel}`}
				placement="bottom"
			>
				<IconButton
					className={clsx('h-40 w-40', className)}
					aria-controls="theme-mode-menu"
					aria-haspopup="true"
					data-testid="theme-mode-toggle"
					onClick={handleClick}
					size="large"
					color="inherit"
				>
					<FuseSvgIcon size={20}>{currentIcon}</FuseSvgIcon>
				</IconButton>
			</Tooltip>

			<Menu
				id="theme-mode-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				classes={{
					paper: 'w-180 py-4 shadow-xl border border-divider'
				}}
			>
				{themeModeOptions.map((opt) => {
					const isSelected = themeMode === opt.mode;

					return (
						<MenuItem
							key={opt.mode}
							data-testid={`theme-mode-option-${opt.mode}`}
							onClick={() => handleSelectMode(opt.mode)}
							selected={isSelected}
							className="py-8"
						>
							<ListItemIcon className="min-w-32">
								<FuseSvgIcon
									size={18}
									color={isSelected ? 'primary' : 'action'}
								>
									{opt.icon}
								</FuseSvgIcon>
							</ListItemIcon>

							<ListItemText
								primary={opt.label}
								primaryTypographyProps={{
									className: clsx('text-13 font-medium', isSelected && 'font-semibold text-primary')
								}}
							/>

							{isSelected && (
								<FuseSvgIcon
									size={16}
									className="text-primary ml-8"
								>
									heroicons-outline:check
								</FuseSvgIcon>
							)}
						</MenuItem>
					);
				})}
			</Menu>
		</div>
	);
}

export default ThemeModeToggle;
