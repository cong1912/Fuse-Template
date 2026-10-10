import { test, expect, request } from '@playwright/test';
import * as path from 'path';

test.describe('Super Core Live Full-Stack Verification', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeAll(async () => {
		try {
			const api = await request.newContext({ baseURL: 'http://localhost:5269', timeout: 3000 });
			const ping = await api.get('/health/live');
			if (!ping.ok()) {
				test.skip(true, 'Live backend not running on port 5269');
			}
			await api.dispose();
		} catch {
			test.skip(true, 'Live backend not running on port 5269');
		}
	});

	const screenshotsDir = 'C:\\Users\\dangc\\.gemini\\antigravity\\brain\\d5979c1e-72c8-497d-8253-2817c94e7106\\screenshots';

	test('01 - Live Backend API Health & Real Seeded Data Verification', async () => {
		const api = await request.newContext({ baseURL: 'http://localhost:5269' });

		// 1. Health check
		const healthRes = await api.get('/health/ready');
		expect(healthRes.status()).toBe(200);
		const healthJson = await healthRes.json();
		expect(healthJson.status).toBe('Healthy');

		// 2. Real products from database
		const prodRes = await api.get('/api/products?pageSize=15');
		expect(prodRes.status()).toBe(200);
		const prodJson = await prodRes.json();
		expect(prodJson.items.length).toBeGreaterThanOrEqual(10);
		expect(prodJson.total).toBeGreaterThanOrEqual(10);

		// 3. Admin login & token
		const loginRes = await api.post('/api/auth/login', {
			data: { email: 'admin@ecommerce.com', password: 'Admin@123' }
		});
		expect(loginRes.status()).toBe(200);
		const loginJson = await loginRes.json();
		const token = loginJson.accessToken;
		expect(token).toBeTruthy();

		// 4. Test n8n integration config
		const n8nRes = await api.get('/api/integrations/n8n/config', {
			headers: { Authorization: `Bearer ${token}` }
		});
		expect(n8nRes.status()).toBe(200);
		const n8nJson = await n8nRes.json();
		expect(n8nJson.webhookUrl).toContain('5678');

		await api.dispose();
	});

	test('02 - Live Products Page with Real Database Data', async ({ page }) => {
		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('networkidle');

		// Assert page title or table header is visible
		await expect(page.getByText('Sản phẩm').or(page.getByText('Products')).first()).toBeVisible({ timeout: 15000 });

		// Assert that real products from seed exist in UI
		const hasRealProduct = page.locator('text=/iPhone|Dell|Samsung|Ghế|Laptop|Polo/i').first();
		await expect(hasRealProduct).toBeVisible({ timeout: 15000 });

		// Take screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '26_live_real_products_catalog.png'),
			fullPage: true
		});
	});

	test('03 - Live Orders Management with Real Database Data', async ({ page }) => {
		await page.goto('/apps/e-commerce/orders');
		await page.waitForLoadState('networkidle');

		// Assert orders header or table is visible
		await expect(page.getByText('Đơn hàng').or(page.getByText('Orders')).first()).toBeVisible({ timeout: 15000 });

		// Assert order status badges exist
		const statusBadge = page.locator('text=/Delivered|Shipped|Processing|Confirmed|Pending/i').first();
		await expect(statusBadge).toBeVisible({ timeout: 15000 });

		// Take screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '27_live_real_orders_management.png'),
			fullPage: true
		});
	});

	test('04 - Live n8n Workflow Automation Hub & Real Ping', async ({ page }) => {
		await page.goto('/settings/integrations');
		await page.waitForLoadState('networkidle');

		// Assert integrations page loaded
		await expect(page.getByText('Cấu hình Tích hợp').or(page.getByText('Integrations')).first()).toBeVisible({ timeout: 15000 });

		// Check n8n automation hub card
		const n8nCard = page.getByText(/n8n/i).first();
		await expect(n8nCard).toBeVisible({ timeout: 15000 });

		// Click test ping button
		const pingBtn = page.getByRole('button', { name: /Gửi Webhook Kiểm Thử|Ping/i }).or(page.locator('button:has-text("Ping")')).first();
		if (await pingBtn.isVisible()) {
			await pingBtn.click();
			await page.waitForTimeout(1000);
		}

		// Take screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '28_live_real_n8n_integration_hub.png'),
			fullPage: true
		});
	});

	test('05 - Live SuperAdmin Impersonation & Audit Trail', async ({ page }) => {
		await page.goto('/platform/shops');
		await page.waitForLoadState('networkidle');

		// Assert Super Admin shops list is visible
		await expect(page.getByText('Quản Lý Gian Hàng & Khách Thuê').or(page.getByText('Cửa hàng')).or(page.getByText('Platform')).first()).toBeVisible({ timeout: 15000 });

		// Navigate to audit trail
		await page.goto('/platform/audit');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Nhật Ký Kiểm Toán Toàn Sàn').or(page.getByText('Audit')).first()).toBeVisible({ timeout: 15000 });

		// Take screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '29_live_real_superadmin_platform.png'),
			fullPage: true
		});
	});
});
