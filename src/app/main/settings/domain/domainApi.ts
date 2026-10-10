import { apiService } from 'app/store/apiService';

export interface TenantDomainDto {
	tenantId: string;
	tenantName: string;
	subdomain: string;
	fullSubdomainUrl: string;
	customDomain?: string | null;
	dnsVerified: boolean;
	sslStatus: string; // 'Active' | 'Pending' | 'NotConfigured' | 'Error'
	sslExpiresAt?: string | null;
	cnameTarget: string;
	serverIp: string;
	txtVerificationRecord: string;
	isCustomDomainAllowedByPlan: boolean;
	autoHttpsRedirect: boolean;
}

export interface DomainVerificationResultDto {
	isSuccess: boolean;
	domain: string;
	cnameMatched: boolean;
	currentCnameTarget?: string | null;
	expectedCnameTarget: string;
	aRecordMatched: boolean;
	currentIp?: string | null;
	expectedIp: string;
	txtRecordMatched: boolean;
	sslStatus: string;
	message: string;
	checkedAtUtc: string;
}

export interface TenantDomainAdminDto {
	tenantId: string;
	tenantName: string;
	subdomain: string;
	customDomain?: string | null;
	plan: number | string;
	status: number | string;
	dnsVerified: boolean;
	sslStatus: string;
	sslExpiresAt?: string | null;
	updatedAtUtc?: string | null;
	createdAtUtc: string;
}

export interface PagedResult<T> {
	items: T[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export const domainApi = apiService
	.enhanceEndpoints({ addTagTypes: ['TenantDomain', 'AdminDomains'] })
	.injectEndpoints({
		endpoints: (builder) => ({
			getTenantDomain: builder.query<TenantDomainDto, void>({
				query: () => ({
					url: '/api/tenant/domain',
					method: 'GET'
				}),
				providesTags: ['TenantDomain']
			}),
			updateSubdomain: builder.mutation<void, { subdomain: string }>({
				query: (body) => ({
					url: '/api/tenant/subdomain',
					method: 'PUT',
					data: body
				}),
				invalidatesTags: ['TenantDomain', 'AdminDomains']
			}),
			setCustomDomain: builder.mutation<void, { customDomain: string }>({
				query: (body) => ({
					url: '/api/tenant/custom-domain',
					method: 'POST',
					data: body
				}),
				invalidatesTags: ['TenantDomain', 'AdminDomains']
			}),
			removeCustomDomain: builder.mutation<void, void>({
				query: () => ({
					url: '/api/tenant/custom-domain',
					method: 'DELETE'
				}),
				invalidatesTags: ['TenantDomain', 'AdminDomains']
			}),
			verifyCustomDomain: builder.mutation<DomainVerificationResultDto, { expectedTarget?: string } | void>({
				query: (params) => ({
					url: '/api/tenant/custom-domain/verify',
					method: 'POST',
					params: params || undefined
				}),
				invalidatesTags: ['TenantDomain']
			}),
			getAdminDomains: builder.query<
				PagedResult<TenantDomainAdminDto>,
				{ search?: string; status?: string; page?: number; pageSize?: number } | void
			>({
				query: (params) => ({
					url: '/api/admin/domains',
					method: 'GET',
					params: params || undefined
				}),
				providesTags: ['AdminDomains']
			}),
			adminSetDomain: builder.mutation<void, { tenantId: string; customDomain: string; forceVerify?: boolean }>({
				query: ({ tenantId, ...body }) => ({
					url: `/api/admin/tenants/${tenantId}/domain`,
					method: 'PUT',
					data: body
				}),
				invalidatesTags: ['AdminDomains', 'TenantDomain']
			}),
			adminRemoveDomain: builder.mutation<void, { tenantId: string }>({
				query: ({ tenantId }) => ({
					url: `/api/admin/tenants/${tenantId}/domain`,
					method: 'DELETE'
				}),
				invalidatesTags: ['AdminDomains', 'TenantDomain']
			}),
			adminVerifyDomain: builder.mutation<DomainVerificationResultDto, { tenantId: string; expectedTarget?: string }>({
				query: ({ tenantId, expectedTarget }) => ({
					url: `/api/admin/tenants/${tenantId}/domain/verify`,
					method: 'POST',
					params: expectedTarget ? { expectedTarget } : undefined
				}),
				invalidatesTags: ['AdminDomains']
			})
		})
	});

export const {
	useGetTenantDomainQuery,
	useUpdateSubdomainMutation,
	useSetCustomDomainMutation,
	useRemoveCustomDomainMutation,
	useVerifyCustomDomainMutation,
	useGetAdminDomainsQuery,
	useAdminSetDomainMutation,
	useAdminRemoveDomainMutation,
	useAdminVerifyDomainMutation
} = domainApi;
