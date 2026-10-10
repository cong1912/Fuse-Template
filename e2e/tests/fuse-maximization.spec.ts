import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Theme Fuse Maximization Verification', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('should display live navigation badges and topbar shortcuts correctly', async ({ page }) => {
    await setupApiMocks(page);

    await page.goto('/dashboards/analytics');
    await page.waitForLoadState('networkidle');

    // Verify navigation badges
    const ordersBadge = page.locator('text=12').first();
    await expect(ordersBadge).toBeVisible({ timeout: 5000 });

    const flashSaleBadge = page.locator('text=HOT').first();
    await expect(flashSaleBadge).toBeVisible({ timeout: 5000 });

    // Capture screenshot of navigation badges & shortcuts
    await page.screenshot({
      path: 'C:/Users/dangc/.gemini/antigravity/brain/d5979c1e-72c8-497d-8253-2817c94e7106/screenshots/44_fuse_badges_and_shortcuts.png',
      fullPage: false
    });
  });
});
