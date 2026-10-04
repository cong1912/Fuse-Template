import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel, CircularProgress, Box, Divider, Alert } from '@mui/material';
import { useGetIntegrationsQuery, useUpdateIntegrationMutation } from './integrationsApi';
import FusePageSimple from '@fuse/core/FusePageSimple';
import PageHeader from 'src/admin-kit/PageHeader'; // Using the Admin Kit as suggested in system prompt

function IntegrationsPage() {
	const { data: integrations, isLoading, error } = useGetIntegrationsQuery();
	const [updateIntegration, { isLoading: isUpdating }] = useUpdateIntegrationMutation();

	// State for forms
	const [vnpayState, setVnpayState] = useState({ isActive: false, tmnCode: '', hashSecret: '' });
	const [ghnState, setGhnState] = useState({ isActive: false, token: '', shopId: '' });
	const [successMsg, setSuccessMsg] = useState('');

	useEffect(() => {
		if (integrations) {
			const vnpay = integrations.find(i => i.provider === 'vnpay');
			if (vnpay) {
				setVnpayState({
					isActive: vnpay.isActive,
					tmnCode: vnpay.credentials?.TmnCode || '',
					hashSecret: vnpay.credentials?.HashSecret || ''
				});
			}

			const ghn = integrations.find(i => i.provider === 'ghn');
			if (ghn) {
				setGhnState({
					isActive: ghn.isActive,
					token: ghn.credentials?.Token || '',
					shopId: ghn.credentials?.ShopId || ''
				});
			}
		}
	}, [integrations]);

	const handleSaveVNPay = async () => {
		try {
			await updateIntegration({
				provider: 'vnpay',
				data: {
					isActive: vnpayState.isActive,
					credentials: {
						TmnCode: vnpayState.tmnCode,
						HashSecret: vnpayState.hashSecret
					}
				}
			}).unwrap();
			setSuccessMsg('Lưu cấu hình VNPay thành công');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			console.error(err);
		}
	};

	const handleSaveGHN = async () => {
		try {
			await updateIntegration({
				provider: 'ghn',
				data: {
					isActive: ghnState.isActive,
					credentials: {
						Token: ghnState.token,
						ShopId: ghnState.shopId
					}
				}
			}).unwrap();
			setSuccessMsg('Lưu cấu hình GHN thành công');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			console.error(err);
		}
	};

	if (isLoading) return <div className="p-24 flex justify-center"><CircularProgress /></div>;

	return (
		<FusePageSimple
			header={<PageHeader title="Tích hợp (Integrations)" breadcrumbs={[{label: 'Cài đặt'}, {label: 'Tích hợp'}]} />}
			content={
				<div className="p-24 w-full max-w-4xl">
					{successMsg && (
						<Alert severity="success" className="mb-24">
							{successMsg}
						</Alert>
					)}
					{error && (
						<Alert severity="error" className="mb-24">
							Đã có lỗi xảy ra khi tải cấu hình.
						</Alert>
					)}

					<Grid container spacing={3}>
						<Grid item xs={12} md={6}>
							<Paper className="p-24 rounded-2xl shadow">
								<Typography variant="h6" className="font-semibold mb-16">
									VNPay (Thanh toán)
								</Typography>
								<Divider className="mb-24" />

								<FormControlLabel
									control={
										<Switch
											checked={vnpayState.isActive}
											onChange={(e) => setVnpayState(prev => ({ ...prev, isActive: e.target.checked }))}
										/>
									}
									label={vnpayState.isActive ? "Đang bật" : "Đang tắt"}
									className="mb-16"
								/>

								<TextField
									fullWidth
									label="TmnCode"
									value={vnpayState.tmnCode}
									onChange={(e) => setVnpayState(prev => ({ ...prev, tmnCode: e.target.value }))}
									margin="normal"
									variant="outlined"
								/>

								<TextField
									fullWidth
									label="HashSecret"
									value={vnpayState.hashSecret}
									onChange={(e) => setVnpayState(prev => ({ ...prev, hashSecret: e.target.value }))}
									margin="normal"
									variant="outlined"
								/>

								<Box display="flex" justifyContent="flex-end" mt={3}>
									<Button
										variant="contained"
										color="secondary"
										onClick={handleSaveVNPay}
										disabled={isUpdating}
									>
										Lưu VNPay
									</Button>
								</Box>
							</Paper>
						</Grid>

						<Grid item xs={12} md={6}>
							<Paper className="p-24 rounded-2xl shadow">
								<Typography variant="h6" className="font-semibold mb-16">
									Giao Hàng Nhanh (Vận chuyển)
								</Typography>
								<Divider className="mb-24" />

								<FormControlLabel
									control={
										<Switch
											checked={ghnState.isActive}
											onChange={(e) => setGhnState(prev => ({ ...prev, isActive: e.target.checked }))}
										/>
									}
									label={ghnState.isActive ? "Đang bật" : "Đang tắt"}
									className="mb-16"
								/>

								<TextField
									fullWidth
									label="Token"
									value={ghnState.token}
									onChange={(e) => setGhnState(prev => ({ ...prev, token: e.target.value }))}
									margin="normal"
									variant="outlined"
								/>

								<TextField
									fullWidth
									label="ShopId"
									value={ghnState.shopId}
									onChange={(e) => setGhnState(prev => ({ ...prev, shopId: e.target.value }))}
									margin="normal"
									variant="outlined"
								/>

								<Box display="flex" justifyContent="flex-end" mt={3}>
									<Button
										variant="contained"
										color="secondary"
										onClick={handleSaveGHN}
										disabled={isUpdating}
									>
										Lưu GHN
									</Button>
								</Box>
							</Paper>
						</Grid>
					</Grid>
				</div>
			}
		/>
	);
}

export default IntegrationsPage;
