import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Enterprise Dashboard: Contextual Drill-down Drawer & Real CSV Export', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('1. Contextual Drill-down Drawer: Open, execute 1-click action, undo & close', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// 1. Click "Chờ Xác Nhận" Action Card
		const pendingCard = page.locator('[data-testid="action-card-op-pending"]');
		await expect(pendingCard).toBeVisible({ timeout: 15000 });
		await pendingCard.click();

		// 2. Verify Drill-down Drawer slides in
		const drawer = page.locator('[data-testid="operations-drilldown-drawer"]');
		await expect(drawer).toBeVisible();
		await expect(drawer.getByText('Chờ Xác Nhận')).toBeVisible();
		await expect(drawer.getByText('#ORD-9821')).toBeVisible();
		await expect(drawer.getByText('Nguyễn Văn An')).toBeVisible();

		// 3. Click 1-Click "Xác Nhận Nhanh" button
		const confirmBtn = page.locator('[data-testid="quick-confirm-ORD-9821"]');
		await expect(confirmBtn).toBeVisible();
		await confirmBtn.click();

		// Verify success toast with Undo action
		await expect(page.getByText(/Đã xác nhận đơn hàng #ORD-9821 thành công!/i)).toBeVisible();
		const undoBtn = page.locator('[data-testid="undo-ORD-9821"]');
		await expect(undoBtn).toBeVisible();
		await expect(confirmBtn).toHaveText(/Đã Xác Nhận/i);
		await expect(confirmBtn).toBeDisabled();

		// Test Undo
		await undoBtn.click();
		await expect(page.getByText(/Đã hoàn tác xác nhận đơn hàng!/i)).toBeVisible();
		await expect(confirmBtn).toHaveText(/Xác Nhận Nhanh/i);
		await expect(confirmBtn).toBeEnabled();

		// Confirm again
		await confirmBtn.click();
		await expect(confirmBtn).toHaveText(/Đã Xác Nhận/i);

		// 4. Close Drawer via Close Button
		const closeBtn = page.locator('[data-testid="close-drilldown-drawer-btn"]');
		await closeBtn.click();
		await expect(drawer).toBeHidden();

		// 5. Open "Cảnh Báo Hết Hàng" card
		const lowStockCard = page.locator('[data-testid="action-card-op-lowstock"]');
		await expect(lowStockCard).toBeVisible();
		await lowStockCard.click();

		// Verify Low Stock items inside Drawer
		await expect(drawer).toBeVisible();
		await expect(drawer.getByText('Cảnh Báo Hết Hàng')).toBeVisible();
		await expect(drawer.getByText('POLO-WHT-M')).toBeVisible();

		// Click 1-click PO generation
		const poBtn = page.locator('[data-testid="quick-po-PROD-01"]');
		await poBtn.click();
		await expect(page.getByText(/Đã tạo lệnh nhập kho khẩn cấp cho POLO-WHT-M!/i)).toBeVisible();

		// Close via ESC key
		await page.keyboard.press('Escape');
		await expect(drawer).toBeHidden();
	});

	test('2. Real CSV / Excel Exporter: Trigger client-side download with UTF-8 BOM', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Set up download event listener before clicking
		const downloadPromise = page.waitForEvent('download');

		const exportBtn = page.getByRole('button', { name: /Xuất Báo Cáo/i });
		await expect(exportBtn).toBeVisible();
		await exportBtn.click();

		// Verify notification
		await expect(page.getByText(/Đang xuất báo cáo doanh số & vận hành/i)).toBeVisible({ timeout: 5000 });

		// Verify file download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/^bao-cao-van-hanh-.*\.csv$/);
		expect(await download.failure()).toBeNull();
	});
});
