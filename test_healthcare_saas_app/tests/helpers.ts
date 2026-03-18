import { Page, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './storage-states';

/**
 * Login helpers for different user types
 */

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
}

export async function loginAsDoctor(page: Page, email?: string, password?: string): Promise<void> {
  const doctorEmail = email || TEST_CREDENTIALS.doctor.email;
  const doctorPassword = password || TEST_CREDENTIALS.doctor.password;
  
  await page.goto('/doctors/login');
  await page.fill('input[type="email"]', doctorEmail);
  await page.fill('input[type="password"]', doctorPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
}

export async function loginAsPatient(page: Page, email?: string, password?: string): Promise<void> {
  const patientEmail = email || TEST_CREDENTIALS.patient.email;
  const patientPassword = password || TEST_CREDENTIALS.patient.password;
  
  await page.goto('/patients/login');
  await page.fill('input[type="email"]', patientEmail);
  await page.fill('input[type="password"]', patientPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL('/patients/appointments', { timeout: 10000 });
}

/**
 * Admin creation helpers
 */

export async function createDoctor(page: Page, doctorData?: {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
}): Promise<{ email: string; password: string }> {
  const defaultDoctorData = {
    fullName: 'Dr. John Doe',
    email: TEST_CREDENTIALS.doctor.email,
    password: TEST_CREDENTIALS.doctor.password,
    phone: '+1234567890',
    specialty: 'General Practice',
    licenseNumber: 'DOC123456',
    dateOfBirth: '1980-01-15'
  };
  
  const data = { ...defaultDoctorData, ...doctorData };
  
  // Navigate to admin register doctor page
  await page.goto('/admin/register-doctor');
  
  // Fill the doctor registration form
  await page.fill('input[name="fullName"]', data.fullName);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="phone"]', data.phone);
  await page.fill('input[name="specialty"]', data.specialty);
  await page.fill('input[name="licenseNumber"]', data.licenseNumber);
  await page.fill('input[name="dateOfBirth"]', data.dateOfBirth);
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for success message and redirect
  await expect(page.locator('text=Doctor registered successfully')).toBeVisible({ timeout: 10000 });
  
  return { email: data.email, password: data.password };
}

export async function createPatient(page: Page, patientData?: {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}): Promise<{ email: string; password: string }> {
  const defaultPatientData = {
    fullName: 'Jane Smith',
    email: TEST_CREDENTIALS.patient.email,
    password: TEST_CREDENTIALS.patient.password,
    phone: '+1234567890',
    dateOfBirth: '1990-05-20',
    gender: 'Female',
    addressLine1: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '12345',
    insuranceProvider: 'Health Insurance Co',
    insurancePolicyNumber: 'POL123456'
  };
  
  const data = { ...defaultPatientData, ...patientData };
  
  // Navigate to admin register patient page
  await page.goto('/admin/register-patient');
  
  // Fill the patient registration form
  await page.fill('input[name="fullName"]', data.fullName);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="phone"]', data.phone);
  await page.fill('input[name="dateOfBirth"]', data.dateOfBirth);
  await page.selectOption('select[name="gender"]', data.gender);
  await page.fill('input[name="addressLine1"]', data.addressLine1);
  await page.fill('input[name="city"]', data.city);
  await page.fill('input[name="state"]', data.state);
  await page.fill('input[name="postalCode"]', data.postalCode);
  await page.fill('input[name="insuranceProvider"]', data.insuranceProvider);
  await page.fill('input[name="insurancePolicyNumber"]', data.insurancePolicyNumber);
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for success message
  await expect(page.locator('text=Patient registered successfully')).toBeVisible({ timeout: 10000 });
  
  return { email: data.email, password: data.password };
}

export async function createPharmacy(page: Page, pharmacyData?: {
  name?: string;
  address?: string;
  phone?: string;
}): Promise<void> {
  const defaultPharmacyData = {
    name: 'Test Pharmacy',
    address: '456 Pharmacy Ave, Medtown, CA 67890',
    phone: '+1234567891'
  };
  
  const data = { ...defaultPharmacyData, ...pharmacyData };
  
  // Navigate to admin register pharmacy page (assuming this exists)
  await page.goto('/admin/register-pharmacy');
  
  // Fill the pharmacy registration form
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="address"]', data.address);
  await page.fill('input[name="phone"]', data.phone);
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for success message
  await expect(page.locator('text=Pharmacy registered successfully')).toBeVisible({ timeout: 10000 });
}

/**
 * Doctor availability helper
 */

export async function createDoctorAvailability(page: Page): Promise<void> {
  // Navigate to availability page
  await page.goto('/doctor/availability');
  
  // Set date range (next 7 days)
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  
  await page.fill('input[name="startDate"]', today.toISOString().split('T')[0]);
  await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
  
  // Set time slots (8 AM - 5 PM, 1-hour slots)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ];
  
  for (const timeSlot of timeSlots) {
    // Check the time slot checkbox or select it (implementation depends on UI)
    await page.check(`input[value="${timeSlot}"]`);
  }
  
  // Submit the availability form
  await page.click('button[type="submit"]');
  
  // Wait for success message
  await expect(page.locator('text=Availability created successfully')).toBeVisible({ timeout: 10000 });
  
  // Validate slots appear in UI
  for (const timeSlot of timeSlots) {
    await expect(page.locator(`text=${timeSlot}`)).toBeVisible();
  }
}

/**
 * Appointment booking helper
 */

export async function bookAppointment(page: Page, doctorName?: string, problemDescription?: string): Promise<void> {
  // Navigate to appointment booking page
  await page.goto('/patient/appointments');
  
  // Select doctor (if not already selected)
  if (doctorName) {
    await page.selectOption('select[name="doctorId"]', doctorName);
  }
  
  // Enter problem description
  if (problemDescription) {
    await page.fill('textarea[name="problemDescription"]', problemDescription);
  }
  
  // Wait for available slots to load
  await page.waitForSelector('.available-slot', { timeout: 10000 });
  
  // Click on the first available slot
  const firstSlot = page.locator('.available-slot').first();
  await firstSlot.click();
  
  // Confirm booking
  await page.click('button[type="submit"]');
  
  // Wait for success message
  await expect(page.locator('text=Appointment booked successfully')).toBeVisible({ timeout: 10000 });
  
  // Validate slot becomes unavailable
  await expect(firstSlot).toHaveClass(/booked|unavailable/);
  
  // Validate appointment appears in list
  await expect(page.locator('.appointment-item')).toBeVisible();
}

/**
 * Navigation helpers
 */

export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

export async function waitForElement(page: Page, selector: string, timeout?: number): Promise<void> {
  await page.waitForSelector(selector, { timeout: timeout || 10000 });
}

/**
 * Form validation helpers
 */

export async function fillForm(page: Page, formData: Record<string, string>): Promise<void> {
  for (const [fieldName, value] of Object.entries(formData)) {
    const element = page.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
    await element.fill(value);
  }
}

export async function submitForm(page: Page, buttonSelector?: string): Promise<void> {
  const button = buttonSelector ? page.locator(buttonSelector) : page.locator('button[type="submit"]');
  await button.click();
}
