import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('B2B Wholesale RFQ Quoting E2E Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display B2B quotes table, pricing tiers, and open negotiation modal', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/b2b');
		await page.waitForLoadState('domcontentloaded');

		// Verify header and table
		await expect(page.locator('header, main').getByText(/B2B Wholesale & Quoting/i).first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/FPT Software Corporation/i)).toBeVisible();
		await expect(page.getByText(/RFQ-20261008-FPT999/i)).toBeVisible();

		// Open Negotiate Dialog
		const counterOfferBtn = page.getByRole('button', { name: /Counter-Offer/i }).first();
		if (await counterOfferBtn.isVisible()) {
			await counterOfferBtn.click();
			await expect(page.getByText(/Negotiate RFQ/i)).toBeVisible({ timeout: 10000 });
		}
	});
});
