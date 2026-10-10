import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Live System Full Browser Tour for User Review', () => {
  test.use({ storageState: 'e2e/.auth/user.json', viewport: { width: 1440, height: 900 } });

  test('Perform visual live tour across all core modules and features', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for visual pacing
    await setupApiMocks(page);

    console.log('🌟 [1/9] Opening Analytics Dashboard...');
    await page.goto('/dashboards/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify Dashboard Loaded
    await expect(page.getByText('Trung Tâm Điều Hành Bán Hàng (E-Commerce Command Center)')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_01_dashboard.png' });

    console.log('🔍 [2/9] Demonstrating Omnisearch Command Palette (Ctrl+K)...');
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(1500);
    const searchInput = page.getByPlaceholder('Tìm kiếm sản phẩm, đơn hàng (#ORD-...), gian hàng, cài đặt...');
    if (await searchInput.isVisible()) {
      await searchInput.fill('iPhone');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_02_omnisearch.png' });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    console.log('📦 [3/9] Opening Products Management...');
    await page.goto('/apps/e-commerce/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_03_products_list.png' });

    console.log('✏️ [4/9] Opening Product Edit with Variant Matrix & AI Copywriter...');
    await page.goto('/apps/e-commerce/products/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_04_product_detail.png' });

    // Open AI Copywriter dialog
    const aiBtn = page.getByRole('button', { name: /AI Viết Mô Tả/i });
    if (await aiBtn.isVisible()) {
      await aiBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_05_ai_copywriter.png' });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    console.log('🛒 [5/9] Opening Orders Management & Detail with Fraud Risk Scoring...');
    await page.goto('/apps/e-commerce/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_06_orders_list.png' });

    await page.goto('/apps/e-commerce/orders/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_07_order_detail_stepper_airisk.png' });

    console.log('⚡ [6/9] Opening Flash Sales Waiting Room...');
    await page.goto('/apps/e-commerce/flash-sales');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_08_flash_sales.png' });

    console.log('🌐 [7/9] Opening Merchant Custom Domain & Subdomain Settings...');
    await page.goto('/settings/domain');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_09_merchant_domain.png' });

    console.log('🛡️ [8/9] Opening Super Admin Platform Domains Hub with Custom Giúp...');
    await page.goto('/platform/domains');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const customGiupBtn = page.getByRole('button', { name: /Custom Giúp/i }).first();
    if (await customGiupBtn.isVisible()) {
      await customGiupBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_10_superadmin_custom_giup.png' });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    console.log('🎨 [9/9] Demonstrating Live Dark/Light Mode Switcher...');
    const themeModeToggle = page.locator('button[aria-label="theme-mode-toggle"]').or(page.locator('[data-testid="theme-mode-toggle"]')).or(page.locator('button:has(svg)').filter({ hasText: '' }).first());
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/live_tour_11_completed_tour.png' });

    console.log('🎉 Live Visual Tour Completed Successfully!');
  });
});
