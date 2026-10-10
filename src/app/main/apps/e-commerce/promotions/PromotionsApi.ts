import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['promotion_playbooks', 'shop_coupons'] as const;

export type PromotionPlaybookDto = {
	id: string;
	type: number;
	code: string;
	name: string;
	description: string;
	badgeText: string;
	isEnabled: boolean;
	configurationJson: string;
	budgetLimit: number | null;
	totalDiscountSpent: number;
	usageCount: number;
	revenueGenerated: number;
	startsAt: string | null;
	endsAt: string | null;
	isCurrentlyActive: boolean;
};

export type CouponDto = {
	id: string;
	code: string;
	description: string;
	type: string;
	value: number;
	minOrderAmount: number | null;
	maxDiscountValue: number;
	maxUses: number;
	timesUsed: number;
	validFrom: string;
	validTo: string;
	isActive: boolean;
	isValid: boolean;
};

export type UpdatePlaybookConfigRequest = {
	id: string;
	name: string;
	description: string;
	badgeText: string;
	configurationJson: string;
	budgetLimit?: number | null;
	startsAt?: string | null;
	endsAt?: string | null;
};

export type CreateCouponRequest = {
	code: string;
	description: string;
	type: string;
	value: number;
	maxUses: number;
	validFrom: string;
	validTo: string;
};

const PromotionsApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getPromotionPlaybooks: build.query<PromotionPlaybookDto[], void>({
				query: () => ({ url: '/api/promotions/playbooks' }),
				providesTags: ['promotion_playbooks']
			}),
			togglePlaybook: build.mutation<boolean, { id: string; isEnabled?: boolean }>({
				query: ({ id, isEnabled }) => ({
					url: `/api/promotions/playbooks/${id}/toggle`,
					method: 'PATCH',
					data: { isEnabled }
				}),
				invalidatesTags: ['promotion_playbooks']
			}),
			updatePlaybookConfig: build.mutation<PromotionPlaybookDto, UpdatePlaybookConfigRequest>({
				query: ({ id, ...body }) => ({
					url: `/api/promotions/playbooks/${id}`,
					method: 'PUT',
					data: body
				}),
				invalidatesTags: ['promotion_playbooks']
			}),
			getShopCoupons: build.query<CouponDto[], void>({
				query: () => ({ url: '/api/coupons' }),
				providesTags: ['shop_coupons']
			}),
			toggleCoupon: build.mutation<boolean, string>({
				query: (id) => ({
					url: `/api/coupons/${id}/toggle`,
					method: 'PATCH'
				}),
				invalidatesTags: ['shop_coupons']
			}),
			createCoupon: build.mutation<string, CreateCouponRequest>({
				query: (body) => ({
					url: '/api/coupons',
					method: 'POST',
					data: body
				}),
				invalidatesTags: ['shop_coupons']
			})
		})
	});

export const {
	useGetPromotionPlaybooksQuery,
	useTogglePlaybookMutation,
	useUpdatePlaybookConfigMutation,
	useGetShopCouponsQuery,
	useToggleCouponMutation,
	useCreateCouponMutation
} = PromotionsApi;

export default PromotionsApi;
