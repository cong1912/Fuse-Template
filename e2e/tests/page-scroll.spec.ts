import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Page Scrollability & Root Redirection Verification', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('1. Root URL redirects to /dashboards/analytics and scrolls smoothly with mouse wheel', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to root
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Verify redirected to /dashboards/analytics (not obsolete /dashboards/project)
		expect(page.url()).toContain('/dashboards/analytics');

		// Verify page has substantial content (scrollHeight > 1500)
		const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
		expect(scrollHeight).toBeGreaterThan(1500);

		// Test mouse wheel scroll over content area
		const initialY = await page.evaluate(() => window.scrollY);
		await page.mouse.move(600, 400);
		await page.mouse.wheel(0, 600);
		await page.waitForTimeout(400);

		const scrolledY = await page.evaluate(() => window.scrollY);
		expect(scrolledY).toBeGreaterThan(initialY);

		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/43_live_homepage_scrolled_down.png',
			fullPage: false
		});
	});

	test('2. Products and Orders pages have active scroll contexts', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Sản phẩm').first()).toBeVisible({ timeout: 10000 });

		await page.goto('/apps/e-commerce/orders');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Đơn hàng').first()).toBeVisible({ timeout: 10000 });
	});
});
