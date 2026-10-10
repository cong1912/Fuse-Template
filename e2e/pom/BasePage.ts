import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
	readonly page: Page;
	readonly url: string;

	constructor(page: Page, url: string = '') {
		this.page = page;
		this.url = url;
	}

	async goto() {
		await this.page.goto(this.url);
		await this.page.waitForLoadState('domcontentloaded');
	}

	async openSettingsPanel() {
		const cogButton = this.page.locator('#fuse-settings-panel .settingsButton');
		await cogButton.click();
		await expect(this.page.getByText('Theme Settings')).toBeVisible();
	}

	async openThemesPanel() {
		const paletteButton = this.page.locator('#fuse-settings-panel button').nth(1);
		await paletteButton.click();
		await expect(this.page.getByText(/Themes/i)).toBeVisible();
	}
}
