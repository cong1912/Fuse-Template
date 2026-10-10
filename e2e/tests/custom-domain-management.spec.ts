import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../config/mockApi';

test.describe('Custom Domain & Subdomain Management System (Merchant & Super Admin)', () => {
	test.use({ storageState: 'e2e/.auth/user.json' });

	test('Merchant should view subdomain, change subdomain, connect custom domain and verify DNS records', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to Merchant Domain Settings
		await page.goto('/settings/domain');
		await page.waitForLoadState('networkidle');

		// 1. Verify Page Title and Header
		await expect(page.getByText('Cài Đặt Tên Miền & Subdomain (Domain & Subdomain Management)')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Subdomain Hệ Thống Mặc Định')).toBeVisible();

		// 2. Check default subdomain card
		await expect(page.getByText('https://fashion-vn.ecommerce.vn').first()).toBeVisible();

		// 3. Change Subdomain via Modal
		const changeSubdomainBtn = page.getByRole('button', { name: 'Đổi Subdomain' });
		await expect(changeSubdomainBtn).toBeVisible();
		await changeSubdomainBtn.click();

		const subdomainDialog = page.getByRole('dialog');
		await expect(subdomainDialog).toBeVisible();
		await expect(page.getByText('Đổi Subdomain Hệ Thống')).toBeVisible();

		const subdomainInput = subdomainDialog.getByRole('textbox');
		await subdomainInput.fill('fashion-boutique-vn');

		const confirmBtn = subdomainDialog.getByRole('button', { name: 'Xác Nhận Đổi' });
		await confirmBtn.click();
		await expect(subdomainDialog).not.toBeVisible();

		// 4. Connect Custom Domain
		const customDomainInput = page.getByLabel('Tên miền riêng của bạn');
		await expect(customDomainInput).toBeVisible();
		await customDomainInput.fill('www.fashionboutique.vn');

		const saveDomainBtn = page.getByRole('button', { name: 'Lưu Tên Miền' });
		await saveDomainBtn.click();

		// Verify "Kiểm Tra Bản Ghi DNS Ngay" button is visible
		const verifyDnsBtn = page.getByRole('button', { name: 'Kiểm Tra Bản Ghi DNS Ngay' });
		await expect(verifyDnsBtn).toBeVisible({ timeout: 10000 });

		// 5. Trigger DNS verification
		await verifyDnsBtn.click();

		// Verify diagnostic card appears
		await expect(page.getByText(/Kết Quả Kiểm Tra DNS/i)).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(/Bản ghi DNS CNAME đã trỏ chính xác/i).first()).toBeVisible();
		await expect(page.getByText('Khớp Đúng')).toBeVisible();

		// 6. Verify DNS Records Table
		await expect(page.getByText(/Hướng Dẫn Trỏ Bản Ghi DNS/i)).toBeVisible();
		await expect(page.getByText('cname.ecommerce.vn').first()).toBeVisible();
		await expect(page.getByText('103.142.26.88').first()).toBeVisible();
	});

	test('Super Admin should monitor all platform domains, search/filter, and perform "Custom Giúp" for a tenant', async ({ page }) => {
		await setupApiMocks(page);

		// Navigate to Platform Domains Control Center
		await page.goto('/platform/domains');
		await page.waitForLoadState('networkidle');

		// 1. Verify Page Title and Metrics
		await expect(page.getByText('Quản Lý Tên Miền Toàn Sàn & Hỗ Trợ Cấu Hình (Platform Domains Hub)')).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Tổng Gian Hàng')).toBeVisible();
		await expect(page.getByText('Tên Miền Riêng Kích Hoạt')).toBeVisible();
		await expect(page.getByText('Chờ Cấu Hình DNS')).toBeVisible();

		// 2. Verify Table contains shops
		await expect(page.getByText('Fashion Store Vietnam')).toBeVisible();
		await expect(page.getByText('Tech Gadgets HCM')).toBeVisible();
		await expect(page.getByText('Organic Care Cosmetics')).toBeVisible();

		// 3. Test Search Filter
		const searchInput = page.getByPlaceholder('Tìm kiếm theo tên gian hàng, tên miền riêng, subdomain...');
		await expect(searchInput).toBeVisible();
		await searchInput.fill('Tech Gadgets');

		// Fashion Store Vietnam should be filtered out
		await expect(page.getByText('Tech Gadgets HCM')).toBeVisible();
		await expect(page.getByText('Fashion Store Vietnam')).not.toBeVisible();

		// Clear search
		await searchInput.fill('');
		await expect(page.getByText('Fashion Store Vietnam')).toBeVisible();

		// 4. Perform "Custom Giúp" for Tech Gadgets HCM
		const techGadgetsRow = page.getByRole('row', { name: /Tech Gadgets HCM/i });
		const customGiupBtn = techGadgetsRow.getByRole('button', { name: /Custom Giúp/i });
		await expect(customGiupBtn).toBeVisible();
		await customGiupBtn.click();

		// Verify Modal is opened
		const helpDialog = page.getByRole('dialog');
		await expect(helpDialog).toBeVisible();
		await expect(page.getByText(/Cấu Hình Tên Miền Giúp Gian Hàng: Tech Gadgets HCM/i)).toBeVisible();

		// Fill in custom domain
		const domainInput = helpDialog.getByLabel(/Tên miền riêng cần gán cho gian hàng/i);
		await domainInput.fill('shop.techgadgets.vn');

		// Check Force Verify switch
		const forceVerifySwitch = helpDialog.getByRole('checkbox');
		await forceVerifySwitch.check();

		// Submit configuration
		const saveHelpDomainBtn = helpDialog.getByRole('button', { name: 'Lưu Tên Miền Cho Gian Hàng' });
		await saveHelpDomainBtn.click();

		// Verify Modal closes
		await expect(helpDialog).not.toBeVisible();

		// Verify updated domain in table
		await expect(page.getByText('shop.techgadgets.vn', { exact: true })).toBeVisible({ timeout: 10000 });
	});
});
