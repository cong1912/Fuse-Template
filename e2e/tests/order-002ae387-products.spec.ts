import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Order 002ae387-2d7b-406e-8a6c-36f7bf07bd9e Products Verification', () => {

	test('Order details and products tab render real items with names, prices, and totals', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Direct navigate to order 002ae387-2d7b-406e-8a6c-36f7bf07bd9e
		await page.goto('/apps/e-commerce/orders/002ae387-2d7b-406e-8a6c-36f7bf07bd9e');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// 1. Verify Tab 0: Order Details contains products list with real names
		const orderDetailsProductsTitle = page.locator('text=Danh Sách Sản Phẩm Trong Đơn');
		await expect(orderDetailsProductsTitle).toBeVisible({ timeout: 10000 });

		const dellProductOnDetails = page.locator('text=Laptop Dell XPS & Asus ZenBook Creator Edition 58').first();
		await expect(dellProductOnDetails).toBeVisible({ timeout: 10000 });

		const iphoneProductOnDetails = page.locator('text=Apple iPhone 13 Pro Max 384GB Titan').first();
		await expect(iphoneProductOnDetails).toBeVisible({ timeout: 10000 });

		// Scroll into view to capture products section clearly
		await orderDetailsProductsTitle.scrollIntoViewIfNeeded();
		await page.waitForTimeout(500);

		// Capture screenshot of Order Details tab products section
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'order_002ae387_details_tab_products.png'),
		});

		// 2. Click Tab 1: "Products"
		const productsTabBtn = page.getByRole('tab', { name: /Products/i });
		await expect(productsTabBtn).toBeVisible({ timeout: 5000 });
		await productsTabBtn.click();
		await page.waitForTimeout(1000);

		// Verify Products Tab header
		const productsTabHeader = page.locator('text=Sản Phẩm Trong Đơn Hàng');
		await expect(productsTabHeader).toBeVisible({ timeout: 10000 });

		// Verify products in table
		const dellProductOnTable = page.locator('text=Laptop Dell XPS & Asus ZenBook Creator Edition 58').first();
		await expect(dellProductOnTable).toBeVisible({ timeout: 10000 });

		const iphoneProductOnTable = page.locator('text=Apple iPhone 13 Pro Max 384GB Titan').first();
		await expect(iphoneProductOnTable).toBeVisible({ timeout: 10000 });

		// Verify summary row
		const summaryRow = page.locator('text=TỔNG CỘNG TIỀN HÀNG:');
		await expect(summaryRow).toBeVisible({ timeout: 10000 });

		// Capture screenshot of Products tab
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'order_002ae387_products_tab_table.png'),
			fullPage: true
		});
	});

});
