import { apiService as api } from 'app/store/apiService';
import { createSelector } from '@reduxjs/toolkit';
import FuseUtils from '@fuse/utils';
import { PartialDeep } from 'type-fest';
import { selectSearchText } from './store/searchTextSlice';
import ProductModel from './product/models/ProductModel';

export const addTagTypes = ['eCommerce_products', 'eCommerce_product', 'eCommerce_orders', 'eCommerce_order'] as const;

const ECommerceApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getECommerceProducts: build.query<GetECommerceProductsApiResponse, GetECommerceProductsApiArg>({
				query: () => ({ url: `/api/products?pageSize=1000` }),
				transformResponse: (response: any) => {
					return (response.items || []).map((p: any) => ({
						id: p.id,
						name: p.name,
						handle: p.name.toLowerCase().replace(/\s+/g, '-'),
						description: p.description,
						categories: p.categoryId ? [p.categoryId] : [],
						tags: [p.productType],
						featuredImageId: '',
						images: [],
						priceTaxExcl: p.price,
						priceTaxIncl: p.price,
						taxRate: 0,
						comparedPrice: p.price,
						quantity: p.stockQuantity,
						sku: p.sku,
						width: '0',
						height: '0',
						depth: '0',
						weight: p.weightInGrams ? p.weightInGrams.toString() : '0',
						extraShippingFee: 0,
						active: p.isActive
					}));
				},
				providesTags: ['eCommerce_products']
			}),
			deleteECommerceProducts: build.mutation<DeleteECommerceProductsApiResponse, DeleteECommerceProductsApiArg>({
				async queryFn(productIds, _queryApi, _extraOptions, fetchWithBQ) {
					for (const id of productIds) {
						await fetchWithBQ({
							url: `/api/products/${id}`,
							method: 'DELETE'
						});
					}
					return { data: true as any };
				},
				invalidatesTags: ['eCommerce_products']
			}),
			getECommerceProduct: build.query<GetECommerceProductApiResponse, GetECommerceProductApiArg>({
				query: (productId) => ({
					url: `/api/products/${productId}`
				}),
				transformResponse: (p: any) => ({
					id: p.id,
					name: p.name,
					handle: p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : '',
					description: p.description,
					categories: p.categoryId ? [p.categoryId] : [],
					tags: [p.productType],
					featuredImageId: '',
					images: [],
					priceTaxExcl: p.price,
					priceTaxIncl: p.price,
					taxRate: 0,
					comparedPrice: p.price,
					quantity: p.stockQuantity,
					sku: p.sku,
					width: '0',
					height: '0',
					depth: '0',
					weight: p.weightInGrams ? p.weightInGrams.toString() : '0',
					extraShippingFee: 0,
					active: p.isActive
				}),
				providesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			createECommerceProduct: build.mutation<CreateECommerceProductApiResponse, CreateECommerceProductApiArg>({
				query: (product) => ({
					url: `/api/products`,
					method: 'POST',
					data: {
						name: product.name,
						description: product.description || '',
						sku: product.sku || '',
						price: product.priceTaxIncl || 0,
						currency: 'VND',
						stockQuantity: product.quantity || 0,
						categoryId: (product.categories && product.categories.length > 0) ? product.categories[0] : '00000000-0000-0000-0000-000000000000',
						productType: product.tags && product.tags.length > 0 ? product.tags[0] : 'Physical',
						weightInGrams: product.weight ? parseFloat(product.weight) : null
					}
				}),
				invalidatesTags: ['eCommerce_products', 'eCommerce_product']
			}),
			updateECommerceProduct: build.mutation<UpdateECommerceProductApiResponse, UpdateECommerceProductApiArg>({
				query: (product) => ({
					url: `/api/products/${product.id}`,
					method: 'PUT',
					data: {
						id: product.id,
						name: product.name,
						description: product.description || '',
						price: product.priceTaxIncl || 0,
						currency: 'VND'
					}
				}),
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			deleteECommerceProduct: build.mutation<DeleteECommerceProductApiResponse, DeleteECommerceProductApiArg>({
				query: (productId) => ({
					url: `/api/products/${productId}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			getECommerceOrders: build.query<GetECommerceOrdersApiResponse, GetECommerceOrdersApiArg>({
				query: () => ({ url: `/api/admin/orders?pageSize=1000` }),
				transformResponse: (response: any) => {
					return (response.items || []).map((o: any) => {
						const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
						const statusName = statuses[o.status] || 'Unknown';
						return {
							id: o.id,
							reference: o.id.substring(0, 8).toUpperCase(),
							subtotal: o.totalAmount.toString(),
							tax: '0',
							discount: '0',
							total: o.totalAmount.toString(),
							date: o.createdAtUtc,
							customer: {
								id: o.customerId,
								firstName: 'Customer',
								lastName: o.customerId.substring(0, 4),
								avatar: '',
								company: '',
								jobTitle: '',
								email: '',
								phone: '',
								invoiceAddress: { address: '', lat: 0, lng: 0 },
								shippingAddress: { address: '', lat: 0, lng: 0 }
							},
							products: (o.items || []).map((i: any) => ({
								id: i.productId,
								name: `Product ${i.productId.substring(0, 4)}`,
								quantity: i.quantity,
								price: i.unitPrice.toString()
							})),
							status: [{
								id: o.status.toString(),
								name: statusName,
								color: statusName === 'Delivered' ? 'bg-green-500 text-white' : 
								       statusName === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
							}],
							payment: {
								transactionId: '',
								amount: o.totalAmount.toString(),
								method: 'Credit Card',
								date: o.createdAtUtc
							},
							shippingDetails: []
						};
					});
				},
				providesTags: ['eCommerce_orders']
			}),
			getECommerceOrder: build.query<GetECommerceOrderApiResponse, GetECommerceOrderApiArg>({
				query: (orderId) => ({ url: `/api/admin/orders/${orderId}` }),
				transformResponse: (o: any) => {
					const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
					const statusName = statuses[o.status] || 'Unknown';
					return {
						id: o.id,
						reference: o.id.substring(0, 8).toUpperCase(),
						subtotal: o.totalAmount.toString(),
						tax: '0',
						discount: '0',
						total: o.totalAmount.toString(),
						date: o.createdAtUtc,
						customer: {
							id: o.customerId,
							firstName: 'Customer',
							lastName: o.customerId.substring(0, 4),
							avatar: '',
							company: '',
							jobTitle: '',
							email: '',
							phone: '',
							invoiceAddress: { address: '', lat: 0, lng: 0 },
							shippingAddress: { address: '', lat: 0, lng: 0 }
						},
						products: (o.items || []).map((i: any) => ({
							id: i.productId,
							name: `Product ${i.productId.substring(0, 4)}`,
							quantity: i.quantity,
							price: i.unitPrice.toString()
						})),
						status: [{
							id: o.status.toString(),
							name: statusName,
							color: statusName === 'Delivered' ? 'bg-green-500 text-white' : 
							       statusName === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
						}],
						payment: {
							transactionId: '',
							amount: o.totalAmount.toString(),
							method: 'Credit Card',
							date: o.createdAtUtc
						},
						shippingDetails: []
					};
				},
				providesTags: ['eCommerce_order']
			}),
			updateECommerceOrder: build.mutation<UpdateECommerceOrderApiResponse, UpdateECommerceOrderApiArg>({
				query: (order) => {
					let newStatus = 0; // Pending
					if (order.status && order.status.length > 0) {
						const statusName = order.status[0].name;
						if (statusName === 'Processing') newStatus = 1;
						if (statusName === 'Shipped') newStatus = 2;
						if (statusName === 'Delivered') newStatus = 3;
						if (statusName === 'Cancelled') newStatus = 4;
					}
					return {
						url: `/api/admin/orders/${order.id}/status`,
						method: 'PUT',
						data: {
							orderId: order.id,
							newStatus: newStatus
						}
					};
				},
				invalidatesTags: ['eCommerce_order', 'eCommerce_orders']
			}),
			deleteECommerceOrder: build.mutation<DeleteECommerceOrderApiResponse, DeleteECommerceOrderApiArg>({
				query: (orderId) => ({
					url: `/api/admin/orders/${orderId}`, // NOTE: The backend may not support deleting orders, this might return 405
					method: 'DELETE'
				}),
				invalidatesTags: ['eCommerce_order', 'eCommerce_orders']
			}),
			deleteECommerceOrders: build.mutation<DeleteECommerceOrdersApiResponse, DeleteECommerceOrdersApiArg>({
				async queryFn(ordersId, _queryApi, _extraOptions, fetchWithBQ) {
					for (const id of ordersId) {
						await fetchWithBQ({
							url: `/api/admin/orders/${id}`,
							method: 'DELETE'
						});
					}
					return { data: true as any };
				},
				invalidatesTags: ['eCommerce_order', 'eCommerce_orders']
			})
		}),
		overrideExisting: false
	});

export default ECommerceApi;

export type GetECommerceProductsApiResponse = /** status 200 OK */ EcommerceProduct[];
export type GetECommerceProductsApiArg = void;

export type DeleteECommerceProductsApiResponse = unknown;
export type DeleteECommerceProductsApiArg = string[]; /** Product ids */

export type GetECommerceProductApiResponse = /** status 200 OK */ EcommerceProduct;
export type GetECommerceProductApiArg = string;

export type CreateECommerceProductApiResponse = /** status 200 OK */ EcommerceProduct;
export type CreateECommerceProductApiArg = PartialDeep<EcommerceProduct>;

export type UpdateECommerceProductApiResponse = unknown;
export type UpdateECommerceProductApiArg = EcommerceProduct; // Product

export type DeleteECommerceProductApiResponse = unknown;
export type DeleteECommerceProductApiArg = string; // Product id

export type GetECommerceOrdersApiResponse = /** status 200 OK */ EcommerceOrder[];
export type GetECommerceOrdersApiArg = void;

export type GetECommerceOrderApiResponse = /** status 200 OK */ EcommerceOrder;
export type GetECommerceOrderApiArg = string; // Order id

export type UpdateECommerceOrderApiResponse = unknown;
export type UpdateECommerceOrderApiArg = EcommerceOrder; // Order

export type DeleteECommerceOrderApiResponse = unknown;
export type DeleteECommerceOrderApiArg = string; // Order id

export type DeleteECommerceOrdersApiResponse = unknown;
export type DeleteECommerceOrdersApiArg = string[]; // Orders id

export type EcommerceProductImageType = {
	id: string;
	url: string;
	type: string;
};

export type EcommerceProduct = {
	id: string;
	name: string;
	handle: string;
	description: string;
	categories: string[];
	tags: string[];
	featuredImageId: string;
	images: EcommerceProductImageType[];
	priceTaxExcl: number;
	priceTaxIncl: number;
	taxRate: number;
	comparedPrice: number;
	quantity: number;
	sku: string;
	width: string;
	height: string;
	depth: string;
	weight: string;
	extraShippingFee: number;
	active: boolean;
};

export type EcommerceOrder = {
	id: string;
	reference: string;
	subtotal: string;
	tax: string;
	discount: string;
	total: string;
	date: string;
	customer: {
		id: string;
		firstName: string;
		lastName: string;
		avatar: string;
		company: string;
		jobTitle: string;
		email: string;
		phone: string;
		invoiceAddress: {
			address: string;
			lat: number;
			lng: number;
		};
		shippingAddress: {
			address: string;
			lat: number;
			lng: number;
		};
	};
	products: Partial<EcommerceProduct & { image: string; price: string }>[];
	status: {
		id: string;
		name: string;
		color: string;
		date?: string;
	}[];
	payment: {
		transactionId: string;
		amount: string;
		method: string;
		date: string;
	};
	shippingDetails: {
		tracking: string;
		carrier: string;
		weight: string;
		fee: string;
		date: string;
	}[];
};

export const {
	useGetECommerceProductsQuery,
	useDeleteECommerceProductsMutation,
	useGetECommerceProductQuery,
	useUpdateECommerceProductMutation,
	useDeleteECommerceProductMutation,
	useGetECommerceOrdersQuery,
	useGetECommerceOrderQuery,
	useUpdateECommerceOrderMutation,
	useDeleteECommerceOrderMutation,
	useDeleteECommerceOrdersMutation,
	useCreateECommerceProductMutation
} = ECommerceApi;

export type ECommerceApiType = {
	[ECommerceApi.reducerPath]: ReturnType<typeof ECommerceApi.reducer>;
};

/**
 * Select products
 */
/**
 * Select filtered products
 */
export const selectFilteredProducts = (products: EcommerceProduct[]) =>
	createSelector([selectSearchText], (searchText) => {
		if (searchText.length === 0) {
			return products;
		}
		return FuseUtils.filterArrayByString<EcommerceProduct>(products, searchText);
	});

/**
 * Select filtered orders
 */
export const selectFilteredOrders = (orders: EcommerceOrder[]) =>
	createSelector([selectSearchText], (searchText) => {
		if (searchText.length === 0) {
			return orders;
		}
		return FuseUtils.filterArrayByString<EcommerceOrder>(orders, searchText);
	});
