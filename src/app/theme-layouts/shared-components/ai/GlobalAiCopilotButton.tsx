import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { toggleGlobalAiCopilot } from './GlobalAiCopilot';

export default function GlobalAiCopilotButton() {
	return (
		<Tooltip title="Enterprise AI Copilot (Phím tắt: Alt + A)" arrow>
			<IconButton
				className="h-40 w-40"
				onClick={() => toggleGlobalAiCopilot()}
				size="large"
				sx={{
					color: '#8b5cf6',
					transition: 'all 0.2s ease',
					'&:hover': {
						bgcolor: 'rgba(139, 92, 246, 0.12)',
						transform: 'scale(1.05)'
					}
				}}
			>
				<AutoAwesomeIcon />
			</IconButton>
		</Tooltip>
	);
}
