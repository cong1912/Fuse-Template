import { apiService as api } from 'app/store/apiService';

export const addTagTypes = ['admin_tenants', 'admin_tenant_details', 'platform_plans'] as const;

export type TenantFeatureOverrideDto = {
	feature: string;
	featureId: number;
	isEnabled: boolean;
	expiresAtUtc?: string | null;
	reason?: string | null;
	updatedAtUtc?: string | null;
};

export type AdminTenantDto = {
	id: string;
	name: string;
	subdomain: string;
	customDomain?: string | null;
	plan: string;
	planTier: number;
	isActive: boolean;
	createdAtUtc: string;
	customMaxProducts?: number | null;
	customMaxStaff?: number | null;
	customMaxCoupons?: number | null;
	activeFeatureOverridesCount: number;
};

export type AdminTenantDetailsDto = {
	id: string;
	name: string;
	subdomain: string;
	customDomain?: string | null;
	plan: string;
	planTier: number;
	isActive: boolean;
	createdAtUtc: string;
	effectiveMaxProducts: number;
	effectiveMaxStaff: number;
	effectiveMaxCoupons: number;
	customMaxProducts?: number | null;
	customMaxStaff?: number | null;
	customMaxCoupons?: number | null;
	featureOverrides: TenantFeatureOverrideDto[];
	enabledFeatures: string[];
};

export type SetFeatureOverrideRequest = {
	tenantId: string;
	feature: number | string;
	isEnabled: boolean;
	reason?: string;
	expiresAtUtc?: string | null;
};

export type UpdatePlanAndQuotasRequest = {
	tenantId: string;
	plan: number; // 0=Free, 1=Standard, 2=Pro, 3=Enterprise
	customMaxProducts?: number | null;
	customMaxStaff?: number | null;
	customMaxCoupons?: number | null;
};

export type ImpersonateTenantResponse = {
	accessToken: string;
	expiresAt: string;
	tenantId: string;
	tenantName: string;
	subdomain: string;
	targetRole: string;
};

export type AuditLogDto = {
	id: string;
	userId: string;
	action: string;
	entityType: string;
	entityId: string;
	oldValues?: string | null;
	newValues?: string | null;
	ipAddress?: string | null;
	userAgent?: string | null;
	actorType?: string | null;
	onBehalfOfTenantId?: string | null;
	createdAtUtc: string;
};

export type PlatformFinancialsDto = {
	totalShops: number;
	activeShops: number;
	suspendedShops: number;
	totalGmvVnd: number;
	platformTakeRateVnd: number;
	mrrVnd: number;
	arrVnd: number;
	plans: {
		free: number;
		basic: number;
		pro: number;
		enterprise: number;
	};
};

export type ExportTenantDataResponse = {
	fileName: string;
	jsonData: string;
	exportedAtUtc: string;
};

export type PlatformPlanDto = {
	id: number;
	code: string;
	name: string;
	price: number;
	maxProducts: string;
	maxStaff: string;
	maxCoupons: string;
	features: string[];
	popular?: boolean;
};

export type CreatePlatformPlanRequest = {
	code: string;
	name: string;
	price: number;
	maxProducts: string;
	maxStaff: string;
	maxCoupons: string;
	features: string[];
	popular?: boolean;
};

export type UpdatePlatformPlanRequest = {
	id: number;
	code: string;
	name: string;
	price: number;
	maxProducts: string;
	maxStaff: string;
	maxCoupons: string;
	features: string[];
	popular?: boolean;
};

export type PlatformBillingInvoiceDto = {
	id: string;
	shopId: string;
	shopName: string;
	plan: string;
	amount: number;
	currency: string;
	billingDateUtc: string;
	dueDateUtc: string;
	status: 'Paid' | 'Pending' | 'Overdue';
	paymentMethod: string;
};

export type PlatformUserDto = {
	id: string;
	email: string;
	fullName: string;
	role: string;
	tenantName: string;
	status: string;
	createdAtUtc: string;
};

export type PlatformRiskAlertDto = {
	id: string;
	shopId: string;
	shopName: string;
	riskScore: number;
	riskLevel: 'Low' | 'Medium' | 'High';
	trigger: string;
	detectedAtUtc: string;
	status: 'Open' | 'UnderReview' | 'Resolved';
};

export type PlatformInviteDto = {
	id: string;
	email: string;
	role: string;
	tenantName: string;
	sentAtUtc: string;
	expiresAtUtc: string;
	status: string;
};

export type PlatformSystemInfoDto = {
	version: string;
	environment: string;
	runtime: string;
	uptime: string;
	serverTimeUtc: string;
	memoryUsageMb: number;
	services: { name: string; status: string; latencyMs: number }[];
	backgroundWorkers: { name: string; status: string; interval: string }[];
};

export type ShopOverviewDto = {
	shopId: string;
	name: string;
	subdomain: string;
	customDomain?: string | null;
	plan: string;
	status: string;
	createdAtUtc: string;
	trialEndsAt?: string | null;
	effectiveMaxProducts: number;
	effectiveMaxStaff: number;
	effectiveMaxCoupons: number;
	monthlyPriceVnd: number;
	features: string[];
};

const AdminTenantsApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAdminTenants: build.query<AdminTenantDto[], void>({
				query: () => ({ url: '/api/admin/tenants' }),
				transformResponse: (response: any) => {
					const rawItems = Array.isArray(response)
						? response
						: (response?.items ?? response?.data ?? []);
					return rawItems.map((item: any) => ({
						id: item.id || item.Id,
						name: item.name || item.Name,
						subdomain: item.subdomain || item.Subdomain,
						customDomain: item.customDomain || item.CustomDomain,
						plan: item.plan || item.Plan || 'Standard',
						planTier: typeof item.planTier === 'number' ? item.planTier : 1,
						isActive: item.status ? item.status.toLowerCase() === 'active' : (item.isActive ?? true),
						createdAtUtc: item.createdAtUtc || item.CreatedAtUtc || new Date().toISOString(),
						customMaxProducts: item.customMaxProducts ?? item.CustomMaxProducts,
						customMaxStaff: item.customMaxStaff ?? item.CustomMaxStaff,
						customMaxCoupons: item.customMaxCoupons ?? item.CustomMaxCoupons,
						activeFeatureOverridesCount: item.activeFeatureOverridesCount ?? 0
					}));
				},
				providesTags: ['admin_tenants']
			}),
			getTenantDetails: build.query<AdminTenantDetailsDto, string>({
				query: (tenantId) => ({ url: `/api/admin/tenants/${tenantId}` }),
				transformResponse: (res: any) => {
					const rawFeatures: any[] = Array.isArray(res?.features) ? res.features : [];
					const enabledFeatures = rawFeatures.filter((f) => f.isEnabled).map((f) => f.feature);
					const featureOverrides = rawFeatures
						.filter((f) => f.isOverridden)
						.map((f) => ({
							feature: f.feature,
							featureId: 0,
							isEnabled: f.isEnabled,
							reason: f.overrideReason,
							expiresAtUtc: f.overrideExpiresAtUtc
						}));

					return {
						id: res.id,
						name: res.name,
						subdomain: res.subdomain,
						customDomain: res.customDomain,
						plan: res.plan,
						planTier: res.plan === 'Enterprise' ? 3 : res.plan === 'Pro' ? 2 : res.plan === 'Standard' ? 1 : 0,
						isActive: res.status ? res.status.toLowerCase() === 'active' : true,
						createdAtUtc: res.createdAtUtc,
						effectiveMaxProducts: res.quotaUsage?.maxProducts ?? 0,
						effectiveMaxStaff: res.quotaUsage?.maxStaff ?? 0,
						effectiveMaxCoupons: res.quotaUsage?.maxCoupons ?? 0,
						customMaxProducts: res.customMaxProducts,
						customMaxStaff: res.customMaxStaff,
						customMaxCoupons: res.customMaxCoupons,
						featureOverrides,
						enabledFeatures
					};
				},
				providesTags: (_result, _error, id) => [{ type: 'admin_tenant_details', id }]
			}),
			setFeatureOverride: build.mutation<boolean, SetFeatureOverrideRequest>({
				query: ({ tenantId, ...body }) => ({
					url: `/api/admin/tenants/${tenantId}/features`,
					method: 'POST',
					data: body
				}),
				invalidatesTags: (_result, _error, { tenantId }) => [
					'admin_tenants',
					{ type: 'admin_tenant_details', id: tenantId }
				]
			}),
			deleteFeatureOverride: build.mutation<boolean, { tenantId: string; feature: number | string }>({
				query: ({ tenantId, feature }) => ({
					url: `/api/admin/tenants/${tenantId}/features/${feature}`,
					method: 'DELETE'
				}),
				invalidatesTags: (_result, _error, { tenantId }) => [
					'admin_tenants',
					{ type: 'admin_tenant_details', id: tenantId }
				]
			}),
			updateTenantPlanAndQuotas: build.mutation<boolean, UpdatePlanAndQuotasRequest>({
				query: ({ tenantId, ...body }) => ({
					url: `/api/admin/tenants/${tenantId}/plan-quotas`,
					method: 'PUT',
					data: body
				}),
				invalidatesTags: (_result, _error, { tenantId }) => [
					'admin_tenants',
					{ type: 'admin_tenant_details', id: tenantId }
				]
			}),
			impersonateTenant: build.mutation<ImpersonateTenantResponse, { tenantId: string; targetRole?: string }>({
				query: ({ tenantId, targetRole = 'Owner' }) => ({
					url: `/api/admin/tenants/${tenantId}/impersonate`,
					method: 'POST',
					data: { targetRole }
				})
			}),
			getPlatformAuditLogs: build.query<AuditLogDto[], void>({
				query: () => ({ url: '/api/admin/tenants/audit-logs' }),
				transformResponse: (response: any) => {
					if (Array.isArray(response)) return response;
					if (response && Array.isArray(response.items)) return response.items;
					if (response && Array.isArray(response.data)) return response.data;
					return [];
				},
				providesTags: ['admin_tenants']
			}),
			getPlatformFinancials: build.query<PlatformFinancialsDto, void>({
				query: () => ({ url: '/api/admin/tenants/platform-financials' }),
				providesTags: ['admin_tenants']
			}),
			exportTenantData: build.mutation<ExportTenantDataResponse, string>({
				query: (tenantId) => ({
					url: `/api/admin/tenants/${tenantId}/export`,
					method: 'POST'
				})
			}),
			getPlatformPlans: build.query<PlatformPlanDto[], void>({
				query: () => ({ url: '/api/superadmin/plans' }),
				transformResponse: (response: any) => {
					if (Array.isArray(response)) return response;
					if (response && Array.isArray(response.items)) return response.items;
					if (response && Array.isArray(response.data)) return response.data;
					return [];
				},
				providesTags: ['platform_plans']
			}),
			createPlatformPlan: build.mutation<PlatformPlanDto, CreatePlatformPlanRequest>({
				query: (body) => ({
					url: '/api/superadmin/plans',
					method: 'POST',
					data: body
				}),
				invalidatesTags: ['platform_plans', 'admin_tenants']
			}),
			updatePlatformPlan: build.mutation<PlatformPlanDto, UpdatePlatformPlanRequest>({
				query: ({ id, ...body }) => ({
					url: `/api/superadmin/plans/${id}`,
					method: 'PUT',
					data: body
				}),
				invalidatesTags: ['platform_plans', 'admin_tenants']
			}),
			deletePlatformPlan: build.mutation<boolean, number>({
				query: (id) => ({
					url: `/api/superadmin/plans/${id}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['platform_plans', 'admin_tenants']
			}),
			getPlatformBilling: build.query<PlatformBillingInvoiceDto[], void>({
				query: () => ({ url: '/api/superadmin/billing' }),
				transformResponse: (response: any) => {
					if (Array.isArray(response)) return response;
					if (response && Array.isArray(response.items)) return response.items;
					if (response && Array.isArray(response.data)) return response.data;
					return [];
				},
				providesTags: ['admin_tenants']
			}),
			approvePlatformBilling: build.mutation<boolean, string>({
				query: (billingId) => ({
					url: `/api/superadmin/billing/${billingId}/approve`,
					method: 'POST'
				}),
				invalidatesTags: ['admin_tenants']
			}),
			getPlatformUsers: build.query<PlatformUserDto[], void>({
				query: () => ({ url: '/api/superadmin/users' }),
				transformResponse: (response: any) => {
					if (Array.isArray(response)) return response;
					if (response && Array.isArray(response.items)) return response.items;
					if (response && Array.isArray(response.data)) return response.data;
					return [];
				},
				providesTags: ['admin_tenants']
			}),
			updatePlatformUserStatus: build.mutation<boolean, { userId: string; status: string }>({
				query: ({ userId, status }) => ({
					url: `/api/superadmin/users/${userId}/status`,
					method: 'PUT',
					data: status
				}),
				invalidatesTags: ['admin_tenants']
			}),
			getPlatformRiskQueue: build.query<PlatformRiskAlertDto[], void>({
				query: () => ({ url: '/api/superadmin/risk' }),
				transformResponse: (response: any) => {
					if (Array.isArray(response)) return response;
					if (response && Array.isArray(response.items)) return response.items;
					if (response && Array.isArray(response.data)) return response.data;
					return [];
				},
				providesTags: ['admin_tenants']
			}),
			getPlatformInvites: build.query<PlatformInviteDto[], void>({
				query: () => ({ url: '/api/superadmin/invites' }),
				transformResponse: (response: any) => {
					if (Array.isArray(response)) return response;
					if (response && Array.isArray(response.items)) return response.items;
					if (response && Array.isArray(response.data)) return response.data;
					return [];
				},
				providesTags: ['admin_tenants']
			}),
			createPlatformInvite: build.mutation<boolean, { email: string; role: string }>({
				query: (body) => ({
					url: '/api/superadmin/invites',
					method: 'POST',
					data: body
				}),
				invalidatesTags: ['admin_tenants']
			}),
			getPlatformSystemInfo: build.query<PlatformSystemInfoDto, void>({
				query: () => ({ url: '/api/superadmin/system' }),
				providesTags: ['admin_tenants']
			}),
			getShopOverview: build.query<ShopOverviewDto, string>({
				query: (shopId) => ({ url: `/api/superadmin/shops/${shopId}/overview` }),
				providesTags: (_result, _error, id) => [{ type: 'admin_tenant_details', id }]
			}),
			updateShopStatus: build.mutation<boolean, { shopId: string; status: string }>({
				query: ({ shopId, status }) => ({
					url: `/api/superadmin/shops/${shopId}/status`,
					method: 'PUT',
					data: status
				}),
				invalidatesTags: ['admin_tenants']
			}),
			getTenantSiteLayout: build.query<TenantSiteLayoutDto, void>({
				query: () => ({ url: '/api/tenant/layout' }),
				providesTags: ['admin_tenants']
			}),
			updateTenantTheme: build.mutation<void, ThemeTokensDto>({
				query: (tokens) => ({
					url: '/api/tenant/layout/theme',
					method: 'PUT',
					data: tokens
				}),
				invalidatesTags: ['admin_tenants']
			})
		}),
		overrideExisting: false
	});

export type ThemeTokensDto = {
	primaryColor: string;
	accentColor: string;
	backgroundColor: string;
	fontFamily: string;
	borderRadius: string;
	darkMode: boolean;
};

export type TenantSiteLayoutDto = {
	tenantId: string;
	themeTokens: ThemeTokensDto;
	pageSections: any[];
};

export default AdminTenantsApi;

export const {
	useGetAdminTenantsQuery,
	useGetTenantDetailsQuery,
	useSetFeatureOverrideMutation,
	useDeleteFeatureOverrideMutation,
	useUpdateTenantPlanAndQuotasMutation,
	useImpersonateTenantMutation,
	useGetPlatformAuditLogsQuery,
	useGetPlatformFinancialsQuery,
	useExportTenantDataMutation,
	useGetPlatformPlansQuery,
	useCreatePlatformPlanMutation,
	useUpdatePlatformPlanMutation,
	useDeletePlatformPlanMutation,
	useGetPlatformBillingQuery,
	useApprovePlatformBillingMutation,
	useGetPlatformUsersQuery,
	useUpdatePlatformUserStatusMutation,
	useGetPlatformRiskQueueQuery,
	useGetPlatformInvitesQuery,
	useCreatePlatformInviteMutation,
	useGetPlatformSystemInfoQuery,
	useGetShopOverviewQuery,
	useUpdateShopStatusMutation,
	useGetTenantSiteLayoutQuery,
	useUpdateTenantThemeMutation
} = AdminTenantsApi;
