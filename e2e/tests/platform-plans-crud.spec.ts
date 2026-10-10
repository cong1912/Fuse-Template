import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';
import * as path from 'path';

test.describe('Super Admin Platform Plans CRUD E2E Suite', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('Complete Platform Plans CRUD Lifecycle (List, Create, Edit, Delete)', async ({ page }) => {
		await setupApiMocks(page);

		// Step 1: Navigate to Platform Plans
		await page.goto('/platform/plans');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Gói Dịch Vụ & Bảng Giá Nền Tảng')).toBeVisible({ timeout: 15000 });

		// Verify existing plans are displayed
		await expect(page.getByText('Gói Starter (Miễn phí)')).toBeVisible();
		await expect(page.getByText('Gói Scale (Chuyên nghiệp)')).toBeVisible();
		await expect(page.getByText('Gói Enterprise (Doanh nghiệp)')).toBeVisible();

		// Step 2: Open "Tạo Gói Mới" dialog
		const createBtn = page.getByRole('button', { name: 'Tạo Gói Mới' });
		await expect(createBtn).toBeVisible();
		await createBtn.click();

		await expect(page.getByText('Tạo Gói Dịch Vụ Mới')).toBeVisible();

		// Fill in Form
		const nameInput = page.getByLabel('Tên Gói Dịch Vụ');
		await nameInput.fill('Gói Tăng Trưởng Đột Phá');

		const codeInput = page.getByLabel('Mã Gói (Code)');
		await codeInput.fill('GROWTH_ULTRA');

		const priceInput = page.getByLabel('Giá Cước Hàng Tháng (VND)');
		await priceInput.fill('1490000');

		// Toggle Most Popular switch
		const popularSwitch = page.getByLabel('Đặt làm Gói Phổ Biến Nhất');
		await popularSwitch.check();

		// Toggle features
		const flashSaleFeature = page.getByText('Phòng chờ ảo Flash Sale');
		await flashSaleFeature.click();

		// Submit creation
		const saveBtn = page.getByRole('button', { name: 'Lưu Thay Đổi' });
		await saveBtn.click();

		// Verify new card appeared
		await expect(page.getByText('Gói Tăng Trưởng Đột Phá', { exact: true })).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('GROWTH_ULTRA', { exact: true })).toBeVisible();

		// Step 3: Edit the newly created plan
		const createdCard = page.locator('.MuiPaper-root').filter({ hasText: 'Gói Tăng Trưởng Đột Phá' });
		const editBtn = createdCard.getByRole('button', { name: 'Chi Tiết & Hạn Ngạch' });
		await editBtn.click();

		await expect(page.getByText('Cấu Hình Gói: Gói Tăng Trưởng Đột Phá')).toBeVisible();

		// Update fields
		await page.getByLabel('Tên Gói Dịch Vụ').fill('Gói Tăng Trưởng Siêu Cấp');
		await page.getByLabel('Giá Cước Hàng Tháng (VND)').fill('1990000');

		await page.getByRole('button', { name: 'Lưu Thay Đổi' }).click();

		// Verify updated title
		await expect(page.getByText('Gói Tăng Trưởng Siêu Cấp', { exact: true })).toBeVisible({ timeout: 10000 });

		// Capture visual verification artifact
		const screenshotPath = path.join(
			process.cwd(),
			'..',
			'c#',
			'e-commerce',
			'docs',
			'images',
			'platform-plans-crud-verified.png'
		);
		await page.screenshot({ path: screenshotPath, fullPage: false });

		// Step 4: Delete the newly created plan
		const updatedCard = page.locator('.MuiPaper-root').filter({ hasText: 'Gói Tăng Trưởng Siêu Cấp' });
		const deleteIconBtn = updatedCard.locator('button[title="Xóa gói dịch vụ"]');
		await deleteIconBtn.click();

		await expect(page.getByText('Xác Nhận Xóa Gói Dịch Vụ')).toBeVisible();
		const confirmDeleteBtn = page.getByRole('button', { name: 'Xóa Gói' });
		await confirmDeleteBtn.click();

		// Verify card is removed
		await expect(page.getByText('Gói Tăng Trưởng Siêu Cấp', { exact: true })).toHaveCount(0, { timeout: 10000 });
	});
});
