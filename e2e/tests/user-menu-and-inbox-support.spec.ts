import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

test.describe('User Menu Dropdown & Live Support Helpdesk Suite', () => {

	test('1. Admin Persona: User Menu shows updated items, navigates to Profile and Helpdesk', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// 1. Login as Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1500);

		// 2. Open User Menu Dropdown in Header
		const userMenuBtn = page.locator('header').locator('button:has(img[alt="user photo"]), button:has(.MuiAvatar-root)').first();
		await expect(userMenuBtn).toBeVisible({ timeout: 10000 });
		await userMenuBtn.click();
		await page.waitForTimeout(600);

		// 3. Verify User Menu Items
		const profileMenuItem = page.locator('.MuiMenuItem-root').filter({ hasText: /Hồ sơ của tôi/i });
		await expect(profileMenuItem).toBeVisible();
		await expect(profileMenuItem).toContainText('Tài khoản & Gian hàng');

		const inboxMenuItem = page.locator('.MuiMenuItem-root').filter({ hasText: /Hộp thư & Hỗ trợ/i });
		await expect(inboxMenuItem).toBeVisible();
		await expect(inboxMenuItem).toContainText('Chat với Super Admin & Báo lỗi');

		const logoutMenuItem = page.locator('.MuiMenuItem-root').filter({ hasText: /Đăng xuất/i });
		await expect(logoutMenuItem).toBeVisible();

		// 4. Capture screenshot of updated User Menu Dropdown
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'user_menu_dropdown_updated.png'),
			fullPage: false
		});

		// 5. Click "Hồ sơ của tôi" and verify redirection to /account/profile
		await profileMenuItem.click();
		await expect(page).toHaveURL(/\/account\/profile/, { timeout: 10000 });
		await page.waitForLoadState('networkidle');

		// Verify Account Profile page loaded
		const profileHeading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /Hồ Sơ|Tài Khoản|Profile/i }).first();
		await expect(profileHeading).toBeVisible({ timeout: 10000 });

		// 6. Open User Menu again and click "Hộp thư & Hỗ trợ"
		const userMenuBtn2 = page.locator('header').locator('button:has(img[alt="user photo"]), button:has(.MuiAvatar-root)').first();
		await userMenuBtn2.click();
		await page.waitForTimeout(600);

		const inboxMenuItem2 = page.locator('.MuiMenuItem-root').filter({ hasText: /Hộp thư & Hỗ trợ/i });
		await expect(inboxMenuItem2).toBeVisible();
		await inboxMenuItem2.click();

		// Verify redirection to /apps/inbox
		await expect(page).toHaveURL(/\/apps\/inbox/, { timeout: 10000 });
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// 7. Verify SuperAdmin Helpdesk Hub UI
		const adminSupportTitle = page.locator('text=Hộp Thư & Hỗ Trợ Kỹ Thuật');
		await expect(adminSupportTitle).toBeVisible({ timeout: 15000 });

		// Capture screenshot of Admin Helpdesk Hub View
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'support_inbox_admin_helpdesk.png'),
			fullPage: true
		});
	});

	test('2. Customer Persona: Live Support 1:1 Chat with Super Admin & Bug Reporting', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// 1. Login as Customer
		await page.locator('input[type="email"]').fill('customer.test1@ecommerce.vn');
		await page.locator('input[type="password"]').fill('Password@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// Explicitly go to /account/profile where customer dashboard layout is ready
		await page.goto('/account/profile');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// 2. Open User Menu Dropdown in Header
		const userMenuBtn = page.locator('header').locator('button:has(img[alt="user photo"]), button:has(.MuiAvatar-root)').first();
		await expect(userMenuBtn).toBeVisible({ timeout: 10000 });
		await userMenuBtn.click();
		await page.waitForTimeout(600);

		// 3. Click "Hộp thư & Hỗ trợ"
		const inboxMenuItem = page.locator('.MuiMenuItem-root').filter({ hasText: /Hộp thư & Hỗ trợ/i });
		await expect(inboxMenuItem).toBeVisible();
		await inboxMenuItem.click();

		await expect(page).toHaveURL(/\/apps\/inbox/, { timeout: 10000 });
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// 4. Verify 1:1 Live Support UI
		const userSupportTitle = page.locator('text=Hộp Thư & Hỗ Trợ Kỹ Thuật');
		await expect(userSupportTitle.first()).toBeVisible({ timeout: 15000 });

		const supportRecipient = page.locator('text=Đội ngũ Vận hành & Hỗ trợ Hệ thống').first();
		await expect(supportRecipient).toBeVisible({ timeout: 10000 });

		// Capture screenshot of customer live support view
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'support_inbox_customer_view.png'),
			fullPage: true
		});

		// 5. Open Bug Report Modal ("Báo Lỗi Kỹ Thuật")
		const bugReportBtn = page.getByRole('button', { name: /Báo Lỗi Kỹ Thuật/i });
		await expect(bugReportBtn).toBeVisible();
		await bugReportBtn.click();
		await page.waitForTimeout(600);

		// Verify Bug Report Dialog
		const bugDialogTitle = page.locator('text=Báo Cáo Sự Cố Kỹ Thuật');
		await expect(bugDialogTitle.first()).toBeVisible();

		// Capture screenshot of Bug Report Modal
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'support_inbox_bug_report_modal.png'),
			fullPage: false
		});

		// 6. Submit a detailed Bug Report
		const bugDescInput = page.getByRole('textbox', { name: /Mô tả sự cố/i });
		await bugDescInput.fill('Kiểm tra tự động E2E: Tính năng báo lỗi trực tiếp gửi thông số môi trường cho Super Admin.');

		const submitBugBtn = page.getByRole('button', { name: /Gửi Báo Lỗi Ngay/i });
		await expect(submitBugBtn).toBeEnabled();
		await submitBugBtn.click();
		await page.waitForTimeout(1500);

		// Verify bug report message appears in the chat message stream
		const bugReportInChat = page.locator('text=[BÁO CÁO SỰ CỐ KỸ THUẬT]').first();
		await expect(bugReportInChat).toBeVisible({ timeout: 10000 });

		// 7. Send a regular chat message
		const messageInput = page.locator('[data-testid="chat-message-input"] textarea, [placeholder*="Nhập tin nhắn"]').first();
		await messageInput.fill('Xin chào đội ngũ Super Admin, tôi cần hỗ trợ kiểm tra trạng thái đơn hàng vừa đặt.');
		await page.locator('[data-testid="btn-send-message"]').click();
		await page.waitForTimeout(1500);

		// Verify customer message in chat stream
		const customerMsgInChat = page.locator('text=tôi cần hỗ trợ kiểm tra trạng thái đơn hàng vừa đặt').first();
		await expect(customerMsgInChat).toBeVisible({ timeout: 10000 });

		// Capture final chat conversation with bug report screenshot
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'support_inbox_customer_submitted.png'),
			fullPage: true
		});
	});

	test('3. Super Admin Persona: Views incoming ticket & conversation from customer', async ({ page }) => {
		await page.context().clearCookies();
		await page.goto('/sign-in');
		await page.waitForLoadState('networkidle');

		// 1. Login as Admin
		await page.locator('input[type="email"]').fill('admin@ecommerce.com');
		await page.locator('input[type="password"]').fill('Admin@123');
		await page.getByRole('button', { name: /Sign in/i }).click();

		await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
		await page.waitForLoadState('networkidle');

		// 2. Go to /apps/inbox
		await page.goto('/apps/inbox');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// 3. Assert conversation from customer is visible in left sidebar
		const conversationItem = page.locator('[data-testid="channel-item"]').first();
		await expect(conversationItem).toBeVisible({ timeout: 10000 });
		await conversationItem.click();
		await page.waitForTimeout(1000);

		// 4. Assert Bug Report and Messages are loaded in Admin conversation pane
		const bugReportInAdmin = page.locator('text=[BÁO CÁO SỰ CỐ KỸ THUẬT]').first();
		await expect(bugReportInAdmin).toBeVisible({ timeout: 10000 });

		// 5. Send Admin reply to resolve/help
		const adminInput = page.locator('[data-testid="chat-message-input"] textarea, [placeholder*="Nhập tin nhắn"]').first();
		await adminInput.fill('Chào bạn, Super Admin đã tiếp nhận thông tin sự cố và đang tiến hành xử lý!');
		await page.locator('[data-testid="btn-send-message"]').click();
		await page.waitForTimeout(1500);

		const adminReplyInChat = page.locator('text=Chào bạn, Super Admin đã tiếp nhận thông tin sự cố').first();
		await expect(adminReplyInChat).toBeVisible({ timeout: 10000 });

		// 6. Capture screenshot of Admin live conversation view
		await page.screenshot({
			path: path.join(SCREENSHOTS_DIR, 'support_inbox_admin_conversation.png'),
			fullPage: true
		});
	});
});
