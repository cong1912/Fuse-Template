import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Flash Sale Category Bulk & Multi-Product Picker Verification', () => {

	test('Bulk Add Products by Category, Calculate Discount, Preview & Delete', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// 1. Login as Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// 2. Navigate to Flash Sales page
		await page.goto('/apps/e-commerce/flash-sales');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Verify Page Title & KPI Banner
		await expect(page.locator('text=Flash Sales & Virtual Waiting Room').first()).toBeVisible();
		await expect(page.locator('text=Sản Phẩm Trong Sale')).toBeVisible();
		await expect(page.locator('text=Tổng Suất Mở Bán')).toBeVisible();

		// 3. Open "Thêm Sản Phẩm Khuyến Mãi" Modal
		const addBtn = page.getByRole('button', { name: /Thêm Sản Phẩm Khuyến Mãi|Chọn theo Danh Mục hoặc Chọn Lẻ/i }).first();
		await expect(addBtn).toBeVisible({ timeout: 10000 });
		await addBtn.click();

		// 4. Verify Modal & Tabs
		await expect(page.locator('text=Thêm Sản Phẩm Vào Chiến Dịch Flash Sale')).toBeVisible();
		const categoryTab = page.locator('text=Chọn Nguyên Danh Mục (Bulk Category)');
		await expect(categoryTab).toBeVisible();
		const pickerTab = page.locator('text=Chọn Sản Phẩm Tự Do (Multi-Product Picker)');
		await expect(pickerTab).toBeVisible();

		// 5. Select Category in Tab 0
		const categorySelect = page.locator('div[role="combobox"]').first();
		await categorySelect.click();
		await page.waitForTimeout(500);

		// Select a category with products (e.g. Laptop or Giày dép or Điện thoại)
		const categoryOption = page.locator('li[role="option"]:has-text("Laptop"), li[role="option"]:has-text("Giày dép"), li[role="option"]:has-text("Điện thoại")').first();
		await categoryOption.click();
		await page.waitForTimeout(1000);

		// 6. Verify Bulk Formula Box & Preview Table
		await expect(page.locator('text=Thiết Lập Công Thức Giảm Giá Hàng Loạt')).toBeVisible();
		await expect(page.locator('text=Xem Trước Danh Sách Sản Phẩm')).toBeVisible();

		// Check preview rows exist
		const previewCheckboxes = page.locator('table tbody tr input[type="checkbox"]');
		const rowCount = await previewCheckboxes.count();
		console.log(`Preview rows in selected category: ${rowCount}`);
		expect(rowCount).toBeGreaterThan(0);

		// Capture screenshot of Tab 0: Bulk Category modal
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'flash_sale_modal_tab0_bulk_category.png'),
			fullPage: false
		});

		// Switch to Tab 1 to capture Multi-Product Picker view
		await pickerTab.click();
		await page.waitForTimeout(600);
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'flash_sale_modal_tab1_product_picker.png'),
			fullPage: false
		});

		// Switch back to Tab 0 to complete bulk add
		await categoryTab.click();
		await page.waitForTimeout(600);

		// 7. Click "Thêm ... Sản Phẩm Vào Flash Sale"
		const submitBtn = page.getByRole('button', { name: /Thêm .* Sản Phẩm Vào Flash Sale/i });
		await expect(submitBtn).toBeEnabled();
		await submitBtn.click();

		// Wait for dialog to close and data to refresh
		await page.waitForTimeout(3000);

		// 8. Verify products now appear in active campaign list
		const quotaBars = page.locator('text=Đã bán: 0 /');
		await expect(quotaBars.first()).toBeVisible({ timeout: 10000 });

		// 9. Verify Delete Button is present
		const deleteBtns = page.locator('button[title="Xóa khỏi Flash Sale"], button:has(svg[data-testid="DeleteOutlineIcon"])');
		const initialCount = await deleteBtns.count();
		console.log(`Items in flash sale: ${initialCount}`);
		expect(initialCount).toBeGreaterThan(0);

		// 10. Capture screenshot of the enhanced Flash Sale page with bulk items
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'flash_sale_category_bulk_added.png'),
			fullPage: true
		});

		// 11. Delete 1 item to verify removal works
		await deleteBtns.first().click();
		await page.waitForTimeout(2000);

		const afterCount = await deleteBtns.count();
		console.log(`Items in flash sale after deletion: ${afterCount}`);
		expect(afterCount).toBeLessThan(initialCount);
	});

});
