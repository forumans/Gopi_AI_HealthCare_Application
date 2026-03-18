import { chromium, BrowserContext, Page } from '@playwright/test';

// Test credentials from the requirements
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@clinic.com',
    password: 'Admin123!'
  },
  doctor: {
    email: 'doctor@clinic.com', // Will be created by admin
    password: 'Doctor123!'
  },
  patient: {
    email: 'patient@clinic.com', // Will be created by admin
    password: 'Patient123!'
  }
};

// Storage states for authenticated sessions
export const AdminStorageState = './tests/e2e/storage-states/admin.json';
export const DoctorStorageState = './tests/e2e/storage-states/doctor.json';
export const PatientStorageState = './tests/e2e/storage-states/patient.json';

// Helper to create authenticated storage states
export async function createStorageState(
  browser: typeof chromium,
  storagePath: string,
  email: string,
  password: string,
  role: 'admin' | 'doctor' | 'patient'
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to login page
  await page.goto(`/${role}/login`);
  
  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for successful login (redirect to dashboard or home)
  await page.waitForURL('/', { timeout: 10000 });
  
  // Save storage state
  await context.storageState({ path: storagePath });
  await context.close();
}

// Global setup function to create all storage states
export async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  
  try {
    // Create admin storage state (admin already exists in test database)
    await createStorageState(browser, AdminStorageState, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password, 'admin');
    
    console.log('✅ Admin storage state created');
    
  } catch (error) {
    console.error('❌ Failed to create storage states:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
