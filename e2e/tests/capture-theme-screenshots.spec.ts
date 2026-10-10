import { test } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Capture Theme Screenshots', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('capture light mode, dark mode, and tenant branding', async ({ page }) => {
		await setupApiMocks(page);

		const targetDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

		// 1. Light Mode with Theme Toggle Menu Open
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('domcontentloaded');
		await page.locator('[data-testid="theme-mode-toggle"]').click();
		await page.waitForTimeout(500);
		await page.screenshot({ path: `${targetDir}/20_theme_switcher_light_menu.png`, fullPage: false });

		// 2. Dark Mode Dashboard
		await page.locator('[data-testid="theme-mode-option-dark"]').click();
		await page.waitForTimeout(500);
		await page.screenshot({ path: `${targetDir}/21_theme_switcher_dark_dashboard.png`, fullPage: false });

		// 3. Tenant Branding & White-Labeling Tab
		await page.goto('/platform/shops/d8c11e5c-7d9a-4c28-9fa4-7e792c31e9c5');
		await page.waitForLoadState('domcontentloaded');
		const brandingSection = page.getByText(/White-Labeling & Theme Tokens/i);
		await brandingSection.scrollIntoViewIfNeeded();
		await page.waitForTimeout(800);
		await page.screenshot({ path: `${targetDir}/22_tenant_branding_white_labeling.png`, fullPage: false });
	});
});
