import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pom/DashboardPage';

test.describe('Dashboard Tests', () => {
  // Use pre-authenticated storage state to skip login
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('should display dashboard correctly', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    await dashboardPage.navigate();
    await dashboardPage.verifyIsLoaded();
  });
});
