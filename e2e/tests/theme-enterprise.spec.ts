import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Modern Enterprise SaaS Theme Architecture Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display ThemeModeToggle on topbar and switch between Light, Dark, and System modes', async ({
		page
	}) => {
		await setupApiMocks(page);
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('domcontentloaded');

		// 1. Verify ThemeModeToggle button is present on top toolbar
		const toggleBtn = page.locator('[data-testid="theme-mode-toggle"]');
		await expect(toggleBtn).toBeVisible({ timeout: 10000 });

		// 2. Open theme menu
		await toggleBtn.click();
		const darkOption = page.locator('[data-testid="theme-mode-option-dark"]');
		const lightOption = page.locator('[data-testid="theme-mode-option-light"]');
		const systemOption = page.locator('[data-testid="theme-mode-option-system"]');

		await expect(darkOption).toBeVisible();
		await expect(lightOption).toBeVisible();
		await expect(systemOption).toBeVisible();

		// 3. Switch to Dark Mode
		await darkOption.click();

		// Verify documentElement has class 'dark' and localStorage is 'dark'
		await expect(page.locator('html')).toHaveClass(/dark/);
		const savedModeDark = await page.evaluate(() => localStorage.getItem('fuse_theme_mode'));
		expect(savedModeDark).toBe('dark');

		// 4. Test Zero-FOUC on reload: page reload must maintain dark mode without reset
		await page.reload();
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('html')).toHaveClass(/dark/);

		// 5. Switch to Light Mode
		await page.locator('[data-testid="theme-mode-toggle"]').click();
		await page.locator('[data-testid="theme-mode-option-light"]').click();

		// Verify documentElement does not have class 'dark'
		await expect(page.locator('html')).not.toHaveClass(/dark/);
		const savedModeLight = await page.evaluate(() => localStorage.getItem('fuse_theme_mode'));
		expect(savedModeLight).toBe('light');

		// 6. Switch to System Mode
		await page.locator('[data-testid="theme-mode-toggle"]').click();
		await page.locator('[data-testid="theme-mode-option-system"]').click();

		const savedModeSystem = await page.evaluate(() => localStorage.getItem('fuse_theme_mode'));
		expect(savedModeSystem).toBe('system');
	});

	test('should render Tenant White-Labeling & Theme Tokens tab with presets and live preview', async ({
		page
	}) => {
		await setupApiMocks(page);
		await page.goto('/platform/shops/d8c11e5c-7d9a-4c28-9fa4-7e792c31e9c5');
		await page.waitForLoadState('domcontentloaded');

		// Verify white-labeling & theme tokens customization section exists
		const brandingSection = page.getByText(/White-Labeling & Theme Tokens/i);
		await expect(brandingSection).toBeVisible({ timeout: 15000 });

		// Verify Presets are present
		await expect(page.getByText('Royal Indigo')).toBeVisible();
		await expect(page.getByText('Emerald Mint')).toBeVisible();

		// Verify Live Interactive Preview
		await expect(page.getByText(/Bản Xem Trước Trực Quan/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /Mua Ngay/i })).toBeVisible();

		// Verify Save button
		const saveBtn = page.locator('[data-testid="save-theme-tokens-btn"]');
		await expect(saveBtn).toBeVisible();
	});
});
