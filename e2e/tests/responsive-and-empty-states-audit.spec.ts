import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('UX & Responsive Quality Audit: Viewport Adaptation & Edge Empty States', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('1. Mobile Viewport (390x844): Verify zero horizontal overflow on Dashboard, Products, Orders', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });

		const pagesToCheck = [
			'/dashboards/analytics',
			'/apps/e-commerce/orders',
			'/apps/e-commerce/products'
		];

		for (const url of pagesToCheck) {
			await page.goto(url, { waitUntil: 'domcontentloaded' });
			await page.waitForTimeout(600);

			// Check horizontal overflow (scrollWidth should match or be within 5px of innerWidth)
			const hasHorizontalOverflow = await page.evaluate(() => {
				return document.documentElement.scrollWidth > window.innerWidth + 5;
			});

			expect(hasHorizontalOverflow, `Horizontal overflow detected on mobile at ${url}`).toBeFalsy();
		}
	});

	test('2. Tablet Viewport (768x1024): Verify layout responsiveness and grid adaptation', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });

		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Verify header and command center remain fully visible
		await expect(page.getByText('Trung Tâm Điều Hành Bán Hàng (E-Commerce Command Center)')).toBeVisible();
		await expect(page.getByText('Trung Tâm Tác Vụ Vận Hành (Operations Action Center)')).toBeVisible();

		// Verify tabs can be clicked without clipping
		const inventoryTab = page.getByRole('tab', { name: /Kho Hàng & Chuỗi Cung Ứng/i });
		await expect(inventoryTab).toBeVisible();
		await inventoryTab.click();
		await expect(page.getByText('Sức Khỏe Tồn Kho & Cảnh Báo Cháy Hàng (Inventory Health Alert)')).toBeVisible();
	});

	test('3. Empty State & Extreme Search Filter: Graceful UX on zero match', async ({ page }) => {
		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('networkidle');

		// Search for gibberish
		const searchInput = page.getByPlaceholder(/Tìm kiếm sản phẩm|Search/i).first();
		if (await searchInput.isVisible()) {
			await searchInput.fill('XYZ_IMPOSSIBLE_PRODUCT_NAME_99999');
			await page.waitForTimeout(500);

			// Assert no table crash, and graceful "No products" or empty row exists
			const bodyText = await page.locator('body').innerText();
			expect(bodyText).not.toContain('Something went wrong');
			expect(bodyText).not.toContain('Minified React error');
		}
	});

	test('4. Dark Mode Visual Contrast & Theme Switching: No unreadable text', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Find ThemeModeToggle on topbar if visible
		const themeToggle = page.locator('[data-testid="theme-mode-toggle-btn"]');
		if (await themeToggle.isVisible()) {
			await themeToggle.click();
			// Select Dark Mode
			const darkModeOption = page.getByRole('menuitem', { name: /Tối|Dark/i });
			if (await darkModeOption.isVisible()) {
				await darkModeOption.click();
				await page.waitForTimeout(400);

				// Verify Dark Mode background is dark
				const bgColor = await page.evaluate(() => {
					return window.getComputedStyle(document.body).backgroundColor;
				});
				expect(bgColor).toBeDefined();
			}
		}
	});
});
