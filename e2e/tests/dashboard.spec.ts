import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pom/DashboardPage';
import { setupApiMocks } from '../config/mockApi';

test.describe('Dashboard Enterprise Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display analytics dashboard with operational widgets', async ({ page }) => {
		await setupApiMocks(page);

		const dashboardPage = new DashboardPage(page);
		await dashboardPage.goto();
		await dashboardPage.verifyLoaded();

		// Verify operational action cards on default tab
		await expect(page.getByText('Chờ Xác Nhận')).toBeVisible();
		await expect(page.getByText('Chờ Đóng Gói')).toBeVisible();

		// Verify recent orders table and top products
		await expect(page.getByText('Recent Orders')).toBeVisible();
		await expect(page.getByText('Top Products')).toBeVisible();

		// Switch to Audience & Traffic tab to verify traffic & conversions metrics
		await dashboardPage.switchToAudienceTab();
		await expect(page.getByText('Conversions')).toBeVisible();
		await expect(page.getByText('Impressions')).toBeVisible();
		await expect(page.getByText('Visits')).toBeVisible();
		await expect(page.getByText('Visitors Overview')).toBeVisible();
	});

	test('should handle live sync refresh and dynamic range & channel filtering', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// 1. Verify Live Sync badge
		await expect(page.getByText('LIVE SYNC')).toBeVisible();

		// 2. Test 1-click manual refresh
		const refreshBtn = page.getByTestId('header-refresh-btn');
		await expect(refreshBtn).toBeVisible();
		await refreshBtn.click();
		await expect(page.getByText(/Đã đồng bộ dữ liệu thời gian thực mới nhất!/i)).toBeVisible({ timeout: 5000 });

		// 3. Test dynamic range switching (7 days)
		const rangeSelect = page.getByRole('combobox').filter({ hasText: /Hôm nay|7 ngày qua|30 ngày qua|Tháng này/i }).first();
		await rangeSelect.click();
		await page.getByRole('option', { name: '7 ngày qua' }).click();
		await expect(page.getByText('Doanh Thu 7 Ngày Qua (GMV)')).toBeVisible();
		await expect(page.getByText('₫138.920.000')).toBeVisible();

		// 4. Test dynamic channel switching (Chỉ Web Store)
		const channelSelect = page.getByRole('combobox').filter({ hasText: /Tất cả kênh bán|Chỉ Web Store|Shopee|TikTok/i }).first();
		await channelSelect.click();
		await page.getByRole('option', { name: 'Chỉ Web Store' }).click();
		await expect(page.getByText('Doanh Thu Web Store (GMV)')).toBeVisible();

		// 5. Switch back to all channels & today
		await channelSelect.click();
		await page.getByRole('option', { name: 'Tất cả kênh bán' }).click();
		await rangeSelect.click();
		await page.getByRole('option', { name: 'Hôm nay' }).click();

		await expect(page.getByText('Doanh Thu Hôm Nay (GMV)')).toBeVisible();
		await expect(page.getByText('₫18.450.000')).toBeVisible();
	});
});
