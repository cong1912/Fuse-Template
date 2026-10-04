import { test, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';

test.describe('Authentication Tests', () => {
  // Clear storage state to ensure a fresh session for manual login
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login('admin@example.com', 'password123');
    
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
