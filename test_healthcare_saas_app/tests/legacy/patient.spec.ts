import { test, expect } from './fixtures';
import { createPatient, loginAsPatient } from './helpers';

test.describe('Patient View', () => {
  let patientCredentials: { email: string; password: string };

  test.beforeAll(async ({ adminPage: page }) => {
    // Create a patient for testing
    patientCredentials = await createPatient(page, {
      fullName: 'Elizabeth Johnson',
      email: 'ejohnson@clinic.com',
      password: 'Patient123!',
      phone: '+1234567102',
      dateOfBirth: '1990-06-15',
      gender: 'Female',
      addressLine1: '888 Patient Care Lane',
      city: 'Wellness City',
      state: 'CA',
      postalCode: '66666',
      insuranceProvider: 'Complete Health Insurance',
      insurancePolicyNumber: 'POL666999'
    });
  });

  test('patient dashboard and profile view', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Verify successful login
    await expect(page).toHaveURL('/');
    
    // Navigate to patient dashboard
    await page.goto('/patient/dashboard');
    
    // Verify dashboard elements
    await expect(page.locator('text=Patient Dashboard')).toBeVisible();
    await expect(page.locator('text=My Appointments')).toBeVisible();
    await expect(page.locator('text=My Prescriptions')).toBeVisible();
    await expect(page.locator('text=Medical History')).toBeVisible();
    
    // Verify patient information is displayed
    await expect(page.locator('text=Elizabeth Johnson')).toBeVisible();
    await expect(page.locator('text=Complete Health Insurance')).toBeVisible();
  });

  test('view prescriptions', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to prescriptions page
    await page.goto('/patient/prescriptions');
    
    // Verify prescriptions page loads
    await expect(page.locator('text=My Prescriptions')).toBeVisible();
    await expect(page.locator('.prescriptions-list')).toBeVisible();
    
    // Check for prescription filters
    await expect(page.locator('select[name="statusFilter"]')).toBeVisible();
    await expect(page.locator('select[name="dateFilter"]')).toBeVisible();
    
    // Look for prescription items
    const prescriptionItems = page.locator('.prescription-item');
    
    if (await prescriptionItems.count() > 0) {
      // Verify prescription details are visible
      await expect(prescriptionItems.first()).toBeVisible();
      
      // Click on first prescription to view details
      await prescriptionItems.first().click();
      
      // Verify prescription details modal/page
      await expect(page.locator('text=Prescription Details')).toBeVisible();
      await expect(page.locator('text=Medication')).toBeVisible();
      await expect(page.locator('text=Dosage')).toBeVisible();
      await expect(page.locator('text=Instructions')).toBeVisible();
      await expect(page.locator('text=Pharmacy')).toBeVisible();
      await expect(page.locator('text=Doctor')).toBeVisible();
      
      // Verify medication information
      await expect(page.locator('.medication-name')).toBeVisible();
      await expect(page.locator('.dosage-info')).toBeVisible();
      await expect(page.locator('.instructions')).toBeVisible();
      
      // Close prescription details
      await page.click('button:has-text("Close")');
      
    } else {
      // Verify empty state when no prescriptions
      await expect(page.locator('text=No prescriptions found')).toBeVisible();
    }
  });

  test('view medical history', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to medical history page
    await page.goto('/patient/medical-history');
    
    // Verify medical history page loads
    await expect(page.locator('text=Medical History')).toBeVisible();
    await expect(page.locator('.medical-history-container')).toBeVisible();
    
    // Check for different sections
    await expect(page.locator('text=Consultations')).toBeVisible();
    await expect(page.locator('text=Lab Results')).toBeVisible();
    await expect(page.locator('text=Diagnoses')).toBeVisible();
    
    // Test consultations section
    const consultationItems = page.locator('.consultation-item');
    
    if (await consultationItems.count() > 0) {
      // Verify consultation details
      await expect(consultationItems.first()).toBeVisible();
      
      // Click on first consultation
      await consultationItems.first().click();
      
      // Verify consultation details
      await expect(page.locator('text=Consultation Details')).toBeVisible();
      await expect(page.locator('text=Date')).toBeVisible();
      await expect(page.locator('text=Doctor')).toBeVisible();
      await expect(page.locator('text=Symptoms')).toBeVisible();
      await expect(page.locator('text=Diagnosis')).toBeVisible();
      
      // Close consultation details
      await page.click('button:has-text("Close")');
    }
    
    // Test lab results section
    const labResultItems = page.locator('.lab-result-item');
    
    if (await labResultItems.count() > 0) {
      // Verify lab result details
      await expect(labResultItems.first()).toBeVisible();
      
      // Click on first lab result
      await labResultItems.first().click();
      
      // Verify lab result details
      await expect(page.locator('text=Lab Results')).toBeVisible();
      await expect(page.locator('text=Test Name')).toBeVisible();
      await expect(page.locator('text=Result')).toBeVisible();
      await expect(page.locator('text=Reference Range')).toBeVisible();
      await expect(page.locator('text=Date')).toBeVisible();
      
      // Close lab result details
      await page.click('button:has-text("Close")');
    }
  });

  test('filter and search medical records', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to medical history page
    await page.goto('/patient/medical-history');
    
    // Test date filtering
    const dateFilter = page.locator('select[name="dateFilter"]');
    
    if (await dateFilter.isVisible()) {
      await dateFilter.selectOption('last_month');
      await page.click('button:has-text("Filter")');
      
      // Verify filter is applied
      await expect(page.locator('.medical-history-container')).toBeVisible();
      
      // Reset filter
      await dateFilter.selectOption('all');
      await page.click('button:has-text("Filter")');
    }
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      // Search by diagnosis
      await searchInput.fill('hypertension');
      await page.click('button:has-text("Search")');
      
      // Verify search results
      await expect(page.locator('.medical-history-container')).toBeVisible();
      
      // Clear search
      await searchInput.fill('');
      await page.click('button:has-text("Search")');
      
      // Verify all records are shown again
      await expect(page.locator('.medical-history-container')).toBeVisible();
    }
  });

  test('download medical records', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to medical history page
    await page.goto('/patient/medical-history');
    
    // Look for download buttons
    const downloadButtons = page.locator('button:has-text("Download")');
    
    if (await downloadButtons.count() > 0) {
      // Test downloading individual record
      await downloadButtons.first().click();
      
      // Verify download starts (this would depend on implementation)
      // For now, just verify the button exists and is clickable
      await expect(downloadButtons.first()).toBeVisible();
    }
    
    // Test download all records
    const downloadAllButton = page.locator('button:has-text("Download All")');
    
    if (await downloadAllButton.isVisible()) {
      await downloadAllButton.click();
      
      // Verify download confirmation
      await expect(page.locator('text=Download started')).toBeVisible();
    }
  });

  test('view appointment history', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to appointments page
    await page.goto('/patient/appointments');
    
    // Verify appointments page loads
    await expect(page.locator('text=My Appointments')).toBeVisible();
    await expect(page.locator('.appointments-list')).toBeVisible();
    
    // Look for appointment items
    const appointmentItems = page.locator('.appointment-item');
    
    if (await appointmentItems.count() > 0) {
      // Verify appointment details
      await expect(appointmentItems.first()).toBeVisible();
      
      // Click on first appointment
      await appointmentItems.first().click();
      
      // Verify appointment details
      await expect(page.locator('text=Appointment Details')).toBeVisible();
      await expect(page.locator('text=Date & Time')).toBeVisible();
      await expect(page.locator('text=Doctor')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
      
      // Close appointment details
      await page.click('button:has-text("Close")');
    }
    
    // Test filtering appointments
    const statusFilter = page.locator('select[name="statusFilter"]');
    
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('completed');
      await page.click('button:has-text("Filter")');
      
      // Verify filter is applied
      await expect(page.locator('.appointments-list')).toBeVisible();
      
      // Reset filter
      await statusFilter.selectOption('all');
      await page.click('button:has-text("Filter")');
    }
  });

  test('patient profile management', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to profile page
    await page.goto('/patient/profile');
    
    // Verify profile page loads
    await expect(page.locator('text=Patient Profile')).toBeVisible();
    
    // Verify profile information is displayed
    await expect(page.locator('text=Elizabeth Johnson')).toBeVisible();
    await expect(page.locator('text=ejohnson@clinic.com')).toBeVisible();
    await expect(page.locator('text=+1234567102')).toBeVisible();
    await expect(page.locator('text=Complete Health Insurance')).toBeVisible();
    
    // Test profile editing
    await page.click('button:has-text("Edit Profile")');
    
    // Verify edit form
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="addressLine1"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    await expect(page.locator('input[name="state"]')).toBeVisible();
    await expect(page.locator('input[name="postalCode"]')).toBeVisible();
    await expect(page.locator('input[name="insuranceProvider"]')).toBeVisible();
    await expect(page.locator('input[name="insurancePolicyNumber"]')).toBeVisible();
    
    // Update profile information
    await page.fill('input[name="phone"]', '+1234567103');
    await page.fill('input[name="city"]', 'New Wellness City');
    await page.fill('input[name="insurancePolicyNumber"]', 'POL777888');
    
    // Save profile
    await page.click('button:has-text("Save Profile")');
    
    // Verify success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    // Verify updated information
    await expect(page.locator('text=+1234567103')).toBeVisible();
    await expect(page.locator('text=New Wellness City')).toBeVisible();
    await expect(page.locator('text=POL777888')).toBeVisible();
  });

  test('billing and insurance information', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to billing page (if it exists)
    await page.goto('/patient/billing');
    
    // Verify billing page loads
    await expect(page.locator('text=Billing & Insurance')).toBeVisible();
    
    // Verify insurance information
    await expect(page.locator('text=Insurance Provider')).toBeVisible();
    await expect(page.locator('text=Complete Health Insurance')).toBeVisible();
    await expect(page.locator('text=Policy Number')).toBeVisible();
    await expect(page.locator('text=POL777888')).toBeVisible();
    
    // Look for billing history
    const billingItems = page.locator('.billing-item');
    
    if (await billingItems.count() > 0) {
      // Verify billing details
      await expect(billingItems.first()).toBeVisible();
      
      // Click on first billing item
      await billingItems.first().click();
      
      // Verify billing details
      await expect(page.locator('text=Billing Details')).toBeVisible();
      await expect(page.locator('text=Service Date')).toBeVisible();
      await expect(page.locator('text=Amount')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
      
      // Close billing details
      await page.click('button:has-text("Close")');
    }
  });

  test('notifications and reminders', async ({ page }) => {
    // Login as patient
    await loginAsPatient(page, patientCredentials.email, patientCredentials.password);
    
    // Navigate to notifications page (if it exists)
    await page.goto('/patient/notifications');
    
    // Verify notifications page loads
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('.notifications-list')).toBeVisible();
    
    // Look for notification items
    const notificationItems = page.locator('.notification-item');
    
    if (await notificationItems.count() > 0) {
      // Verify notification details
      await expect(notificationItems.first()).toBeVisible();
      
      // Click on first notification
      await notificationItems.first().click();
      
      // Verify notification details
      await expect(page.locator('text=Notification Details')).toBeVisible();
      await expect(page.locator('text=Message')).toBeVisible();
      await expect(page.locator('text=Date')).toBeVisible();
      
      // Mark as read
      await page.click('button:has-text("Mark as Read")');
      
      // Verify notification is marked as read
      await expect(notificationItems.first()).toHaveClass(/read/);
      
    } else {
      // Verify empty state when no notifications
      await expect(page.locator('text=No notifications')).toBeVisible();
    }
    
    // Test notification settings
    const settingsButton = page.locator('button:has-text("Notification Settings")');
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Verify settings modal
      await expect(page.locator('text=Notification Settings')).toBeVisible();
      await expect(page.locator('input[name="emailNotifications"]')).toBeVisible();
      await expect(page.locator('input[name="smsNotifications"]')).toBeVisible();
      await expect(page.locator('input[name="appointmentReminders"]')).toBeVisible();
      
      // Update settings
      await page.check('input[name="emailNotifications"]');
      await page.check('input[name="appointmentReminders"]');
      
      // Save settings
      await page.click('button:has-text("Save Settings")');
      
      // Verify success message
      await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    }
  });
});
