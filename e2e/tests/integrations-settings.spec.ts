import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Store Integrations Settings (VNPay & GHN)', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('should display payment and shipping integrations forms and save settings', async ({ page }) => {
		await page.goto('/settings/integrations');

		// Check Page Header
		await expect(page.getByText('Trung Tâm Tích Hợp').or(page.getByText('Integrations')).first()).toBeVisible({ timeout: 15000 });

		// Switch to Payment & Shipping Tab
		const paymentsTab = page.getByTestId('tab-payments');
		await paymentsTab.click();

		// Check VNPay form section
		await expect(page.getByText('Cổng Thanh Toán VNPay').or(page.getByText('VNPay')).first()).toBeVisible();

		// Check GHN form section
		await expect(page.getByText('Giao Hàng Nhanh (GHN Express)').or(page.getByText('GHN')).first()).toBeVisible();

		// Click Save VNPay button
		const saveVnpayBtn = page.getByTestId('save-vnpay-btn');
		await expect(saveVnpayBtn).toBeVisible();
		await saveVnpayBtn.click();

		// Assert success feedback
		await expect(page.getByText('Lưu cấu hình VNPay thành công')).toBeVisible();
	});
});
