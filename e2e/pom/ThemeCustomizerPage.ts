import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ThemeCustomizerPage extends BasePage {
	constructor(page: Page) {
		super(page, '/dashboards/analytics');
	}

	async openThemesPanel() {
		const paletteButton = this.page.locator('#fuse-settings-panel button').nth(1);
		await paletteButton.click();
		await expect(this.page.getByText('Theme Color Options')).toBeVisible({ timeout: 10000 });
	}

	async openSettingsPanel() {
		const cogButton = this.page.locator('#fuse-settings-panel .settingsButton');
		await cogButton.click();
		await expect(this.page.getByText('Theme Settings')).toBeVisible({ timeout: 10000 });
	}

	async selectTheme(themeId: string) {
		const themeOption = this.page.locator('div').filter({ hasText: new RegExp(`^${themeId}$`) }).locator('..').locator('button').first();
		if (await themeOption.isVisible()) {
			await themeOption.click();
		} else {
			// Fallback: click text directly or button near text
			await this.page.getByText(themeId, { exact: false }).first().click();
		}
	}

	async selectLayout(layoutLabel: string) {
		const radio = this.page.getByRole('radio', { name: new RegExp(layoutLabel, 'i') });
		await radio.click();
	}

	async closePanel() {
		await this.page.keyboard.press('Escape');
		await this.page.waitForTimeout(400);
	}
}
