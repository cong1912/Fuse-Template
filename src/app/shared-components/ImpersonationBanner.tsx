import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type ImpersonationInfo = {
	tenantId: string;
	tenantName: string;
	subdomain: string;
	originalToken: string;
	expiresAt: string;
};

export function ImpersonationBanner() {
	const [info, setInfo] = useState<ImpersonationInfo | null>(null);

	useEffect(() => {
		const checkImpersonation = () => {
			const saved = localStorage.getItem('impersonation_info');
			if (saved) {
				try {
					setInfo(JSON.parse(saved));
				} catch {
					setInfo(null);
				}
			} else {
				setInfo(null);
			}
		};

		checkImpersonation();
		window.addEventListener('storage', checkImpersonation);
		return () => window.removeEventListener('storage', checkImpersonation);
	}, []);

	if (!info) {
		return null;
	}

	const handleExit = () => {
		if (info.originalToken) {
			localStorage.setItem('jwt_access_token', info.originalToken);
		}
		localStorage.removeItem('impersonation_info');
		window.location.href = '/platform/shops';
	};

	return (
		<Box
			sx={{
				backgroundColor: '#d97706', // amber-600
				color: '#ffffff',
				px: 3,
				py: 1,
				position: 'sticky',
				top: 0,
				zIndex: 9999,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
				<Typography variant="body2" sx={{ fontWeight: 600 }}>
					IMPERSONATION ACTIVE: Viewing store &ldquo;{info.tenantName}&rdquo; ({info.subdomain}.domain.com).
					All administrative actions are logged under compliance.
				</Typography>
			</Box>
			<Button
				variant="contained"
				size="small"
				onClick={handleExit}
				sx={{
					backgroundColor: '#ffffff',
					color: '#b45309',
					fontWeight: 700,
					'&:hover': { backgroundColor: '#fef3c7' }
				}}
				startIcon={<FuseSvgIcon size={16}>heroicons-outline:logout</FuseSvgIcon>}
			>
				Exit Impersonation
			</Button>
		</Box>
	);
}

export default ImpersonationBanner;
