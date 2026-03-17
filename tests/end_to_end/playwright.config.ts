import { defineConfig, devices } from '@playwright/test';
import { TEST_CONFIG } from './test-env-config';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: TEST_CONFIG.urls.frontend,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure. */
    screenshot: 'only-on-failure',

    /* Test timeout */
    timeout: 60000,
    
    /* Action timeout */
    actionTimeout: 10000,
  },

  /* Global setup and teardown */
  globalSetup: './test-global-setup.ts',
  globalTeardown: './test-global-teardown.ts',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      url: TEST_CONFIG.urls.frontend,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../.. && python -m uvicorn server.app.main:app --host 127.0.0.1 --port 8000',
      url: TEST_CONFIG.urls.backend,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});
