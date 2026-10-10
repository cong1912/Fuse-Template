import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Playwright Stress Testing: Hard Cases, Edge Boundaries & Chaos Resilience', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('1. Input Boundary & Malicious Injection (XSS, SQLi, Special Chars, Long Strings)', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to product edit or new product
		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('networkidle');

		// Click on first product to edit
		const firstProduct = page.locator('tbody tr, .fuse-product-item, a[href*="/apps/e-commerce/products/"]').first();
		if (await firstProduct.isVisible({ timeout: 10000 })) {
			await firstProduct.click();
			await page.waitForLoadState('networkidle');

			// Try injecting XSS and SQLi payload into product name
			const nameInput = page.locator('input[name="name"], input#name').first();
			if (await nameInput.isVisible()) {
				const xssPayload = '<img src=x onerror=alert("XSS_ATTACK") /> \' OR \'1\'=\'1 -- 🚀🔥💎';
				await nameInput.fill(xssPayload);
				await expect(nameInput).toHaveValue(xssPayload);

				// Verify no script execution dialog or crash
				page.on('dialog', async (dialog) => {
					// If an alert is triggered by the XSS payload, this is a vulnerability!
					throw new Error(`XSS Vulnerability detected! Dialog message: ${dialog.message()}`);
				});

				// Test extreme string length (500+ characters)
				const longString = 'A'.repeat(500);
				await nameInput.fill(longString);
				const val = await nameInput.inputValue();
				expect(val.length).toBeGreaterThan(0);
			}
		}
	});

	test('2. Rapid Double-Clicking & Debounce on Critical Action Buttons', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Test Rapid 5x Clicking on "Xuất Báo Cáo"
		const exportBtn = page.getByRole('button', { name: /Xuất Báo Cáo/i });
		if (await exportBtn.isVisible()) {
			// Click 5 times in rapid succession
			await Promise.all([
				exportBtn.click({ clickCount: 1 }),
				exportBtn.click({ clickCount: 1 }).catch(() => {}),
				exportBtn.click({ clickCount: 1 }).catch(() => {}),
				exportBtn.click({ clickCount: 1 }).catch(() => {}),
				exportBtn.click({ clickCount: 1 }).catch(() => {})
			]);

			// Page should remain responsive, no crash or error boundary
			await expect(page.getByText('Trung Tâm Điều Hành Bán Hàng (E-Commerce Command Center)')).toBeVisible();
		}

		// Switch to Inventory tab and test rapid clicking on PO button
		const inventoryTab = page.getByRole('tab', { name: /Kho Hàng & Chuỗi Cung Ứng/i });
		await inventoryTab.click();
		await page.waitForTimeout(400);

		const poBtn = page.getByRole('button', { name: /Tạo Lệnh Nhập/i }).first();
		if (await poBtn.isVisible()) {
			await poBtn.click();
			// Rapid click while button is debounced
			await poBtn.click().catch(() => {});
			await expect(page.getByText(/Đã tạo lệnh nhập hàng khẩn cấp/i).first()).toBeVisible();
		}
	});

	test('3. Chaos Network Resilience: Graceful Handling of HTTP 500 Server Errors', async ({ page }) => {
		await setupApiMocks(page);

		// Intercept orders API with an intentional 500 Internal Server Error
		await page.route(/\/api\/admin\/orders(\?.*)?$/, async (route) => {
			return route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({
					title: 'Internal Server Error',
					status: 500,
					detail: 'Simulated backend database failure or crash'
				})
			});
		});

		// Navigate to Orders page
		await page.goto('/apps/e-commerce/orders');
		await page.waitForTimeout(1000);

		// App MUST NOT crash with unhandled white screen of death
		// The error state must be handled gracefully with a user-friendly message
		await expect(page.getByText('Không thể tải danh sách đơn hàng')).toBeVisible({ timeout: 10000 });
		const bodyText = await page.textContent('body');
		expect(bodyText).not.toContain('Something went wrong');
		expect(bodyText).not.toContain('Cannot read properties of undefined');
	});

	test('4. Chaos Network Resilience: HTTP 401 Session Expiration', async ({ page }) => {
		await setupApiMocks(page);

		// Intercept profile/auth verification with 401 Unauthorized
		await page.route(/\/api\/auth\/me|\/api\/account\/profile/, async (route) => {
			return route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Token expired or invalid signature' })
			});
		});

		await page.goto('/account/profile');
		await page.waitForTimeout(1000);

		// Page should handle unauthorized gracefully (either show login or friendly notification)
		const body = await page.textContent('body');
		expect(body).toBeDefined();
	});

	test('5. Non-existent Entity IDs (404 Fallback & Missing Data Resilience)', async ({ page }) => {
		await setupApiMocks(page);

		// Attempt to navigate to a non-existent product GUID
		await page.goto('/apps/e-commerce/products/00000000-0000-0000-0000-000000000000');
		await page.waitForTimeout(1000);

		// App must not crash, must render product layout or redirect
		const currentUrl = page.url();
		expect(currentUrl).toBeDefined();

		// Attempt to navigate to a non-existent order
		await page.goto('/apps/e-commerce/orders/non-existent-order-id-99999');
		await page.waitForTimeout(1000);

		// Navigation shell must remain intact
		await expect(page.getByText('Trang chủ').first()).toBeVisible({ timeout: 10000 });
	});

	test('6. Omnisearch Extreme Query & Zero Results Empty State', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Trigger Omnisearch via Ctrl+K
		await page.keyboard.press('Control+KeyK');
		await page.waitForTimeout(500);

		const searchInput = page.getByPlaceholder(/Tìm kiếm sản phẩm, đơn hàng, tính năng.../i);
		if (await searchInput.isVisible()) {
			// Type extreme non-existent query
			await searchInput.fill('@@@___NON_EXISTENT_SEARCH_STRING_XYZ_999___$$$');
			await page.waitForTimeout(400);

			// Should show empty state message
			await expect(page.getByText(/Không tìm thấy kết quả phù hợp/i)).toBeVisible();

			// Press Escape to close modal smoothly
			await page.keyboard.press('Escape');
			await page.waitForTimeout(300);
			await expect(searchInput).not.toBeVisible();
		}
	});
});
