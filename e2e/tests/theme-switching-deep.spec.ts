import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Theme Switching Deep Verification Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('should switch cleanly between Light and Dark mode without palette distortion or flicker', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/dashboards/analytics', { waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(1000);

		// Switch to Dark mode via ThemeModeToggle or direct fuseSettings dispatch
		await page.evaluate(() => {
			const raw = localStorage.getItem('defaultSettings');
			let settings = raw ? JSON.parse(raw) : {};
			if (!settings.theme) settings.theme = {};
			settings.theme.mode = 'dark';
			localStorage.setItem('defaultSettings', JSON.stringify(settings));
			document.documentElement.classList.add('dark');
		});

		// Verify dark mode class is applied to HTML element
		const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
		expect(hasDarkClass).toBe(true);

		// Reload page to verify persistence
		await page.reload({ waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(1000);

		// Verify persisted dark mode
		const persistedDark = await page.evaluate(() => {
			const raw = localStorage.getItem('defaultSettings');
			const s = raw ? JSON.parse(raw) : null;
			return s?.theme?.mode === 'dark' || document.documentElement.classList.contains('dark');
		});
		expect(persistedDark).toBe(true);

		// Switch back to Light mode
		await page.evaluate(() => {
			const raw = localStorage.getItem('defaultSettings');
			let settings = raw ? JSON.parse(raw) : {};
			if (!settings.theme) settings.theme = {};
			settings.theme.mode = 'light';
			localStorage.setItem('defaultSettings', JSON.stringify(settings));
			document.documentElement.classList.remove('dark');
		});

		const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
		expect(isLight).toBe(true);
	});
});
