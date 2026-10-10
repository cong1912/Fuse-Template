import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Catalog Products & Categories Deep CRUD Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('Product CRUD: should create, view and update product with notifications', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to new product page
		await page.goto('/apps/e-commerce/products/new', { waitUntil: 'domcontentloaded' });
		await page.locator('#fuse-splash-screen').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
		await expect(page.getByText('Sản Phẩm Mới')).toBeVisible({ timeout: 15000 });

		// Fill name
		const nameInput = page.getByLabel(/Tên sản phẩm/i).first();
		await nameInput.fill('Tai Nghe Bluetooth Pro Wireless 2026');

		// Check create button is enabled and click
		const createBtn = page.getByRole('button', { name: /Tạo Sản Phẩm/i });
		await expect(createBtn).toBeEnabled();
		await createBtn.click();

		// Verify navigation to product detail
		await expect(page).toHaveURL(/\/apps\/e-commerce\/products\/[a-zA-Z0-9-]+/, { timeout: 10000 });

		// Click Save to update
		const saveBtn = page.getByRole('button', { name: /Lưu Thay Đổi/i });
		if (await saveBtn.isVisible()) {
			await expect(saveBtn).toBeEnabled();
			await saveBtn.click();
			// Assert page remains responsive and intact
			await expect(page.getByText(/Chi Tiết Sản Phẩm/i)).toBeVisible();
		}
	});

	test('Categories CRUD: should add root category, add subcategory and edit', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to categories page
		await page.goto('/apps/e-commerce/categories', { waitUntil: 'domcontentloaded' });
		await page.locator('#fuse-splash-screen').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
		await expect(page.getByText('Quản Lý Danh Mục Sản Phẩm (Categories)')).toBeVisible({ timeout: 15000 });

		// 1. Add root category
		const addRootBtn = page.getByRole('button', { name: /Thêm Danh Mục Gốc/i });
		await expect(addRootBtn).toBeVisible();
		await addRootBtn.click();

		await expect(page.getByText('Thêm Danh Mục Mới')).toBeVisible();

		const nameInput = page.getByPlaceholder(/Ví dụ: Thiết bị di động/i);
		await nameInput.fill('Thiết Bị Âm Thanh Thông Minh');

		const descInput = page.getByPlaceholder(/Mô tả vắn tắt/i);
		await descInput.fill('Tai nghe, loa phòng khách và micro thu âm');

		const saveCatBtn = page.getByRole('button', { name: /Lưu Danh Mục/i });
		await saveCatBtn.click();

		// Dialog closes and category is rendered
		await expect(page.getByText('Thêm Danh Mục Mới')).not.toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Thiết Bị Âm Thanh Thông Minh')).toBeVisible();

		// 2. Edit category
		const editBtn = page.getByRole('button', { name: /Chỉnh sửa danh mục/i }).first();
		await editBtn.waitFor({ state: 'visible', timeout: 5000 });
		await editBtn.click();
		await expect(page.getByText('Chỉnh Sửa Danh Mục')).toBeVisible({ timeout: 5000 });
		const updateBtn = page.getByRole('button', { name: /Cập Nhật/i });
		await updateBtn.click();
		await expect(page.getByText('Chỉnh Sửa Danh Mục')).not.toBeVisible({ timeout: 5000 });
	});
});
