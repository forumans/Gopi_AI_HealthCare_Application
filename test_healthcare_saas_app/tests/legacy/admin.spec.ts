import { test, expect } from './fixtures';
import { createDoctor, createPatient, createPharmacy } from './helpers';

test.describe('Admin Workflows', () => {
  test.beforeEach(async ({ adminPage }) => {
    // Admin is already authenticated via adminPage fixture
  });

  test('create doctor successfully', async ({ adminPage: page }) => {
    // Navigate to register doctor page
    await page.goto('/admin/register-doctor');
    
    // Verify the form is loaded
    await expect(page.locator('h1')).toContainText('Register Doctor');
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="specialty"]')).toBeVisible();
    await expect(page.locator('input[name="licenseNumber"]')).toBeVisible();
    await expect(page.locator('input[name="dateOfBirth"]')).toBeVisible();
    
    // Create a doctor
    const doctorData = {
      fullName: 'Dr. Sarah Wilson',
      email: 'drwilson@clinic.com',
      password: 'Doctor123!',
      phone: '+1234567890',
      specialty: 'Cardiology',
      licenseNumber: 'CARD789012',
      dateOfBirth: '1975-03-22'
    };
    
    await createDoctor(page, doctorData);
    
    // Verify success message
    await expect(page.locator('text=Doctor registered successfully')).toBeVisible();
    
    // Navigate to users list to verify doctor appears
    await page.goto('/admin/users');
    await expect(page.locator('text=Dr. Sarah Wilson')).toBeVisible();
    await expect(page.locator('text=drwilson@clinic.com')).toBeVisible();
  });

  test('create patient successfully', async ({ adminPage: page }) => {
    // Navigate to register patient page
    await page.goto('/admin/register-patient');
    
    // Verify the form is loaded
    await expect(page.locator('h1')).toContainText('Register Patient');
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="dateOfBirth"]')).toBeVisible();
    await expect(page.locator('select[name="gender"]')).toBeVisible();
    await expect(page.locator('input[name="addressLine1"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    await expect(page.locator('input[name="state"]')).toBeVisible();
    await expect(page.locator('input[name="postalCode"]')).toBeVisible();
    await expect(page.locator('input[name="insuranceProvider"]')).toBeVisible();
    await expect(page.locator('input[name="insurancePolicyNumber"]')).toBeVisible();
    
    // Create a patient
    const patientData = {
      fullName: 'Michael Johnson',
      email: 'mjohnson@clinic.com',
      password: 'Patient123!',
      phone: '+1234567891',
      dateOfBirth: '1985-07-15',
      gender: 'Male',
      addressLine1: '789 Patient Street',
      city: 'Healthville',
      state: 'CA',
      postalCode: '54321',
      insuranceProvider: 'MediCare Plus',
      insurancePolicyNumber: 'POL987654'
    };
    
    await createPatient(page, patientData);
    
    // Verify success message
    await expect(page.locator('text=Patient registered successfully')).toBeVisible();
    
    // Navigate to users list to verify patient appears
    await page.goto('/admin/users');
    await expect(page.locator('text=Michael Johnson')).toBeVisible();
    await expect(page.locator('text=mjohnson@clinic.com')).toBeVisible();
  });

  test('create pharmacy successfully', async ({ adminPage: page }) => {
    // Navigate to register pharmacy page
    await page.goto('/admin/register-pharmacy');
    
    // Verify the form is loaded
    await expect(page.locator('h1')).toContainText('Register Pharmacy');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="address"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    
    // Create a pharmacy
    const pharmacyData = {
      name: 'Central Medical Pharmacy',
      address: '321 Pharmacy Boulevard, Medtown, CA 98765',
      phone: '+1234567892'
    };
    
    await createPharmacy(page, pharmacyData);
    
    // Verify success message
    await expect(page.locator('text=Pharmacy registered successfully')).toBeVisible();
    
    // Navigate to pharmacies list to verify pharmacy appears
    await page.goto('/admin/pharmacies');
    await expect(page.locator('text=Central Medical Pharmacy')).toBeVisible();
    await expect(page.locator('text=321 Pharmacy Boulevard')).toBeVisible();
  });

  test('view all records in admin dashboard', async ({ adminPage: page }) => {
    // Navigate to admin dashboard
    await page.goto('/');
    
    // Verify dashboard sections are visible
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=System Statistics')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Check for quick action buttons
    await expect(page.locator('button:has-text("Register New Doctor")')).toBeVisible();
    await expect(page.locator('button:has-text("Register New Patient")')).toBeVisible();
    await expect(page.locator('button:has-text("Register Pharmacy")')).toBeVisible();
    
    // Navigate to users section
    await page.click('button:has-text("Manage Users")');
    await expect(page.locator('text=Users Management')).toBeVisible();
    
    // Verify users table is present
    await expect(page.locator('table.users-table')).toBeVisible();
    
    // Navigate to reports section
    await page.click('button:has-text("View Reports")');
    await expect(page.locator('text=Reports')).toBeVisible();
    
    // Verify reports sections
    await expect(page.locator('text=Appointment Statistics')).toBeVisible();
    await expect(page.locator('text=User Statistics')).toBeVisible();
  });

  test('validate record persistence across pages', async ({ adminPage: page }) => {
    // Create a doctor
    const doctorData = {
      fullName: 'Dr. Emily Chen',
      email: 'drchen@clinic.com',
      password: 'Doctor123!',
      phone: '+1234567893',
      specialty: 'Pediatrics',
      licenseNumber: 'PED345678',
      dateOfBirth: '1982-11-08'
    };
    
    await createDoctor(page, doctorData);
    
    // Navigate away from users page
    await page.goto('/');
    
    // Navigate back to users page
    await page.goto('/admin/users');
    
    // Verify doctor still appears
    await expect(page.locator('text=Dr. Emily Chen')).toBeVisible();
    await expect(page.locator('text=drchen@clinic.com')).toBeVisible();
    
    // Create a patient
    const patientData = {
      fullName: 'Robert Davis',
      email: 'rdavis@clinic.com',
      password: 'Patient123!',
      phone: '+1234567894',
      dateOfBirth: '1992-04-30',
      gender: 'Male',
      addressLine1: '555 Patient Lane',
      city: 'Wellness City',
      state: 'CA',
      postalCode: '11111',
      insuranceProvider: 'HealthFirst Insurance',
      insurancePolicyNumber: 'POL555777'
    };
    
    await createPatient(page, patientData);
    
    // Navigate away and back again
    await page.goto('/');
    await page.goto('/admin/users');
    
    // Verify both records persist
    await expect(page.locator('text=Dr. Emily Chen')).toBeVisible();
    await expect(page.locator('text=Robert Davis')).toBeVisible();
  });

  test('search and filter functionality', async ({ adminPage: page }) => {
    // Create multiple users for testing search
    await createDoctor(page, {
      fullName: 'Dr. Alex Turner',
      email: 'drturner@clinic.com',
      password: 'Doctor123!',
      phone: '+1234567895',
      specialty: 'Neurology',
      licenseNumber: 'NEUR901234',
      dateOfBirth: '1978-06-12'
    });
    
    await createPatient(page, {
      fullName: 'Lisa Anderson',
      email: 'landerson@clinic.com',
      password: 'Patient123!',
      phone: '+1234567896',
      dateOfBirth: '1988-09-25',
      gender: 'Female',
      addressLine1: '999 Health Street',
      city: 'Medical City',
      state: 'CA',
      postalCode: '22222',
      insuranceProvider: 'CarePlus',
      insurancePolicyNumber: 'POL888999'
    });
    
    // Navigate to users page
    await page.goto('/admin/users');
    
    // Test search functionality
    await page.fill('input[placeholder*="Search"]', 'Dr. Alex Turner');
    await page.click('button:has-text("Search")');
    
    // Verify only Dr. Alex Turner appears
    await expect(page.locator('text=Dr. Alex Turner')).toBeVisible();
    await expect(page.locator('text=Lisa Anderson')).not.toBeVisible();
    
    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.click('button:has-text("Search")');
    
    // Verify both users appear again
    await expect(page.locator('text=Dr. Alex Turner')).toBeVisible();
    await expect(page.locator('text=Lisa Anderson')).toBeVisible();
    
    // Test filter by role
    await page.selectOption('select[name="roleFilter"]', 'DOCTOR');
    
    // Verify only doctors appear
    await expect(page.locator('text=Dr. Alex Turner')).toBeVisible();
    await expect(page.locator('text=Lisa Anderson')).not.toBeVisible();
    
    // Test filter by role - Patients
    await page.selectOption('select[name="roleFilter"]', 'PATIENT');
    
    // Verify only patients appear
    await expect(page.locator('text=Dr. Alex Turner')).not.toBeVisible();
    await expect(page.locator('text=Lisa Anderson')).toBeVisible();
  });
});
