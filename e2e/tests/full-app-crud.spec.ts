import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Full-App End-to-End CRUD & Business Operations Test Suite', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('1. Product Lifecycle CRUD: Create, Read/Filter, Update and Delete through UI', async ({ page }) => {
		// [READ]: View products catalog
		await page.goto('/apps/e-commerce/products');
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible({ timeout: 15000 });

		// [CREATE]: Navigate to Add Product form
		await page.locator('a[href="/apps/e-commerce/products/new"]').first().click();
		await expect(page.getByText('New Product')).toBeVisible();

		// Fill product details in Basic Info
		const nameInput = page.locator('#name');
		await nameInput.fill('Bàn Phím Cơ Không Dây Keychron K2 Pro');

		// Click Add button in header
		const addBtn = page.getByRole('button', { name: 'Add', exact: true });
		await expect(addBtn).toBeEnabled();
		await addBtn.click();

		// Should navigate to product detail
		await page.waitForURL(/\/apps\/e-commerce\/products\/44444444-4444-4444-4444-444444444444/);
		await expect(page.getByText('Bàn Phím Cơ Không Dây Keychron K2 Pro').first()).toBeVisible();

		// [READ / LIST]: Return to catalog and verify new product appears in list
		await page.goto('/apps/e-commerce/products');
		await expect(page.getByText('Bàn Phím Cơ Không Dây Keychron K2 Pro').first()).toBeVisible();

		// Test search filter
		const searchInput = page.getByPlaceholder('Search products');
		await searchInput.fill('Keychron');
		await expect(page.getByText('Bàn Phím Cơ Không Dây Keychron K2 Pro').first()).toBeVisible();
		await expect(page.getByText('MacBook Pro 16 M3 Max').first()).not.toBeVisible();

		// Clear search
		await searchInput.fill('');
		await expect(page.getByText('MacBook Pro 16 M3 Max').first()).toBeVisible();

		// [UPDATE]: Open the product again to update
		await page.getByText('Bàn Phím Cơ Không Dây Keychron K2 Pro').first().click();

		const editNameInput = page.locator('#name');
		await editNameInput.fill('Bàn Phím Cơ Không Dây Keychron K2 Pro Max RGB');

		const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
		await expect(saveBtn).toBeEnabled();
		await saveBtn.click();

		// [DELETE]: Click Remove to delete product
		const removeBtn = page.getByRole('button', { name: 'Remove', exact: true });
		await expect(removeBtn).toBeVisible();
		await removeBtn.click();

		// Verifies redirect back to catalog and item is deleted
		await page.waitForURL('/apps/e-commerce/products');
		await expect(page.getByText('Bàn Phím Cơ Không Dây Keychron K2 Pro')).not.toBeVisible();
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible();
	});

	test('2. Order Lifecycle: Catalog list inspection and detailed tabs navigation', async ({ page }) => {
		// [READ]: View orders list
		await page.goto('/apps/e-commerce/orders');

		await expect(page.locator('table').getByText('ord-8888-0001').or(page.getByText('ord-8888-0001').first())).toBeVisible({ timeout: 15000 });
		await expect(page.locator('table').getByText('ord-8888-0002').or(page.getByText('ord-8888-0002').first())).toBeVisible();

		// Click order to open detail
		await page.getByText('ord-8888-0001').first().click();

		// Check Header & Reference
		await expect(page.getByText(/Order ord-8888-0001/i).or(page.getByText(/Order ORD-8888/i)).first()).toBeVisible();
		await expect(page.getByText(/From Nguyễn Thanh Sơn/i)).toBeVisible();

		// Check Order Details Tab (Customer, Addresses, Payment, Status)
		await expect(page.getByText('Sơn Trà Logistics')).toBeVisible();
		await expect(page.getByText(/123 Võ Văn Kiệt/i).first()).toBeVisible();
		await expect(page.getByText('sontra@logistics.vn')).toBeVisible();

		// Switch to Products Tab
		await page.getByRole('tab', { name: 'Products' }).click();
		await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();

		// Switch to Invoice Tab
		await page.getByRole('tab', { name: 'Invoice' }).click();
		await expect(page.getByRole('heading', { name: 'INVOICE' })).toBeVisible();
	});

	test('3. Category Tree Hierarchy: Verification of nested category nodes', async ({ page }) => {
		await page.goto('/apps/e-commerce/categories');

		await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Điện Thoại & Tablet')).toBeVisible();
		await expect(page.getByText('Máy Tính & Laptop')).toBeVisible();

		// Nested children verified via expanded tree
		await expect(page.getByText('Apple iPhone')).toBeVisible();
		await expect(page.getByText('MacBook Pro')).toBeVisible();
	});

	test('4. Store Staff Management: Add new staff member and delete record', async ({ page }) => {
		await page.goto('/settings/staff');

		// Assert existing staff
		await expect(page.getByRole('heading', { name: 'Nguyễn Văn Quản Trị' })).toBeVisible({ timeout: 15000 });

		// Add new staff member
		await page.getByRole('button', { name: 'Thêm Nhân Viên' }).first().click();
		await page.getByPlaceholder('Nguyễn Văn A').fill('Lý Bảo Châu');
		await page.getByPlaceholder('nhanvien@shop.vn').fill('chau.lb@shop.vn');
		await page.getByRole('button', { name: 'Thêm Nhân Viên' }).last().click();

		// Assert new staff is displayed in table
		await expect(page.getByRole('heading', { name: 'Lý Bảo Châu' })).toBeVisible();
		await expect(page.getByText('chau.lb@shop.vn')).toBeVisible();

		// Delete staff member
		const deleteBtn = page.locator('tr:has-text("Lý Bảo Châu")').getByRole('button', { name: 'Xóa' });
		await deleteBtn.click();
		await expect(page.getByRole('heading', { name: 'Lý Bảo Châu' })).not.toBeVisible();
	});

	test('5. Super Admin Platform & Tenant Management: Feature Overrides & Impersonation', async ({ page }) => {
		await page.goto('/platform/shops');

		// Assert shop list
		await expect(page.getByText('Flagship Electronics Store')).toBeVisible({ timeout: 15000 });

		// Open Feature Override modal (Configure button)
		await page.getByRole('button', { name: 'Configure' }).first().click();
		await expect(page.getByText(/Configure Tenant:/i)).toBeVisible();
		await page.getByRole('button', { name: 'Close' }).click();

		// Login as Shop (Impersonation)
		await page.getByRole('button', { name: 'Login as Shop' }).first().click();
		await expect(page.getByText(/IMPERSONATION ACTIVE/i)).toBeVisible();

		// Exit Impersonation
		await page.getByRole('button', { name: 'Exit Impersonation' }).click();
		await expect(page.getByText(/IMPERSONATION ACTIVE/i)).not.toBeVisible();
	});
});
