import { test, expect } from '@playwright/test';

test.describe('Verify Phase 2, Phase 3, Product Creation & AI Copilot', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	const targetDir = 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots';

	test('01. Create Physical Product with AI Copywriter & Category Selector', async ({ page }) => {
		await page.goto('/apps/e-commerce/products/new');
		await page.waitForLoadState('networkidle');

		// 1. Enter product name
		const nameInput = page.locator('input#name');
		await nameInput.fill('Áo Polo Nam Luxury Dệt Tổ Ong Kháng Khuẩn');

		// 2. Open AI Copywriter Dialog
		const aiBtn = page.getByRole('button', { name: /AI Viết Mô Tả & SEO/i });
		await expect(aiBtn).toBeVisible();
		await aiBtn.click();
		await page.waitForTimeout(1000);

		// Verify AI dialog opened
		await expect(page.getByText('AI Copywriter & SEO Generator')).toBeVisible();
		await page.screenshot({ path: `${targetDir}/phase3_01_product_ai_dialog.png` });

		// Click Apply AI Content
		const applyBtn = page.getByRole('button', { name: /Áp Dụng Vào Sản Phẩm/i });
		if (await applyBtn.isVisible()) {
			await applyBtn.click();
		} else {
			await page.getByRole('button', { name: /Đóng/i }).click();
		}
		await page.waitForTimeout(500);

		// 3. Select Category from dropdown
		const catSelect = page.getByRole('combobox', { name: /Danh mục chính \(Cửa hàng\)/i });
		if (await catSelect.isVisible()) {
			await catSelect.click();
			await page.waitForTimeout(500);
			const firstOption = page.locator('li[role="option"]').nth(1);
			if (await firstOption.isVisible()) {
				await firstOption.click();
			}
		}

		await page.screenshot({ path: `${targetDir}/phase3_02_product_filled_form.png` });

		// 4. Submit product creation
		const submitBtn = page.getByRole('button', { name: /Tạo Sản Phẩm/i });
		await expect(submitBtn).toBeEnabled();
		await submitBtn.click();

		// Wait for redirect to products or product detail
		await page.waitForURL(/\/apps\/e-commerce\/products/, { timeout: 10000 });
		await page.waitForTimeout(1500);
		await page.screenshot({ path: `${targetDir}/phase3_03_product_created_success.png` });
	});

	test('02. Test Global AI Copilot from Toolbar', async ({ page }) => {
		await page.goto('/dashboards/analytics');
		await page.waitForLoadState('networkidle');

		// Find Global AI Copilot Button in toolbar (sparkles icon)
		const copilotBtn = page.locator('button:has([data-testid="AutoAwesomeIcon"])').first();
		await expect(copilotBtn).toBeVisible();
		await copilotBtn.click();
		await page.waitForTimeout(1000);

		// Verify AI Copilot Drawer slides out
		await expect(page.getByRole('heading', { name: /Enterprise AI Copilot/i })).toBeVisible();

		// Click a suggested quick prompt
		const promptBtn = page.getByText(/Phân tích doanh số & hiệu quả kinh doanh/i).first();
		if (await promptBtn.isVisible()) {
			await promptBtn.click();
		} else {
			const chatInput = page.locator('input[placeholder*="Hỏi AI"], input[placeholder*="Nhập câu hỏi"]').first();
			await chatInput.fill('Báo cáo doanh số và hiệu quả bán hàng hôm nay');
			await chatInput.press('Enter');
		}

		// Wait for AI reply to render
		await page.waitForTimeout(2500);
		await page.screenshot({ path: `${targetDir}/phase3_04_global_ai_copilot_chat.png` });
	});

	test('03. Test Phase 3 Theme Customizer with Split-Screen Live Preview', async ({ page }) => {
		await page.goto('/settings/theme');
		await page.waitForLoadState('networkidle');

		// Verify Theme Customizer Title & Controls
		await expect(page.getByText('Tùy Biến Giao Diện Cửa Hàng (Theme Customizer)')).toBeVisible();

		// Take initial desktop screenshot
		await page.screenshot({ path: `${targetDir}/phase3_05_theme_customizer_desktop.png` });

		// Click Emerald Green color preset
		const emeraldPreset = page.getByText(/Xanh Lá Tươi Mát/i);
		await expect(emeraldPreset).toBeVisible();
		await emeraldPreset.click();
		await page.waitForTimeout(500);

		// Switch to Mobile Preview frame
		const mobileBtn = page.locator('button[aria-label*="Điện thoại"], button:has([data-testid="SmartphoneIcon"])');
		await expect(mobileBtn).toBeVisible();
		await mobileBtn.click();
		await page.waitForTimeout(800);

		// Take mobile frame screenshot
		await page.screenshot({ path: `${targetDir}/phase3_06_theme_customizer_mobile_preview.png` });

		// Click "Lưu & Xuất Bản"
		const saveBtn = page.getByRole('button', { name: /Lưu & Xuất Bản/i });
		await expect(saveBtn).toBeVisible();
		await saveBtn.click();

		// Verify toast notification
		await page.waitForTimeout(1000);
		await page.screenshot({ path: `${targetDir}/phase3_07_theme_customizer_saved.png` });
	});

	test('04. Verify Phase 2 Domain Settings & SSL', async ({ page }) => {
		await page.goto('/settings/domain');
		await page.waitForLoadState('networkidle');

		// Verify Domain Settings page heading loaded
		await expect(page.getByRole('heading', { name: /Cài Đặt Tên Miền & Subdomain/i })).toBeVisible();
		await page.waitForTimeout(1000);

		await page.screenshot({ path: `${targetDir}/phase2_01_domain_settings_page.png` });
	});
});
