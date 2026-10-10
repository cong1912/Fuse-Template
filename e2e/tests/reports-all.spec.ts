import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Reports Analytics & Intelligence Suite (All 7 BI Dashboards)', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('1. Revenue Report: KPIs, ApexCharts, DataGrid, and Export', async ({ page }) => {
		await page.goto('/reports/revenue');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Báo Cáo Doanh Thu & Tăng Trưởng/i)).toBeVisible({ timeout: 15000 });
		// KPI Cards
		await expect(page.getByText('Doanh Thu Gộp').first()).toBeVisible();
		await expect(page.getByText('Doanh Thu Thuần').first()).toBeVisible();
		// Action
		await expect(page.getByRole('button', { name: /Xuất Báo Cáo CSV/i })).toBeVisible();
		// DataGrid
		await expect(page.getByText('Bảng Kê Chi Tiết Hiệu Suất Doanh Thu Hàng Ngày')).toBeVisible();
	});

	test('2. Orders Report: Pipeline Funnel, Carrier Shares, and DataGrid', async ({ page }) => {
		await page.goto('/reports/orders');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Báo Cáo Đơn Hàng & Vận Hành/i)).toBeVisible({ timeout: 15000 });
		// KPI Cards
		await expect(page.getByText('Tổng Đơn Đã Ghi Nhận')).toBeVisible();
		await expect(page.getByText('Tỷ Lệ Giao Thành Công')).toBeVisible();
		// Pipeline chart
		await expect(page.getByText(/Phễu Trạng Thái Xử Lý Đơn Hàng/i)).toBeVisible();
		// Action
		await expect(page.getByRole('button', { name: /Xuất File CSV/i })).toBeVisible();
	});

	test('3. Products Report: Top Sellers, Margins, Dead Stock Alerts', async ({ page }) => {
		await page.goto('/reports/products');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Báo Cáo Sản Phẩm & Hiệu Suất Bán Lẻ/i)).toBeVisible({ timeout: 15000 });
		// KPI Cards
		await expect(page.getByText('Mặt Hàng Đang Bán')).toBeVisible();
		await expect(page.getByText('Top 1 Doanh Thu')).toBeVisible();
		// Matrix
		await expect(page.getByText(/Bảng Thống Kê Hiệu Quả Từng Mã Hàng/i)).toBeVisible();
	});

	test('4. Customers Report: CRM, RFM Segments, Sync Hub', async ({ page }) => {
		await page.goto('/reports/customers');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Trung Tâm Quản Lý & Đồng Bộ Khách Hàng/i)).toBeVisible({ timeout: 15000 });
		// Channels
		await expect(page.getByText('Kênh Web Store').first()).toBeVisible();
		await expect(page.getByRole('button', { name: /Đồng Bộ Ngay Bây Giờ/i })).toBeVisible();
	});

	test('5. Finance Report: Gateways Breakdown, Cashflow, Reconciliation', async ({ page }) => {
		await page.goto('/reports/finance');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Báo Cáo Tài Chính & Dòng Tiền/i)).toBeVisible({ timeout: 15000 });
		// KPI Cards
		await expect(page.getByText('Số Dư Thực Nhận Khả Dụng')).toBeVisible();
		await expect(page.getByText('COD Đang Thu Hộ')).toBeVisible();
		// Chart
		await expect(page.getByText(/Lưu Chuyển Tiền Tệ Hàng Ngày/i)).toBeVisible();
	});

	test('6. Inventory Report: Warehouse Network, Turnover, Reorder Suggestions', async ({ page }) => {
		await page.goto('/reports/inventory');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Báo Cáo Tồn Kho & Dự Báo Cung Ứng/i)).toBeVisible({ timeout: 15000 });
		// KPI Cards
		await expect(page.getByText('Tổng Giá Trị Tồn Kho')).toBeVisible();
		await expect(page.getByText('Hệ Số Vòng Quay Kho')).toBeVisible();
		// Reorder button
		await expect(page.getByRole('button', { name: /Tạo Lệnh Nhập Gợi Ý/i })).toBeVisible();
	});

	test('7. Marketing Report: Campaign ROI, Voucher Rankings, Lift Chart', async ({ page }) => {
		await page.goto('/reports/marketing');
		await page.waitForLoadState('networkidle');

		// Header
		await expect(page.getByText(/Báo Cáo Tiếp Thị & Hiệu Quả Khuyến Mại/i)).toBeVisible({ timeout: 15000 });
		// KPI Cards
		await expect(page.getByText('Doanh Thu Từ Khuyến Mãi')).toBeVisible();
		await expect(page.getByText('Hệ Số Hoàn Vốn (ROI)')).toBeVisible();
		// Ranking Table
		await expect(page.getByText(/Bảng Xếp Hạng Hiệu Quả Từng Mã Voucher/i)).toBeVisible();
	});

	test('8. Analytics Dashboard: Inventory Tab and Audience Conversion Funnel Tab', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Tab 1: Kho hàng & Chuỗi cung ứng
		const inventoryTab = page.getByRole('tab', { name: /Kho Hàng & Chuỗi Cung Ứng/i });
		await inventoryTab.click();
		await page.waitForTimeout(400);

		await expect(page.getByText(/Sức Khỏe Tồn Kho & Cảnh Báo Cháy Hàng/i)).toBeVisible();
		await expect(page.getByText(/Mạng Lưới & Sức Chứa Kho Hàng Đa Chi Nhánh/i)).toBeVisible();

		// Tab 2: Khách hàng & Lưu lượng
		const audienceTab = page.getByRole('tab', { name: /Khách Hàng & Lưu Lượng/i });
		await audienceTab.click();
		await page.waitForTimeout(400);

		await expect(page.getByText(/Phễu Chuyển Đổi Mua Hàng Toàn Diện/i)).toBeVisible();
		await expect(page.getByText(/Xem SP \/ Truy cập/i)).toBeVisible();
	});
});
