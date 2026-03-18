import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Basic Application Health', () => {
  test.beforeEach(async ({ page }) => {
    // Set default timeout for smoke tests
    test.setTimeout(30000);
  });

  test('application loads correctly', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Healthcare SaaS/);
    
    // Check for main navigation elements
    await expect(page.locator('.brand')).toBeVisible();
    
    // Verify login options are available
    const loginOptions = page.locator('a[href*="login"]');
    await expect(loginOptions).toHaveCount.greaterThan(0);
  });

  test('admin login page accessible', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');
    
    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check page title or heading
    await expect(page.locator('h1, h2').filter({ hasText: 'Admin Login' })).toBeVisible();
  });

  test('doctor login page accessible', async ({ page }) => {
    // Navigate to doctor login
    await page.goto('/doctors/login');
    
    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check page title or heading
    await expect(page.locator('h1, h2').filter({ hasText: 'Doctor Login' })).toBeVisible();
  });

  test('patient login page accessible', async ({ page }) => {
    // Navigate to patient login
    await page.goto('/patients/login');
    
    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check page title or heading
    await expect(page.locator('h1, h2').filter({ hasText: 'Patient Login' })).toBeVisible();
  });

  test('backend API health check', async ({ page }) => {
    // Check if backend API is accessible
    const response = await page.request.get('http://localhost:8000/health');
    
    // API should be accessible (status 200, 404, or other expected status)
    expect(response.status()).toBeLessThan(500);
  });

  test('application responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile navigation works
    await expect(page.locator('.brand')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.brand')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.brand')).toBeVisible();
  });

  test('no JavaScript errors in console', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Navigate through main pages
    await page.goto('/');
    await page.goto('/admin/login');
    await page.goto('/doctors/login');
    await page.goto('/patients/login');
    
    // Check for any JavaScript errors
    expect(errors).toHaveLength(0);
  });

  test('application loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
