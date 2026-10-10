import { test, expect } from '@playwright/test';
import * as path from 'path';
import { setupApiMocks } from '../config/mockApi';

test.describe('Saleor/Shopify-Grade UX, AI Tangible Value & Omnisearch Verification', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	const screenshotsDir = 'C:\\Users\\dangc\\.gemini\\antigravity\\brain\\d5979c1e-72c8-497d-8253-2817c94e7106\\screenshots';

	test('01 - Fixed Sidebar Background & Vouchers Management', async ({ page }) => {
		await page.goto('/apps/e-commerce/promotions');
		await page.waitForLoadState('networkidle');

		// Click Vouchers tab
		const voucherTab = page.locator('button[role="tab"]').filter({ hasText: 'Voucher & Mã Giảm Giá' });
		if (await voucherTab.isVisible()) {
			await voucherTab.click();
			await page.waitForTimeout(500);
		}

		// Capture fullpage screenshot to prove sidebar background extends seamlessly with NO white cutoff
		await page.screenshot({
			path: path.join(screenshotsDir, '33_fixed_sidebar_voucher_fullpage.png'),
			fullPage: true
		});
	});

	test('02 - Saleor/Shopify 2-Column Product & Variant Matrix UI', async ({ page }) => {
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');

		// Check 2-column layout and SEO preview
		await expect(page.locator('text=Trạng Thái Sản Phẩm')).toBeVisible();
		await expect(page.locator('text=Kênh Phân Phối (Channels)')).toBeVisible();
		await expect(page.locator('text=Xem Trước Kết Quả Google SEO')).toBeVisible();

		// Click Variants tab
		const variantsTab = page.locator('button[role="tab"]').filter({ hasText: 'Ma Trận Biến Thể' });
		await variantsTab.click();
		await page.waitForTimeout(500);

		await expect(page.locator('text=Thuộc Tính & Phân Loại Biến Thể')).toBeVisible();
		await expect(page.locator('text=Tạo Ma Trận Biến Thể')).toBeVisible();
		await expect(page.locator('text=Chỉnh Sửa Hàng Loạt')).toBeVisible();

		// Take screenshot of Variant Matrix
		await page.screenshot({
			path: path.join(screenshotsDir, '34_saleor_shopify_product_and_variant_matrix.png'),
			fullPage: false
		});
	});

	test('03 - AI Magic Copywriter & SEO Generator', async ({ page }) => {
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');

		// Fill a product name first
		const nameInput = page.locator('#name');
		await nameInput.fill('Áo thun Polo nam cotton dệt tổ ong cao cấp');
		await page.waitForTimeout(300);

		// Click AI Copywriter button
		const aiBtn = page.locator('button').filter({ hasText: 'AI Viết Mô Tả & SEO' });
		await expect(aiBtn).toBeVisible();
		await aiBtn.click();

		// Verify AI Dialog
		await expect(page.locator('text=AI Copywriter & SEO Generator')).toBeVisible();

		// Wait for generation
		await page.waitForTimeout(1000);
		await expect(page.locator('text=Xem trước kết quả tìm kiếm Google (Google SERP Snippet)')).toBeVisible();
		await expect(page.locator('text=4 Điểm Nhấn Bán Hàng (USP Bullets)')).toBeVisible();

		// Capture screenshot of AI Dialog
		await page.screenshot({
			path: path.join(screenshotsDir, '35_ai_copywriter_and_seo_generator.png')
		});

		// Apply AI content
		const applyBtn = page.locator('button').filter({ hasText: 'Áp Dụng Vào Sản Phẩm' });
		await applyBtn.click();
		await page.waitForTimeout(500);
	});

	test('04 - Saleor/Shopify Order Details with Stepper & AI Fraud Risk Score', async ({ page }) => {
		await page.goto('/apps/e-commerce/orders');
		await page.waitForLoadState('networkidle');

		// Click on first order
		const firstRow = page.locator('tbody tr').first();
		if (await firstRow.isVisible()) {
			await firstRow.click();
		} else {
			await page.goto('/apps/e-commerce/orders/1');
		}
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(800);

		// Verify Stepper, GHN Logistics, Customer CRM & AI Risk
		await expect(page.locator('text=Tiến Trình Đơn Hàng')).toBeVisible();
		await expect(page.locator('text=Giao Hàng Nhanh (GHN)').first()).toBeVisible();
		await expect(page.locator('text=AI Đánh Giá Rủi Ro')).toBeVisible();
		await expect(page.locator('text=98/100 An Toàn')).toBeVisible();
		await expect(page.locator('text=Thông Tin Khách Hàng')).toBeVisible();

		// Capture screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '36_order_details_stepper_and_ai_risk.png'),
			fullPage: true
		});
	});

	test('05 - Omnisearch Command Palette (Ctrl+K) & Notifications Panel', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// 1. Open Omnisearch via search bar click
		const searchBox = page.locator('text=Tìm kiếm...').first();
		if (await searchBox.isVisible()) {
			await searchBox.click();
		} else {
			await page.keyboard.press('Control+k');
		}
		await page.waitForTimeout(600);

		// Verify Command Palette
		await expect(page.locator('text=Tác Vụ Nhanh').first()).toBeVisible();
		await page.screenshot({
			path: path.join(screenshotsDir, '37_omnisearch_command_palette.png')
		});

		// Close Omnisearch
		await page.keyboard.press('Escape');
		await page.waitForTimeout(300);

		// 2. Open Notification Panel
		const notifBtn = page.locator('#notification-panel-toggle-btn');
		await notifBtn.click();
		await page.waitForTimeout(600);

		await expect(page.locator('text=Thông Báo')).toBeVisible();
		await expect(page.locator('text=Đơn hàng mới #ORD-9821')).toBeVisible();

		await page.screenshot({
			path: path.join(screenshotsDir, '38_notifications_drawer_with_tabs.png')
		});
	});

	test('06 - Luxury Bank Card & User Profile Page', async ({ page }) => {
		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');

		// Verify Profile Page
		await expect(page.locator('text=Thông Tin Tài Khoản & Gian Hàng')).toBeVisible();

		// Click Bank Card & Payout Tab
		const bankTab = page.locator('button[role="tab"]').filter({ hasText: 'Thẻ Ngân Hàng' });
		await bankTab.click();
		await page.waitForTimeout(600);

		await expect(page.locator('text=Tài Khoản Ngân Hàng & Thẻ Nhận Tiền Doanh Thu')).toBeVisible();
		await expect(page.locator('text=Vietcombank')).toBeVisible();
		await expect(page.getByText('Tài Khoản Chính', { exact: true })).toBeVisible();

		// Capture screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '39_luxury_bank_card_and_payout.png'),
			fullPage: true
		});
	});

	test('07 - Customer CRM & Multi-Channel Sync Hub', async ({ page }) => {
		await page.goto('/reports/customers');
		await page.waitForLoadState('networkidle');

		// Verify Customer Hub
		await expect(page.locator('text=Trung Tâm Quản Lý & Đồng Bộ Khách Hàng')).toBeVisible();
		await expect(page.locator('text=Kênh Web Store')).toBeVisible();
		await expect(page.locator('text=Kênh Shopee')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'TikTok Shop' })).toBeVisible();
		await expect(page.locator('text=⭐ VIP / Champions')).toBeVisible();

		// Capture screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '40_customer_crm_and_sync_hub.png'),
			fullPage: true
		});
	});
});
