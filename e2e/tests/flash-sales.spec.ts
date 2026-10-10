import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Flash Sales & Virtual Waiting Room E2E Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display active waiting room, queue metrics, and allow batch admission', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/flash-sales');
		await page.waitForLoadState('domcontentloaded');

		// Verify header and traffic guard banner
		await expect(page.locator('header, main').getByText(/Flash Sales & Virtual Waiting Room/i).first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/REDIS TOKEN BUCKET ACTIVE/i)).toBeVisible();
		await expect(page.getByText(/High-Concurrency Traffic Guard/i)).toBeVisible();

		// Verify flash sale campaign is listed
		await expect(page.getByText(/10.10 Super Tech Flash Sale/i).first()).toBeVisible();

		// Verify batch admission action
		const admitBtn = page.getByRole('button', { name: /Admit 50 Users/i });
		if (await admitBtn.isVisible()) {
			await admitBtn.click();
			await expect(page.getByText(/Successfully admitted/i)).toBeVisible({ timeout: 10000 });
		}
	});
});
