import { test, expect } from './fixtures';
import { createDoctor, createDoctorAvailability, loginAsDoctor } from './helpers';

test.describe('Doctor Workflows', () => {
  let doctorCredentials: { email: string; password: string };

  test.beforeAll(async ({ adminPage: page }) => {
    // Create a doctor for testing
    doctorCredentials = await createDoctor(page, {
      fullName: 'Dr. Michael Roberts',
      email: 'drroberts@clinic.com',
      password: 'Doctor123!',
      phone: '+1234567897',
      specialty: 'Internal Medicine',
      licenseNumber: 'INT567890',
      dateOfBirth: '1973-12-03'
    });
  });

  test('doctor login and dashboard access', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Verify successful login
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Dr. Michael Roberts')).toBeVisible();
    
    // Navigate to doctor dashboard
    await page.goto('/doctor/dashboard');
    
    // Verify dashboard elements
    await expect(page.locator('text=Doctor Dashboard')).toBeVisible();
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
    await expect(page.locator('text=Upcoming Appointments')).toBeVisible();
    await expect(page.locator('text=Availability Management')).toBeVisible();
  });

  test('create availability slots', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Create availability slots
    await createDoctorAvailability(page);
    
    // Verify success message
    await expect(page.locator('text=Availability created successfully')).toBeVisible();
    
    // Verify slots are visible in the UI
    await expect(page.locator('.time-slot')).toHaveCount.greaterThan(0);
    
    // Verify slots are marked as AVAILABLE
    const availableSlots = page.locator('.time-slot.available');
    await expect(availableSlots).toHaveCount.greaterThan(0);
    
    // Verify specific time slots are present
    const expectedTimeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    for (const timeSlot of expectedTimeSlots) {
      await expect(page.locator(`text=${timeSlot}`)).toBeVisible();
    }
  });

  test('view today\'s appointments', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Navigate to appointments page
    await page.goto('/doctor/appointments');
    
    // Verify appointments page is loaded
    await expect(page.locator('text=Doctor Appointments')).toBeVisible();
    await expect(page.locator('text=Today\'s Schedule')).toBeVisible();
    
    // Verify appointments list (even if empty)
    await expect(page.locator('.appointments-list')).toBeVisible();
    
    // Check for appointment filters
    await expect(page.locator('select[name="dateFilter"]')).toBeVisible();
    await expect(page.locator('select[name="statusFilter"]')).toBeVisible();
  });

  test('start consultation workflow', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Navigate to appointments page
    await page.goto('/doctor/appointments');
    
    // Look for any scheduled appointments (this would need setup in real tests)
    const appointmentItems = page.locator('.appointment-item');
    
    if (await appointmentItems.count() > 0) {
      // Click on the first appointment
      await appointmentItems.first().click();
      
      // Verify consultation page loads
      await expect(page.locator('text=Patient Consultation')).toBeVisible();
      await expect(page.locator('text=Patient Information')).toBeVisible();
      
      // Verify consultation form elements
      await expect(page.locator('textarea[name="symptoms"]')).toBeVisible();
      await expect(page.locator('textarea[name="diagnosis"]')).toBeVisible();
      await expect(page.locator('textarea[name="labResults"]')).toBeVisible();
      await expect(page.locator('textarea[name="prescription"]')).toBeVisible();
      await expect(page.locator('select[name="pharmacy"]')).toBeVisible();
      
      // Start consultation
      await page.click('button:has-text("Start Consultation")');
      
      // Verify consultation started
      await expect(page.locator('text=Consultation in Progress')).toBeVisible();
    } else {
      // If no appointments, verify empty state
      await expect(page.locator('text=No appointments scheduled')).toBeVisible();
    }
  });

  test('availability management - edit and delete', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Navigate to availability page
    await page.goto('/doctor/availability');
    
    // Create some availability first
    await createDoctorAvailability(page);
    
    // Test editing availability
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modify time slots
      await page.uncheck('input[value="12:00"]'); // Remove lunch slot
      await page.check('input[value="17:00"]'); // Add evening slot
      
      // Save changes
      await page.click('button:has-text("Update Availability")');
      
      // Verify success message
      await expect(page.locator('text=Availability updated successfully')).toBeVisible();
      
      // Verify changes are reflected
      await expect(page.locator('input[value="12:00"]')).not.toBeChecked();
      await expect(page.locator('input[value="17:00"]')).toBeChecked();
    }
    
    // Test deleting availability
    const deleteButton = page.locator('button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      await page.click('button:has-text("Confirm Delete")');
      
      // Verify success message
      await expect(page.locator('text=Availability deleted successfully')).toBeVisible();
      
      // Verify slot is removed
      await expect(page.locator('.time-slot')).toHaveCount.lessThan(9); // Should be less than original
    }
  });

  test('view patient history before consultation', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Navigate to appointments page
    await page.goto('/doctor/appointments');
    
    // Look for appointments with patients
    const appointmentItems = page.locator('.appointment-item');
    
    if (await appointmentItems.count() > 0) {
      // Click on first appointment
      await appointmentItems.first().click();
      
      // Look for patient history section
      const patientHistoryLink = page.locator('button:has-text("View Patient History")');
      
      if (await patientHistoryLink.isVisible()) {
        await patientHistoryLink.click();
        
        // Verify patient history modal/page
        await expect(page.locator('text=Patient Medical History')).toBeVisible();
        await expect(page.locator('text=Previous Appointments')).toBeVisible();
        await expect(page.locator('text=Prescriptions')).toBeVisible();
        await expect(page.locator('text=Medical Records')).toBeVisible();
        
        // Close patient history
        await page.click('button:has-text("Close")');
      }
    }
  });

  test('search and filter appointments', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Navigate to appointments page
    await page.goto('/doctor/appointments');
    
    // Test date filter
    const dateFilter = page.locator('select[name="dateFilter"]');
    if (await dateFilter.isVisible()) {
      await dateFilter.selectOption('today');
      await page.click('button:has-text("Filter")');
      
      // Verify filter is applied
      await expect(page.locator('.appointment-item')).toBeVisible();
    }
    
    // Test status filter
    const statusFilter = page.locator('select[name="statusFilter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('scheduled');
      await page.click('button:has-text("Filter")');
      
      // Verify filter is applied
      await expect(page.locator('.appointment-item')).toBeVisible();
    }
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.click('button:has-text("Search")');
      
      // Verify search is applied
      await expect(page.locator('.appointments-list')).toBeVisible();
    }
  });

  test('doctor profile management', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, doctorCredentials.email, doctorCredentials.password);
    
    // Navigate to profile page
    await page.goto('/doctor/profile');
    
    // Verify profile page loads
    await expect(page.locator('text=Doctor Profile')).toBeVisible();
    
    // Verify profile information is displayed
    await expect(page.locator('text=Dr. Michael Roberts')).toBeVisible();
    await expect(page.locator('text=Internal Medicine')).toBeVisible();
    await expect(page.locator('text=INT567890')).toBeVisible();
    
    // Test profile editing
    await page.click('button:has-text("Edit Profile")');
    
    // Verify edit form
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('textarea[name="bio"]')).toBeVisible();
    
    // Update profile
    await page.fill('input[name="phone"]', '+1234567899');
    await page.fill('textarea[name="bio"]', 'Experienced internal medicine physician with 15+ years of practice.');
    
    // Save profile
    await page.click('button:has-text("Save Profile")');
    
    // Verify success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    // Verify updated information
    await expect(page.locator('text=+1234567899')).toBeVisible();
  });
});
