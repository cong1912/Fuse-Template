import { test, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';
import { setupApiMocks } from '../config/mockApi';

test.describe('Authentication Tests', () => {
  // Clear storage state to ensure a fresh session for manual login
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should login successfully with valid credentials', async ({ page }) => {
    await setupApiMocks(page);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    try {
      await loginPage.fillEmail('admin@ecommerce.com');
      await loginPage.fillPassword('Admin@123');
      await loginPage.submitLogin();
      await expect(page).toHaveURL(/.*dashboards/, { timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: 'test-failure.png' });
      throw e;
    }
  });
});
