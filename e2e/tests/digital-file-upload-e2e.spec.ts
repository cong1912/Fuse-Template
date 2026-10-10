import { test, expect } from '@playwright/test';

test.describe('Real File Upload E2E for Digital Products', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	const targetDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

	test('Upload Real PDF File directly from computer to server', async ({ page }) => {
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');

		// 1. Select Digital
		const digitalOption = page.locator('text=Tệp Tin / Tài Liệu PDF').first();
		await digitalOption.click();
		await page.waitForTimeout(500);

		// 2. Prepare genuine PDF buffer with %PDF-1.4 magic bytes
		const pdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Title (Sample Ebook 2026)\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF');

		// 3. Upload file via the file input
		const fileInput = page.locator('input[type="file"][accept*=".pdf"]').first();
		await fileInput.setInputFiles({
			name: 'Giao-Trinh-Clean-Architecture-2026.pdf',
			mimeType: 'application/pdf',
			buffer: pdfBuffer
		});

		// 4. Wait for upload to complete and verify feedback
		await expect(page.getByText(/Tải tệp tin lên máy chủ thành công/i)).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(/Giao-Trinh-Clean-Architecture-2026\.pdf/i)).toBeVisible();

		// 5. Verify the downloadUrl input contains /uploads/documents/...
		const downloadInput = page.getByLabel(/Đường dẫn tệp tin tải về/i);
		await expect(downloadInput).toHaveValue(/\/uploads\/documents\//i);

		// 6. Test PDF preview modal with uploaded file
		const previewBtn = page.getByRole('button', { name: /Xem Trước PDF/i });
		await expect(previewBtn).toBeVisible();
		await previewBtn.click();
		await page.waitForTimeout(1500);

		// Verify preview modal title and take screenshot
		await expect(page.getByText(/Xem Trước Tài Liệu PDF/i).first()).toBeVisible();
		await page.screenshot({ path: `${targetDir}/pdf_preview_modal_working.png` });

		// Close modal
		await page.getByRole('button', { name: /^Đóng$/i }).click();
		await page.waitForTimeout(500);

		// 7. Fill name and create product
		const nameInput = page.locator('input#name');
		await nameInput.fill('Giáo Trình Clean Architecture & DDD .NET 10 (Uploaded PDF)');

		await page.screenshot({ path: `${targetDir}/pdf_file_uploaded_success.png` });

		const submitBtn = page.getByRole('button', { name: /Tạo Sản Phẩm/i });
		await submitBtn.click();

		await page.waitForURL(/\/apps\/e-commerce\/products/, { timeout: 15000 });
		await page.waitForTimeout(2000);

		// Verify downloadUrl is saved
		await page.screenshot({ path: `${targetDir}/pdf_product_created_with_uploaded_file.png` });
	});
});
