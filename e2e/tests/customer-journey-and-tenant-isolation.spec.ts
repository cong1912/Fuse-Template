import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Customer Persona Journey & Multi-Tenant Data Isolation Audit', () => {

	test('1. Normal Customer Registration, Auto-Login & Profile RBAC Inspection', async ({ page }) => {
		// Fresh session for guest registration
		await page.context().clearCookies();
		await page.goto('/sign-up');
		await page.waitForLoadState('networkidle');

		// Verify Sign up page
		await expect(page.getByText('Sign up', { exact: true })).toBeVisible({ timeout: 15000 });

		const timestamp = Date.now();
		const testEmail = `customer.browser.${timestamp}@ecommerce.vn`;

		// Fill in registration form
		await page.getByLabel(/Display name/i).fill('Khách Hàng Hoàng Long');
		await page.locator('input[type="email"]').fill(testEmail);
		await page.locator('input[type="password"]').first().fill('Password@123');
		await page.locator('input[type="password"]').nth(1).fill('Password@123');
		await page.getByRole('checkbox').check();

		// Submit registration
		const submitBtn = page.getByRole('button', { name: 'Register' });
		await expect(submitBtn).toBeEnabled({ timeout: 10000 });
		await submitBtn.click();

		// Customer should be auto-authenticated and redirected into app
		await page.waitForURL((url) => !url.pathname.includes('/sign-up'), { timeout: 20000 });
		await page.waitForLoadState('networkidle');

		// Navigate to customer profile
		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText(/General Info/i).or(page.getByText(/Tài khoản/i)).first()).toBeVisible({ timeout: 15000 });

		// Inspect navigation: Administrative items MUST be hidden for normal Customer (role: user)
		const platformMenu = page.getByText('Hệ thống/Platform');
		const integrationsMenu = page.getByText('Tích hợp (Integrations)');
		const staffMenu = page.getByText('Nhân viên');
		const revenueMenu = page.getByText('Doanh thu');

		await expect(platformMenu).not.toBeVisible();
		await expect(integrationsMenu).not.toBeVisible();
		await expect(staffMenu).not.toBeVisible();
		await expect(revenueMenu).not.toBeVisible();

		// Capture evidence screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'customer_01_registered_and_restricted_menu.png'),
			fullPage: true
		});
	});

	test('2. Customer Blocked from Admin URLs (Browser RBAC Enforcement)', async ({ page }) => {
		// Log in as customer
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		await page.locator('input[type="email"]').fill('customer.test1@ecommerce.vn');
		await page.locator('input[type="password"]').fill('Password@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// Attempt 1: Direct navigation to Integrations page
		await page.goto('/settings/integrations');
		await page.waitForTimeout(2000);
		// Customer should be rejected/redirected away from /settings/integrations
		expect(page.url()).not.toContain('/settings/integrations');

		// Attempt 2: Direct navigation to Platform Shops
		await page.goto('/platform/shops');
		await page.waitForTimeout(2000);
		expect(page.url()).not.toContain('/platform/shops');

		// Attempt 3: Direct navigation to Staff Management
		await page.goto('/settings/staff');
		await page.waitForTimeout(2000);
		expect(page.url()).not.toContain('/settings/staff');

		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'customer_02_admin_routes_blocked.png'),
			fullPage: true
		});
	});

	test('3. Tenant A (Shop A) Staff View: Only Sees Shop A Integrations & Webhooks', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Shop A Staff
		await page.locator('input[type="email"]').fill('staff.shopa@flagship.vn');
		await page.locator('input[type="password"]').fill('Staff@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// Navigate to Integrations Hub
		await page.goto('/settings/integrations');
		await page.waitForLoadState('networkidle');

		// Shop A's webhook must be visible
		await expect(page.getByText('https://webhook.flagship-store.vn/events').first()).toBeVisible({ timeout: 15000 });

		// Shop B's webhook MUST NOT be visible (0 data leakage!)
		await expect(page.getByText('https://webhook.fashion-boutique.vn/events')).not.toBeVisible();

		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tenant_01_shop_a_isolated_integrations.png'),
			fullPage: true
		});
	});

	test('4. Tenant B (Shop B) Staff View: Only Sees Shop B Integrations & Webhooks', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Shop B Staff
		await page.locator('input[type="email"]').fill('staff.shopb@fashion.vn');
		await page.locator('input[type="password"]').fill('Staff@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// Set active tenant header/context for Shop B
		await page.evaluate(() => {
			localStorage.setItem('active_tenant_id', '22222222-2222-2222-2222-222222222222');
		});

		// Navigate to Integrations Hub
		await page.goto('/settings/integrations');
		await page.waitForLoadState('networkidle');

		// Test in browser context: fetch webhooks with Shop B tenant ID
		const webhooksData = await page.evaluate(async () => {
			const token = localStorage.getItem('jwt_access_token');
			const res = await fetch('http://localhost:5269/api/tenant/webhooks', {
				headers: {
					Authorization: `Bearer ${token}`,
					'X-Tenant-Id': '22222222-2222-2222-2222-222222222222'
				}
			});
			return { status: res.status, data: await res.json() };
		});

		expect(webhooksData.status).toBe(200);
		expect(webhooksData.data.length).toBeGreaterThan(0);
		expect(webhooksData.data[0].targetUrl).toBe('https://webhook.fashion-boutique.vn/events');

		// Ensure Shop A webhook is nowhere in Shop B data!
		const leakedShopA = webhooksData.data.some((w: any) => w.targetUrl.includes('flagship-store.vn'));
		expect(leakedShopA).toBe(false);

		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tenant_02_shop_b_isolated_integrations.png'),
			fullPage: true
		});
	});

	test('5. Cross-Tenant Attack & Customer Elevation Attacks Blocked (403 Forbidden)', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Shop A Staff
		await page.locator('input[type="email"]').fill('staff.shopa@flagship.vn');
		await page.locator('input[type="password"]').fill('Staff@123');
		await page.getByRole('button', { name: /Sign in/i }).click();
		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// Staff A attempts to breach Shop B Webhooks
		const staffABreachResult = await page.evaluate(async () => {
			const token = localStorage.getItem('jwt_access_token');
			const res = await fetch('http://localhost:5269/api/tenant/webhooks', {
				headers: {
					Authorization: `Bearer ${token}`,
					'X-Tenant-Id': '22222222-2222-2222-2222-222222222222'
				}
			});
			return { status: res.status, text: await res.text() };
		});

		expect(staffABreachResult.status).toBe(403);
		expect(staffABreachResult.text).toContain('You are not staff of this shop');

		// Staff A attempts to breach Shop B Orders
		const staffAOrdersBreach = await page.evaluate(async () => {
			const token = localStorage.getItem('jwt_access_token');
			const res = await fetch('http://localhost:5269/api/admin/orders', {
				headers: {
					Authorization: `Bearer ${token}`,
					'X-Tenant-Id': '22222222-2222-2222-2222-222222222222'
				}
			});
			return { status: res.status, text: await res.text() };
		});

		expect(staffAOrdersBreach.status).toBe(403);
		expect(staffAOrdersBreach.text).toContain('You are not staff of this shop');

		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tenant_03_cross_tenant_breach_blocked.png'),
			fullPage: true
		});
	});

});
