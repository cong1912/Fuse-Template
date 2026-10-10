import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['flash_sales', 'flash_sale_details'] as const;

export type FlashSaleItemDto = {
	id: string;
	productId: string;
	productName?: string;
	discountPrice: number;
	currency: string;
	stockLimit: number;
	stockSold: number;
};

export type FlashSaleDto = {
	id: string;
	name: string;
	description: string;
	startsAtUtc: string;
	endsAtUtc: string;
	isActive: boolean;
	items: FlashSaleItemDto[];
};

export type WaitingRoomStatusDto = {
	flashSaleId: string;
	userId: string;
	status: number; // 0=Queued, 1=Admitted, 2=Expired, 3=NotEnqueued
	position: number;
	totalInQueue: number;
	admissionToken?: string | null;
	admissionExpiresAtUtc?: string | null;
	estimatedWaitSeconds: number;
};

export type AdmitBatchResponse = {
	flashSaleId: string;
	admittedCount: number;
	admittedUserIds: string[];
};

const FlashSaleApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getFlashSales: build.query<FlashSaleDto[], void>({
				query: () => ({ url: '/api/flashsales' }),
				providesTags: ['flash_sales']
			}),
			getFlashSaleById: build.query<FlashSaleDto, string>({
				query: (id) => ({ url: `/api/flashsales/${id}` }),
				providesTags: (_res, _err, id) => [{ type: 'flash_sale_details', id }]
			}),
			getWaitingRoomStatus: build.query<WaitingRoomStatusDto, { flashSaleId: string; userId: string }>({
				query: ({ flashSaleId, userId }) => ({
					url: `/api/flashsales/${flashSaleId}/waiting-room/status?userId=${userId}`
				})
			}),
			admitWaitingRoomBatch: build.mutation<AdmitBatchResponse, { flashSaleId: string; batchSize?: number; ttlMinutes?: number }>({
				query: ({ flashSaleId, batchSize = 100, ttlMinutes = 5 }) => ({
					url: `/api/flashsales/${flashSaleId}/waiting-room/admit`,
					method: 'POST',
					data: { batchSize, ttlMinutes }
				}),
				invalidatesTags: ['flash_sales']
			}),
			createFlashSale: build.mutation<string, { name: string; description: string; startsAtUtc: string; endsAtUtc: string }>({
				query: (data) => ({
					url: '/api/flashsales',
					method: 'POST',
					data
				}),
				invalidatesTags: ['flash_sales']
			}),
			addFlashSaleItem: build.mutation<void, { flashSaleId: string; productId: string; discountPrice: number; currency?: string; stockLimit: number }>({
				query: ({ flashSaleId, productId, discountPrice, currency = 'VND', stockLimit }) => ({
					url: `/api/flashsales/${flashSaleId}/items`,
					method: 'POST',
					data: { productId, discountPrice, currency, stockLimit }
				}),
				invalidatesTags: ['flash_sales', 'flash_sale_details']
			}),
			addFlashSaleItemsBatch: build.mutation<number, { flashSaleId: string; items: Array<{ productId: string; discountPrice: number; currency?: string; stockLimit: number }> }>({
				query: ({ flashSaleId, items }) => ({
					url: `/api/flashsales/${flashSaleId}/items/batch`,
					method: 'POST',
					data: { items }
				}),
				invalidatesTags: ['flash_sales', 'flash_sale_details']
			}),
			removeFlashSaleItem: build.mutation<void, { flashSaleId: string; itemId: string }>({
				query: ({ flashSaleId, itemId }) => ({
					url: `/api/flashsales/${flashSaleId}/items/${itemId}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['flash_sales', 'flash_sale_details']
			})
		}),
		overrideExisting: false
	});

export default FlashSaleApi;

export const {
	useGetFlashSalesQuery,
	useGetFlashSaleByIdQuery,
	useGetWaitingRoomStatusQuery,
	useAdmitWaitingRoomBatchMutation,
	useCreateFlashSaleMutation,
	useAddFlashSaleItemMutation,
	useAddFlashSaleItemsBatchMutation,
	useRemoveFlashSaleItemMutation
} = FlashSaleApi;


