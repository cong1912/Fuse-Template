import { useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {
	useGetB2BQuotesQuery,
	useNegotiateB2BQuoteMutation,
	useAcceptB2BQuoteMutation,
	B2BQuoteDto
} from './B2BApi';

function B2BQuotesPage() {
	const { data: quotes = [], isLoading, refetch } = useGetB2BQuotesQuery();
	const [selectedQuote, setSelectedQuote] = useState<B2BQuoteDto | null>(null);
	const [acceptQuote, { isLoading: isConverting }] = useAcceptB2BQuoteMutation();
	const [statusFilter, setStatusFilter] = useState<string>('All');
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const filteredQuotes = quotes.filter((q) => {
		if (statusFilter === 'All') return true;
		return q.status.toLowerCase() === statusFilter.toLowerCase();
	});

	const getStatusChip = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'convertedtoorder':
				return <Chip size="small" label="Order Created" color="success" />;
			case 'approved':
				return <Chip size="small" label="Approved" color="primary" />;
			case 'negotiating':
				return <Chip size="small" label="Negotiating" color="warning" />;
			case 'submitted':
				return <Chip size="small" label="Pending Review" color="info" />;
			case 'rejected':
				return <Chip size="small" label="Rejected" color="error" />;
			default:
				return <Chip size="small" label={status || 'Draft'} variant="outlined" />;
		}
	};

	const handleQuickAccept = async (quote: B2BQuoteDto) => {
		try {
			await acceptQuote({
				quoteId: quote.id,
				shippingStreet: 'Corporate Headquarters',
				shippingCity: 'Hanoi',
				shippingState: 'Hanoi'
			}).unwrap();
			setSuccessMsg(`Quote ${quote.quoteNumber} converted to standard order!`);
			setTimeout(() => setSuccessMsg(null), 4000);
			refetch();
		} catch (e) {
			console.error('Failed to convert quote', e);
		}
	};

	return (
		<FusePageSimple
			header={
				<div className="flex flex-col sm:flex-row items-center justify-between p-24 sm:p-32 w-full border-b border-divider">
					<div className="flex items-center">
						<FuseSvgIcon size={32} className="text-primary-main mr-16">
							heroicons-outline:briefcase
						</FuseSvgIcon>
						<div>
							<Typography className="text-2xl font-bold tracking-tight">
								B2B Wholesale & Quoting (RFQ)
							</Typography>
							<Typography color="text.secondary" className="text-sm">
								Negotiate wholesale prices and manage corporate buyer purchase quotes
							</Typography>
						</div>
					</div>
					<div className="mt-16 sm:mt-0 flex gap-8">
						{['All', 'Submitted', 'Negotiating', 'Approved', 'ConvertedToOrder'].map((status) => (
							<Button
								key={status}
								size="small"
								variant={statusFilter === status ? 'contained' : 'outlined'}
								color={statusFilter === status ? 'primary' : 'inherit'}
								onClick={() => setStatusFilter(status)}
							>
								{status}
							</Button>
						))}
					</div>
				</div>
			}
			content={
				<div className="p-24 sm:p-32 w-full max-w-7xl mx-auto space-y-24">
					{successMsg && (
						<Alert severity="success" className="shadow rounded-xl">
							{successMsg}
						</Alert>
					)}

					{/* Metrics Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-20">
						<Paper className="p-20 shadow rounded-2xl">
							<Typography color="text.secondary" className="text-xs uppercase font-semibold">
								Total RFQs
							</Typography>
							<Typography className="text-2xl font-bold mt-4">{quotes.length}</Typography>
						</Paper>
						<Paper className="p-20 shadow rounded-2xl">
							<Typography color="text.secondary" className="text-xs uppercase font-semibold">
								Pending Negotiation
							</Typography>
							<Typography className="text-2xl font-bold mt-4 text-warning-main">
								{quotes.filter((q) => q.status?.toLowerCase() === 'submitted' || q.status?.toLowerCase() === 'negotiating').length}
							</Typography>
						</Paper>
						<Paper className="p-20 shadow rounded-2xl">
							<Typography color="text.secondary" className="text-xs uppercase font-semibold">
								Converted to Orders
							</Typography>
							<Typography className="text-2xl font-bold mt-4 text-success-main">
								{quotes.filter((q) => q.status?.toLowerCase() === 'convertedtoorder').length}
							</Typography>
						</Paper>
						<Paper className="p-20 shadow rounded-2xl">
							<Typography color="text.secondary" className="text-xs uppercase font-semibold">
								Pipeline Value
							</Typography>
							<Typography className="text-2xl font-bold mt-4 text-primary-main">
								{quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0).toLocaleString()} đ
							</Typography>
						</Paper>
					</div>

					{/* Quotes Table */}
					<Paper className="shadow rounded-2xl overflow-hidden p-24">
						<Typography className="text-lg font-semibold mb-16">
							Wholesale Requests for Quote
						</Typography>

						{isLoading ? (
							<div className="py-48 flex justify-center">
								<CircularProgress />
							</div>
						) : filteredQuotes.length === 0 ? (
							<Typography color="text.secondary" className="py-32 text-center">
								No quotes found matching "{statusFilter}".
							</Typography>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell className="font-semibold">RFQ Reference</TableCell>
											<TableCell className="font-semibold">Company / Buyer</TableCell>
											<TableCell className="font-semibold">Items Count</TableCell>
											<TableCell className="font-semibold">Quoted Total</TableCell>
											<TableCell className="font-semibold">Status</TableCell>
											<TableCell className="font-semibold">Date</TableCell>
											<TableCell className="font-semibold text-right">Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredQuotes.map((quote) => (
											<TableRow key={quote.id} hover>
												<TableCell className="font-medium text-primary-main">
													{quote.quoteNumber}
												</TableCell>
												<TableCell>
													<div>
														<span className="font-semibold text-sm">{quote.companyName}</span>
														<div className="text-xs text-text-secondary">Tax ID: {quote.taxId}</div>
													</div>
												</TableCell>
												<TableCell>{quote.items?.length || 0} line items</TableCell>
												<TableCell className="font-bold">
													{quote.totalAmount?.toLocaleString()} {quote.currency}
												</TableCell>
												<TableCell>{getStatusChip(quote.status)}</TableCell>
												<TableCell className="text-xs text-text-secondary">
													{new Date(quote.createdAtUtc).toLocaleDateString()}
												</TableCell>
												<TableCell align="right" className="space-x-8">
													{quote.status?.toLowerCase() !== 'convertedtoorder' && (
														<>
															<Button
																size="small"
																variant="outlined"
																color="primary"
																onClick={() => setSelectedQuote(quote)}
															>
																Counter-Offer
															</Button>
															<Button
																size="small"
																variant="contained"
																color="success"
																disabled={isConverting}
																onClick={() => handleQuickAccept(quote)}
															>
																Accept & Order
															</Button>
														</>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</Paper>

					{/* Negotiation Dialog */}
					{selectedQuote && (
						<NegotiateQuoteDialog
							quote={selectedQuote}
							onClose={() => {
								setSelectedQuote(null);
								refetch();
							}}
						/>
					)}
				</div>
			}
		/>
	);
}

function NegotiateQuoteDialog({
	quote,
	onClose
}: {
	quote: B2BQuoteDto;
	onClose: () => void;
}) {
	const [negotiate, { isLoading }] = useNegotiateB2BQuoteMutation();
	const [notes, setNotes] = useState(quote.merchantNotes || 'Counter-offer proposed with bulk tier discount.');
	const [prices, setPrices] = useState<Record<string, number>>(() => {
		const initial: Record<string, number> = {};
		quote.items?.forEach((i) => {
			initial[i.id] = i.quotedUnitPrice;
		});
		return initial;
	});

	const handleSubmitNegotiation = async () => {
		const adjustments = Object.entries(prices).map(([itemId, newPrice]) => ({
			itemId,
			newQuotedUnitPrice: Number(newPrice)
		}));

		try {
			await negotiate({
				quoteId: quote.id,
				merchantNotes: notes,
				adjustments
			}).unwrap();
			onClose();
		} catch (e) {
			console.error('Failed to submit negotiation', e);
		}
	};

	return (
		<Dialog open fullWidth maxWidth="md" onClose={onClose}>
			<DialogTitle className="flex justify-between items-center border-b border-divider">
				<div>
					<Typography className="text-lg font-bold">Negotiate RFQ: {quote.quoteNumber}</Typography>
					<Typography color="text.secondary" className="text-xs">
						Buyer: {quote.companyName} (Tax ID: {quote.taxId})
					</Typography>
				</div>
				<Button size="small" onClick={onClose}>
					<FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
				</Button>
			</DialogTitle>

			<DialogContent className="p-24 space-y-20">
				<Typography className="font-semibold text-sm">Line Items & Unit Price Negotiation</Typography>
				<div className="divide-y divide-divider border border-divider rounded-xl">
					{quote.items?.map((item) => (
						<div key={item.id} className="p-16 flex items-center justify-between gap-16">
							<div>
								<Typography className="font-medium text-sm">{item.productName}</Typography>
								<Typography color="text.secondary" className="text-xs">
									SKU: {item.sku} • Quantity: {item.quantity} • List Price: {item.originalUnitPrice?.toLocaleString()} {item.currency}
								</Typography>
							</div>

							<div className="flex items-center gap-12">
								<TextField
									size="small"
									label="Negotiated Price"
									type="number"
									value={prices[item.id] ?? item.quotedUnitPrice}
									onChange={(e) =>
										setPrices((prev) => ({ ...prev, [item.id]: parseFloat(e.target.value) || 0 }))
									}
									className="w-160"
								/>
								<Typography className="font-semibold text-sm w-120 text-right">
									= {((prices[item.id] ?? item.quotedUnitPrice) * item.quantity).toLocaleString()} {item.currency}
								</Typography>
							</div>
						</div>
					))}
				</div>

				<TextField
					fullWidth
					multiline
					rows={3}
					label="Merchant Counter-Offer Notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
				/>
			</DialogContent>

			<DialogActions className="p-16 border-t border-divider">
				<Button onClick={onClose} variant="outlined" color="inherit">
					Cancel
				</Button>
				<Button
					onClick={handleSubmitNegotiation}
					variant="contained"
					color="primary"
					disabled={isLoading}
				>
					{isLoading ? 'Saving...' : 'Send Counter-Offer'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default B2BQuotesPage;
