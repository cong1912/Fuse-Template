import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
	readonly heading: Locator;
	readonly operationsActionCenter: Locator;
	readonly recentOrdersTable: Locator;
	readonly topProductsList: Locator;
	readonly visitorsChart: Locator;

	constructor(page: Page) {
		super(page, '/dashboards/analytics');
		this.heading = page.getByText(/Trung Tâm Điều Hành Bán Hàng|E-Commerce Command Center|Analytics dashboard/i);
		this.operationsActionCenter = page.getByText(/Trung Tâm Tác Vụ Vận Hành|Operations Action Center/i);
		this.recentOrdersTable = page.getByText(/Recent Orders/i);
		this.topProductsList = page.getByText(/Top Products/i);
		this.visitorsChart = page.getByText(/Visitors Overview/i);
	}

	async verifyLoaded() {
		await expect(this.heading).toBeVisible({ timeout: 15000 });
		await expect(this.operationsActionCenter).toBeVisible({ timeout: 15000 });
		await expect(this.recentOrdersTable).toBeVisible({ timeout: 15000 });
		await expect(this.topProductsList).toBeVisible({ timeout: 15000 });
	}

	async switchToAudienceTab() {
		const tab = this.page.getByRole('tab', { name: /Khách Hàng & Lưu Lượng|Audience & Traffic/i });
		await tab.click();
		await this.page.waitForTimeout(500);
	}
}

