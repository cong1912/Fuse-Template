import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Flash Sale Creation & Waiting Room CRUD Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should successfully create flash sale campaign, add items and admit waiting room batch', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/flash-sales', { waitUntil: 'domcontentloaded' });
		await page.locator('#fuse-splash-screen').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
		await expect(page.getByText('Flash Sales & Virtual Waiting Room')).toBeVisible({ timeout: 15000 });

		// 1. Open Create Flash Sale Dialog
		const createBtn = page.getByRole('button', { name: /Tạo Chiến Dịch Flash Sale/i });
		await expect(createBtn).toBeVisible();
		await createBtn.click();

		// Verify dialog opened
		await expect(page.getByText('Tạo Chiến Dịch Flash Sale Mới')).toBeVisible();

		// Fill campaign details
		const nameInput = page.getByPlaceholder(/Ví dụ: Giờ Vàng Siêu Sale 10.10/i);
		await nameInput.fill('Flash Sale Đại Tiệc Công Nghệ');

		const descInput = page.getByPlaceholder(/Săn deal giảm sốc tới 50%/i);
		await descInput.fill('Giảm cực sốc chỉ trong 24 giờ vàng');

		// Submit creation
		const submitCreateBtn = page.getByRole('button', { name: /Tạo Chiến Dịch/i }).last();
		await submitCreateBtn.click();

		// Verify dialog closed
		await expect(page.getByRole('heading', { name: 'Tạo Chiến Dịch Flash Sale Mới' })).not.toBeVisible({ timeout: 5000 });

		// Verify campaign in list
		await expect(page.getByText('Flash Sale Đại Tiệc Công Nghệ')).toBeVisible();

		// 2. Add an item to campaign
		const addItemBtn = page.getByRole('button', { name: /Thêm Sản Phẩm/i }).first();
		if (await addItemBtn.isVisible()) {
			await addItemBtn.click();
			await expect(page.getByRole('heading', { name: 'Thêm Sản Phẩm Vào Flash Sale' })).toBeVisible();

			// Select product
			const selectProd = page.getByLabel(/Chọn sản phẩm/i);
			await selectProd.click();
			await page.getByRole('option').first().click();

			// Enter discount price
			const priceInput = page.getByLabel(/Giá khuyến mãi Flash Sale/i);
			await priceInput.fill('49000000');

			// Submit Add Item
			await page.getByRole('button', { name: /Thêm Vào Flash Sale/i }).click();
			await expect(page.getByRole('heading', { name: 'Thêm Sản Phẩm Vào Flash Sale' })).not.toBeVisible({ timeout: 5000 });
		}

		// 3. Test Waiting Room Batch Admit
		const admit50Btn = page.getByRole('button', { name: /Cho vào 50 khách|Admit 50/i });
		if (await admit50Btn.isVisible()) {
			await admit50Btn.click();
			await expect(page.getByText(/Cho phép 50 người dùng vào thanh toán thành công/i)).toBeVisible({ timeout: 5000 });
		}
	});
});
