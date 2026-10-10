import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Multi-Language Selection E2E Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('should only display English and Vietnamese options and switch between them seamlessly', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Find the language switcher button (contains flag img and language code)
		const langButton = page.locator('header, main, [class*="Toolbar"]').locator('button:has(img[alt="English"])').first();
		await expect(langButton).toBeVisible();

		// Open language menu
		await langButton.click();

		// Assert exactly English and Tiếng Việt are present
		await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();
		await expect(page.getByRole('menuitem', { name: 'Tiếng Việt' })).toBeVisible();

		// Assert Turkish and Arabic are completely removed
		await expect(page.getByRole('menuitem', { name: 'Turkish' })).not.toBeVisible();
		await expect(page.getByRole('menuitem', { name: 'Arabic' })).not.toBeVisible();

		// Select Tiếng Việt
		await page.getByRole('menuitem', { name: 'Tiếng Việt' }).click();

		// Language button now shows Vietnamese flag and code "vi"
		const viLangButton = page.locator('header, main, [class*="Toolbar"]').locator('button:has(img[alt="Tiếng Việt"])').first();
		await expect(viLangButton).toBeVisible();
		await expect(viLangButton).toContainText('vi');

		// Switch back to English
		await viLangButton.click();
		await page.getByRole('menuitem', { name: 'English' }).click();
		await expect(page.locator('header, main, [class*="Toolbar"]').locator('button:has(img[alt="English"])').first()).toBeVisible();
	});
});
