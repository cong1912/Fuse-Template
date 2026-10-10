import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('Multi-Tenant Visibility, Multi-Type Products & Calendar Booking Suite', () => {

	test('1. Super Admin: Products Table Multi-Tenant Column, Badges & Tenant Filter', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Super Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Navigate to Products
		await page.goto('/apps/e-commerce/products');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Verify "Gian hàng (Tenant)" column header
		const tenantCol = page.locator('th').filter({ hasText: /Gian hàng \(Tenant\)/i });
		await expect(tenantCol).toBeVisible({ timeout: 10000 });

		// Verify Tenant filter dropdown exists
		const tenantFilter = page.locator('text=Bộ lọc Gian hàng (Super Admin):');
		await expect(tenantFilter).toBeVisible({ timeout: 10000 });

		// Verify Product Type column header exists
		const typeCol = page.locator('th').filter({ hasText: /Loại SP/i });
		await expect(typeCol).toBeVisible({ timeout: 10000 });

		// Capture screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '01_products_multitenant_superadmin.png'),
			fullPage: true
		});
	});

	test('2. Super Admin: Orders Table Multi-Tenant Column & Filter', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login as Super Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Navigate to Orders
		await page.goto('/apps/e-commerce/orders');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Verify "Gian hàng (Tenant)" column header
		const tenantCol = page.locator('th').filter({ hasText: /Gian hàng \(Tenant\)/i });
		await expect(tenantCol).toBeVisible({ timeout: 10000 });

		// Verify Tenant filter dropdown exists
		const tenantFilter = page.locator('text=Bộ lọc Gian hàng (Super Admin):');
		await expect(tenantFilter).toBeVisible({ timeout: 10000 });

		// Capture screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '02_orders_multitenant_superadmin.png'),
			fullPage: true
		});
	});

	test('3. Multi-Type Products: Digital & Serial Key Dynamic Tabs', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Navigate to New Product page
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Fill name
		await page.locator('input[name="name"]').fill('Khóa học lập trình Fullstack React & .NET (E-Book & Video)');

		// Select Digital Product Card ("Tệp Tin / Tài Liệu PDF")
		const digitalCard = page.locator('text=Tệp Tin / Tài Liệu PDF').first();
		await expect(digitalCard).toBeVisible({ timeout: 10000 });
		await digitalCard.click();
		await page.waitForTimeout(600);

		// Verify dynamic tab "Tệp Tin & Tải Về" is rendered
		const digitalTab = page.getByRole('tab', { name: /Tệp Tin & Tải Về/i });
		await expect(digitalTab).toBeVisible({ timeout: 5000 });
		await digitalTab.click();
		await page.waitForTimeout(600);

		// Click "Gán Link PDF Mẫu"
		const samplePdfBtn = page.getByRole('button', { name: /Gán Link PDF Mẫu/i });
		await expect(samplePdfBtn).toBeVisible({ timeout: 5000 });
		await samplePdfBtn.click();
		await page.waitForTimeout(500);

		// Verify and click "Xem Trước PDF" button
		const previewPdfBtn = page.getByRole('button', { name: /Xem Trước PDF/i });
		await expect(previewPdfBtn).toBeVisible({ timeout: 5000 });
		await previewPdfBtn.click();
		await page.waitForTimeout(600);

		// Capture PDF Preview dialog screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '03_digital_product_tab_preview.png'),
			fullPage: false
		});

		// Close dialog
		await page.getByRole('button', { name: /Đóng/i }).click();
		await page.waitForTimeout(400);

		// Now test Serial Key Card
		const basicInfoTab = page.getByRole('tab', { name: /Thông Tin & Giá Bán/i });
		await basicInfoTab.click();
		await page.waitForTimeout(500);

		const serialCard = page.locator('text=Tài Khoản & Serial Key').first();
		await expect(serialCard).toBeVisible({ timeout: 10000 });
		await serialCard.click();
		await page.waitForTimeout(600);

		// Verify dynamic tab "Kho Tài Khoản & Serial Key" appears
		const serialTab = page.getByRole('tab', { name: /Kho Tài Khoản & Serial Key/i });
		await expect(serialTab).toBeVisible({ timeout: 5000 });
		await serialTab.click();
		await page.waitForTimeout(600);

		// Add a single key
		const keyInput = page.locator('input[placeholder*="netflix_pro@mail.com"]').first();
		await keyInput.fill('VIP-NETFLIX-4K-ACCOUNT-2026:SecurePass999');
		await page.getByRole('button', { name: /Thêm Key/i }).click();
		await page.waitForTimeout(500);

		// Toggle secret key visibility
		const toggleKeyBtn = page.getByRole('button', { name: /Hiển Thị Mã Đầy Đủ/i });
		await expect(toggleKeyBtn).toBeVisible({ timeout: 5000 });
		await toggleKeyBtn.click();
		await page.waitForTimeout(400);

		// Capture screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '04_serial_key_product_tab.png'),
			fullPage: false
		});
	});

	test('4. Universal Booking Calendar: Views, Appointments, Booking Dialog', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// Login
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Navigate to Calendar
		await page.goto('/apps/calendar');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Verify Calendar Header & Title
		const calendarHeader = page.locator('h5').filter({ hasText: /Lịch Hẹn & Đặt Chỗ/i });
		await expect(calendarHeader).toBeVisible({ timeout: 10000 });

		// Verify Seeded Event is visible on calendar
		const eventEl = page.locator('.fc-event').first();
		await expect(eventEl).toBeVisible({ timeout: 10000 });

		// Capture Month View screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '05_calendar_month_view.png'),
			fullPage: true
		});

		// Click the event to view details modal
		await eventEl.click();
		await page.waitForTimeout(600);

		// Verify Details Dialog is open
		const detailsDialog = page.getByRole('dialog');
		await expect(detailsDialog).toBeVisible({ timeout: 5000 });

		// Capture Details Dialog screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '06_calendar_event_details_modal.png'),
			fullPage: false
		});

		// Close details dialog
		await page.getByRole('button', { name: /Đóng/i }).click();
		await page.waitForTimeout(400);

		// Click "Đặt Lịch Mới" button
		const newBookingBtn = page.getByRole('button', { name: /Đặt Lịch Mới/i });
		await newBookingBtn.click();
		await page.waitForTimeout(500);

		// Fill in new appointment
		await page.locator('input[placeholder*="Giao máy giặt"]').fill('Giao dàn âm thanh Sony HT-A9 & Cân chỉnh âm học');
		await page.locator('input[placeholder="Nguyễn Văn A"]').fill('Lê Minh Trí');
		await page.locator('input[placeholder="0988 xxx xxx"]').fill('0909 112 233');
		await page.locator('input[placeholder*="Số nhà"]').fill('Penthouse P02, Toà The Metropole, TP. Thủ Đức');

		// Click "Xác Nhận Đặt Lịch"
		const confirmBtn = page.getByRole('button', { name: /Xác Nhận Đặt Lịch/i });
		await confirmBtn.click();
		await page.waitForTimeout(1000);

		// Verify dialog is closed and new booking title is visible on calendar
		await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
		const newCreatedEvent = page.locator('.fc-event').filter({ hasText: /Giao dàn âm thanh Sony HT-A9/i });
		await expect(newCreatedEvent).toBeVisible({ timeout: 10000 });

		// Capture final Calendar updated screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, '07_calendar_new_appointment_added.png'),
			fullPage: true
		});
	});

});
