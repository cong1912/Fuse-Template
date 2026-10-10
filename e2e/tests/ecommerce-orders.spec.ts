import { test, expect } from '@playwright/test';
import { OrdersPage } from '../pom/OrdersPage';
import { setupApiMocks } from '../config/mockApi';

test.describe('E-Commerce Orders Enterprise Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display orders list and status details', async ({ page }) => {
		await setupApiMocks(page);

		const ordersPage = new OrdersPage(page);
		await ordersPage.goto();
		await ordersPage.verifyLoaded();

		// Check presence of mock order records
		await expect(page.locator('table').getByText('ord-8888-0001').or(page.getByText('ord-8888-0001').first())).toBeVisible({ timeout: 15000 });
		await expect(page.locator('table').getByText('ord-8888-0002').or(page.getByText('ord-8888-0002').first())).toBeVisible({ timeout: 15000 });

		// Verify order statuses are rendered
		await expect(page.getByText(/Processing|Delivered/i).first()).toBeVisible();
	});
});
