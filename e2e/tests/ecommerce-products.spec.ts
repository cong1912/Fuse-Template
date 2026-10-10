import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pom/ProductsPage';
import { setupApiMocks } from '../config/mockApi';

test.describe('E-Commerce Products Enterprise Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display product catalog and support filtering', async ({ page }) => {
		await setupApiMocks(page);

		const productsPage = new ProductsPage(page);
		await productsPage.goto();
		await productsPage.verifyLoaded();

		// Verify product list contains mock catalog items
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('iPhone 16 Pro Max 256GB')).toBeVisible({ timeout: 15000 });

		// Perform search
		await productsPage.searchProduct('MacBook');
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible();
	});
});
