import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
	readonly productsTable: Locator;

	constructor(page: Page) {
		super(page, '/apps/e-commerce/products');
		this.productsTable = page.locator('table');
	}

	async verifyLoaded() {
		await expect(this.productsTable).toBeVisible({ timeout: 15000 });
	}

	async searchProduct(name: string) {
		const searchInput = this.page.locator('input[placeholder*="Search"]').first();
		if (await searchInput.isVisible()) {
			await searchInput.fill(name);
			await this.page.waitForTimeout(500);
		}
	}
}
