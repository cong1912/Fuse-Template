import { apiService as api } from 'app/store/apiService';
import { createSelector } from '@reduxjs/toolkit';
import FuseUtils from '@fuse/utils';
import { PartialDeep } from 'type-fest';
import { selectSearchText } from './store/searchTextSlice';
import ProductModel from './product/models/ProductModel';
import { getOrderStatusConfig, getOrderStatusId } from './order/constants';

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
					return (response.items || []).map((p: any) => {
						const priceVal = typeof p.price === 'object' && p.price !== null ? (p.price.amount ?? 0) : (p.price ?? 0);
						const images = (p.images || []).map((img: any) => ({
							id: img.id,
							url: img.url,
							type: 'image',
							isMain: img.isMain
						}));
						if (images.length === 0 && p.mainImageUrl) {
							images.push({
								id: 'main-img',
								url: p.mainImageUrl,
								type: 'image',
								isMain: true
							});
						}
						const mainImg = images.find((i: any) => i.isMain) || images[0];
						const featuredId = mainImg ? mainImg.id : (p.mainImageUrl ? 'main-img' : '');
						return {
							id: p.id,
							name: p.name,
							handle: p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : '',
							description: p.description || '',
							categories: p.categoryId ? [p.categoryId] : [],
							tags: p.productType ? [p.productType] : [],
							featuredImageId: featuredId,
							images: images,
							priceTaxExcl: priceVal,
							priceTaxIncl: priceVal,
							taxRate: 0,
							comparedPrice: priceVal,
							quantity: p.stockQuantity ?? 0,
							sku: p.sku || '',
							width: '0',
							height: '0',
							depth: '0',
							weight: p.weightInGrams ? p.weightInGrams.toString() : '0',
							extraShippingFee: 0,
							active: Boolean(p.isActive)
						};
					});
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
				transformResponse: (p: any) => {
					const priceVal = typeof p.price === 'object' && p.price !== null ? (p.price.amount ?? 0) : (p.price ?? 0);
					const images = (p.images || []).map((img: any) => ({
						id: img.id,
						url: img.url,
						type: 'image',
						isMain: img.isMain
					}));
					const mainImg = images.find((i: any) => i.isMain) || images[0];
					const featuredId = mainImg ? mainImg.id : (p.mainImageUrl || '');
					return {
						id: p.id,
						name: p.name,
						handle: p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : '',
						description: p.description,
						categories: p.categoryId ? [p.categoryId] : [],
						tags: [p.productType],
						featuredImageId: featuredId,
						images: images,
						priceTaxExcl: priceVal,
						priceTaxIncl: priceVal,
						taxRate: 0,
						comparedPrice: priceVal,
						quantity: p.stockQuantity,
						sku: p.sku,
						width: '0',
						height: '0',
						depth: '0',
						weight: p.weightInGrams ? p.weightInGrams.toString() : '0',
						extraShippingFee: 0,
						active: p.isActive,
						productType: p.productType || 'Physical',
						downloadUrl: p.downloadUrl || '',
						tenantId: p.tenantId || '',
						tenantName: p.tenantName || 'Shop Mặc định'
					};
				},
				providesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			createECommerceProduct: build.mutation<CreateECommerceProductApiResponse, CreateECommerceProductApiArg>({
				query: (product) => {
					let pType = 1;
					if (product.productType === 'Digital') pType = 2;
					else if (product.productType === 'SerialKey') pType = 3;

					const validCatId = product.categoryId && /^[0-9a-f-]{36}$/i.test(product.categoryId)
						? product.categoryId
						: (product.categories && product.categories.length > 0 && typeof product.categories[0] === 'string' && /^[0-9a-f-]{36}$/i.test(product.categories[0]))
							? product.categories[0]
							: null;

					const weightVal = product.weightInGrams 
						? Number(product.weightInGrams) 
						: (product.weight ? parseFloat(product.weight) : (pType === 1 ? 500 : null));

					return {
						url: `/api/products`,
						method: 'POST',
						data: {
							name: product.name,
							description: product.description || '',
							sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
							price: Number(product.price ?? product.priceTaxIncl ?? 0),
							currency: 'VND',
							stockQuantity: Number(product.quantity ?? product.stockQuantity ?? (pType === 2 ? 9999 : 10)),
							categoryId: validCatId,
							productType: pType,
							downloadUrl: product.downloadUrl || null,
							serialKeys: product.serialKeys || null,
							weightInGrams: pType === 1 ? (weightVal || 500) : null,
							images: (product.images || []).map((img: any) => ({
								imageUrl: img.url,
								altText: product.name,
								isMain: img.id === product.featuredImageId || Boolean(img.isMain)
							}))
						}
					};
				},
				transformResponse: (response: any) => {
					if (typeof response === 'string') {
						return { id: response };
					}
					return response;
				},
				invalidatesTags: ['eCommerce_products', 'eCommerce_product']
			}),
			updateECommerceProduct: build.mutation<UpdateECommerceProductApiResponse, UpdateECommerceProductApiArg>({
				async queryFn(product, _queryApi, _extraOptions, fetchWithBQ) {
					const validCatId = product.categoryId && /^[0-9a-f-]{36}$/i.test(product.categoryId)
						? product.categoryId
						: (product.categories && product.categories.length > 0 && typeof product.categories[0] === 'string' && /^[0-9a-f-]{36}$/i.test(product.categories[0]))
							? product.categories[0]
							: undefined;

					const updateRes = await fetchWithBQ({
						url: `/api/products/${product.id}`,
						method: 'PUT',
						data: {
							id: product.id,
							name: product.name,
							description: product.description || '',
							price: Number(product.price ?? product.priceTaxIncl ?? 0),
							currency: 'VND',
							categoryId: validCatId,
							stockQuantity: product.quantity !== undefined ? Number(product.quantity) : (product.stockQuantity !== undefined ? Number(product.stockQuantity) : undefined),
							isActive: product.active,
							weightInGrams: product.weightInGrams ? Number(product.weightInGrams) : (product.weight ? parseFloat(product.weight) : undefined),
							downloadUrl: product.downloadUrl || undefined
						}
					});

					if (updateRes.error) {
						return { error: updateRes.error };
					}

					if (product.featuredImageId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.featuredImageId)) {
						await fetchWithBQ({
							url: `/api/products/${product.id}/images/${product.featuredImageId}/main`,
							method: 'PUT'
						});
					}

					const validGuidImages = (product.images || []).filter((img: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(img.id));
					if (validGuidImages.length > 1) {
						await fetchWithBQ({
							url: `/api/products/${product.id}/images/reorder`,
							method: 'PUT',
							data: {
								orderedImageIds: validGuidImages.map((img: any) => img.id)
							}
						});
					}

					return { data: updateRes.data };
				},
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			deleteECommerceProduct: build.mutation<DeleteECommerceProductApiResponse, DeleteECommerceProductApiArg>({
				query: (productId) => ({
					url: `/api/products/${productId}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
			}),
			generateProductDescription: build.mutation<{ content: string }, { name: string; category?: string; price?: number; attributes?: string; toneStyle?: string }>({
				query: (body) => ({
					url: `/api/ai/generate/product-description`,
					method: 'POST',
					data: {
						name: body.name,
						category: body.category || 'Thời trang & Đời sống',
						price: body.price || 0,
						attributes: body.attributes || '',
						toneStyle: body.toneStyle || 'Professional'
					}
				})
			}),
			generateSeoMeta: build.mutation<{ content: string }, { name: string; category?: string }>({
				query: (body) => ({
					url: `/api/ai/generate/seo-meta`,
					method: 'POST',
					data: {
						name: body.name,
						category: body.category || 'Thời trang & Đời sống'
					}
				})
			}),
			getECommerceOrders: build.query<GetECommerceOrdersApiResponse, GetECommerceOrdersApiArg>({
				query: () => ({ url: `/api/admin/orders?pageSize=1000` }),
				transformResponse: (response: any) => {
					return (response.items || []).map((o: any) => {
						const statusCfg = getOrderStatusConfig(o.status);
						return {
							id: o.id,
							reference: o.reference || (o.id ? o.id.substring(0, 8).toUpperCase() : ''),
							subtotal: (o.totalAmount ?? 0).toString(),
							tax: '0',
							discount: '0',
							total: (o.totalAmount ?? 0).toString(),
							date: o.createdAtUtc,
							customer: o.customer ? {
								id: o.customerId || o.customer.id || '',
								firstName: o.customer.firstName || 'Customer',
								lastName: o.customer.lastName || '',
								avatar: o.customer.avatar || '',
								company: o.customer.company || '',
								jobTitle: o.customer.jobTitle || '',
								email: o.customer.email || '',
								phone: o.customer.phone || '',
								invoiceAddress: o.customer.invoiceAddress || { address: '', lat: 0, lng: 0 },
								shippingAddress: o.customer.shippingAddress || { address: '', lat: 0, lng: 0 }
							} : {
								id: o.customerId,
								firstName: 'Customer',
								lastName: (o.customerId || '').substring(0, 4),
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
								name: i.productName || i.name || `Product ${(i.productId || '').substring(0, 4)}`,
								quantity: i.quantity,
								price: (i.unitPrice ?? 0).toString(),
								image: i.productImage || '/assets/images/apps/ecommerce/product-image-placeholder.png'
							})),
							status: [{
								id: statusCfg.id.toString(),
								name: statusCfg.name,
								color: statusCfg.colorTailwind
							}],
							payment: {
								transactionId: '',
								amount: (o.totalAmount ?? 0).toString(),
								method: 'Credit Card',
								date: o.createdAtUtc
							},
							shippingDetails: [],
							tenantId: o.tenantId || '',
							tenantName: o.tenantName || 'Shop Mặc định'
						};
					});
				},
				providesTags: ['eCommerce_orders']
			}),
			getECommerceOrder: build.query<GetECommerceOrderApiResponse, GetECommerceOrderApiArg>({
				query: (orderId) => ({ url: `/api/admin/orders/${orderId}` }),
				transformResponse: (o: any) => {
					const statusCfg = getOrderStatusConfig(o.status);
					return {
						id: o.id,
						reference: o.reference || (o.id ? o.id.substring(0, 8).toUpperCase() : ''),
						subtotal: (o.totalAmount ?? 0).toString(),
						tax: '0',
						discount: '0',
						total: (o.totalAmount ?? 0).toString(),
						date: o.createdAtUtc,
						customer: o.customer ? {
							id: o.customerId || o.customer.id || '',
							firstName: o.customer.firstName || 'Customer',
							lastName: o.customer.lastName || '',
							avatar: o.customer.avatar || '',
							company: o.customer.company || '',
							jobTitle: o.customer.jobTitle || '',
							email: o.customer.email || '',
							phone: o.customer.phone || '',
							invoiceAddress: o.customer.invoiceAddress || { address: '', lat: 0, lng: 0 },
							shippingAddress: o.customer.shippingAddress || { address: '', lat: 0, lng: 0 }
						} : {
							id: o.customerId,
							firstName: 'Customer',
							lastName: (o.customerId || '').substring(0, 4),
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
							name: i.productName || i.name || `Product ${(i.productId || '').substring(0, 4)}`,
							quantity: i.quantity,
							price: (i.unitPrice ?? 0).toString(),
							image: i.productImage || '/assets/images/apps/ecommerce/product-image-placeholder.png'
						})),
						status: [{
							id: statusCfg.id.toString(),
							name: statusCfg.name,
							color: statusCfg.colorTailwind
						}],
						payment: {
							transactionId: '',
							amount: (o.totalAmount ?? 0).toString(),
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
					const statusName = order.status && order.status.length > 0 ? order.status[0].name : '';
					const newStatus = getOrderStatusId(statusName);
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
			}),
			getECommerceCategories: build.query<Array<{ id: string; name: string; description?: string }>, void>({
				query: () => ({ url: '/api/admin/categories/tree' }),
				transformResponse: (response: any[]) => {
					const flatten = (arr: any[]): any[] => {
						let res: any[] = [];
						for (const item of arr || []) {
							res.push({ id: item.id, name: item.name, description: item.description });
							if (item.children && item.children.length > 0) {
								res = res.concat(flatten(item.children));
							}
						}
						return res;
					};
					return flatten(response);
				}
			}),
			getProductSerialKeys: build.query<SerialKeyItem[], string>({
				query: (productId) => ({ url: `/api/products/${productId}/serial-keys` }),
				providesTags: ['eCommerce_product']
			}),
			addSerialKeys: build.mutation<{ count: number }, { productId: string; keys: string[] }>({
				query: ({ productId, keys }) => ({
					url: `/api/products/${productId}/serial-keys`,
					method: 'POST',
					data: { keys }
				}),
				invalidatesTags: ['eCommerce_product', 'eCommerce_products']
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

export type SerialKeyItem = {
	id: string;
	productId: string;
	keyString: string;
	isUsed: boolean;
	usedByOrderId?: string;
};

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
	categoryId?: string | null;
	tags: string[];
	featuredImageId: string;
	images: EcommerceProductImageType[];
	priceTaxExcl: number;
	priceTaxIncl: number;
	taxRate: number;
	comparedPrice: number;
	quantity: number;
	stockQuantity?: number;
	price?: number | string;
	costPerItem?: number;
	sku: string;
	width: string;
	height: string;
	depth: string;
	weight: string;
	weightInGrams?: number | string | null;
	extraShippingFee: number;
	active: boolean;
	productType?: 'Physical' | 'Digital' | 'SerialKey' | string;
	downloadUrl?: string;
	tenantId?: string;
	tenantName?: string;
	serialKeys?: string[];
};

export type EcommerceOrder = {
	id: string;
	reference: string;
	subtotal: string;
	tax: string;
	discount: string;
	total: string;
	date: string;
	tenantId?: string;
	tenantName?: string;
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
	useGetECommerceCategoriesQuery,
	useDeleteECommerceProductsMutation,
	useGetECommerceProductQuery,
	useUpdateECommerceProductMutation,
	useDeleteECommerceProductMutation,
	useGetECommerceOrdersQuery,
	useGetECommerceOrderQuery,
	useUpdateECommerceOrderMutation,
	useDeleteECommerceOrderMutation,
	useDeleteECommerceOrdersMutation,
	useCreateECommerceProductMutation,
	useGetProductSerialKeysQuery,
	useAddSerialKeysMutation,
	useGenerateProductDescriptionMutation,
	useGenerateSeoMetaMutation
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
export const selectFilteredProducts = (products?: EcommerceProduct[]) =>
	createSelector([selectSearchText], (searchText) => {
		const safeProducts = products || [];
		if (searchText.length === 0) {
			return safeProducts;
		}
		return FuseUtils.filterArrayByString<EcommerceProduct>(safeProducts, searchText);
	});

/**
 * Select filtered orders
 */
export const selectFilteredOrders = (orders?: EcommerceOrder[]) =>
	createSelector([selectSearchText], (searchText) => {
		const safeOrders = orders || [];
		if (searchText.length === 0) {
			return safeOrders;
		}
		return FuseUtils.filterArrayByString<EcommerceOrder>(safeOrders, searchText);
	});
