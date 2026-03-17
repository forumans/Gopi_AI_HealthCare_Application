import { test, expect } from '@playwright/test';

// Doctor End-to-End Tests
test.describe('Doctor End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  test('Doctor Registration', async ({ page }) => {
    // Navigate to doctor registration
    await page.click('text=Doctor Registration');
    
    // Fill out registration form
    await page.fill('[data-testid="doctor-name"]', 'Dr. Jane Smith');
    await page.fill('[data-testid="doctor-email"]', 'jane.smith@test.com');
    await page.fill('[data-testid="doctor-phone"]', '1234567890');
    await page.fill('[data-testid="doctor-specialization"]', 'Cardiology');
    await page.fill('[data-testid="doctor-password"]', 'password123');
    await page.fill('[data-testid="doctor-confirm-password"]', 'password123');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page.locator('text=Registration successful')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('Doctor Login', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Submit login
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page.locator('text=Doctor Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="doctor-name"]')).toContainText('Dr. Test Doctor');
  });

  test('Doctor View Today\'s Appointments', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to today's appointments
    await page.click('[data-testid="today-appointments-link"]');
    
    // Verify appointments page
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-list"]')).toBeVisible();
  });

  test('Doctor Manage Availability', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to availability management
    await page.click('[data-testid="availability-link"]');
    
    // Add availability
    await page.click('[data-testid="add-availability"]');
    await page.selectOption('[data-testid="availability-date"]', '2026-03-17');
    await page.selectOption('[data-testid="availability-time"]', '09:00');
    await page.click('[data-testid="save-availability"]');
    
    // Verify successful addition
    await expect(page.locator('text=Availability added successfully')).toBeVisible();
  });

  test('Doctor View All Appointments', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to all appointments
    await page.click('[data-testid="all-appointments-link"]');
    
    // Verify appointments page
    await expect(page.locator('text=All Appointments')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-list"]')).toBeVisible();
  });

  test('Doctor Conduct Consultation', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to today's appointments
    await page.click('[data-testid="today-appointments-link"]');
    
    // Click on a confirmed appointment
    await page.click('[data-testid="confirmed-appointment"]:first-child');
    
    // Start consultation
    await page.click('[data-testid="start-consultation"]');
    
    // Fill consultation form
    await page.fill('[data-testid="symptoms"]', 'Patient reports headache and fever');
    await page.fill('[data-testid="diagnosis"]', 'Common cold');
    await page.fill('[data-testid="lab-results"]', 'Blood test normal');
    await page.fill('[data-testid="medication"]', 'Paracetamol');
    await page.fill('[data-testid="dosage"]', '500mg');
    await page.fill('[data-testid="instructions"]', 'Take twice daily with food');
    
    // Select pharmacy
    await page.selectOption('[data-testid="pharmacy-select"]', '1');
    
    // Complete consultation
    await page.click('[data-testid="complete-consultation"]');
    
    // Verify successful completion
    await expect(page.locator('text=Consultation completed successfully')).toBeVisible();
  });

  test('Doctor Search Patients', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to patient search
    await page.click('[data-testid="search-patients-link"]');
    
    // Search for patient
    await page.fill('[data-testid="patient-search"]', 'John');
    await page.click('[data-testid="search-button"]');
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('Doctor View Patient Profile', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to patient search
    await page.click('[data-testid="search-patients-link"]');
    
    // Search and click on patient
    await page.fill('[data-testid="patient-search"]', 'John');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="patient-result"]:first-child');
    
    // Verify patient profile
    await expect(page.locator('text=Patient Profile')).toBeVisible();
    await expect(page.locator('[data-testid="patient-info"]')).toBeVisible();
  });

  test('Doctor Update Profile', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to profile
    await page.click('[data-testid="profile-link"]');
    
    // Update profile information
    await page.fill('[data-testid="profile-phone"]', '9876543210');
    await page.click('[data-testid="update-profile"]');
    
    // Verify successful update
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('Doctor Cancel Appointment', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to today's appointments
    await page.click('[data-testid="today-appointments-link"]');
    
    // Click on appointment and cancel
    await page.click('[data-testid="appointment-card"]:first-child');
    await page.click('[data-testid="cancel-appointment"]');
    
    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel"]');
    
    // Verify successful cancellation
    await expect(page.locator('text=Appointment cancelled successfully')).toBeVisible();
  });

  test('Doctor View Availability Calendar', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'doctor@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to availability
    await page.click('[data-testid="availability-link"]');
    
    // Verify calendar view
    await expect(page.locator('text=Manage Availability')).toBeVisible();
    await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible();
    
    // Navigate calendar
    await page.click('[data-testid="next-month"]');
    await page.click('[data-testid="prev-month"]');
  });
});
