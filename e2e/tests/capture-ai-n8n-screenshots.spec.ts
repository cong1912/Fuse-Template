import { test } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Screenshot Capture Suite', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('Capture Screenshots for AI Dashboard, Copilot & n8n Automation Hub', async ({ page }) => {
		test.setTimeout(60000);
		await setupApiMocks(page);

		// 1. Analytics Dashboard with AI Executive Insights Card
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);
		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/23_ai_executive_insights_dashboard.png',
			fullPage: false
		});

		// 2. Open AI Copilot Drawer and send a prompt to show Agentic Action Card
		const copilotBtn = page.getByTestId('open-copilot-from-card');
		await copilotBtn.click();
		await page.waitForTimeout(500);

		const inputField = page.getByTestId('ai-copilot-input');
		await inputField.fill('Sản phẩm nào nguy cấp sắp hết hàng cần bổ sung?');
		await page.getByTestId('ai-copilot-send-btn').click();
		await page.waitForTimeout(1000);

		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/24_ai_copilot_drawer_agentic_ui.png',
			fullPage: false
		});

		// 3. n8n Workflow Automation Hub with Test Ping result
		await page.goto('/settings/integrations');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		const testPingBtn = page.getByTestId('test-n8n-ping-btn');
		await testPingBtn.click();
		await page.waitForTimeout(1000);

		await page.screenshot({
			path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/25_n8n_workflow_automation_hub.png',
			fullPage: false
		});
	});
});
