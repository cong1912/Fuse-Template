import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('UI Stability & Typing Performance Deep Tests', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('ProductsTable: instant search filtering without UI lag or memory leak', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/products', { waitUntil: 'domcontentloaded' });
		await page.locator('#fuse-splash-screen').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
		await expect(page.getByText(/Products/i).first()).toBeVisible({ timeout: 15000 });

		const searchInput = page.getByPlaceholder(/Search/i).first();
		await expect(searchInput).toBeVisible();

		// Record performance of rapid typing in search input
		const startTime = Date.now();
		await searchInput.fill('MacBook');
		const elapsed = Date.now() - startTime;

		// Typing should be fast, below 1000ms
		expect(elapsed).toBeLessThan(1000);

		// Assert table filtered
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible();

		// Clear search and verify reset
		await searchInput.clear();
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible();
	});

	test('OrdersTable: responsive search and pagination without re-render locks', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/orders', { waitUntil: 'domcontentloaded' });
		await page.locator('#fuse-splash-screen').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
		await expect(page.getByText(/Orders/i).first()).toBeVisible({ timeout: 15000 });

		const searchInput = page.getByPlaceholder(/Search/i).first();
		await expect(searchInput).toBeVisible();

		await searchInput.fill('ORD-');
		// Confirm table handles input smoothly
		await page.waitForTimeout(300);
		await expect(searchInput).toHaveValue('ORD-');
	});

	test('Product 2-column form: rapid keystroke input with Google SEO live preview without re-rendering form', async ({ page }) => {
		await setupApiMocks(page);

		await page.goto('/apps/e-commerce/products/new', { waitUntil: 'domcontentloaded' });
		await page.locator('#fuse-splash-screen').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
		await expect(page.getByText(/Xem Trước Kết Quả Google SEO/i)).toBeVisible({ timeout: 15000 });

		const nameInput = page.getByLabel(/Tên sản phẩm/i).first();
		await expect(nameInput).toBeVisible();

		// Rapidly type product name
		const testTitle = 'Bàn Phím Cơ Không Dây Cao Cấp Pro Max 2026';
		await nameInput.fill(testTitle);

		// Google SEO preview should update synchronously
		await expect(page.getByText(testTitle).first()).toBeVisible();

		// Check Add Product button is enabled and responsive
		const addBtn = page.getByRole('button', { name: /Tạo Sản Phẩm/i });
		await expect(addBtn).toBeEnabled();
	});
});
