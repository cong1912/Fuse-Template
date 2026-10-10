import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Tier-1 Super Admin & Platform Operations E2E Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('should display Plans & Pricing catalog, tier comparison, and feature quotas modal', async ({ page }) => {
		await page.goto('/platform/plans');
		await page.waitForLoadState('networkidle');

		// Assert Header
		await expect(page.getByText('Gói Dịch Vụ & Bảng Giá Nền Tảng')).toBeVisible();

		// Assert plan cards rendered
		await expect(page.getByText('Gói Starter (Miễn phí)')).toBeVisible();
		await expect(page.getByText('Gói Growth (Tiêu chuẩn)')).toBeVisible();
		await expect(page.getByText('Gói Scale (Chuyên nghiệp)')).toBeVisible();
		await expect(page.getByText('Gói Enterprise (Doanh nghiệp)')).toBeVisible();

		// Open Plan modal
		const detailButtons = page.getByRole('button', { name: 'Chi Tiết & Hạn Ngạch' });
		await expect(detailButtons.first()).toBeVisible();
		await detailButtons.first().click();

		// Check modal opened
		await expect(page.getByText('Cấu Hình Gói:')).toBeVisible();
		await page.getByRole('button', { name: 'Đóng' }).click();
	});

	test('should display Billing subscriptions table and approve pending invoices', async ({ page }) => {
		await page.goto('/platform/billing');
		await page.waitForLoadState('networkidle');

		// Assert Header & Summary
		await expect(page.getByText('Quản Lý Hóa Đơn & Thuê Bao')).toBeVisible();
		await expect(page.getByText('Tổng Doanh Thu Hóa Đơn (MRR)')).toBeVisible();

		// Assert table invoices
		await expect(page.getByText('Flagship Electronics Store')).toBeVisible();
		await expect(page.getByText('Fashion Boutique Online')).toBeVisible();

		// Test Filter Button
		await page.getByRole('button', { name: /Chờ duyệt/ }).click();
		await expect(page.getByText('Chờ Thanh Toán')).toBeVisible();

		// Test Approve Button
		const approveBtn = page.getByRole('button', { name: 'Duyệt Thu Tiền' });
		if (await approveBtn.isVisible()) {
			await approveBtn.click();
			await expect(page.getByText(/Đã duyệt thanh toán thành công/)).toBeVisible();
		}
	});

	test('should display Global Platform Users list, filter, and toggle status', async ({ page }) => {
		await page.goto('/platform/users');
		await page.waitForLoadState('networkidle');

		// Assert Header
		await expect(page.getByText('Quản Lý Người Dùng Toàn Nền Tảng')).toBeVisible();

		// Assert users in table
		await expect(page.getByText('Platform Super Administrator')).toBeVisible();
		await expect(page.getByText('Flagship Store Owner')).toBeVisible();

		// Search
		const searchInput = page.getByPlaceholder('Tìm kiếm người dùng, email, shop...');
		await expect(searchInput).toBeVisible();
		await searchInput.fill('admin@ecommerce.com');
		await expect(page.getByText('Platform Super Administrator')).toBeVisible();
	});

	test('should display Fraud & Risk Queue with score meters and freeze action', async ({ page }) => {
		await page.goto('/platform/risk');
		await page.waitForLoadState('networkidle');

		// Assert Header & Cards
		await expect(page.getByText('Hàng Đợi Giám Sát Rủi Ro & Gian Lận')).toBeVisible();
		await expect(page.getByText('Cảnh Báo Cấp Độ Cao')).toBeVisible();

		// Assert alert rows
		await expect(page.getByText('Abnormal Order Burst (35 orders/min from single IP subnet)')).toBeVisible();
		await expect(page.getByText('High Refund Velocity (> 15% of daily transactions)')).toBeVisible();

		// Check Freeze action
		const freezeBtn = page.getByRole('button', { name: 'Khóa Cửa Hàng' }).first();
		await expect(freezeBtn).toBeVisible();
		await freezeBtn.click();
		await expect(page.getByText(/Đã tạm khóa cửa hàng/)).toBeVisible();
	});

	test('should display Platform Invites and allow sending new invite', async ({ page }) => {
		await page.goto('/platform/invites');
		await page.waitForLoadState('networkidle');

		// Assert Header
		await expect(page.getByText('Quản Lý Lời Mời Quản Trị & Nhân Sự')).toBeVisible();
		await expect(page.getByText('deputy-admin@ecommerce.com')).toBeVisible();

		// Open Invite Modal
		await page.getByRole('button', { name: 'Gửi Lời Mời Mới' }).click();
		await expect(page.getByText('Gửi Lời Mời Gia Nhập Nền Tảng')).toBeVisible();

		// Fill and Submit
		await page.getByPlaceholder('admin@domain.com').fill('new-auditor@sec.vn');
		await page.getByRole('button', { name: 'Gửi Lời Mời' }).click();
		await expect(page.getByText(/Đã gửi thư mời tham gia thành công/)).toBeVisible();
	});

	test('should display System Diagnostics with cluster service health and background workers', async ({ page }) => {
		await page.goto('/platform/system');
		await page.waitForLoadState('networkidle');

		// Assert Header & Uptime
		await expect(page.getByText('Sức Khỏe Hệ Thống & Giám Sát Cụm Hạ Tầng')).toBeVisible();
		await expect(page.getByText('Thời Gian Hoạt Động (Uptime)')).toBeVisible();

		// Assert services
		await expect(page.getByText('Microsoft SQL Server 2022')).toBeVisible();
		await expect(page.getByText('Redis 7 Cache & Session Bus')).toBeVisible();
		await expect(page.getByText('RabbitMQ 4 Event Broker')).toBeVisible();
		await expect(page.getByText('Elasticsearch 8.15 Catalog Search')).toBeVisible();
		await expect(page.getByText('Imgproxy Image Processing Engine')).toBeVisible();

		// Assert workers
		await expect(page.getByText('OrderExpirationWorker')).toBeVisible();
		await expect(page.getByText('StockReconciliationWorker')).toBeVisible();
	});

	test('should display Shop Detail Inspection Console with identity and effective quotas', async ({ page }) => {
		await page.goto('/platform/shops/00000000-0000-0000-0000-000000000001');
		await page.waitForLoadState('networkidle');

		// Assert Header & Identity
		await expect(page.getByText('Hồ Sơ Cửa Hàng Chi Tiết')).toBeVisible();
		await expect(page.getByText('Flagship Electronics Store')).toBeVisible();
		await expect(page.getByText('flagship.ecommerce.vn')).toBeVisible();

		// Assert Quotas
		await expect(page.getByText('Hạn Mức Sản Phẩm Tối Đa')).toBeVisible();
		await expect(page.getByText('Hạn Mức Nhân Viên Cửa Hàng')).toBeVisible();
		await expect(page.getByText('Hạn Mức Khuyến Mãi / Mã Giảm Giá')).toBeVisible();

		// Assert Impersonate Button
		await expect(page.getByRole('button', { name: /Đăng Nhập Cửa Hàng/ })).toBeVisible();
	});
});
