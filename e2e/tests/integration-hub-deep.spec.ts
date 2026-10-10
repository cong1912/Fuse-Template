import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Enterprise Integration Hub & Multi-Tenant Webhooks / Omnichannel Sync', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('Complete verification of Integration Hub tabs, Webhooks, n8n, Omnichannel, and Payments', async ({ page }) => {
		// Set full HD viewport
		await page.setViewportSize({ width: 1440, height: 900 });

		// 1. Navigate to Integrations Page
		await page.goto('/settings/integrations');

		// 2. Verify Page Header & KPI Cards
		await expect(page.getByText('Trung Tâm Tích Hợp & Kết Nối Đa Kênh')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Enterprise Hub')).toBeVisible();
		await expect(page.getByText('Outbound Webhooks')).toBeVisible();
		await expect(page.getByText('Đồng Bộ Sàn TMĐT')).toBeVisible();
		await expect(page.getByText('n8n Automation Hub')).toBeVisible();
		await expect(page.getByText('Cổng Thanh Toán & Ship')).toBeVisible();

		// Capture screenshot of Tab 0: Webhooks Hub
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_integration_01_webhooks_hub.png',
			fullPage: true
		});

		// 3. Open "Đăng Ký Webhook Doanh Nghiệp Mới" Dialog
		const addWebhookBtn = page.getByTestId('add-webhook-btn');
		await expect(addWebhookBtn).toBeVisible();
		await addWebhookBtn.click();

		const registerDialog = page.getByTestId('register-webhook-dialog');
		await expect(registerDialog).toBeVisible();
		await expect(registerDialog.getByText('Đăng Ký Webhook Doanh Nghiệp Mới')).toBeVisible();

		// Check Secret Key Auto-generation
		const secretInput = page.getByTestId('new-webhook-secret');
		await expect(secretInput).toBeVisible();
		const initialSecret = await secretInput.inputValue();
		expect(initialSecret).toContain('whsec_');
		expect(initialSecret.length).toBeGreaterThanOrEqual(20);

		// Click "Tự sinh mã bảo mật ngẫu nhiên"
		const generateSecretBtn = page.getByTestId('generate-secret-btn');
		await generateSecretBtn.click();
		const regeneratedSecret = await secretInput.inputValue();
		expect(regeneratedSecret).toContain('whsec_');

		// Click "Sao chép" button
		const copySecretBtn = page.getByTestId('copy-secret-btn');
		await copySecretBtn.click();

		// Fill Target URL
		const urlInput = page.getByTestId('new-webhook-url');
		await urlInput.fill('https://erp.myshop.vn/api/orders/webhook');

		// Toggle an event
		const eventCheck = page.getByTestId('event-check-risk.alert_detected');
		await eventCheck.click();

		// Capture screenshot of Register Webhook Dialog
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_integration_02_register_modal.png'
		});

		// Submit Registration
		const submitRegisterBtn = page.getByTestId('submit-register-webhook-btn');
		await submitRegisterBtn.click();

		// Verify Dialog Closed and Table has the webhook
		await expect(registerDialog).not.toBeVisible();
		await expect(page.getByText('erp.myshop.vn').first()).toBeVisible({ timeout: 10000 });

		// 4. Test Ping Webhook
		const pingBtn = page.locator('[data-testid^="ping-webhook-"]').first();
		await expect(pingBtn).toBeVisible();
		await pingBtn.click();
		await expect(page.getByTestId('ping-result-alert')).toBeVisible({ timeout: 10000 });

		// 5. Open Delivery History Logs Drawer
		const viewLogsBtn = page.locator('[data-testid^="view-logs-"]').first();
		await expect(viewLogsBtn).toBeVisible();
		await viewLogsBtn.click();

		const logsDrawer = page.getByTestId('delivery-logs-drawer');
		await expect(logsDrawer).toBeVisible();
		await expect(logsDrawer.getByText('Lịch Sử Phát Tin Webhook (Delivery Logs)')).toBeVisible();
		await expect(logsDrawer.getByText('orders.created').first()).toBeVisible();
		await expect(logsDrawer.getByText('Payload JSON đã gửi:').first()).toBeVisible();

		// Capture screenshot of Delivery Logs Drawer
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_integration_03_delivery_logs.png'
		});

		// Close Logs Drawer
		await page.keyboard.press('Escape');
		await expect(logsDrawer).not.toBeVisible();

		// 6. Switch to Tab 1: n8n Workflow Hub
		const n8nTab = page.getByTestId('tab-n8n');
		await n8nTab.click();
		await expect(page.getByText('n8n Workflow Automation Hub')).toBeVisible();
		await expect(page.getByTestId('n8n-webhook-url')).toBeVisible();

		// Click "Gửi Webhook Thử Nghiệm (Test Ping)"
		const testN8nPingBtn = page.getByTestId('test-n8n-ping-btn');
		await testN8nPingBtn.click();
		await expect(page.getByTestId('n8n-ping-result')).toBeVisible({ timeout: 10000 });

		// Click "Lưu Cấu Hình n8n"
		const saveN8nBtn = page.getByTestId('save-n8n-btn');
		await saveN8nBtn.click();

		// Capture screenshot of n8n Tab
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_integration_04_n8n_hub.png',
			fullPage: true
		});

		// 7. Switch to Tab 2: Omnichannel Sync (TikTok Shop, Shopee, POS)
		const omnichannelTab = page.getByTestId('tab-omnichannel');
		await omnichannelTab.click();
		await expect(page.getByText('Đồng Bộ Bán Hàng Đa Kênh Tự Động')).toBeVisible();
		await expect(page.getByText('TikTok Shop OpenAPI')).toBeVisible();
		await expect(page.getByText('Shopee Open Platform')).toBeVisible();
		await expect(page.getByText('Máy Quét Mã Vạch & Bán Hàng Trực Tiếp Tại Quầy')).toBeVisible();

		// Click "Đồng Bộ Ngay" on TikTok
		const syncTikTokBtn = page.getByTestId('sync-tiktok-btn');
		await syncTikTokBtn.click();
		await expect(page.getByText('Đã đồng bộ thành công 28 đơn hàng mới')).toBeVisible({ timeout: 10000 });

		// Click "Lưu Cấu Hình TikTok"
		const saveTikTokBtn = page.getByTestId('save-tiktok-btn');
		await saveTikTokBtn.click();

		// Click "Lưu Cấu Hình Shopee"
		const saveShopeeBtn = page.getByTestId('save-shopee-btn');
		await saveShopeeBtn.click();

		// Click "Lưu Cấu Hình POS"
		const savePosBtn = page.getByTestId('save-pos-btn');
		await savePosBtn.click();

		// Capture screenshot of Omnichannel Sync Tab
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_integration_05_omnichannel_sync.png',
			fullPage: true
		});

		// 8. Switch to Tab 3: Payment & Shipping
		const paymentsTab = page.getByTestId('tab-payments');
		await paymentsTab.click();
		await expect(page.getByText('Cổng Thanh Toán VNPay')).toBeVisible();
		await expect(page.getByText('VietQR Pro (Mã QR Tĩnh & Động)')).toBeVisible();
		await expect(page.getByText('Giao Hàng Nhanh (GHN Express)')).toBeVisible();
		await expect(page.getByText('Giao Hàng Tiết Kiệm (GHTK)')).toBeVisible();

		// Save VNPay
		const saveVnpayBtn = page.getByTestId('save-vnpay-btn');
		await saveVnpayBtn.click();

		// Save VietQR
		const saveVietqrBtn = page.getByTestId('save-vietqr-btn');
		await saveVietqrBtn.click();

		// Capture screenshot of Payment & Shipping Tab
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_integration_06_payments_and_shipping.png',
			fullPage: true
		});
	});
});
