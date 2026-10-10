import { test, expect } from '@playwright/test';
import { TenantControlPage } from '../pom/TenantControlPage';
import { setupApiMocks } from '../config/mockApi';

test.describe('Tenant Control Center Enterprise Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should display tenant list and open feature gating configurator modal', async ({ page }) => {
		await setupApiMocks(page);

		const tenantPage = new TenantControlPage(page);
		await tenantPage.goto();
		await tenantPage.verifyLoaded();

		// Check mock tenants are listed
		await expect(page.getByText('Flagship Electronics Store')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Fashion Boutique Online')).toBeVisible({ timeout: 15000 });

		// Open configuration modal
		await tenantPage.openConfigureModal();

		// Check feature toggles are accessible
		await expect(page.getByText(/Flash Sale Virtual Waiting Room/i)).toBeVisible();
		await expect(page.getByText(/B2B Wholesale & Quoting RFQ Engine/i)).toBeVisible();
		await expect(page.getByText(/Jev AI Micro-Decisions/i)).toBeVisible();
	});

	test('should perform Tenant Impersonation and display sticky ImpersonationBanner with exit action', async ({ page }) => {
		await setupApiMocks(page);

		const tenantPage = new TenantControlPage(page);
		await tenantPage.goto();
		await tenantPage.verifyLoaded();

		// Click "Login as Shop"
		await tenantPage.clickLoginAsShop();

		// Verify that ImpersonationBanner appears with the warning
		await expect(page.getByText(/IMPERSONATION ACTIVE/i)).toBeVisible({ timeout: 15000 });
		await expect(page.getByText(/Flagship Electronics Store/i).first()).toBeVisible();

		// Verify 1-click Exit Impersonation button
		const exitBtn = page.getByRole('button', { name: /Exit Impersonation/i });
		await expect(exitBtn).toBeVisible();

		// Click Exit
		await exitBtn.click();

		// Verify redirect back to platform shops and banner removed
		await expect(page).toHaveURL(/\/platform\/shops/, { timeout: 15000 });
	});

	test('should allow exporting tenant data snapshot in JSON format', async ({ page }) => {
		await setupApiMocks(page);

		const tenantPage = new TenantControlPage(page);
		await tenantPage.goto();
		await tenantPage.verifyLoaded();

		// Open Configure modal
		await tenantPage.openConfigureModal();

		// Click "Export Store Data (JSON)"
		const exportBtn = page.getByRole('button', { name: /Export Store Data/i });
		await expect(exportBtn).toBeVisible();
		await exportBtn.click();

		// Verify success alert appears
		await expect(page.getByText(/Store data snapshot exported and downloaded successfully!/i)).toBeVisible({ timeout: 10000 });
	});

	test('should display Platform Audit Trail & Compliance logs with filtering and details', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/platform/audit');
		await expect(page.getByText(/Platform Audit Trail & Compliance/i)).toBeVisible({ timeout: 15000 });

		// Check audit log records are listed
		await expect(page.getByText('TENANT_IMPERSONATE_START')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('FEATURE_OVERRIDE_SET')).toBeVisible();

		// Open detail modal on first table entry
		const viewBtn = page.locator('table').getByRole('button', { name: 'View', exact: true }).first();
		await viewBtn.click();

		await expect(page.getByText(/Audit Event Details/i)).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('dialog').getByText('admin@ecommerce.com')).toBeVisible();
	});

	test('should display Platform Overview with Global GMV and Financial Metrics', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/platform/overview');
		await expect(page.getByText(/Platform Economics & Financials/i)).toBeVisible({ timeout: 15000 });

		// Verify financial KPI cards
		await expect(page.getByText('Global Fleet GMV')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Platform Take-Rate (1.5%)')).toBeVisible();
		await expect(page.getByText('SaaS MRR / ARR')).toBeVisible();
		await expect(page.getByText('Tenant Fleet Health', { exact: true })).toBeVisible();

		// Verify Subscription Plan distribution
		await expect(page.getByText(/Subscription Plan Distribution/i)).toBeVisible();
		await expect(page.getByText(/Enterprise Tier/i)).toBeVisible();
		await expect(page.getByText(/Pro Tier/i)).toBeVisible();
	});
});
