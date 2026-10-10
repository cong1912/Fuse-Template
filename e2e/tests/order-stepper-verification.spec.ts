import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Order Lifecycle Stepper Verification (#04465B85)', () => {

	test('Order #04465B85 displays accurate dynamic lifecycle stepper and status', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });

		// Navigate to Order #04465B85 details page
		const targetOrderId = '04465b85-2909-49d3-9b2b-145dadefefd6';
		await page.goto(`/apps/e-commerce/orders/${targetOrderId}`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// 1. Verify Header contains Order Reference
		const headerTitle = page.locator('text=Tiến Trình Đơn Hàng #04465B85');
		await expect(headerTitle).toBeVisible({ timeout: 10000 });

		// 2. Verify Status Badge shows "Đang giao hàng"
		const statusBadge = page.locator('text=Đang giao hàng');
		await expect(statusBadge.first()).toBeVisible();

		// 3. Verify Stepper Step Labels
		await expect(page.locator('text=Đặt hàng').first()).toBeVisible();
		await expect(page.locator('text=Đã thanh toán').first()).toBeVisible();
		await expect(page.locator('text=Đang đóng gói').first()).toBeVisible();
		await expect(page.locator('text=Giao cho ĐVVC').first()).toBeVisible();
		await expect(page.locator('text=Giao thành công').first()).toBeVisible();

		// 4. Verify "Giao thành công" does NOT show the fake completed timestamp "16:45 09/10/2026"
		const fakeTime = page.locator('text="16:45 09/10/2026"');
		await expect(fakeTime).not.toBeVisible();

		// 5. Verify "Giao thành công" displays expected delivery note
		const expectedDelivery = page.locator('text=Dự kiến: Hôm nay');
		await expect(expectedDelivery).toBeVisible();

		// 6. Verify Completed checkmarks: Exactly 3 steps completed (0: Đặt hàng, 1: Đã thanh toán, 2: Đang đóng gói)
		// MUI Stepper completed steps render an SVG with data-testid="CheckCircleIcon" or Mui-completed
		const completedSteps = page.locator('.MuiStep-root.Mui-completed');
		const count = await completedSteps.count();
		console.log(`Completed steps count: ${count}`);
		expect(count).toBe(3);

		// 7. Verify Active step is Step 3 ("Giao cho ĐVVC")
		const activeStep = page.locator('.MuiStep-root:not(.Mui-completed)').first();
		await expect(activeStep).toContainText('Giao cho ĐVVC');

		// 8. Capture high-res screenshot of the fixed order details page
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'order_04465B85_stepper_fixed.png'),
			fullPage: true
		});
	});

});
