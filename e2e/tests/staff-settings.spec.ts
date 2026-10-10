import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Store Settings & Staff Management E2E Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('should display store staff list and add a new staff member via invite dialog', async ({ page }) => {
		await page.goto('/settings/staff');
		await page.waitForLoadState('networkidle');

		// Assert Header
		await expect(page.getByText('Nhân Sự & Phân Quyền Cửa Hàng')).toBeVisible();

		// Assert staff rows
		await expect(page.getByText('Nguyễn Văn Quản Trị')).toBeVisible();
		await expect(page.getByText('Trần Thị Thu Ngân')).toBeVisible();
		await expect(page.getByText('Lê Hoàng Kho Vận')).toBeVisible();

		// Open Add Staff modal
		await page.getByRole('button', { name: 'Thêm Nhân Viên' }).click();
		await expect(page.getByText('Thêm Nhân Viên Mới Vào Cửa Hàng')).toBeVisible();

		// Fill form
		await page.getByPlaceholder('Nguyễn Văn A').fill('Đỗ Minh Tuấn');
		await page.getByPlaceholder('nhanvien@shop.vn').fill('tuan.dm@shop.vn');
		await page.getByRole('button', { name: 'Thêm Nhân Viên' }).last().click();

		// Assert new staff appears in table
		await expect(page.getByRole('heading', { name: 'Đỗ Minh Tuấn' })).toBeVisible();
		await expect(page.getByText('tuan.dm@shop.vn')).toBeVisible();
	});
});
