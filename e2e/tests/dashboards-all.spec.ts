import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Dashboards Complete Suite: Analytics, Project & Finance', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('1. Project Dashboard: Header, Overview and tab switching (Home, Team, Budget)', async ({ page }) => {
		await page.goto('/dashboards/project');

		// Check Header & Title
		await expect(page.getByText(/Welcome back/i).first()).toBeVisible({ timeout: 15000 });

		// Verify Home Tab content
		await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();

		// Switch to Team Tab
		await page.getByRole('tab', { name: 'Team' }).click();
		await expect(page.getByRole('tab', { name: 'Team' })).toHaveAttribute('aria-selected', 'true');

		// Switch to Budget Tab
		await page.getByRole('tab', { name: 'Budget' }).click();
		await expect(page.getByRole('tab', { name: 'Budget' })).toHaveAttribute('aria-selected', 'true');
	});

	test('2. Finance Dashboard: Account balance, metrics, and transactions overview', async ({ page }) => {
		await page.goto('/dashboards/finance');

		// Check Dashboard header / title
		await expect(page.getByText('Finance Dashboard').or(page.getByText('Financial Overview')).first()).toBeVisible({ timeout: 15000 });

		// Check account balance & current statement widgets
		await expect(page.getByText('Current Statement').or(page.getByText('Account Balance')).first()).toBeVisible();
		await expect(page.getByText('Recent Transactions').first()).toBeVisible();
	});
});
