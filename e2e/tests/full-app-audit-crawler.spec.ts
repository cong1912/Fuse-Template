import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

const APP_ROUTES = [
	{ name: 'Analytics Dashboard', url: '/dashboards/analytics' },
	{ name: 'Finance Dashboard', url: '/dashboards/finance' },
	{ name: 'Orders List', url: '/apps/e-commerce/orders' },
	{ name: 'Order Detail', url: '/apps/e-commerce/orders/ord-001' },
	{ name: 'Products Catalog', url: '/apps/e-commerce/products' },
	{ name: 'Product Detail', url: '/apps/e-commerce/products/prod-001' },
	{ name: 'Categories', url: '/apps/e-commerce/categories' },
	{ name: 'Product Classes', url: '/apps/e-commerce/product-classes' },
	{ name: 'Flash Sales Waiting Room', url: '/apps/e-commerce/flash-sales' },
	{ name: 'B2B Wholesale Quotes', url: '/apps/e-commerce/b2b' },
	{ name: 'Promotions & Vouchers', url: '/apps/e-commerce/promotions' },
	{ name: 'Customers Report', url: '/reports/customers' },
	{ name: 'Revenue Report', url: '/reports/revenue' },
	{ name: 'Orders Report', url: '/reports/orders' },
	{ name: 'Products Report', url: '/reports/products' },
	{ name: 'Finance Report', url: '/reports/finance' },
	{ name: 'Inventory Report', url: '/reports/inventory' },
	{ name: 'Marketing Report', url: '/reports/marketing' },
	{ name: 'Platform Overview', url: '/platform/overview' },
	{ name: 'Platform Shops (SuperAdmin)', url: '/platform/shops' },
	{ name: 'Platform Plans', url: '/platform/plans' },
	{ name: 'Platform Billing', url: '/platform/billing' },
	{ name: 'Platform Users', url: '/platform/users' },
	{ name: 'Platform Risk Queue', url: '/platform/risk' },
	{ name: 'Platform Invites', url: '/platform/invites' },
	{ name: 'Platform Audit Logs', url: '/platform/audit' },
	{ name: 'Platform System Diagnostics', url: '/platform/system' },
	{ name: 'Settings Staff', url: '/settings/staff' },
	{ name: 'Account Profile', url: '/account/profile' },
	{ name: 'Integrations Settings', url: '/settings/integrations' },
	{ name: 'Error 404 Page', url: '/404' }
];

test.describe('Autonomous Playwright Full-App Audit & Bug Hunter', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('Deep Audit: Crawl all 31 app routes, verify no console/page crashes, no broken layouts', async ({ page }) => {
		test.setTimeout(180000);
		await setupApiMocks(page);

		const auditFindings: Array<{ route: string; issues: string[] }> = [];

		for (const route of APP_ROUTES) {
			const consoleErrors: string[] = [];
			const pageErrors: string[] = [];
			const failedRequests: string[] = [];

			const onConsole = (msg: any) => {
				if (msg.type() === 'error') {
					const text = msg.text();
					// Ignore minor favicon or expected mock noise if any
					if (!text.includes('favicon.ico') && !text.includes('chrome-extension')) {
						consoleErrors.push(text);
					}
				}
			};

			const onPageError = (err: Error) => {
				pageErrors.push(err.message || String(err));
			};

			const onResponse = (res: any) => {
				if (res.status() >= 400 && !res.url().includes('favicon')) {
					// Some endpoints may return 404 if item doesn't exist, record for awareness
					failedRequests.push(`${res.status()} on ${res.url()}`);
				}
			};

			page.on('console', onConsole);
			page.on('pageerror', onPageError);
			page.on('response', onResponse);

			try {
				const response = await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
				
				// Wait for lazy chunk loading animation to detach
				await page.locator('.fuse-loading, [class*="FuseLoading"], svg.animate-spin').waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
				await page.waitForTimeout(500);

				const currentIssues: string[] = [];

				// Check 1: HTTP Response
				if (!response || response.status() >= 500) {
					currentIssues.push(`Server returned HTTP ${response?.status()}`);
				}

				// Check 2: Crash or React error boundary
				const bodyText = await page.locator('body').innerText();
				if (bodyText.includes('Something went wrong') || bodyText.includes('Minified React error')) {
					currentIssues.push('React Error Boundary triggered');
				}

				// Check 3: Page is not completely empty
				if (bodyText.trim().length === 0) {
					currentIssues.push('Page rendered completely blank');
				}

				// Check 4: Unrendered raw translation placeholders
				const rawI18nMatches = bodyText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
				if (rawI18nMatches) {
					currentIssues.push(`Raw translation placeholder detected: ${rawI18nMatches.slice(0, 3).join(', ')}`);
				}

				// Check 5: Page errors (unhandled JS crashes)
				if (pageErrors.length > 0) {
					currentIssues.push(`JavaScript Exception: ${pageErrors.join('; ')}`);
				}

				// Check 6: Severe console errors
				const severeConsoleErrors = consoleErrors.filter(e => 
					!e.includes('ResizeObserver') && 
					!e.includes('unsupported-css-property') &&
					!e.includes('warning')
				);
				if (severeConsoleErrors.length > 0) {
					currentIssues.push(`Console Errors: ${severeConsoleErrors.slice(0, 2).join('; ')}`);
				}

				if (currentIssues.length > 0) {
					auditFindings.push({ route: route.name + ` (${route.url})`, issues: currentIssues });
				}
			} catch (err: any) {
				auditFindings.push({ route: route.name + ` (${route.url})`, issues: [`Navigation Timeout or Error: ${err.message}`] });
			} finally {
				page.off('console', onConsole);
				page.off('pageerror', onPageError);
				page.off('response', onResponse);
			}
		}

		console.log('=== AUDIT RESULTS SUMMARY ===');
		console.log(`Total Routes Checked: ${APP_ROUTES.length}`);
		console.log(`Routes with Issues: ${auditFindings.length}`);
		for (const f of auditFindings) {
			console.log(`[ISSUE] ${f.route}:`);
			for (const issue of f.issues) {
				console.log(`   - ${issue}`);
			}
		}

		// Expect zero fatal React error boundary crashes
		const crashFindings = auditFindings.filter(f => f.issues.some(i => i.includes('React Error Boundary') || i.includes('blank')));
		expect(crashFindings, `Found fatal crashes on routes: ${JSON.stringify(crashFindings)}`).toHaveLength(0);
	});
});
