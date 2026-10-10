import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';
import * as path from 'path';

test.describe('E-Commerce Product Image Upload, Rendering and Persistence E2E Suite', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('1. Product Image: Upload, Binary Rendering, Save, Reload Persistence & Table Thumbnail', async ({ page }) => {
		await setupApiMocks(page);

		// Step 1: Open Products Catalog
		await page.goto('/apps/e-commerce/products');
		await expect(page.getByText('MacBook Pro 16 M3 Max')).toBeVisible({ timeout: 15000 });

		// Step 2: Open product details
		await page.getByText('MacBook Pro 16 M3 Max').first().click();
		await page.waitForURL(/\/apps\/e-commerce\/products\/11111111-1111-1111-1111-111111111111/);
		await expect(page.getByText('MacBook Pro 16 M3 Max').first()).toBeVisible();

		// Step 3: Switch to "Product Images" Tab
		const imagesTab = page.getByRole('tab', { name: /thư viện ảnh|product images/i });
		await expect(imagesTab).toBeVisible();
		await imagesTab.click();

		// Count initial images
		const initialCount = await page.locator('.productImageItem').count();

		// Step 4: Upload a valid PNG image file
		const pngBuffer = Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			'base64'
		);
		const fileInput = page.locator('input#button-file');
		await fileInput.setInputFiles({
			name: 'macbook_test_image.png',
			mimeType: 'image/png',
			buffer: pngBuffer
		});

		// Step 5: Wait for new image item to appear in the gallery
		await expect(page.locator('.productImageItem')).toHaveCount(initialCount + 1, { timeout: 10000 });

		const newlyAddedImg = page.locator('.productImageItem img').last();
		await expect(newlyAddedImg).toBeVisible({ timeout: 10000 });

		// Step 6: Mathematically prove that the browser loaded real image pixels (not broken HTML 404)
		await expect
			.poll(
				async () => {
					return await newlyAddedImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
				},
				{ timeout: 10000 }
			)
			.toBe(true);

		// Step 7: Click Save in header to persist state
		const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
		if (await saveBtn.isEnabled()) {
			await saveBtn.click();
		}

		// Step 8: Reload page (F5) to verify database persistence across sessions
		await page.reload();
		await page.getByRole('tab', { name: /thư viện ảnh|product images/i }).click();

		await expect(page.locator('.productImageItem')).toHaveCount(initialCount + 1, { timeout: 10000 });
		const persistedImg = page.locator('.productImageItem img').last();
		await expect(persistedImg).toBeVisible();

		const isPersistedRendered = await persistedImg.evaluate(
			(el: HTMLImageElement) => el.complete && el.naturalWidth > 0
		);
		expect(isPersistedRendered).toBe(true);

		// Step 9: Return to catalog and verify thumbnail in products table
		await page.goto('/apps/e-commerce/products');
		await expect(page.getByText('MacBook Pro 16 M3 Max').first()).toBeVisible();

		const rowImg = page.locator('tr').filter({ hasText: 'MacBook Pro 16 M3 Max' }).locator('img');
		await expect(rowImg).toBeVisible();
		const isRowImgLoaded = await rowImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
		expect(isRowImgLoaded).toBe(true);

		// Capture visual verification artifact
		const screenshotPath = path.join(
			process.cwd(),
			'..',
			'c#',
			'e-commerce',
			'docs',
			'images',
			'product-image-verified.png'
		);
		await page.screenshot({ path: screenshotPath, fullPage: false });

		// Step 10: Delete image and verify clean removal
		await page.getByText('MacBook Pro 16 M3 Max').first().click();
		await page.getByRole('tab', { name: /thư viện ảnh|product images/i }).click();

		const deleteBtn = page.locator('.productImageItem').last().locator('.productImageDelete');
		await page.locator('.productImageItem').last().hover();
		await deleteBtn.click();

		await expect(page.locator('.productImageItem')).toHaveCount(initialCount, { timeout: 10000 });
	});
});
