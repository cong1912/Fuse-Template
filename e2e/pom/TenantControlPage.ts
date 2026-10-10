import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TenantControlPage extends BasePage {
	readonly title: Locator;
	readonly tenantsTable: Locator;

	constructor(page: Page) {
		super(page, '/platform/shops');
		this.title = page.locator('header, main').getByText(/Super Admin Control Center/i).first();
		this.tenantsTable = page.locator('table');
	}

	async verifyLoaded() {
		await expect(this.title).toBeVisible({ timeout: 15000 });
		await expect(this.tenantsTable).toBeVisible({ timeout: 15000 });
	}

	async openConfigureModal() {
		const configureBtn = this.page.getByRole('button', { name: /Configure/i }).first();
		await configureBtn.click();
		await expect(this.page.getByText(/Configure Tenant/i)).toBeVisible({ timeout: 10000 });
	}

	async clickLoginAsShop() {
		const loginBtn = this.page.getByRole('button', { name: /Login as Shop/i }).first();
		await loginBtn.click();
	}
}
