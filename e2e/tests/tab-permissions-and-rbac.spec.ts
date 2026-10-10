import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Tab Permissions & Dynamic RBAC Browser Verification', () => {

	test('1. Customer Persona: Payouts Tab & Shop Fields Hidden in Profile, Analytics Blocked', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as normal customer
		await page.locator('input[type="email"]').fill('customer.test1@ecommerce.vn');
		await page.locator('input[type="password"]').fill('Password@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// 1. Visit Profile page
		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');

		// Verify Role badge shows "Khách Hàng (Customer)"
		const roleChip = page.locator('[data-testid="user-role-chip"]');
		await expect(roleChip).toBeVisible({ timeout: 10000 });
		await expect(roleChip).toContainText(/Khách Hàng/i);

		// Verify Tab "Hồ Sơ Cá Nhân" is present
		const profileTab = page.locator('[data-testid="tab-profile"]');
		await expect(profileTab).toBeVisible();
		await expect(profileTab).toContainText(/Hồ Sơ Cá Nhân/i);

		// Verify Tab "Thẻ Ngân Hàng & Rút Tiền" (Payouts) MUST BE HIDDEN for customer
		const payoutsTab = page.locator('[data-testid="tab-payouts"]');
		await expect(payoutsTab).not.toBeVisible();

		// Verify Shop Name input MUST BE HIDDEN for customer
		const shopNameInput = page.locator('[data-testid="input-shopname"]');
		await expect(shopNameInput).not.toBeVisible();

		// Verify Tab "Bảo Mật & Mật Khẩu" is visible
		const securityTab = page.locator('[data-testid="tab-security"]');
		await expect(securityTab).toBeVisible();

		// Capture screenshot of customer profile with payouts tab hidden
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tab_rbac_01_customer_profile.png'),
			fullPage: true
		});

		// 2. Customer attempts to access Analytics Dashboard -> MUST BE BLOCKED
		await page.goto('/dashboards/analytics');
		await page.waitForTimeout(2000);
		expect(page.url()).not.toContain('/dashboards/analytics');
	});

	test('2. Staff Persona: Payouts Tab Hidden in Profile for Regular Staff', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Regular Shop Staff (WarehouseStaff)
		await page.locator('input[type="email"]').fill('warehouse.staff@flagship.vn');
		await page.locator('input[type="password"]').fill('Staff@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// Visit Profile page
		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');

		// Verify Role badge shows "Nhân Viên (Staff)" or role
		const roleChip = page.locator('[data-testid="user-role-chip"]');
		await expect(roleChip).toBeVisible({ timeout: 10000 });

		// Verify Tab "Hồ Sơ & Gian Hàng" is present
		const profileTab = page.locator('[data-testid="tab-profile"]');
		await expect(profileTab).toBeVisible();

		// Verify Tab "Thẻ Ngân Hàng & Rút Tiền" (Payouts) is HIDDEN for non-admin staff
		const payoutsTab = page.locator('[data-testid="tab-payouts"]');
		await expect(payoutsTab).not.toBeVisible();

		// Verify Tab "Bảo Mật & Mật Khẩu" is visible
		const securityTab = page.locator('[data-testid="tab-security"]');
		await expect(securityTab).toBeVisible();

		// Capture screenshot of staff profile with payouts tab hidden
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tab_rbac_02_staff_profile.png'),
			fullPage: true
		});
	});

	test('3. Admin / SuperAdmin Persona: All Profile Tabs & Integration Tabs Fully Visible', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as SuperAdmin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// 1. Visit Profile page
		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');

		// Verify Role chip is Super Admin
		const roleChip = page.locator('[data-testid="user-role-chip"]');
		await expect(roleChip).toBeVisible({ timeout: 10000 });
		await expect(roleChip).toContainText(/Super Admin/i);

		// Verify ALL 3 tabs are VISIBLE for SuperAdmin
		const profileTab = page.locator('[data-testid="tab-profile"]');
		const payoutsTab = page.locator('[data-testid="tab-payouts"]');
		const securityTab = page.locator('[data-testid="tab-security"]');

		await expect(profileTab).toBeVisible();
		await expect(payoutsTab).toBeVisible();
		await expect(securityTab).toBeVisible();

		// Click on Payouts Tab and verify Bank Card Manager renders
		await payoutsTab.click();
		await page.waitForTimeout(500);
		await expect(page.getByText(/Thẻ Ngân Hàng/i).or(page.getByText(/Vietcombank/i)).first()).toBeVisible();

		// Capture screenshot of Admin with Payouts tab active
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tab_rbac_03_admin_profile_payouts_tab.png'),
			fullPage: true
		});

		// 2. Visit Integrations Hub
		await page.goto('/settings/integrations');
		await page.waitForLoadState('networkidle');

		// Verify ALL 4 Integration Tabs are VISIBLE for Admin
		await expect(page.locator('[data-testid="tab-webhooks"]')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('[data-testid="tab-n8n"]')).toBeVisible();
		await expect(page.locator('[data-testid="tab-omnichannel"]')).toBeVisible();
		await expect(page.locator('[data-testid="tab-payments"]')).toBeVisible();

		// Capture screenshot of Admin Integrations tabs
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'tab_rbac_04_admin_all_integration_tabs.png'),
			fullPage: true
		});
	});

});
