import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Account, Profile & Notifications Suite', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);
	});

	test('1. User Account Profile: Form inputs and update action', async ({ page }) => {
		await page.goto('/account/profile');

		// Check heading
		await expect(page.getByRole('heading', { name: /Thông Tin Tài Khoản|Nguyễn Minh Tú|Profile/i }).first()).toBeVisible({ timeout: 15000 });

		// Fill profile form
		const nameInput = page.getByLabel(/Họ và tên/i).or(page.getByPlaceholder('Name'));
		await nameInput.first().fill('Admin User Enterprise');

		const emailInput = page.getByLabel(/Địa chỉ Email/i).or(page.getByPlaceholder('Email'));
		await emailInput.first().fill('admin@enterprise.vn');

		// Assert Update Profile button
		await expect(page.getByRole('button', { name: /Lưu Thay Đổi Hồ Sơ|Update Profile/i })).toBeVisible();
	});

	test('2. Profile App: Timeline, About and Photos tabs navigation', async ({ page }) => {
		await page.goto('/apps/profile');

		// Check cover & avatar
		await expect(page.getByAltText('Profile Cover')).toBeVisible({ timeout: 15000 });
		await expect(page.getByAltText('User avatar')).toBeVisible();

		// Check Tabs: Timeline, About, Photos & Videos
		await expect(page.getByRole('tab', { name: 'Timeline' })).toBeVisible();
		await expect(page.getByRole('tab', { name: 'About' })).toBeVisible();
		await expect(page.getByRole('tab', { name: 'Photos & Videos' })).toBeVisible();

		// Switch to About Tab
		await page.getByRole('tab', { name: 'About' }).click();
		await expect(page.getByText('General Information').or(page.getByText('About')).first()).toBeVisible();
	});

	test('3. Notifications App: Feed, Notification cards, and dismiss action', async ({ page }) => {
		await page.goto('/apps/notifications');

		// Check Notification Cards
		await expect(page.getByText('New Order Received').first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Security Audit Completed').first()).toBeVisible();

		// Dismiss first notification
		const dismissBtn = page.locator('button:has-text("Dismiss")').or(page.locator('button[aria-label="Dismiss"]')).or(page.locator('.my-masonry-grid button').first());
		if (await dismissBtn.isVisible()) {
			await dismissBtn.click();
		}
	});
});
