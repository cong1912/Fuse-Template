import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';
import path from 'path';

test.describe('Enterprise E-Commerce Command Center & Fuse Theme Maximization', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('Enterprise Command Center: Sales & Operations, Inventory Health & Omnichannel Hub', async ({ page }) => {
		await setupApiMocks(page);

		const screenshotsDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

		// 1. Navigate to Analytics Dashboard
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// 2. Verify Command Center Header
		await expect(page.getByText('Trung Tâm Điều Hành Bán Hàng (E-Commerce Command Center)')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Giám sát doanh số theo thời gian thực')).toBeVisible();

		// 3. Verify Operational Action Center (To-Do Cards)
		await expect(page.getByText('Trung Tâm Tác Vụ Vận Hành (Operations Action Center)')).toBeVisible();
		await expect(page.getByText('Chờ Xác Nhận')).toBeVisible();
		await expect(page.getByText('Chờ Đóng Gói')).toBeVisible();
		await expect(page.getByText('Đang Giao Vận')).toBeVisible();
		await expect(page.getByText('Đổi Trả / Khiếu Nại')).toBeVisible();
		await expect(page.getByText('Cảnh Báo Hết Hàng')).toBeVisible();

		// 4. Verify 4 Core E-Commerce KPI Cards with Apex Sparklines
		await expect(page.getByText('₫18.450.000')).toBeVisible();
		await expect(page.getByText('48 Đơn')).toBeVisible();
		await expect(page.getByText('₫384.375')).toBeVisible();
		await expect(page.getByText('3.42%')).toBeVisible();

		// 5. Verify Hourly Real-time Sales Curve & Omnichannel Breakdown
		await expect(page.getByText('Đường Cong Doanh Thu Theo Giờ (Real-time Hourly GMV)')).toBeVisible();
		await expect(page.getByText('Doanh Số Đa Kênh (Omnichannel Share)')).toBeVisible();
		await expect(page.getByText('Web Store Trực Tuyến', { exact: true })).toBeVisible();
		await expect(page.getByText('Sàn Shopee Mall', { exact: true })).toBeVisible();
		await expect(page.getByText('TikTok Shop', { exact: true })).toBeVisible();

		// Test Header Export
		const exportBtn = page.getByRole('button', { name: /Xuất Báo Cáo/i });
		if (await exportBtn.isVisible()) {
			await exportBtn.click();
			await expect(page.getByText(/Đang xuất báo cáo doanh số & vận hành/i)).toBeVisible({ timeout: 5000 });
		}

		// Capture Sales & Operations Tab Screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '41_enterprise_command_center_sales_tab.png'),
			fullPage: true
		});

		// 6. Switch to Tab 2: Kho hàng & Chuỗi cung ứng
		const inventoryTab = page.getByRole('tab', { name: /Kho Hàng & Chuỗi Cung Ứng/i });
		await inventoryTab.click();
		await page.waitForTimeout(600);

		// Verify Inventory Health Alert Hub
		await expect(page.getByText('Sức Khỏe Tồn Kho & Cảnh Báo Cháy Hàng (Inventory Health Alert)')).toBeVisible();
		await expect(page.getByText('Áo thun Polo nam cotton dệt tổ ong')).toBeVisible();
		await expect(page.getByText('Quần âu nam co giãn dáng slimfit')).toBeVisible();
		await expect(page.getByText('Áo sơ mi oxford trắng dài tay')).toBeVisible();

		// Test 1-click PO action button
		const poBtn = page.getByRole('button', { name: /Tạo Lệnh Nhập/i }).first();
		await expect(poBtn).toBeVisible();
		await poBtn.click();
		await expect(page.getByText(/Đã tạo lệnh nhập hàng khẩn cấp \(Purchase Order\)/i)).toBeVisible({ timeout: 5000 });

		// Capture Inventory & Supply Chain Tab Screenshot
		await page.screenshot({
			path: path.join(screenshotsDir, '42_enterprise_inventory_health_tab.png'),
			fullPage: true
		});

		// 7. Switch to Tab 3: Khách hàng & Lưu lượng
		const audienceTab = page.getByRole('tab', { name: /Khách hàng & Lưu lượng/i });
		await audienceTab.click();
		await page.waitForTimeout(600);

		await expect(page.getByText('Phân Tích Độc Giả & Khách Mua Hàng')).toBeVisible();
		await expect(page.getByText('Visitors Overview')).toBeVisible();
	});
});
