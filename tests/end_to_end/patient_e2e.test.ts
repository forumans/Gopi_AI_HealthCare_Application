import { test, expect } from '@playwright/test';

// Patient End-to-End Tests
test.describe('Patient End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  test('Patient Registration', async ({ page }) => {
    // Navigate to patient registration
    await page.click('text=Patient Registration');
    
    // Fill out registration form
    await page.fill('#email', 'john.doe@test.com');
    await page.fill('#password', 'password123');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Verify successful registration
    await expect(page.locator('text=Registration successful')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('Patient Login', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for navigation and verify successful login by checking URL
    await page.waitForURL('**/patients/appointments');
    
    // Verify we're on the appointments page
    await expect(page.locator('text=My Appointments')).toBeVisible();
  });

  test('Patient View Appointments', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to appointments
    await page.click('text=My Appointments');
    
    // Verify appointments page
    await expect(page.locator('text=My Appointments')).toBeVisible();
  });

  test('Patient View Prescriptions', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to prescriptions
    await page.click('text=My Prescriptions & Medical Records');
    
    // Verify prescriptions page
    await expect(page.locator('text=My Prescriptions & Medical Records')).toBeVisible();
    await expect(page.locator('text=Patient Information')).toBeVisible();
  });

  test('Patient Book Appointment', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to appointments
    await page.click('text=My Appointments');
    
    // Click on available appointment slot
    await page.click('text=Available');
    
    // Confirm booking
    await page.click('text=Confirm Booking');
    
    // Verify successful booking
    await expect(page.locator('text=Appointment booked successfully')).toBeVisible();
  });

  test('Patient Update Profile', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to profile
    await page.click('text=My Profile');
    
    // Update profile information
    await page.fill('input[name="phone"]', '9876543210');
    await page.click('button:has-text("Update Profile")');
    
    // Verify successful update
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('Patient View Medical History', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to medical history
    await page.click('text=Medical History');
    
    // Verify medical history page
    await expect(page.locator('text=Medical History')).toBeVisible();
  });

  test('Patient Upload Document', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5173/login');
    await page.fill('#email', 'patient@test.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to documents
    await page.click('text=My Documents');
    
    // Upload document
    await page.setInputFiles('input[type="file"]', 'test-document.pdf');
    await page.fill('textarea[name="description"]', 'Test document');
    await page.click('button:has-text("Upload Document")');
    
    // Verify successful upload
    await expect(page.locator('text=Document uploaded successfully')).toBeVisible();
  });
});
