import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';

export interface PageHeaderProps {
	title: string;
	breadcrumbs?: { label: string; href?: string }[];
	actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, actions }) => {
	return (
		<Box
			mb={4}
			display="flex"
			justifyContent="space-between"
			alignItems="flex-start"
		>
			<Box>
				<Typography
					variant="h4"
					component="h1"
					gutterBottom
					fontWeight={700}
				>
					{title}
				</Typography>
				{breadcrumbs && breadcrumbs.length > 0 && (
					<Breadcrumbs aria-label="breadcrumb">
						{breadcrumbs.map((bc, index) => {
							const isLast = index === breadcrumbs.length - 1;
							return isLast || !bc.href ? (
								<Typography
									key={index}
									color="text.primary"
								>
									{bc.label}
								</Typography>
							) : (
								<Link
									key={index}
									underline="hover"
									color="inherit"
									href={bc.href}
								>
									{bc.label}
								</Link>
							);
						})}
					</Breadcrumbs>
				)}
			</Box>
			<Box>{actions}</Box>
		</Box>
	);
};

export default PageHeader;
