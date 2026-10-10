import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['b2b_quotes', 'b2b_credit'] as const;

export type B2BQuoteItemDto = {
	id: string;
	productId: string;
	productVariantId?: string | null;
	productName: string;
	sku: string;
	quantity: number;
	originalUnitPrice: number;
	quotedUnitPrice: number;
	totalAmount: number;
	currency: string;
};

export type B2BQuoteDto = {
	id: string;
	customerId: string;
	quoteNumber: string;
	companyName: string;
	taxId: string;
	status: string; // Draft, Submitted, Negotiating, Approved, Rejected, ConvertedToOrder, Expired
	totalAmount: number;
	currency: string;
	validUntilUtc?: string | null;
	merchantNotes?: string | null;
	customerNotes?: string | null;
	convertedOrderId?: string | null;
	createdAtUtc: string;
	items: B2BQuoteItemDto[];
};

export type B2BCreditAccountDto = {
	id: string;
	customerId: string;
	companyName: string;
	taxId: string;
	creditLimit: number;
	usedCredit: number;
	availableCredit: number;
	paymentTermDays: number;
	isFrozen: boolean;
	freezeReason?: string | null;
	currency: string;
};

export type NegotiateQuoteRequest = {
	quoteId: string;
	merchantNotes?: string;
	validUntilUtc?: string;
	adjustments?: { itemId: string; newQuotedUnitPrice: number }[];
};

export type AcceptQuoteRequest = {
	quoteId: string;
	shippingStreet: string;
	shippingCity: string;
	shippingState: string;
	shippingCountry?: string;
	shippingZipCode?: string;
};

const B2BApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getB2BQuotes: build.query<B2BQuoteDto[], { customerId?: string; status?: string } | void>({
				query: (params) => ({
					url: '/api/b2b/rfq',
					params: params || {}
				}),
				providesTags: ['b2b_quotes']
			}),
			negotiateB2BQuote: build.mutation<B2BQuoteDto, NegotiateQuoteRequest>({
				query: ({ quoteId, ...body }) => ({
					url: `/api/b2b/quotes/${quoteId}/negotiate`,
					method: 'PUT',
					data: body
				}),
				invalidatesTags: ['b2b_quotes']
			}),
			acceptB2BQuote: build.mutation<{ orderId: string }, AcceptQuoteRequest>({
				query: ({ quoteId, ...body }) => ({
					url: `/api/b2b/quotes/${quoteId}/accept`,
					method: 'POST',
					data: body
				}),
				invalidatesTags: ['b2b_quotes']
			}),
			getB2BCreditAccount: build.query<B2BCreditAccountDto, string>({
				query: (customerId) => ({ url: `/api/b2b/credit/${customerId}` }),
				providesTags: ['b2b_credit']
			})
		}),
		overrideExisting: false
	});

export default B2BApi;

export const {
	useGetB2BQuotesQuery,
	useNegotiateB2BQuoteMutation,
	useAcceptB2BQuoteMutation,
	useGetB2BCreditAccountQuery
} = B2BApi;
