import { test, expect } from '@playwright/test';

test.describe('Verify Digital (PDF) & Serial Key (Account) Product Creation UI & Backend', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	const targetDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

	test('01. Create Digital (PDF) Product with Inline Asset Setup & Preview', async ({ page }) => {
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');

		// 1. Select Digital product type
		const digitalOption = page.locator('text=Tệp Tin / Tài Liệu PDF').first();
		await expect(digitalOption).toBeVisible();
		await digitalOption.click();
		await page.waitForTimeout(600);

		// 2. Verify inline setup card appears on BasicInfoTab
		const inlineCardTitle = page.getByText(/Thiết Lập Tệp Tin & Tài Liệu PDF \(Digital Product Asset\)/i);
		await expect(inlineCardTitle).toBeVisible();

		// Verify unlimited stock badge
		await expect(page.getByText(/Tồn kho: Vô hạn \(Auto 9999\)/i)).toBeVisible();

		// 3. Click "Gán Link PDF Mẫu (Test W3C)"
		const samplePdfBtn = page.getByRole('button', { name: /Gán Link PDF Mẫu/i });
		await expect(samplePdfBtn).toBeVisible();
		await samplePdfBtn.click();
		await page.waitForTimeout(500);

		// Verify downloadUrl input has value and status box appears
		const downloadInput = page.getByLabel(/Đường dẫn tệp tin tải về/i);
		await expect(downloadInput).toHaveValue(/dummy\.pdf/);
		await expect(page.getByText(/Đã sẵn sàng cấp phát/i)).toBeVisible();

		// 4. Test PDF preview modal
		const previewBtn = page.getByRole('button', { name: /Xem Trước PDF/i });
		await expect(previewBtn).toBeVisible();
		await previewBtn.click();
		await page.waitForTimeout(1000);

		// Verify preview modal title
		await expect(page.getByText(/Xem Trước Tài Liệu PDF/i).first()).toBeVisible();
		await page.getByRole('button', { name: /Đóng/i }).click();
		await page.waitForTimeout(500);

		// 5. Fill product name & price
		const nameInput = page.locator('input#name');
		await nameInput.fill('Ebook Lập Trình Clean Architecture & DDD .NET 10 (PDF Bản Quyền)');

		// Take screenshot of inline digital setup
		await page.screenshot({ path: `${targetDir}/digital_product_inline_setup.png` });

		// 6. Submit creation
		const submitBtn = page.getByRole('button', { name: /Tạo Sản Phẩm/i });
		await expect(submitBtn).toBeEnabled();
		await submitBtn.click();

		// Wait for redirect to products or detail
		await page.waitForURL(/\/apps\/e-commerce\/products/, { timeout: 15000 });
		await page.waitForTimeout(2000);

		// Take screenshot of created digital product
		await page.screenshot({ path: `${targetDir}/digital_product_created.png` });
	});

	test('02. Create Serial Key / Account Product with 1-Click Generator & Pool Management', async ({ page }) => {
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');

		// 1. Select SerialKey product type
		const serialKeyOption = page.locator('text=Tài Khoản & Serial Key').first();
		await expect(serialKeyOption).toBeVisible();
		await serialKeyOption.click();
		await page.waitForTimeout(600);

		// 2. Verify inline setup card appears on BasicInfoTab
		const inlineCardTitle = page.getByText(/Kho Tài Khoản & Serial Key \(Cấp Phát Tự Động\)/i);
		await expect(inlineCardTitle).toBeVisible();

		// 3. Test 1-Click sample generator: +5 Netflix accounts
		const netflixBtn = page.getByRole('button', { name: /\+ 5 Tài Khoản Netflix Premium/i });
		await expect(netflixBtn).toBeVisible();
		await netflixBtn.click();
		await page.waitForTimeout(600);

		// Verify 5 keys created & stock badge updated
		await expect(page.getByText(/Tồn kho: 5 key có sẵn/i)).toBeVisible();

		// 4. Test adding single custom account
		const singleInput = page.getByPlaceholder(/user@mail\.com:Password123 hoặc KEY-XXXX/i);
		await singleInput.fill('custom_admin_vip@eshop.vn:SecretPass2026!');
		const addSingleBtn = page.getByRole('button', { name: /^Thêm$/i });
		await addSingleBtn.click();
		await page.waitForTimeout(500);

		// Verify total updated to 6
		await expect(page.getByText(/Tồn kho: 6 key có sẵn/i)).toBeVisible();
		await expect(page.getByText(/Danh Sách Key Sẵn Sàng Cấp \(6 key\)/i)).toBeVisible();

		// 5. Fill product name & price
		const nameInput = page.locator('input#name');
		await nameInput.fill('Tài Khoản Netflix Premium 4K UltraHD (Giao Tự Động 100%)');

		// Take screenshot of inline serial key setup
		await page.screenshot({ path: `${targetDir}/serialkey_product_inline_setup.png` });

		// 6. Submit creation
		const submitBtn = page.getByRole('button', { name: /Tạo Sản Phẩm/i });
		await expect(submitBtn).toBeEnabled();
		await submitBtn.click();

		// Wait for redirect to products or detail
		await page.waitForURL(/\/apps\/e-commerce\/products/, { timeout: 15000 });
		await page.waitForTimeout(2000);

		// If redirected to detail page, switch to Serial Key tab to inspect pool
		const keyTab = page.getByRole('tab', { name: /Kho Tài Khoản & Serial Key/i });
		if (await keyTab.isVisible()) {
			await keyTab.click();
			await page.waitForTimeout(1000);
		}

		// Take screenshot of created serial key product & pool
		await page.screenshot({ path: `${targetDir}/serialkey_product_created.png` });
	});
});
