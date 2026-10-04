import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
    readonly header: Locator;

    constructor(page: Page) {
        super(page, '/dashboards');
        this.header = page.getByRole('heading', { name: /Trang chủ|Dashboard/i });
    }

    async verifyLoaded() {
        // Assume successful login redirects to dashboard
        await expect(this.page).toHaveURL(/.*dashboards.*/);
    }
}
