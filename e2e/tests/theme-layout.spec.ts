import { test, expect } from '@playwright/test';
import { ThemeCustomizerPage } from '../pom/ThemeCustomizerPage';
import { setupApiMocks } from '../config/mockApi';

test.describe('Theme & Layout Switching Enterprise Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should support dynamic theme palette switching without UI degradation', async ({ page }) => {
		await setupApiMocks(page);

		const customizerPage = new ThemeCustomizerPage(page);
		await customizerPage.goto();

		// Open theme color palette drawer
		await customizerPage.openThemesPanel();

		// Verify theme panel has loaded options
		await expect(page.getByText('Theme Color Options')).toBeVisible();

		// Select a dark theme option (e.g., Default Dark)
		await customizerPage.selectTheme('Default Dark');

		// Verify dashboard core content remains intact after theme change
		await expect(page.getByText(/Recent Orders/i)).toBeVisible();
		await expect(page.getByText(/Top Products/i)).toBeVisible();
	});

	test('should support dynamic layout style switching', async ({ page }) => {
		await setupApiMocks(page);

		const customizerPage = new ThemeCustomizerPage(page);
		await customizerPage.goto();

		// Open layout and settings drawer
		await customizerPage.openSettingsPanel();

		// Verify settings panel is open
		await expect(page.getByText('Theme Settings')).toBeVisible();

		// Select Layout 2
		const layout2Radio = page.getByRole('radio', { name: /Layout 2/i });
		if (await layout2Radio.isVisible()) {
			await layout2Radio.click();
			// Assert that page remains responsive and dashboard widget is still visible
			await expect(page.getByText(/Recent Orders/i)).toBeVisible({ timeout: 10000 });
		}
	});
});
