import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
	readonly ordersTable: Locator;

	constructor(page: Page) {
		super(page, '/apps/e-commerce/orders');
		this.ordersTable = page.locator('table');
	}

	async verifyLoaded() {
		await expect(this.ordersTable).toBeVisible({ timeout: 15000 });
	}
}
