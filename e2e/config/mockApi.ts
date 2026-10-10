import { Page } from '@playwright/test';
import crypto from 'crypto';

export async function setupApiMocks(page: Page) {
	// 1. Auth Login
	await page.route('**/api/auth/login', async (route) => {
		const json = {
			accessToken:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGVjb21tZXJjZS5jb20iLCJyb2xlIjpbImFkbWluIiwiU3VwZXJBZG1pbiJdLCJuYW1lIjoiU3VwZXIgQWRtaW4iLCJleHAiOjI1MjQ2MDgwMDB9.signature',
			email: 'admin@ecommerce.com',
			userId: '00000000-0000-0000-0000-000000000001',
			roles: ['admin', 'SuperAdmin']
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 2. Auth Current User with Shortcuts Support
	let mockUserShortcuts = ['orders', 'products', 'revenue', 'domain-settings'];
	await page.route('**/api/auth/me', async (route) => {
		if (route.request().method() === 'PUT') {
			try {
				const body = route.request().postDataJSON();
				if (body?.data?.shortcuts) {
					mockUserShortcuts = body.data.shortcuts;
				} else if (body?.shortcuts) {
					mockUserShortcuts = body.shortcuts;
				}
			} catch {
				// ignore
			}
			const json = {
				uid: '00000000-0000-0000-0000-000000000001',
				email: 'admin@ecommerce.com',
				displayName: 'Super Admin',
				role: ['superadmin', 'admin'],
				data: {
					displayName: 'Super Admin',
					photoURL: '/assets/images/avatars/brian-hughes.jpg',
					email: 'admin@ecommerce.com',
					shortcuts: mockUserShortcuts
				}
			};
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
		}

		const json = {
			uid: '00000000-0000-0000-0000-000000000001',
			email: 'admin@ecommerce.com',
			displayName: 'Super Admin',
			role: ['superadmin', 'admin'],
			data: {
				displayName: 'Super Admin',
				photoURL: '/assets/images/avatars/brian-hughes.jpg',
				email: 'admin@ecommerce.com',
				shortcuts: mockUserShortcuts
			}
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 2. Staff Me Profile
	await page.route('**/api/shop/staff/me', async (route) => {
		const json = {
			id: '00000000-0000-0000-0000-000000000001',
			email: 'admin@ecommerce.com',
			fullName: 'Super Admin',
			role: 'SuperAdmin'
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 3. Analytics Dashboard Summary
	await page.route('**/api/admin/analytics/dashboard-summary*', async (route) => {
		const json = {
			totalOrders: 1420,
			grossRevenue: 485000000,
			averageOrderValue: 341500,
			totalCustomers: 890,
			newCustomersThisPeriod: 120,
			totalProducts: 45,
			lowStockCount: 4,
			outOfStockCount: 1,
			dailyStats: [
				{ date: new Date(Date.now() - 3 * 86400000).toISOString(), revenue: 12500000, orders: 38 },
				{ date: new Date(Date.now() - 2 * 86400000).toISOString(), revenue: 15800000, orders: 46 },
				{ date: new Date(Date.now() - 1 * 86400000).toISOString(), revenue: 18200000, orders: 52 },
				{ date: new Date().toISOString(), revenue: 14900000, orders: 41 }
			]
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 4. Products List & CRUD
	let products = [
		{
			id: '11111111-1111-1111-1111-111111111111',
			name: 'MacBook Pro 16 M3 Max',
			sku: 'MBP-16-M3',
			description: 'Supercharged for pros with M3 Max chip.',
			price: { amount: 89990000, currency: 'VND' },
			stockQuantity: 12,
			isActive: true,
			categoryId: 'cat-002',
			productType: 'Physical',
			images: [{ id: 'img-1', url: '/assets/images/apps/ecommerce/product-image-placeholder.png', isMain: true }],
			variants: []
		},
		{
			id: '22222222-2222-2222-2222-222222222222',
			name: 'iPhone 16 Pro Max 256GB',
			sku: 'IPH-16PM-256',
			description: 'Titanium design with 48MP camera.',
			price: { amount: 34990000, currency: 'VND' },
			stockQuantity: 4,
			isActive: true,
			categoryId: 'cat-001',
			productType: 'Physical',
			images: [{ id: 'img-2', url: '/assets/images/apps/ecommerce/product-image-placeholder.png', isMain: true }],
			variants: []
		},
		{
			id: '33333333-3333-3333-3333-333333333333',
			name: 'Sony WH-1000XM5 Wireless Headphones',
			sku: 'SNY-WH-1000XM5',
			description: 'Industry leading noise canceling headphones.',
			price: { amount: 8490000, currency: 'VND' },
			stockQuantity: 28,
			isActive: true,
			categoryId: 'cat-003',
			productType: 'Physical',
			images: [{ id: 'img-3', url: '/assets/images/apps/ecommerce/product-image-placeholder.png', isMain: true }],
			variants: []
		}
	];

	await page.route(/\/api\/products(\/.*|\?.*)?$/, async (route) => {
		const method = route.request().method();
		const url = route.request().url();
		const matchId = url.match(/\/api\/products\/([0-9a-fA-F-]+)(?:$|\?|\/)/);

		if (method === 'POST') {
			if (url.includes('/images')) {
				const body = route.request().postDataJSON() || {};
				const imgId = crypto.randomUUID();
				const prodId = matchId ? matchId[1] : '';
				const prod = products.find((p) => p.id === prodId);
				const imgObj = {
					id: imgId,
					url: body.imageUrl || '/uploads/products/c775a1bf-7048-41e2-bd80-e2118ff739c4.png',
					altText: body.altText || 'Product image',
					sortOrder: prod ? prod.images.length : 0,
					isMain: Boolean(body.isMain) || (prod ? prod.images.length === 0 : true)
				};
				if (prod) {
					if (imgObj.isMain) {
						prod.images.forEach((i: any) => { i.isMain = false; });
					}
					prod.images.push(imgObj);
				}
				return route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(imgObj)
				});
			}
			const postData = route.request().postDataJSON() || {};
			const newProduct = {
				id: '44444444-4444-4444-4444-444444444444',
				name: postData.name || 'New Enterprise Product',
				sku: postData.sku || 'SKU-NEW-001',
				description: postData.description || '',
				price: { amount: postData.price || 12000000, currency: 'VND' },
				stockQuantity: postData.stockQuantity || 50,
				isActive: true,
				categoryId: postData.categoryId || 'cat-001',
				productType: postData.productType || 'Physical',
				images: postData.images && postData.images.length > 0
					? postData.images.map((im: any, idx: number) => ({ id: `img-${idx + 10}`, url: im.imageUrl, isMain: im.isMain }))
					: [{ id: 'img-new-1', url: '/assets/images/apps/ecommerce/product-image-placeholder.png', isMain: true }],
				variants: []
			};
			products.push(newProduct);
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(newProduct) });
		}

		if (method === 'PUT') {
			if (url.includes('/main')) {
				if (matchId) {
					const prod = products.find((p) => p.id === matchId[1]);
					const mainMatch = url.match(/\/images\/([^/?]+)\/main/);
					const mainId = mainMatch ? mainMatch[1] : '';
					if (prod) {
						prod.images.forEach((img: any) => { img.isMain = (img.id === mainId); });
					}
				}
				return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
			}
			if (url.includes('/reorder')) {
				return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
			}
			if (matchId) {
				const id = matchId[1];
				const putData = route.request().postDataJSON() || {};
				const idx = products.findIndex((p) => p.id === id);
				if (idx !== -1) {
					if (putData.name) products[idx].name = putData.name;
					if (putData.price) products[idx].price = { amount: putData.price, currency: 'VND' };
					if (putData.stockQuantity !== undefined) products[idx].stockQuantity = putData.stockQuantity;
				}
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		if (method === 'DELETE') {
			if (url.includes('/images/')) {
				const imgMatch = url.match(/\/images\/([^/?]+)/);
				const imgId = imgMatch ? imgMatch[1] : '';
				if (matchId) {
					const prod = products.find((p) => p.id === matchId[1]);
					if (prod) {
						prod.images = prod.images.filter((img: any) => img.id !== imgId);
					}
				}
				return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
			}
			if (matchId) {
				const id = matchId[1];
				products = products.filter((p) => p.id !== id);
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		if (matchId) {
			const id = matchId[1];
			const found = products.find((p) => p.id === id) || products[0];
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(found) });
		}

		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				items: products,
				pageIndex: 1,
				totalPages: 1,
				totalCount: products.length
			})
		});
	});

	await page.route('**/api/files/upload*', async (route) => {
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				url: '/uploads/products/c775a1bf-7048-41e2-bd80-e2118ff739c4.png',
				originalFileName: 'test_product.png',
				sizeBytes: 70
			})
		});
	});

	// 5. Orders List & Detail
	let orders = [
		{
			id: 'ord-8888-0001',
			customerId: 'cust-001',
			totalAmount: 43480000,
			status: 1, // Processing
			createdAtUtc: new Date().toISOString(),
			customer: {
				firstName: 'Nguyễn',
				lastName: 'Thanh Sơn',
				avatar: '',
				company: 'Sơn Trà Logistics',
				email: 'sontra@logistics.vn',
				phone: '+84 912 345 678',
				invoiceAddress: { address: '123 Võ Văn Kiệt, Sơn Trà, Đà Nẵng', lat: 16.0544, lng: 108.2022 },
				shippingAddress: { address: '123 Võ Văn Kiệt, Sơn Trà, Đà Nẵng', lat: 16.0544, lng: 108.2022 }
			},
			items: [
				{ productId: '22222222-2222-2222-2222-222222222222', quantity: 1, unitPrice: 34990000 },
				{ productId: '33333333-3333-3333-3333-333333333333', quantity: 1, unitPrice: 8490000 }
			]
		},
		{
			id: 'ord-8888-0002',
			customerId: 'cust-002',
			totalAmount: 89990000,
			status: 3, // Delivered
			createdAtUtc: new Date(Date.now() - 86400000).toISOString(),
			customer: {
				firstName: 'Trần',
				lastName: 'Hương Giang',
				avatar: '',
				company: 'FPT Retail Corp',
				email: 'giangth@fpt.com.vn',
				phone: '+84 987 654 321',
				invoiceAddress: { address: '10 Phạm Văn Bạch, Cầu Giấy, Hà Nội', lat: 21.0285, lng: 105.8542 },
				shippingAddress: { address: '10 Phạm Văn Bạch, Cầu Giấy, Hà Nội', lat: 21.0285, lng: 105.8542 }
			},
			items: [
				{ productId: '11111111-1111-1111-1111-111111111111', quantity: 1, unitPrice: 89990000 }
			]
		}
	];

	await page.route(/\/api\/admin\/orders(\/.*|\?.*)?$/, async (route) => {
		const method = route.request().method();
		const url = route.request().url();
		const matchId = url.match(/\/api\/admin\/orders\/([a-zA-Z0-9-]+)(?:$|\?)/);

		if (method === 'PUT') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		if (matchId) {
			const id = matchId[1];
			const order = orders.find((o) => o.id === id) || orders[0];
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(order) });
		}

		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				items: orders,
				pageIndex: 1,
				totalPages: 1,
				totalCount: orders.length
			})
		});
	});


	// 6. Super Admin Tenants List
	await page.route('**/api/admin/tenants', async (route) => {
		const json = [
			{
				id: 't-001',
				name: 'Flagship Electronics Store',
				subdomain: 'flagship',
				plan: 'Enterprise',
				planTier: 3,
				isActive: true,
				createdAtUtc: '2026-01-15T00:00:00Z',
				customMaxProducts: 10000,
				customMaxStaff: 50,
				customMaxCoupons: 500,
				activeFeatureOverridesCount: 2
			},
			{
				id: 't-002',
				name: 'Fashion Boutique Online',
				subdomain: 'fashion',
				plan: 'Pro',
				planTier: 2,
				isActive: true,
				createdAtUtc: '2026-03-20T00:00:00Z',
				activeFeatureOverridesCount: 0
			}
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 6.1 Platform Audit Logs
	await page.route('**/api/admin/tenants/audit-logs', async (route) => {
		const json = [
			{
				id: 'audit-001',
				userId: 'admin@ecommerce.com',
				action: 'TENANT_IMPERSONATE_START',
				entityType: 'Tenant',
				entityId: 't-001',
				actorType: 'SuperAdminImpersonator',
				onBehalfOfTenantId: 't-001',
				ipAddress: '127.0.0.1',
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
				oldValues: null,
				newValues: '{"tenantId":"t-001","role":"Owner","impersonatedBy":"Super Admin"}',
				createdAtUtc: new Date().toISOString()
			},
			{
				id: 'audit-002',
				userId: 'admin@ecommerce.com',
				action: 'FEATURE_OVERRIDE_SET',
				entityType: 'TenantFeatureOverride',
				entityId: '13',
				actorType: 'SuperAdmin',
				onBehalfOfTenantId: 't-001',
				ipAddress: '127.0.0.1',
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
				oldValues: '{"isEnabled":false}',
				newValues: '{"isEnabled":true,"reason":"Flash sale prep"}',
				createdAtUtc: new Date(Date.now() - 3600000).toISOString()
			}
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 6.2 Platform Financials & Analytics
	await page.route('**/api/admin/tenants/platform-financials', async (route) => {
		const json = {
			totalShops: 12,
			activeShops: 11,
			suspendedShops: 1,
			totalGmvVnd: 28450000000,
			platformTakeRateVnd: 426750000,
			mrrVnd: 45000000,
			arrVnd: 540000000,
			plans: {
				free: 4,
				basic: 3,
				pro: 3,
				enterprise: 2
			}
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 6.3 Tenant Impersonation
	await page.route('**/api/admin/tenants/*/impersonate', async (route) => {
		const url = route.request().url();
		const tenantIdMatch = url.match(/\/api\/admin\/tenants\/([^/]+)\/impersonate/);
		const tenantId = tenantIdMatch ? tenantIdMatch[1] : 't-001';
		const json = {
			accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJ0LTAwMSIsImlzX2ltcGVyc29uYXRlZCI6InRydWUiLCJyb2xlcyI6WyJPd25lciIsImFkbWluIl0sImV4cCI6MjUyNDYwODAwMH0.signature',
			expiresAt: new Date(Date.now() + 1800000).toISOString(),
			tenantId: tenantId,
			tenantName: tenantId === 't-002' ? 'Fashion Boutique Online' : 'Flagship Electronics Store',
			subdomain: tenantId === 't-002' ? 'fashion' : 'flagship',
			targetRole: 'Owner'
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 6.4 Tenant Data Export
	await page.route('**/api/admin/tenants/*/export', async (route) => {
		const url = route.request().url();
		const tenantIdMatch = url.match(/\/api\/admin\/tenants\/([^/]+)\/export/);
		const tenantId = tenantIdMatch ? tenantIdMatch[1] : 't-001';
		const json = {
			fileName: `tenant_${tenantId}_snapshot.json`,
			jsonData: JSON.stringify({
				tenantId: tenantId,
				exportedAtUtc: new Date().toISOString(),
				profile: { name: 'Flagship Electronics Store', subdomain: 'flagship', plan: 'Enterprise' },
				quotas: { maxProducts: 10000, maxStaff: 50 },
				productsCount: 45,
				ordersCount: 1420
			}, null, 2),
			exportedAtUtc: new Date().toISOString()
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 7. Tenant Details & Feature Overrides
	await page.route(/\/api\/admin\/tenants\/(?!audit-logs|platform-financials)[^/]+$/, async (route) => {
		const method = route.request().method();
		if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		const json = {
			id: 't-001',
			name: 'Flagship Electronics Store',
			subdomain: 'flagship',
			plan: 'Enterprise',
			planTier: 3,
			isActive: true,
			createdAtUtc: '2026-01-15T00:00:00Z',
			effectiveMaxProducts: 10000,
			effectiveMaxStaff: 50,
			effectiveMaxCoupons: 500,
			customMaxProducts: 10000,
			customMaxStaff: 50,
			customMaxCoupons: 500,
			featureOverrides: [
				{
					feature: 'VirtualWaitingRoom',
					featureId: 13,
					isEnabled: true,
					reason: 'Flash sale prep'
				}
			],
			enabledFeatures: ['VirtualWaitingRoom', 'B2BWholesale', 'JevAiDecision', 'TikTokShopSync']
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/admin/tenants/*/features*', async (route) => {
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
	});

	await page.route('**/api/admin/tenants/*/plan-quotas', async (route) => {
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
	});


	// 9. B2B Quotes
	await page.route('**/api/b2b/rfq*', async (route) => {
		if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
			const json = { orderId: 'ord-b2b-0001' };
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
		}

		const json = [
			{
				id: 'b2b-q-001',
				customerId: 'cust-b2b-001',
				quoteNumber: 'RFQ-20261008-FPT999',
				companyName: 'FPT Software Corporation',
				taxId: '0101234567',
				status: 'Negotiating',
				totalAmount: 180000000,
				currency: 'VND',
				createdAtUtc: new Date().toISOString(),
				merchantNotes: 'Counter-offer 10% discount for 20 units',
				items: [
					{
						id: 'qi-1',
						productId: '11111111-1111-1111-1111-111111111111',
						productName: 'MacBook Pro 16 M3 Max',
						sku: 'MBP-16-M3',
						quantity: 2,
						originalUnitPrice: 89990000,
						quotedUnitPrice: 85000000,
						totalAmount: 170000000,
						currency: 'VND'
					}
				]
			}
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 10. SuperAdmin Endpoints
	await page.route(/\/api\/superadmin\/plans/, async (route) => {
		const json = [
			{ id: 0, code: 'Free', name: 'Gói Starter (Miễn phí)', price: 0, maxProducts: '20', maxStaff: '2', maxCoupons: '3', features: ['Cơ bản'] },
			{ id: 1, code: 'Basic', name: 'Gói Growth (Tiêu chuẩn)', price: 299000, maxProducts: '500', maxStaff: '5', maxCoupons: '20', features: ['CustomDomain', 'FlashSale'] },
			{ id: 2, code: 'Pro', name: 'Gói Scale (Chuyên nghiệp)', price: 999000, maxProducts: 'Không giới hạn', maxStaff: 'Không giới hạn', maxCoupons: 'Không giới hạn', features: ['B2BWholesale', 'VirtualWaitingRoom'], popular: true },
			{ id: 3, code: 'Enterprise', name: 'Gói Enterprise (Doanh nghiệp)', price: 2999000, maxProducts: 'Không giới hạn', maxStaff: 'Không giới hạn', maxCoupons: 'Không giới hạn', features: ['Dedicated SLAs', 'Multi-region'] }
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route(/\/api\/superadmin\/billing/, async (route) => {
		if (route.request().method() === 'POST') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}
		const json = [
			{ id: 'b1111111-0000-0000-0000-000000000001', shopId: 't-001', shopName: 'Flagship Electronics Store', plan: 'Enterprise', amount: 2999000, currency: 'VND', billingDateUtc: new Date().toISOString(), dueDateUtc: new Date(Date.now() + 864000000).toISOString(), status: 'Paid', paymentMethod: 'VietQR NAPAS 24/7' },
			{ id: 'b1111111-0000-0000-0000-000000000002', shopId: 't-002', shopName: 'Fashion Boutique Online', plan: 'Pro', amount: 999000, currency: 'VND', billingDateUtc: new Date().toISOString(), dueDateUtc: new Date(Date.now() + 864000000).toISOString(), status: 'Pending', paymentMethod: 'VietQR NAPAS 24/7' }
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route(/\/api\/superadmin\/users/, async (route) => {
		if (route.request().method() === 'PUT') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}
		const json = [
			{ id: 'u-001', email: 'admin@ecommerce.com', fullName: 'Platform Super Administrator', role: 'SuperAdmin', tenantName: 'Platform Global', status: 'Active', createdAtUtc: new Date().toISOString() },
			{ id: 'u-002', email: 'owner@flagship.vn', fullName: 'Flagship Store Owner', role: 'TenantOwner', tenantName: 'Flagship Electronics Store', status: 'Active', createdAtUtc: new Date().toISOString() }
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route(/\/api\/superadmin\/risk/, async (route) => {
		const json = [
			{ id: 'r-001', shopId: 't-001', shopName: 'Flagship Electronics Store', riskScore: 88, riskLevel: 'High', trigger: 'Abnormal Order Burst (35 orders/min from single IP subnet)', detectedAtUtc: new Date().toISOString(), status: 'Open' },
			{ id: 'r-002', shopId: 't-002', shopName: 'Fashion Boutique Online', riskScore: 62, riskLevel: 'Medium', trigger: 'High Refund Velocity (> 15% of daily transactions)', detectedAtUtc: new Date().toISOString(), status: 'UnderReview' }
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route(/\/api\/superadmin\/invites/, async (route) => {
		if (route.request().method() === 'POST') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}
		const json = [
			{ id: 'inv-001', email: 'deputy-admin@ecommerce.com', role: 'SuperAdmin', tenantName: 'Platform Core', sentAtUtc: new Date().toISOString(), expiresAtUtc: new Date(Date.now() + 500000000).toISOString(), status: 'Pending' }
		];
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route(/\/api\/superadmin\/system/, async (route) => {
		const json = {
			version: '1.0.0-enterprise (Build 2026.10)',
			environment: 'Production (Docker Multi-Tenant)',
			runtime: '.NET 10.0.0 CLR',
			uptime: '14d 6h 22m',
			serverTimeUtc: new Date().toISOString(),
			memoryUsageMb: 148.5,
			services: [
				{ name: 'Microsoft SQL Server 2022', status: 'Healthy', latencyMs: 2 },
				{ name: 'Redis 7 Cache & Session Bus', status: 'Healthy', latencyMs: 1 },
				{ name: 'RabbitMQ 4 Event Broker', status: 'Healthy', latencyMs: 3 },
				{ name: 'Elasticsearch 8.15 Catalog Search', status: 'Healthy', latencyMs: 4 },
				{ name: 'Imgproxy Image Processing Engine', status: 'Healthy', latencyMs: 2 }
			],
			backgroundWorkers: [
				{ name: 'OrderExpirationWorker', status: 'Running', interval: '60s' },
				{ name: 'StockReconciliationWorker', status: 'Running', interval: '180s' },
				{ name: 'PaymentReconciliationWorker', status: 'Running', interval: '180s' }
			]
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/superadmin/shops/*/overview', async (route) => {
		const json = {
			shopId: '00000000-0000-0000-0000-000000000001',
			name: 'Flagship Electronics Store',
			subdomain: 'flagship',
			customDomain: 'store.flagship.vn',
			plan: 'Enterprise',
			status: 'Active',
			createdAtUtc: new Date().toISOString(),
			effectiveMaxProducts: 10000,
			effectiveMaxStaff: 50,
			effectiveMaxCoupons: 100,
			monthlyPriceVnd: 2999000,
			features: ['VirtualWaitingRoom', 'B2BWholesale', 'TikTokShopSync', 'PosBarcodeCheckout']
		};
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/superadmin/shops/*/status', async (route) => {
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
	});

	// 11. Product Classes
	await page.route(/\/api\/admin\/product-classes/, async (route) => {
		const json = [
			{ id: 'pc-1', name: 'Laptop & Máy Tính Xách Tay', hasVariants: true },
			{ id: 'pc-2', name: 'Điện Thoại Di Động', hasVariants: true },
			{ id: 'pc-3', name: 'Phụ Kiện Điện Tử', hasVariants: false }
		];
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	// 12. Tenant Integrations (Payment & Shipping)
	let integrations = [
		{
			id: 'int-1',
			provider: 'vnpay',
			type: 'payment',
			isActive: true,
			credentials: { TmnCode: 'TESTTMN', HashSecret: 'TESTSECRETKEY8888888888' }
		},
		{
			id: 'int-2',
			provider: 'ghn',
			type: 'shipping',
			isActive: true,
			credentials: { Token: 'ghn-test-token-123456', ShopId: '123456' }
		}
	];
	await page.route(/\/api\/tenant\/integrations(\/.*|\?.*)?$/, async (route) => {
		const method = route.request().method();
		if (method === 'PUT') {
			const url = route.request().url();
			const provider = url.split('/').pop() || 'vnpay';
			const body = route.request().postDataJSON() || {};
			const idx = integrations.findIndex((i) => i.provider === provider);
			if (idx !== -1) {
				integrations[idx] = { ...integrations[idx], ...body.data };
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(integrations[idx]) });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(integrations) });
	});

	// 13. Notifications
	let notifications = [
		{
			id: 'notif-1',
			icon: 'heroicons-outline:shopping-cart',
			title: 'New Order Received',
			description: 'Order #ORD-8888-0001 placed for 43,480,000 VND',
			time: new Date(Date.now() - 300000).toISOString(),
			read: false,
			useRouter: true
		},
		{
			id: 'notif-2',
			icon: 'heroicons-outline:shield-check',
			title: 'Security Audit Completed',
			description: 'Platform health and SOC2 compliance checks passed.',
			time: new Date(Date.now() - 3600000).toISOString(),
			read: true,
			useRouter: true
		}
	];
	await page.route(/\/api\/shop\/notifications(\/.*|\?.*)?$/, async (route) => {
		const method = route.request().method();
		const url = route.request().url();
		if (url.includes('/read-all')) {
			notifications.forEach((n) => (n.read = true));
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}
		if (url.includes('/read')) {
			const match = url.match(/\/notifications\/([a-zA-Z0-9-]+)\/read/);
			if (match) {
				const id = match[1];
				notifications = notifications.filter((n) => n.id !== id);
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(notifications) });
	});

	// 14. Super Admin Plans (CRUD)
	let platformPlans = [
		{
			id: 0,
			code: 'FREE',
			name: 'Gói Starter (Miễn phí)',
			price: 0,
			maxProducts: '20',
			maxStaff: '2',
			maxCoupons: '3',
			features: ['None'],
			popular: false
		},
		{
			id: 1,
			code: 'BASIC',
			name: 'Gói Growth (Tiêu chuẩn)',
			price: 299000,
			maxProducts: '500',
			maxStaff: '5',
			maxCoupons: '20',
			features: ['CustomDomain', 'FlashSale', 'TikTokShopSync', 'PosBarcodeCheckout'],
			popular: false
		},
		{
			id: 2,
			code: 'PRO',
			name: 'Gói Scale (Chuyên nghiệp)',
			price: 999000,
			maxProducts: 'Không giới hạn',
			maxStaff: 'Không giới hạn',
			maxCoupons: 'Không giới hạn',
			features: ['CustomDomain', 'AdvancedAnalytics', 'AiChat', 'MultiWarehouse', 'VirtualWaitingRoom'],
			popular: true
		},
		{
			id: 3,
			code: 'ENTERPRISE',
			name: 'Gói Enterprise (Doanh nghiệp)',
			price: 2999000,
			maxProducts: 'Không giới hạn',
			maxStaff: 'Không giới hạn',
			maxCoupons: 'Không giới hạn',
			features: ['CustomDomain', 'AdvancedAnalytics', 'AiChat', 'MultiWarehouse', 'B2BWholesale', 'EInvoiceMisa'],
			popular: false
		}
	];

	await page.route(/\/api\/superadmin\/plans(\/.*|\?.*)?$/, async (route) => {
		const method = route.request().method();
		const url = route.request().url();
		const matchId = url.match(/\/api\/superadmin\/plans\/(\d+)(?:$|\?|\/)/);

		if (method === 'POST') {
			const body = route.request().postDataJSON() || {};
			const newId = platformPlans.length > 0 ? Math.max(...platformPlans.map((p) => p.id)) + 1 : 1;
			if (body.popular) {
				platformPlans.forEach((p) => (p.popular = false));
			}
			const newPlan = {
				id: newId,
				code: body.code || `PLAN_${newId}`,
				name: body.name || `Custom Plan ${newId}`,
				price: Number(body.price) || 0,
				maxProducts: body.maxProducts || 'Không giới hạn',
				maxStaff: body.maxStaff || 'Không giới hạn',
				maxCoupons: body.maxCoupons || 'Không giới hạn',
				features: body.features || [],
				popular: Boolean(body.popular)
			};
			platformPlans.push(newPlan);
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(newPlan) });
		}

		if (method === 'PUT') {
			if (matchId) {
				const id = parseInt(matchId[1], 10);
				const body = route.request().postDataJSON() || {};
				const idx = platformPlans.findIndex((p) => p.id === id);
				if (idx !== -1) {
					if (body.popular) {
						platformPlans.forEach((p) => (p.popular = false));
					}
					platformPlans[idx] = {
						...platformPlans[idx],
						code: body.code || platformPlans[idx].code,
						name: body.name || platformPlans[idx].name,
						price: body.price !== undefined ? Number(body.price) : platformPlans[idx].price,
						maxProducts: body.maxProducts || platformPlans[idx].maxProducts,
						maxStaff: body.maxStaff || platformPlans[idx].maxStaff,
						maxCoupons: body.maxCoupons || platformPlans[idx].maxCoupons,
						features: body.features || platformPlans[idx].features,
						popular: body.popular !== undefined ? Boolean(body.popular) : platformPlans[idx].popular
					};
					return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(platformPlans[idx]) });
				}
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		if (method === 'DELETE') {
			if (matchId) {
				const id = parseInt(matchId[1], 10);
				platformPlans = platformPlans.filter((p) => p.id !== id);
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(platformPlans)
		});
	});

	// 27. n8n Workflow Integration
	let n8nConfig = {
		webhookUrl: 'http://localhost:5678/webhook/ecommerce-events',
		secretKey: 'n8n_sec_enterprise_2026',
		isEnabled: true,
		subscribedEvents: ['orders.created', 'orders.status_changed', 'inventory.low_stock', 'risk.alert_detected']
	};

	await page.route('**/api/integrations/n8n/config', async (route) => {
		if (route.request().method() === 'PUT') {
			try {
				const body = JSON.parse(route.request().postData() || '{}');
				n8nConfig = { ...n8nConfig, ...body };
			} catch (_) {}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, message: 'Cập nhật cấu hình n8n Workflow Automation thành công!' })
			});
		}
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(n8nConfig)
		});
	});

	await page.route('**/api/integrations/n8n/test-ping', async (route) => {
		const json = {
			success: true,
			statusCode: 200,
			responseTimeMs: 15,
			signature: 'sha256=17df20ab...',
			payloadSent: JSON.stringify({ event: 'test.ping', message: 'Enterprise E-Commerce to n8n Webhook Ping Test' }),
			message: 'Webhook kết nối n8n thành công (200 OK)!'
		};
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(json)
		});
	});

	// 28. AI Dashboard Endpoints
	await page.route('**/api/ai/rfm-segments/summary', async (route) => {
		const json = {
			champions: 18,
			loyal: 34,
			regular: 28,
			atRisk: 14,
			lost: 6,
			total: 100
		};
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(json)
		});
	});

	await page.route('**/api/ai/demand-forecast/low-stock-risk', async (route) => {
		const json = [
			{
				productId: '11111111-1111-1111-1111-111111111111',
				productName: 'MacBook Pro 16 M3 Max',
				currentStock: 4,
				estimatedDaysUntilStockout: 5,
				urgencyLevel: 'Critical'
			},
			{
				productId: '22222222-2222-2222-2222-222222222222',
				productName: 'iPhone 15 Pro Max Titanium',
				currentStock: 9,
				estimatedDaysUntilStockout: 12,
				urgencyLevel: 'High'
			}
		];
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(json)
		});
	});

	await page.route('**/api/ai/chat', async (route) => {
		const body = JSON.parse(route.request().postData() || '{}');
		const prompt = (body.message || '').toLowerCase();
		let reply = 'Dựa trên phân tích cơ sở dữ liệu thời gian thực của nền tảng: Tất cả các chỉ số vận hành đang trong trạng thái tối ưu.';
		if (prompt.includes('tồn kho') || prompt.includes('hết hàng') || prompt.includes('stock')) {
			reply = 'Hệ thống ghi nhận 2 sản phẩm có mức tồn kho dưới 7 ngày đáp ứng theo vận tốc bán hiện tại. Khuyến nghị tạo đơn đặt hàng nhập bổ sung ngay.';
		} else if (prompt.includes('flash sale')) {
			reply = 'Dự báo chuyển đổi cho thấy việc tổ chức Flash Sale trong khung giờ vàng 20:00 - 23:00 có thể thúc đẩy doanh số tăng thêm 28%.';
		} else if (prompt.includes('rfm') || prompt.includes('khách hàng')) {
			reply = 'Nhóm khách hàng At-Risk chiếm 14% tổng tập khách hàng. Để tối ưu tỷ lệ giữ chân, nên kích hoạt kịch bản n8n tự động gửi mã ưu đãi phục hồi.';
		}
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ reply })
		});
	});

	// 20. Tenant & Custom Domain Management
	const tenantDomainState = {
		tenantId: '00000000-0000-0000-0000-000000000001',
		tenantName: 'Fashion Store Vietnam',
		subdomain: 'fashion-vn',
		fullSubdomainUrl: 'https://fashion-vn.ecommerce.vn',
		customDomain: null as string | null,
		dnsVerified: false,
		sslStatus: 'NotConfigured',
		sslExpiresAt: null as string | null,
		cnameTarget: 'cname.ecommerce.vn',
		serverIp: '103.142.26.88',
		txtVerificationRecord: 'ecommerce-verify=00000000-0000-0000-0000-000000000001',
		isCustomDomainAllowedByPlan: true,
		autoHttpsRedirect: true
	};

	const adminDomainsList = [
		{
			tenantId: '00000000-0000-0000-0000-000000000001',
			tenantName: 'Fashion Store Vietnam',
			subdomain: 'fashion-vn',
			customDomain: 'www.fashionstore.vn',
			plan: 'Enterprise',
			status: 'Active',
			dnsVerified: true,
			sslStatus: 'Active',
			sslExpiresAt: '2027-01-01T00:00:00Z',
			updatedAtUtc: new Date().toISOString(),
			createdAtUtc: '2026-01-15T08:00:00Z'
		},
		{
			tenantId: '00000000-0000-0000-0000-000000000002',
			tenantName: 'Tech Gadgets HCM',
			subdomain: 'tech-gadgets',
			customDomain: null,
			plan: 'Pro',
			status: 'Active',
			dnsVerified: false,
			sslStatus: 'NotConfigured',
			sslExpiresAt: null,
			updatedAtUtc: null,
			createdAtUtc: '2026-02-10T09:30:00Z'
		},
		{
			tenantId: '00000000-0000-0000-0000-000000000003',
			tenantName: 'Organic Care Cosmetics',
			subdomain: 'organic-care',
			customDomain: 'shop.organiccare.com',
			plan: 'Basic',
			status: 'Active',
			dnsVerified: false,
			sslStatus: 'Pending',
			sslExpiresAt: null,
			updatedAtUtc: new Date().toISOString(),
			createdAtUtc: '2026-03-01T10:00:00Z'
		},
		{
			tenantId: '00000000-0000-0000-0000-000000000004',
			tenantName: 'Sneaker Zone VN',
			subdomain: 'sneaker-zone',
			customDomain: 'sneakerzone.vn',
			plan: 'Pro',
			status: 'Active',
			dnsVerified: true,
			sslStatus: 'Active',
			sslExpiresAt: '2026-12-31T23:59:59Z',
			updatedAtUtc: new Date().toISOString(),
			createdAtUtc: '2026-03-15T14:20:00Z'
		}
	];

	await page.route(/\/api\/tenant\/domain(\?.*)?$/, async (route) => {
		if (route.request().method() === 'GET') {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(tenantDomainState)
			});
		}
		return route.continue();
	});

	await page.route(/\/api\/tenant\/subdomain(\?.*)?$/, async (route) => {
		if (route.request().method() === 'PUT') {
			const body = JSON.parse(route.request().postData() || '{}');
			if (body.subdomain) {
				tenantDomainState.subdomain = body.subdomain.toLowerCase();
				tenantDomainState.fullSubdomainUrl = `https://${tenantDomainState.subdomain}.ecommerce.vn`;
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ isSuccess: true, subdomain: tenantDomainState.subdomain })
			});
		}
		return route.continue();
	});

	await page.route(/\/api\/tenant\/custom-domain\/verify(\?.*)?$/, async (route) => {
		tenantDomainState.dnsVerified = true;
		tenantDomainState.sslStatus = 'Active';
		const result = {
			isSuccess: true,
			domain: tenantDomainState.customDomain || 'www.mybrand.vn',
			cnameMatched: true,
			currentCnameTarget: 'cname.ecommerce.vn',
			expectedCnameTarget: 'cname.ecommerce.vn',
			aRecordMatched: true,
			currentIp: '103.142.26.88',
			expectedIp: '103.142.26.88',
			txtRecordMatched: true,
			sslStatus: 'Active',
			message: "Bản ghi DNS CNAME đã trỏ chính xác về cname.ecommerce.vn. Chứng chỉ SSL Let's Encrypt TLS 1.3 đã kích hoạt tự động thành công!",
			checkedAtUtc: new Date().toISOString()
		};
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(result)
		});
	});

	await page.route(/\/api\/tenant\/custom-domain(\?.*)?$/, async (route) => {
		const method = route.request().method();
		if (method === 'POST') {
			const body = JSON.parse(route.request().postData() || '{}');
			tenantDomainState.customDomain = (body.customDomain || '').toLowerCase();
			tenantDomainState.dnsVerified = false;
			tenantDomainState.sslStatus = 'Pending';
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ isSuccess: true, customDomain: tenantDomainState.customDomain })
			});
		} else if (method === 'DELETE') {
			tenantDomainState.customDomain = null;
			tenantDomainState.dnsVerified = false;
			tenantDomainState.sslStatus = 'NotConfigured';
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ isSuccess: true })
			});
		}
		return route.continue();
	});

	await page.route(/\/api\/admin\/domains(\?.*)?$/, async (route) => {
		const url = new URL(route.request().url());
		const search = (url.searchParams.get('search') || '').toLowerCase();
		const status = url.searchParams.get('status') || 'All';

		let filtered = [...adminDomainsList];
		if (search) {
			filtered = filtered.filter(
				(d) =>
					d.tenantName.toLowerCase().includes(search) ||
					d.subdomain.toLowerCase().includes(search) ||
					(d.customDomain && d.customDomain.toLowerCase().includes(search))
			);
		}
		if (status && status !== 'All') {
			if (status === 'Verified') filtered = filtered.filter((d) => d.dnsVerified);
			else if (status === 'Pending') filtered = filtered.filter((d) => d.customDomain && !d.dnsVerified);
			else if (status === 'None') filtered = filtered.filter((d) => !d.customDomain);
		}

		const json = {
			items: filtered,
			totalCount: filtered.length,
			pageNumber: 1,
			pageSize: 50,
			totalPages: 1,
			hasPreviousPage: false,
			hasNextPage: false
		};
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(json)
		});
	});

	await page.route(/\/api\/admin\/tenants\/([0-9a-fA-F-]+)\/domain\/verify(\?.*)?$/, async (route) => {
		const result = {
			isSuccess: true,
			domain: 'verified.shop.vn',
			cnameMatched: true,
			currentCnameTarget: 'cname.ecommerce.vn',
			expectedCnameTarget: 'cname.ecommerce.vn',
			aRecordMatched: true,
			currentIp: '103.142.26.88',
			expectedIp: '103.142.26.88',
			txtRecordMatched: true,
			sslStatus: 'Active',
			message: 'SuperAdmin xác thực DNS thành công: Tên miền đã trỏ đúng CNAME về cname.ecommerce.vn.',
			checkedAtUtc: new Date().toISOString()
		};
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(result)
		});
	});

	await page.route(/\/api\/admin\/tenants\/([0-9a-fA-F-]+)\/domain(\?.*)?$/, async (route) => {
		const method = route.request().method();
		const match = route.request().url().match(/\/api\/admin\/tenants\/([0-9a-fA-F-]+)\/domain/);
		const tenantId = match ? match[1] : '';

		if (method === 'PUT') {
			const body = JSON.parse(route.request().postData() || '{}');
			const target = adminDomainsList.find((d) => d.tenantId === tenantId);
			if (target) {
				target.customDomain = (body.customDomain || '').toLowerCase();
				if (body.forceVerify) {
					target.dnsVerified = true;
					target.sslStatus = 'Active';
				} else {
					target.dnsVerified = false;
					target.sslStatus = 'Pending';
				}
				target.updatedAtUtc = new Date().toISOString();
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ isSuccess: true })
			});
		} else if (method === 'DELETE') {
			const target = adminDomainsList.find((d) => d.tenantId === tenantId);
			if (target) {
				target.customDomain = null;
				target.dnsVerified = false;
				target.sslStatus = 'NotConfigured';
				target.updatedAtUtc = new Date().toISOString();
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ isSuccess: true })
			});
		}
		return route.continue();
	});

	// 21. Promotion Playbooks & Coupons
	const playbooks = [
		{
			id: 'pb-01',
			type: 0,
			code: 'TIERED-CART',
			name: 'Mua Nhiều Giảm Sâu (Bậc Thang Giỏ Hàng)',
			description: 'Mua càng nhiều giảm càng sâu: Giảm 5% cho đơn từ 500k, 10% từ 1M, 15% từ 2M.',
			badgeText: 'Tự động tính toán',
			isEnabled: true,
			configurationJson: '{}',
			budgetLimit: 50000000,
			totalDiscountSpent: 12500000,
			usageCount: 142,
			revenueGenerated: 85000000,
			startsAt: '2026-01-01T00:00:00Z',
			endsAt: null,
			isCurrentlyActive: true
		},
		{
			id: 'pb-02',
			type: 1,
			code: 'FREESHIP-XTRA',
			name: 'Shop Trợ Giá Phí Vận Chuyển',
			description: 'Tài trợ 100% phí giao hàng cho đơn hàng giá trị từ ₫300.000.',
			badgeText: 'Freeship Xtra',
			isEnabled: true,
			configurationJson: '{}',
			budgetLimit: 30000000,
			totalDiscountSpent: 8400000,
			usageCount: 280,
			revenueGenerated: 112000000,
			startsAt: '2026-01-01T00:00:00Z',
			endsAt: null,
			isCurrentlyActive: true
		},
		{
			id: 'pb-03',
			type: 3,
			code: 'NEW-USER-WELCOME',
			name: 'Ưu Đãi Đơn Đầu Tiên (Khách Mới)',
			description: 'Tặng mã giảm giá 15% cho khách hàng lần đầu mua sắm.',
			badgeText: 'Chào bạn mới',
			isEnabled: true,
			configurationJson: '{}',
			budgetLimit: 20000000,
			totalDiscountSpent: 3500000,
			usageCount: 115,
			revenueGenerated: 42000000,
			startsAt: '2026-01-01T00:00:00Z',
			endsAt: null,
			isCurrentlyActive: true
		}
	];

	const coupons = [
		{
			id: 'cp-01',
			code: 'WELCOME2026',
			description: 'Giảm 20% cho đơn hàng đầu tiên của khách hàng mới',
			type: 'Percentage',
			value: 20,
			minOrderAmount: 200000,
			maxDiscountValue: 100000,
			maxUses: 500,
			timesUsed: 128,
			validFrom: '2026-01-01T00:00:00Z',
			validTo: '2026-12-31T23:59:59Z',
			isActive: true,
			isValid: true
		},
		{
			id: 'cp-02',
			code: 'VIP50K',
			description: 'Giảm trực tiếp 50k cho khách hàng thân thiết',
			type: 'FixedAmount',
			value: 50000,
			minOrderAmount: 500000,
			maxDiscountValue: 50000,
			maxUses: 200,
			timesUsed: 45,
			validFrom: '2026-01-01T00:00:00Z',
			validTo: '2026-12-31T23:59:59Z',
			isActive: true,
			isValid: true
		}
	];

	await page.route(/\/api\/promotions\/playbooks(\/.*|\?.*)?$/, async (route) => {
		if (route.request().method() === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(playbooks) });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
	});

	await page.route(/\/api\/coupons(\/.*|\?.*)?$/, async (route) => {
		if (route.request().method() === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(coupons) });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
	});

	// Mock uploaded product images (returns valid 1x1 png pixel so browser naturalWidth > 0)
	await page.route(/\/uploads\/products\/.*/, async (route) => {
		const pngBase64 =
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
		return route.fulfill({
			status: 200,
			contentType: 'image/png',
			body: Buffer.from(pngBase64, 'base64')
		});
	});

	// Mock Flash Sales Endpoints
	let flashSales: any[] = [
		{
			id: 'fs-001',
			name: 'Flash Sale Siêu Deal Công Nghệ',
			description: 'Giảm giá cực sốc tới 50% cho laptop và điện thoại flagship',
			startsAtUtc: new Date().toISOString(),
			endsAtUtc: new Date(Date.now() + 86400000).toISOString(),
			isActive: true,
			items: [
				{
					id: 'fsi-001',
					productId: '11111111-1111-1111-1111-111111111111',
					productName: 'MacBook Pro 16 M3 Max',
					discountPrice: 69990000,
					currency: 'VND',
					stockLimit: 50,
					stockSold: 18
				}
			]
		}
	];

	await page.route(/\/api\/flashsales(\/.*|\?.*)?$/, async (route) => {
		const url = route.request().url();
		const method = route.request().method();

		if (url.includes('/waiting-room/admit')) {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ flashSaleId: 'fs-001', admittedCount: 50, admittedUserIds: [] })
			});
		}

		if (url.includes('/waiting-room/status')) {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					flashSaleId: 'fs-001',
					userId: 'user-001',
					status: 1,
					position: 0,
					totalInQueue: 120,
					admissionToken: 'tok-mock',
					estimatedWaitSeconds: 0
				})
			});
		}

		if (url.includes('/items') && method === 'POST') {
			const body = JSON.parse(route.request().postData() || '{}');
			const saleMatch = url.match(/\/api\/flashsales\/([^\/]+)\/items/);
			const targetId = saleMatch ? saleMatch[1] : 'fs-001';
			const s = flashSales.find((item) => item.id === targetId) || flashSales[0];
			if (s) {
				s.items.push({
					id: `fsi-${Date.now()}`,
					productId: body.productId,
					discountPrice: body.discountPrice,
					currency: body.currency || 'VND',
					stockLimit: body.stockLimit || 50,
					stockSold: 0
				});
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		if (method === 'POST') {
			const body = JSON.parse(route.request().postData() || '{}');
			const newId = `fs-${Date.now()}`;
			const newSale = {
				id: newId,
				name: body.name,
				description: body.description || '',
				startsAtUtc: body.startsAtUtc,
				endsAtUtc: body.endsAtUtc,
				isActive: true,
				items: []
			};
			flashSales.push(newSale);
			return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newId) });
		}

		// GET list or detail
		if (method === 'GET') {
			const match = url.match(/\/api\/flashsales\/([^\/\?]+)$/);
			if (match && match[1] && match[1] !== 'flashsales') {
				const single = flashSales.find((s) => s.id === match[1]) || flashSales[0];
				return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(single) });
			}
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(flashSales) });
		}

		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
	});

	// Mock Categories Endpoints
	let categoryTree: any[] = [
		{
			id: 'cat-001',
			name: 'Điện Tử & Công Nghệ',
			description: 'Các thiết bị số và điện tử',
			children: [
				{ id: 'cat-002', name: 'Điện thoại thông minh', description: 'Smartphones các hãng' },
				{ id: 'cat-003', name: 'Máy tính xách tay', description: 'Laptops văn phòng & gaming' }
			]
		},
		{
			id: 'cat-004',
			name: 'Thời Trang & Phụ Kiện',
			description: 'Quần áo, túi xách, giày dép',
			children: []
		}
	];

	await page.route(/\/api\/admin\/categories(\/.*|\?.*)?$/, async (route) => {
		const url = route.request().url();
		const method = route.request().method();

		if (url.includes('/tree') && method === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(categoryTree) });
		}

		if (method === 'POST') {
			const body = JSON.parse(route.request().postData() || '{}');
			const newCat = {
				id: `cat-${Date.now()}`,
				name: body.name,
				description: body.description || '',
				children: []
			};
			if (body.parentId) {
				const findParent = (list: any[]): any => {
					for (const item of list) {
						if (item.id === body.parentId) return item;
						if (item.children) {
							const found = findParent(item.children);
							if (found) return found;
						}
					}
					return null;
				};
				const parent = findParent(categoryTree);
				if (parent) {
					if (!parent.children) parent.children = [];
					parent.children.push(newCat);
				} else {
					categoryTree.push(newCat);
				}
			} else {
				categoryTree.push(newCat);
			}
			return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newCat.id) });
		}

		if (method === 'PUT') {
			const body = JSON.parse(route.request().postData() || '{}');
			const match = url.match(/\/api\/admin\/categories\/([^\/\?]+)/);
			const targetId = match ? match[1] : '';
			const updateRecursively = (list: any[]): boolean => {
				for (const item of list) {
					if (item.id === targetId) {
						if (body.name) item.name = body.name;
						if (body.description !== undefined) item.description = body.description;
						return true;
					}
					if (item.children && updateRecursively(item.children)) return true;
				}
				return false;
			};
			updateRecursively(categoryTree);
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		if (method === 'DELETE') {
			const match = url.match(/\/api\/admin\/categories\/([^\/\?]+)/);
			const targetId = match ? match[1] : '';
			const deleteRecursively = (list: any[]) => {
				const idx = list.findIndex((c) => c.id === targetId);
				if (idx !== -1) {
					list.splice(idx, 1);
					return;
				}
				for (const item of list) {
					if (item.children) deleteRecursively(item.children);
				}
			};
			deleteRecursively(categoryTree);
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(true) });
		}

		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(categoryTree) });
	});

	// 40. Tenant Webhooks & Integrations
	let tenantWebhooks = [
		{
			id: '03ecd8bf-b4df-4009-bc47-20478c57d7bc',
			tenantId: '00000000-0000-0000-0000-000000000001',
			targetUrl: 'https://erp.enterprise.vn/api/webhooks/orders',
			events: ['orders.created', 'orders.paid', 'inventory.low_stock'],
			isActive: true,
			failureCount: 0,
			createdAtUtc: new Date().toISOString(),
			lastTriggeredAtUtc: new Date(Date.now() - 3600000).toISOString()
		}
	];

	let webhookLogs = [
		{
			id: '61e870e7-6cf8-4c66-bcec-f46dd843208f',
			subscriptionId: '03ecd8bf-b4df-4009-bc47-20478c57d7bc',
			eventType: 'orders.created',
			payloadJson: JSON.stringify({
				orderId: 'ORD-2026-99182',
				customer: 'Nguyen Van A',
				totalAmount: 1850000,
				status: 'Pending',
				timestamp: new Date().toISOString()
			}),
			responseStatusCode: 200,
			responseBody: '{"status":"received","queueId":"q_88921"}',
			isSuccess: true,
			attemptNumber: 1,
			errorMessage: null,
			deliveredAtUtc: new Date(Date.now() - 3600000).toISOString()
		}
	];

	await page.route('**/api/tenant/webhooks**', async (route) => {
		const method = route.request().method();
		const url = route.request().url();

		if (url.includes('/logs')) {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(webhookLogs) });
		}

		if (url.includes('/ping') && method === 'POST') {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, message: 'Ping webhook thành công (HTTP 200 OK - Latency 42ms)' })
			});
		}

		if (url.includes('/toggle') && method === 'PATCH') {
			const id = url.split('/webhooks/')[1]?.split('/')[0];
			const wh = tenantWebhooks.find(w => w.id === id);
			if (wh) wh.isActive = !wh.isActive;
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wh ? wh.isActive : true) });
		}

		if (method === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tenantWebhooks) });
		}

		if (method === 'POST') {
			const postData = route.request().postDataJSON() || {};
			const newWebhook = {
				id: 'wh-' + Date.now(),
				tenantId: '00000000-0000-0000-0000-000000000001',
				targetUrl: postData.targetUrl || 'https://webhook.site/test',
				events: postData.events || ['orders.created'],
				isActive: true,
				failureCount: 0,
				createdAtUtc: new Date().toISOString(),
				lastTriggeredAtUtc: null
			};
			tenantWebhooks.push(newWebhook);
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(newWebhook) });
		}

		if (method === 'DELETE') {
			const id = url.split('/webhooks/')[1];
			tenantWebhooks = tenantWebhooks.filter(w => w.id !== id);
			return route.fulfill({ status: 204 });
		}

		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tenantWebhooks) });
	});

	let tenantIntegrationsList = [
		{ provider: 'vnpay', isEnabled: true, credentials: { TmnCode: 'ECOM2026', HashSecret: 'VNPAYSECRETKEY' } },
		{ provider: 'ghn', isEnabled: true, credentials: { Token: 'ghn_token_live', ShopId: '1892014' } },
		{ provider: 'tiktok', isEnabled: true },
		{ provider: 'shopee', isEnabled: true },
		{ provider: 'pos', isEnabled: true },
		{ provider: 'vietqr', isEnabled: true }
	];

	await page.route('**/api/tenant/integrations**', async (route) => {
		const method = route.request().method();
		if (method === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tenantIntegrationsList) });
		}
		if (method === 'PUT') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify('00000000-0000-0000-0000-000000000001') });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tenantIntegrationsList) });
	});

	await page.route('**/api/tenant/webhooks**', async (route) => {
		const method = route.request().method();
		if (method === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
		}
		if (method === 'POST') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'wh-001', targetUrl: 'https://example.com/webhook', events: [], isActive: true }) });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
	});

	let n8nMockConfig = {
		webhookUrl: 'http://localhost:5678/webhook/ecommerce-events',
		secretKey: 'n8n_sec_enterprise_2026',
		isEnabled: true,
		subscribedEvents: ['orders.created', 'orders.paid', 'inventory.low_stock', 'risk.alert_detected']
	};

	await page.route('**/api/integrations/n8n/**', async (route) => {
		const method = route.request().method();
		const url = route.request().url();
		if (url.includes('/test-ping') && method === 'POST') {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					statusCode: 200,
					responseTimeMs: 38,
					signature: 'sha256=9a8bc43f1e92d04a67b8e1f5...',
					payloadSent: '{"eventType":"ping","timestamp":"2026-10-10"}',
					message: 'Đã gửi webhook kiểm tra thành công tới n8n.'
				})
			});
		}
		if (method === 'GET') {
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(n8nMockConfig) });
		}
		if (method === 'PUT') {
			const data = route.request().postDataJSON() || {};
			n8nMockConfig = { ...n8nMockConfig, ...data };
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Updated' }) });
		}
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(n8nMockConfig) });
	});

	// Analytics & Reports API Mocks
	await page.route('**/api/admin/analytics/revenue**', async (route) => {
		const json = {
			totalRevenue: 184500000,
			netRevenue: 172600000,
			totalOrders: 428,
			averageOrderValue: 431000,
			refundRate: 1.8,
			dailyBreakdown: [
				{ date: '2026-10-04', revenue: 21000000, orders: 48 },
				{ date: '2026-10-05', revenue: 24500000, orders: 56 },
				{ date: '2026-10-06', revenue: 28000000, orders: 62 },
				{ date: '2026-10-07', revenue: 23000000, orders: 52 },
				{ date: '2026-10-08', revenue: 31000000, orders: 74 },
				{ date: '2026-10-09', revenue: 29000000, orders: 68 },
				{ date: '2026-10-10', revenue: 28000000, orders: 68 }
			]
		};
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/admin/analytics/top-products**', async (route) => {
		const json = [
			{ productId: 'p1', productName: 'Bàn phím cơ không dây RK84 RGB Hotswap', sku: 'KB-RK84', unitsSold: 142, totalRevenue: 142000000, profitMargin: 38, stockQuantity: 65 },
			{ productId: 'p2', productName: 'Chuột Gaming Siêu Nhẹ Pulsefire Haste', sku: 'MS-PULSE', unitsSold: 98, totalRevenue: 78400000, profitMargin: 42, stockQuantity: 28 },
			{ productId: 'p3', productName: 'Tai nghe chụp tai Không Dây Noise Cancelling', sku: 'HP-NC700', unitsSold: 76, totalRevenue: 114000000, profitMargin: 35, stockQuantity: 12 },
			{ productId: 'p4', productName: 'Ghế Công Thái Học Ergonomic Pro Herman', sku: 'CH-ERGO', unitsSold: 34, totalRevenue: 170000000, profitMargin: 45, stockQuantity: 8 },
			{ productId: 'p5', productName: 'Đèn Bàn LED Chống Cận Cảm Ứng Xiaomi', sku: 'LT-DESK', unitsSold: 115, totalRevenue: 46000000, profitMargin: 50, stockQuantity: 4 }
		];
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/admin/analytics/payments**', async (route) => {
		const json = {
			items: [
				{ gateway: 'vnpay', transactionCount: 198, totalAmount: 98000000, successRate: 98.5, feeAmount: 1470000 },
				{ gateway: 'momo', transactionCount: 112, totalAmount: 48000000, successRate: 99.1, feeAmount: 720000 },
				{ gateway: 'cod', transactionCount: 86, totalAmount: 28500000, successRate: 94.2, feeAmount: 0 },
				{ gateway: 'bank_transfer', transactionCount: 32, totalAmount: 10000000, successRate: 100, feeAmount: 0 }
			],
			totalProcessed: 184500000,
			totalFees: 2190000
		};
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/admin/analytics/order-status-summary**', async (route) => {
		const json = {
			pending: 14,
			confirmed: 28,
			processing: 45,
			shipped: 120,
			delivered: 210,
			cancelled: 8,
			refunded: 3,
			total: 428
		};
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/admin/analytics/categories**', async (route) => {
		const json = [
			{ categoryId: 'cat-1', categoryName: 'Thiết Bị Điện Tử & Công Nghệ', revenue: 98500000, percentage: 53.4 },
			{ categoryId: 'cat-2', categoryName: 'Phụ Kiện Gaming & Decor', revenue: 52000000, percentage: 28.2 },
			{ categoryId: 'cat-3', categoryName: 'Bàn Ghế Công Thái Học', revenue: 34000000, percentage: 18.4 }
		];
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
	});

	await page.route('**/api/admin/reports/export**', async (route) => {
		const csvContent = 'Date,Metric,Value\n2026-10-04,Sales,21000000\n2026-10-05,Sales,24500000';
		return route.fulfill({
			status: 200,
			contentType: 'text/csv',
			headers: { 'Content-Disposition': 'attachment; filename="report.csv"' },
			body: csvContent
		});
	});
}


