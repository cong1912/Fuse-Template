import { test } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Capture Domain & Subdomain Management Screenshots', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('capture merchant domain page, platform domains hub, and custom giup modal', async ({ page }) => {
		await setupApiMocks(page);

		const targetDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

		// 1. Merchant Domain Settings Page
		await page.goto('/settings/domain');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/41_merchant_domain_settings.png`, fullPage: true });

		// 2. Platform Domains Control Center
		await page.goto('/platform/domains');
		await page.waitForLoadState('networkidle');
		const navDomainItem = page.getByRole('button', { name: /Quản lý Tên miền/i });
		if (await navDomainItem.count() > 0) {
			await navDomainItem.scrollIntoViewIfNeeded();
		}
		await page.waitForTimeout(600);
		await page.screenshot({ path: `${targetDir}/42_superadmin_platform_domains_hub.png`, fullPage: true });

		// 3. SuperAdmin "Custom Giúp" Modal
		const techGadgetsRow = page.getByRole('row', { name: /Tech Gadgets HCM/i });
		const customGiupBtn = techGadgetsRow.getByRole('button', { name: /Custom Giúp/i });
		await customGiupBtn.click();
		await page.waitForTimeout(400);
		await page.screenshot({ path: `${targetDir}/43_superadmin_custom_giup_modal.png`, fullPage: false });
	});
});
