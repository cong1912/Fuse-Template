import { test, expect, request } from '@playwright/test';
import * as path from 'path';
import { setupApiMocks } from '../config/mockApi';

test.describe('Multi-Tenant Promotion Playbook Engine & Hub Verification', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	const screenshotsDir = 'C:\\Users\\dangc\\.gemini\\antigravity\\brain\\d5979c1e-72c8-497d-8253-2817c94e7106\\screenshots';

	test('01 - Real Backend API Playbook Engine & Evaluation', async () => {
		let api;
		try {
			api = await request.newContext({ baseURL: 'http://localhost:5269', timeout: 3000 });
			const ping = await api.get('/health/live');
			if (!ping.ok()) {
				test.skip(true, 'Live backend not running on port 5269');
				return;
			}
		} catch {
			test.skip(true, 'Live backend not running on port 5269');
			return;
		}

		// 1. Authenticate as Admin
		const loginRes = await api.post('/api/auth/login', {
			data: { email: 'admin@ecommerce.com', password: 'Admin@123' }
		});
		expect(loginRes.status()).toBe(200);
		const loginJson = await loginRes.json();
		const token = loginJson.accessToken;
		expect(token).toBeTruthy();

		const authHeaders = { Authorization: `Bearer ${token}` };

		// 2. Fetch playbooks
		const pbRes = await api.get('/api/promotions/playbooks', { headers: authHeaders });
		expect(pbRes.status()).toBe(200);
		const playbooks = await pbRes.json();
		expect(playbooks.length).toBeGreaterThanOrEqual(6);

		const codes = playbooks.map((p: any) => p.code);
		expect(codes).toContain('TIERED-CART');
		expect(codes).toContain('SHOP-FREESHIP');
		expect(codes).toContain('NEW-CUSTOMER');

		// 3. Test Evaluation Engine
		const evalRes = await api.post('/api/promotions/playbooks/evaluate', {
			headers: authHeaders,
			data: {
				cartTotal: 900000,
				itemCount: 2,
				isFirstOrder: true,
				shippingFee: 30000
			}
		});
		expect(evalRes.status()).toBe(200);
		const evalJson = await evalRes.json();
		expect(evalJson.totalDiscount).toBeGreaterThan(0);
		expect(evalJson.finalTotal).toBeLessThan(900000);
		expect(evalJson.appliedDiscounts.length).toBeGreaterThanOrEqual(2);

		// 4. Test Coupons for Shop
		const couponsRes = await api.get('/api/coupons', { headers: authHeaders });
		expect(couponsRes.status()).toBe(200);
		const coupons = await couponsRes.json();
		expect(Array.isArray(coupons)).toBe(true);

		await api.dispose();
	});

	test('02 - Promotion Playbook Hub UI & Interactive Toggle', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/apps/e-commerce/promotions');
		await page.waitForLoadState('domcontentloaded');

		// 1. Verify Header and Subtitle
		await expect(page.getByText('Trung Tâm Kịch Bản Khuyến Mãi (Promotion Playbooks)')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/Sân chơi tùy biến cho Shop/i)).toBeVisible();

		// 2. Verify Metric Cards
		await expect(page.getByText('Kịch Bản Đang Bật')).toBeVisible();
		await expect(page.getByText('GMV Doanh Số Kích Cầu')).toBeVisible();
		await expect(page.getByText('Tổng Chi Phí Trợ Giá')).toBeVisible();

		// 3. Verify Playbook Cards in Gallery
		await expect(page.getByText('Mua Nhiều Giảm Sâu (Bậc Thang Giỏ Hàng)')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Shop Trợ Giá Phí Vận Chuyển')).toBeVisible();
		await expect(page.getByText('Ưu Đãi Đơn Đầu Tiên (Khách Mới)')).toBeVisible();

		// Screenshot 1: Playbook Gallery
		await page.screenshot({
			path: path.join(screenshotsDir, '30_live_promotion_playbooks_gallery.png'),
			fullPage: true
		});

		// 4. Test Toggle Switch
		const firstSwitch = page.locator('input[type="checkbox"]').first();
		await firstSwitch.click({ force: true });
		await page.waitForTimeout(1000);

		// 5. Open Customize Dialog
		const customizeBtn = page.getByTestId('btn-customize-TIERED-CART');
		await customizeBtn.scrollIntoViewIfNeeded();
		await customizeBtn.click();
		await page.waitForTimeout(1000);

		// Verify Dialog is visible
		await expect(page.getByTestId('dialog-playbook-config')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Tham số cấu hình chi tiết (JSON Config)')).toBeVisible({ timeout: 10000 });

		// Screenshot 2: Customize Dialog
		await page.screenshot({
			path: path.join(screenshotsDir, '31_live_playbook_customize_dialog.png')
		});

		// Close Dialog
		await page.getByTestId('dialog-close-btn').click();
		await page.waitForTimeout(1000);

		// 6. Switch to Tab 2: Shop Vouchers
		await page.getByTestId('tab-vouchers').click();
		await page.waitForTimeout(1500);

		// Verify table or empty state
		await expect(page.getByText(/Mã Voucher/i).or(page.getByText(/Shop chưa tạo mã/i))).toBeVisible();

		// Screenshot 3: Shop Vouchers Management
		await page.screenshot({
			path: path.join(screenshotsDir, '32_live_shop_vouchers_management.png'),
			fullPage: true
		});
	});
});
