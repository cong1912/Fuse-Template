import { test } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Capture Reports & Analytics Screenshots', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('capture all overhauled report pages and analytics tabs', async ({ page }) => {
		await setupApiMocks(page);

		const targetDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

		// 1. Revenue Report
		await page.goto('/reports/revenue');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_01_revenue.png`, fullPage: false });

		// 2. Orders Report
		await page.goto('/reports/orders');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_02_orders.png`, fullPage: false });

		// 3. Products Report
		await page.goto('/reports/products');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_03_products.png`, fullPage: false });

		// 4. Finance Report
		await page.goto('/reports/finance');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_04_finance.png`, fullPage: false });

		// 5. Inventory Report
		await page.goto('/reports/inventory');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_05_inventory.png`, fullPage: false });

		// 6. Marketing Report
		await page.goto('/reports/marketing');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_06_marketing.png`, fullPage: false });

		// 7. Analytics Dashboard - Tab 1 (Inventory)
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');
		const invTab = page.getByRole('tab', { name: /Kho Hàng & Chuỗi Cung Ứng/i });
		await invTab.click();
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_07_analytics_inventory_tab.png`, fullPage: false });

		// 8. Analytics Dashboard - Tab 2 (Audience & Funnel)
		const audTab = page.getByRole('tab', { name: /Khách Hàng & Lưu Lượng/i });
		await audTab.click();
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/report_08_analytics_audience_funnel_tab.png`, fullPage: false });
	});
});
