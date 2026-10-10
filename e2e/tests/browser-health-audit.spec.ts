import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';
import { ThemeCustomizerPage } from '../pom/ThemeCustomizerPage';
import * as path from 'path';

const SCREENSHOT_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Enterprise Full-App Browser Health & Quality Audit', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should traverse all core app modules with 0 console errors and capture visual verification artifacts', async ({ page }) => {
		const uncaughtErrors: string[] = [];

		page.on('pageerror', (err) => {
			uncaughtErrors.push(`[PageError] ${err.message}`);
		});

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				// Ignore benign third-party asset 404s and offline backend connection refused messages
				if (
					!text.includes('favicon') &&
					!text.includes('placeholder') &&
					!text.includes('ERR_CONNECTION_REFUSED') &&
					!text.includes('Failed to load resource')
				) {
					uncaughtErrors.push(`[ConsoleError] ${text}`);
				}
			}
		});

		await setupApiMocks(page);

		// 1. Dashboard Analytics
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText(/Recent Orders/i)).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_analytics_dashboard.png'), fullPage: false });

		// 2. E-Commerce Products
		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible();
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_products_catalog.png'), fullPage: false });

		// 3. E-Commerce Orders
		await page.goto('/apps/e-commerce/orders');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('ord-8888-0001').first()).toBeVisible();
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_orders_management.png'), fullPage: false });

		// 4. Super Admin Control Center
		await page.goto('/platform/shops');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('header, main').getByText(/Super Admin Control Center/i).first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Flagship Electronics Store')).toBeVisible();
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_super_admin_tenants.png'), fullPage: false });

		// 5. Flash Sales & Virtual Waiting Room
		await page.goto('/apps/e-commerce/flash-sales');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText(/High-Concurrency Traffic Guard/i)).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_flash_sale_waiting_room.png'), fullPage: false });

		// 6. B2B Wholesale Quoting (RFQ)
		await page.goto('/apps/e-commerce/b2b');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('header, main').getByText(/B2B Wholesale & Quoting/i).first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('FPT Software Corporation')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_b2b_wholesale_quotes.png'), fullPage: false });

		// 7. Dynamic Dark Theme Switching Live Verification
		const customizer = new ThemeCustomizerPage(page);
		await page.goto('/dashboards/analytics');
		await customizer.openThemesPanel();
		await customizer.selectTheme('Default Dark');
		await customizer.closePanel();
		await page.waitForTimeout(500);
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_theme_dark_mode.png'), fullPage: false });

		// 8. Dynamic Layout Switching Live Verification
		await customizer.openSettingsPanel();
		const layout2Radio = page.getByRole('radio', { name: /Layout 2/i });
		if (await layout2Radio.isVisible()) {
			await layout2Radio.click();
			await customizer.closePanel();
			await page.waitForTimeout(500);
			await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_layout2_dynamic_switch.png'), fullPage: false });
		}

		// 9. Platform Economics & Financials
		await page.goto('/platform/overview');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText(/Platform Economics & Financials/i)).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_platform_overview_financials.png'), fullPage: false });

		// 10. Super Admin Shops with Login as Shop action
		await page.goto('/platform/shops');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByRole('button', { name: /Login as Shop/i }).first()).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_super_admin_shops_actions.png'), fullPage: false });

		// 11. Tenant Impersonation Active Mode
		const loginBtn = page.getByRole('button', { name: /Login as Shop/i }).first();
		await loginBtn.click();
		await expect(page.getByText(/IMPERSONATION ACTIVE/i)).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_impersonation_active_banner.png'), fullPage: false });

		// Exit impersonation to restore state
		await page.getByRole('button', { name: /Exit Impersonation/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// 12. Platform Audit Trail & Compliance
		await page.goto('/platform/audit');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText(/Platform Audit Trail & Compliance/i)).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_platform_audit_trail.png'), fullPage: false });

		// 13. Platform Plans & Pricing Catalog
		await page.goto('/platform/plans');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Gói Dịch Vụ & Bảng Giá Nền Tảng')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_platform_plans_pricing.png'), fullPage: false });

		// 14. Billing & Invoices
		await page.goto('/platform/billing');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Quản Lý Hóa Đơn & Thuê Bao')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_platform_billing_subscriptions.png'), fullPage: false });

		// 15. Global Users Directory
		await page.goto('/platform/users');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Quản Lý Người Dùng Toàn Nền Tảng')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_platform_global_users.png'), fullPage: false });

		// 16. Fraud & Risk Queue
		await page.goto('/platform/risk');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Hàng Đợi Giám Sát Rủi Ro & Gian Lận')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_platform_risk_queue.png'), fullPage: false });

		// 17. System Diagnostics & Cluster Health
		await page.goto('/platform/system');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Sức Khỏe Hệ Thống & Giám Sát Cụm Hạ Tầng')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_platform_system_diagnostics.png'), fullPage: false });

		// 18. Shop Detail Inspection Console
		await page.goto('/platform/shops/00000000-0000-0000-0000-000000000001');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Hồ Sơ Cửa Hàng Chi Tiết')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_platform_shop_detail.png'), fullPage: false });

		// 19. Store Staff & Roles Management
		await page.goto('/settings/staff');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Nhân Sự & Phân Quyền Cửa Hàng')).toBeVisible({ timeout: 15000 });
		await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_store_staff_management.png'), fullPage: false });

		// Assert zero uncaught runtime errors across all pages
		expect(uncaughtErrors, `Uncaught runtime errors detected: ${uncaughtErrors.join(' | ')}`).toHaveLength(0);
	});
});
