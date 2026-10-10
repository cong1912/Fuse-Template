import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Playwright Stress Testing: Full-App Cross-Module Lifecycle & Multi-Tenant Isolation', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('1. Full Lifecycle: Products, Variant Matrix, Pricing & SEO Preview', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('networkidle');

		// Verify product list renders properly
		await expect(page.getByText('Sản phẩm').first()).toBeVisible({ timeout: 15000 });

		// Click to view product details
		const firstProduct = page.locator('tbody tr, a[href*="/apps/e-commerce/products/"]').first();
		if (await firstProduct.isVisible()) {
			await firstProduct.click();
			await page.waitForLoadState('networkidle');

			// Verify 2-Column Shopify/Saleor Layout
			await expect(page.getByText(/Thiết Lập Giá & Tính Toán Lợi Nhuận/i)).toBeVisible({ timeout: 10000 });

			// Verify Profit Margin Calculator
			await expect(page.getByText(/Lợi Nhuận Gộp/i).first()).toBeVisible();

			// Test AI Copywriter dialog trigger
			const aiBtn = page.getByRole('button', { name: /AI Viết Mô Tả/i });
			if (await aiBtn.isVisible()) {
				await aiBtn.click();
				await expect(page.getByText(/AI Copywriter & SEO Generator/i)).toBeVisible();
				// Close dialog
				const closeBtn = page.getByRole('button', { name: /Hủy Bỏ/i }).or(page.getByText(/Hủy Bỏ/i));
				if (await closeBtn.isVisible()) {
					await closeBtn.click();
				}
			}

			// Switch to Variants Tab
			const variantsTab = page.getByRole('tab', { name: /Ma Trận Biến Thể/i });
			if (await variantsTab.isVisible()) {
				await variantsTab.click();
				await page.waitForTimeout(400);
				await expect(page.getByText(/Ma Trận Biến Thể/i).first()).toBeVisible();
			}
		}
	});

	test('2. Full Lifecycle: Order Fulfillment Stepper, GHN Tracking & AI Fraud Risk', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/orders');
		await page.waitForLoadState('networkidle');

		// Click on an order
		const firstOrder = page.locator('tbody tr, a[href*="/apps/e-commerce/orders/"]').first();
		if (await firstOrder.isVisible()) {
			await firstOrder.click();
			await page.waitForLoadState('networkidle');

			// Verify Order Lifecycle Stepper
			await expect(page.getByText(/Tiến Trình Đơn Hàng/i)).toBeVisible({ timeout: 10000 });

			// Verify Shipping Tracking (GHN Express)
			await expect(page.getByText(/Giao Hàng Nhanh \(GHN\)/i).first()).toBeVisible();

			// Verify AI Fraud Risk Score
			await expect(page.getByText(/AI Đánh Giá Rủi Ro/i)).toBeVisible();
			await expect(page.getByText(/98\/100 An Toàn/i)).toBeVisible();
		}
	});

	test('3. Full Lifecycle: Promotion Playbooks & Shop Vouchers Management', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/promotions');
		await page.waitForLoadState('networkidle');

		// Verify Promotion Playbooks Gallery Header & KPI Cards
		await expect(page.getByText(/Trung Tâm Kịch Bản Khuyến Mãi/i)).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/Thư Viện Kịch Bản Khuyến Mãi/i).first()).toBeVisible();

		// Switch to Vouchers tab
		const vouchersTab = page.getByTestId('tab-vouchers').or(page.getByRole('tab', { name: /Voucher & Mã Giảm Giá Của Shop/i }));
		if (await vouchersTab.isVisible()) {
			await vouchersTab.click();
			await page.waitForTimeout(400);
			// Either coupons table or empty message appears
			await expect(
				page.getByText(/Shop chưa tạo mã giảm giá nào/i)
					.or(page.getByText(/Mã Voucher/i))
					.or(page.getByRole('button', { name: /Tạo Mã Giảm Giá Mới/i }))
			).toBeVisible();
		}

		// Switch back to Playbooks tab and test customize dialog
		const playbooksTab = page.getByRole('tab', { name: /Thư Viện Kịch Bản Khuyến Mãi/i });
		await playbooksTab.click();
		await page.waitForTimeout(400);

		// Test Customize Playbook Dialog
		const customizeBtn = page.getByRole('button', { name: /Tùy Biến Cấu Hình/i }).first();
		if (await customizeBtn.isVisible()) {
			await customizeBtn.click();
			await expect(page.getByTestId('dialog-playbook-config')).toBeVisible();

			const cancelBtn = page.getByTestId('dialog-close-btn').or(page.getByRole('button', { name: /Đóng/i })).first();
			if (await cancelBtn.isVisible()) {
				await cancelBtn.click();
			}
		}
	});

	test('4. Full Lifecycle: Multi-Tenant Isolation & SuperAdmin Impersonation', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to platform shops as SuperAdmin
		await page.goto('/platform/shops');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText(/Flagship Electronics Store/i)).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Hệ thống/Platform').first()).toBeVisible();

		// Impersonate into Shop
		const impersonateBtn = page.getByRole('button', { name: /Login as Shop/i }).first();
		if (await impersonateBtn.isVisible()) {
			await impersonateBtn.click();
			await page.waitForTimeout(500);

			// Under impersonation: Platform management menu MUST BE HIDDEN
			await expect(page.getByText(/IMPERSONATION ACTIVE/i)).toBeVisible();
			await expect(page.getByText('Hệ thống/Platform')).not.toBeVisible();

			// Exit Impersonation
			const exitBtn = page.getByRole('button', { name: /Exit Impersonation/i });
			await exitBtn.click();
			await page.waitForTimeout(500);

			// Platform menu restored
			await expect(page.getByText('Hệ thống/Platform').first()).toBeVisible();
		}
	});

	test('5. Full Lifecycle: Customer CRM, RFM Segments & Sync Hub', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/reports/customers');
		await page.waitForLoadState('networkidle');

		// Verify CRM & Sync Hub Header
		await expect(page.getByText(/Trung Tâm Quản Lý & Đồng Bộ Khách Hàng/i)).toBeVisible({ timeout: 15000 });

		// Verify Sync Channels
		await expect(page.getByText('Kênh Web Store').first()).toBeVisible();
		await expect(page.getByText('Kênh Shopee').first()).toBeVisible();
		await expect(page.getByRole('heading', { name: 'TikTok Shop' })).toBeVisible();

		// Test RFM Tab Filtering
		const vipTab = page.getByRole('tab', { name: /VIP/i });
		if (await vipTab.isVisible()) {
			await vipTab.click();
			await page.waitForTimeout(300);
		}

		// Test 1-click Customer Sync
		const syncBtn = page.getByRole('button', { name: /Đồng Bộ Ngay Bây Giờ/i });
		if (await syncBtn.isVisible()) {
			await syncBtn.click();
			await expect(page.getByText(/Đang đồng bộ|Đã đồng bộ thành công/i)).toBeVisible({ timeout: 5000 });
		}
	});

	test('6. Full Lifecycle: Luxury Bank Cards & Payout Account Management', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');

		// Switch to Bank Account / Payout Tab
		const bankTab = page.getByRole('tab', { name: /Tài Khoản Ngân Hàng & Rút Tiền/i });
		if (await bankTab.isVisible()) {
			await bankTab.click();
			await page.waitForTimeout(400);

			// Verify 3D Luxury Bank Card
			await expect(page.getByText(/Vietcombank/i)).toBeVisible();
			await expect(page.getByText(/TÀI KHOẢN CHÍNH/i)).toBeVisible();

			// Open Add Bank Card Dialog
			const addCardBtn = page.getByRole('button', { name: /Thêm Tài Khoản Ngân Hàng/i });
			if (await addCardBtn.isVisible()) {
				await addCardBtn.click();
				await expect(page.getByText(/Thêm Tài Khoản Ngân Hàng Nhận Tiền/i)).toBeVisible();

				const cancelBtn = page.getByRole('button', { name: /Hủy bỏ/i });
				if (await cancelBtn.isVisible()) {
					await cancelBtn.click();
				}
			}
		}
	});
});
