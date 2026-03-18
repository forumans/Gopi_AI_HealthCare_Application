import { test as base, Page } from '@playwright/test';
import { AdminStorageState, DoctorStorageState, PatientStorageState } from './storage-states';

// Define test fixtures
export const test = base.extend<{
  page: Page;
  adminPage: Page;
  doctorPage: Page;
  patientPage: Page;
}>({
  // Regular page
  page: async ({ page }, use) => {
    await use(page);
  },
  
  // Admin authenticated page
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: AdminStorageState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  // Doctor authenticated page
  doctorPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: DoctorStorageState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  // Patient authenticated page
  patientPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: PatientStorageState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
export type TestFixtures = typeof test;
