import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Multi-Role Navigation, AI Dashboard & n8n Automation Suite', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('1. SuperAdmin Navigation & Impersonation into Shop hides Platform menu', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to platform shops
		await page.goto('/platform/shops');
		await page.waitForLoadState('networkidle');
		await expect(page.getByText('Flagship Electronics Store')).toBeVisible({ timeout: 15000 });

		// SuperAdmin sees Platform group in navigation
		await expect(page.getByText('Hệ thống/Platform').first()).toBeVisible();

		// Click "Login as Shop" to impersonate Flagship Electronics Store
		const impersonateBtn = page.getByRole('button', { name: /Login as Shop/i }).first();
		await impersonateBtn.click();

		// Impersonation Banner should be active
		await expect(page.getByText(/IMPERSONATION ACTIVE/i)).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/Flagship Electronics Store/i).first()).toBeVisible();

		// Under shop impersonation (admin role), Platform management group MUST be hidden
		await expect(page.getByText('Hệ thống/Platform')).not.toBeVisible();

		// Exit impersonation to restore SuperAdmin context
		const exitBtn = page.getByRole('button', { name: /Exit Impersonation/i });
		await expect(exitBtn).toBeVisible();
		await exitBtn.click();

		await expect(page).toHaveURL(/\/platform\/shops/, { timeout: 15000 });
		await expect(page.getByText('Hệ thống/Platform').first()).toBeVisible();
	});

	test('2. Analytics Dashboard renders AI Executive Insights Card & Opens Copilot', async ({ page }) => {
		await setupApiMocks(page);

		// Go to Analytics Dashboard
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Verify AI Executive Decision Center is visible
		await expect(page.getByText(/AI Executive Decision Center/i)).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/Cảnh Báo Chuỗi Cung Ứng/i)).toBeVisible();
		await expect(page.getByText(/Khách Hàng & Giữ Chân \(RFM\)/i)).toBeVisible();
		await expect(page.getByText(/Đề Xuất Tăng Trưởng/i)).toBeVisible();

		// Verify Low stock items from AI query are listed
		await expect(page.getByText('MacBook Pro 16 M3 Max').first()).toBeVisible();

		// Click "Hỏi AI Copilot" button from the card
		const copilotBtn = page.getByTestId('open-copilot-from-card');
		await expect(copilotBtn).toBeVisible();
		await copilotBtn.click();

		// Verify Drawer opens
		await expect(page.getByRole('heading', { name: /Enterprise AI Copilot/i })).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(/Semantic Kernel/i).first()).toBeVisible();

		// Verify suggested prompt pills exist
		await expect(page.getByText(/Phân tích doanh số/i).first()).toBeVisible();

		// Send a prompt to AI Copilot
		const inputField = page.getByTestId('ai-copilot-input');
		await inputField.fill('Sản phẩm nào nguy cấp sắp hết hàng cần bổ sung?');
		await page.getByTestId('ai-copilot-send-btn').click();

		// Wait for AI response bubble and Generative UI action card
		await expect(page.getByTestId('copilot-action-card-btn').first()).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(/Cảnh Báo & Điều Phối Kho Hàng/i).first()).toBeVisible();

		// Close Copilot Drawer
		await page.getByTestId('close-ai-copilot-drawer').click();
	});

	test('3. n8n Workflow Automation Hub - Configure & Trigger HMAC Test Ping', async ({ page }) => {
		await setupApiMocks(page);

		// Go to Integrations Settings
		await page.goto('/settings/integrations');
		await page.waitForLoadState('networkidle');

		// Verify n8n Workflow Automation Hub Card
		await expect(page.getByText(/n8n Workflow Automation Hub/i)).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/Tự động hóa luồng nghiệp vụ E-Commerce/i)).toBeVisible();

		// Verify inputs
		const urlInput = page.getByTestId('n8n-webhook-url');
		await expect(urlInput).toBeVisible();
		const secretInput = page.getByTestId('n8n-secret-key');
		await expect(secretInput).toBeVisible();

		// Trigger "Gửi Webhook Thử Nghiệm (Test Ping)"
		const testPingBtn = page.getByTestId('test-n8n-ping-btn');
		await expect(testPingBtn).toBeVisible();
		await testPingBtn.click();

		// Verify Ping Result Box with HMAC signature
		await expect(page.getByTestId('n8n-ping-result')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(/Webhook kết nối n8n thành công/i)).toBeVisible();
		await expect(page.getByText(/Chữ ký: sha256=/i)).toBeVisible();

		// Save configuration
		const saveBtn = page.getByTestId('save-n8n-btn');
		await expect(saveBtn).toBeVisible();
		await saveBtn.click();

		// Verify success alert
		await expect(page.getByText(/Lưu cấu hình n8n Workflow Automation thành công/i)).toBeVisible({ timeout: 10000 });
	});
});
