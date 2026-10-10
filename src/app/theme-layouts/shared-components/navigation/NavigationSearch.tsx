import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import GlobalOmniSearchDialog from './GlobalOmniSearchDialog';

type NavigationSearchProps = {
	className?: string;
	variant?: 'basic' | 'full';
};

/**
 * The navigation search with Omnisearch Command Palette (Ctrl+K).
 */
function NavigationSearch(props: NavigationSearchProps) {
	const { className = '' } = props;
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setIsOpen(prev => !prev);
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => window.removeEventListener('keydown', handleGlobalKeyDown);
	}, []);

	return (
		<>
			<Box
				onClick={() => setIsOpen(true)}
				className={`hidden md:flex items-center px-12 py-6 rounded-full cursor-pointer transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/50 mx-8 ${className}`}
				sx={{ minWidth: 200 }}
			>
				<SearchIcon fontSize="small" className="text-slate-400 mr-8" />
				<Typography variant="body2" className="text-slate-400 flex-1 select-none text-13">
					Tìm kiếm...
				</Typography>
				<Box
					component="span"
					className="px-6 py-2 text-11 font-semibold rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
				>
					Ctrl K
				</Box>
			</Box>

			<Tooltip title="Tìm kiếm (Ctrl+K)">
				<IconButton
					className="md:hidden h-40 w-40"
					onClick={() => setIsOpen(true)}
					size="large"
				>
					<SearchIcon />
				</IconButton>
			</Tooltip>

			<GlobalOmniSearchDialog
				open={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}

export default NavigationSearch;
