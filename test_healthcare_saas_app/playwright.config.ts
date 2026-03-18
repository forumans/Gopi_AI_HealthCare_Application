import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Healthcare SaaS E2E Tests
 * 
 * This is an independent test project that can run separately from the main application.
 * It tests the Healthcare SaaS application running on:
 * - Backend: http://localhost:8000
 * - Frontend: http://localhost:5173
 * 
 * Prerequisites:
 * 1. Healthcare application servers must be running
 * 2. Test database must be available
 * 3. Admin user must exist in test database
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global test configuration
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000 // 5 seconds for assertions
  },
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],
  
  // Global settings for all tests
  use: {
    // Base URL for the healthcare application
    baseURL: 'http://localhost:5173',
    
    // Action timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Recording settings
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser settings
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Test isolation
    testIdAttribute: 'data-testid'
  },

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      testMatch: '**/*.spec.ts',
      testIgnore: '**/smoke.spec.ts'
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      testMatch: '**/*.spec.ts',
      testIgnore: '**/smoke.spec.ts'
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      testMatch: '**/*.spec.ts',
      testIgnore: '**/smoke.spec.ts'
    },
    {
      name: 'smoke-tests',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      testMatch: '**/smoke.spec.ts',
      retries: 0,
      globalSetup: undefined,
      globalTeardown: undefined
    }
  ],

  // Test organization
  testIgnore: [
    '**/node_modules/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/playwright/.cache/**'
  ],

  // Output directories
  outputDir: 'test-results',
  
  // Global setup and teardown (only for full test suite)
  globalSetup: process.env.SKIP_GLOBAL_SETUP ? undefined : require.resolve('./tests/global-setup.ts'),
  globalTeardown: process.env.SKIP_GLOBAL_SETUP ? undefined : require.resolve('./tests/global-teardown.ts'),
  
  // Environment variables
  env: {
    BASE_URL: 'http://localhost:5173',
    API_URL: 'http://localhost:8000',
    TEST_TIMEOUT: '30000',
    RETRY_COUNT: '2'
  },

  // Web server configuration (optional - if you want Playwright to start servers)
  webServer: {
    command: 'echo "Please start healthcare application servers manually"',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Metadata for test organization
  metadata: {
    'Test Environment': 'E2E Test Suite',
    'Application': 'Healthcare SaaS',
    'Version': '1.0.0',
    'Browser Support': ['Chrome', 'Firefox', 'Safari']
  }
});
