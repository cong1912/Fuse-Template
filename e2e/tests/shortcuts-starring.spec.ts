import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Navigation Shortcuts & Page Starring E2E Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('should display shortcuts, allow pinning/unpinning pages, and persist across page reloads', async ({ page }) => {
		// Set desktop viewport so toolbar shortcuts are visible (Hidden lgDown)
		await page.setViewportSize({ width: 1440, height: 900 });

		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// 1. Locate the shortcuts manager button (gold star)
		const shortcutsStarButton = page.locator('button[aria-haspopup="true"]:has(svg), button[title*="lối tắt"], button[title*="shortcut"]').first();
		await expect(shortcutsStarButton).toBeVisible();

		// Take screenshot of initial state
		await page.screenshot({ path: 'e2e/screenshots/shortcuts_initial_toolbar.png' });

		// 2. Open shortcuts management menu
		await shortcutsStarButton.click();
		await page.waitForTimeout(400);

		// 3. Verify menu elements: search input, Pinned section, All pages section
		const searchInput = page.getByPlaceholder('Tìm trang để ghim...');
		await expect(searchInput).toBeVisible();

		// Check sections exist
		await expect(page.locator('text=Đã ghim').first()).toBeVisible();
		await expect(page.locator('text=Tất cả các trang').first()).toBeVisible();

		// Take screenshot of open shortcuts menu
		await page.screenshot({ path: 'e2e/screenshots/shortcuts_menu_open.png' });

		// 4. Pin a new page: "Flash Sales (Waiting Room)"
		// Find the row for Flash Sales in the menu
		const flashSalesRow = page.locator('li.MuiMenuItem-root', { hasText: 'Flash Sales' }).first();
		await expect(flashSalesRow).toBeVisible();

		// Click the star button inside Flash Sales row to pin it
		const flashSalesStarBtn = flashSalesRow.locator('button');
		await flashSalesStarBtn.click();

		// Take screenshot after pinning Flash Sales
		await page.screenshot({ path: 'e2e/screenshots/shortcuts_pinned_flash_sales.png' });

		// 5. Close menu by pressing Escape
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);

		// 6. Verify that Flash Sales shortcut icon is now present in the toolbar
		// Flash Sales has title "Flash Sales (Waiting Room)" or link to /apps/e-commerce/flash-sales
		const flashSalesToolbarLink = page.locator('header, [class*="Toolbar"]').locator('a[href="/apps/e-commerce/flash-sales"]');
		await expect(flashSalesToolbarLink).toBeVisible();

		// Take screenshot showing new shortcut on toolbar
		await page.screenshot({ path: 'e2e/screenshots/shortcuts_toolbar_with_flash_sales.png' });

		// 7. Refresh the page to test persistence (F5)
		await page.reload();
		await page.waitForLoadState('networkidle');

		// 8. Assert Flash Sales is STILL in the toolbar after refresh!
		const flashSalesToolbarAfterReload = page.locator('header, [class*="Toolbar"]').locator('a[href="/apps/e-commerce/flash-sales"]');
		await expect(flashSalesToolbarAfterReload).toBeVisible();

		// Take screenshot verifying persistence after reload
		await page.screenshot({ path: 'e2e/screenshots/shortcuts_persisted_after_f5.png' });

		// 9. Unpin Flash Sales: open menu again and toggle star off
		const reopenStarBtn = page.locator('button[aria-haspopup="true"]:has(svg), button[title*="lối tắt"], button[title*="shortcut"]').first();
		await reopenStarBtn.click();

		const pinnedFlashSalesRow = page.locator('li.MuiMenuItem-root', { hasText: 'Flash Sales' }).first();
		await expect(pinnedFlashSalesRow).toBeVisible();
		await pinnedFlashSalesRow.locator('button').click();

		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);

		// 10. Verify Flash Sales is removed from toolbar
		await expect(page.locator('header, [class*="Toolbar"]').locator('a[href="/apps/e-commerce/flash-sales"]')).toHaveCount(0);

		// Take screenshot of toolbar after unpinning
		await page.screenshot({ path: 'e2e/screenshots/shortcuts_unpinned_clean.png' });
	});

	test('should filter shortcuts by search query', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		const shortcutsStarButton = page.locator('button[aria-haspopup="true"]:has(svg), button[title*="lối tắt"], button[title*="shortcut"]').first();
		await shortcutsStarButton.click();

		const searchInput = page.getByPlaceholder('Tìm trang để ghim...');
		await searchInput.fill('Theme');

		// Verify search results show Tùy biến Giao diện (Theme)
		await expect(page.locator('li.MuiMenuItem-root', { hasText: 'Theme' })).toBeVisible();

		// Other unrelated pages like "Đơn hàng" should not be visible in search results
		await expect(page.locator('li.MuiMenuItem-root', { hasText: 'Đơn hàng' })).toHaveCount(0);

		// Clear search
		await searchInput.fill('');
		// Sections should reappear
		await expect(page.locator('text=Đã ghim').first()).toBeVisible();
	});
});
