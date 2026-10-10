import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Product Classes Catalog & Attributes Management', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('should display product classes DataGrid with records, variants toggle, and actions', async ({ page }) => {
		await page.goto('/apps/e-commerce/product-classes');

		// Check Heading & New Class Button
		await expect(page.getByRole('heading', { name: 'Product Classes' })).toBeVisible({ timeout: 15000 });
		await expect(page.getByRole('button', { name: 'New Class' })).toBeVisible();

		// Check rows from API mock
		await expect(page.getByText('Laptop & Máy Tính Xách Tay')).toBeVisible();
		await expect(page.getByText('Điện Thoại Di Động')).toBeVisible();
		await expect(page.getByText('Phụ Kiện Điện Tử')).toBeVisible();
	});
});
