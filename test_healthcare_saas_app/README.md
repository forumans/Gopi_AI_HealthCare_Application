# Healthcare SaaS E2E Test Suite

Independent end-to-end testing suite for the Healthcare SaaS application using Playwright.

## 🎯 Overview

This is a **standalone test project** that can run independently from the main healthcare application. It provides comprehensive E2E testing for all critical workflows and business rules.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (>= 18.0.0)
2. **Healthcare Application Servers** running:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`
3. **Test Database** with admin user created

### Installation

```bash
# Clone or navigate to the test project
cd test_healthcare_saas_app

# Install dependencies
npm install

# Install Playwright browsers
npm run test:install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests with browser visible
npm run test:headed

# Run smoke tests only
npm run test:smoke

# Run specific test categories
npm run test:auth
npm run test:admin
npm run test:doctor
npm run test:patient
npm run test:appointments
npm run test:consultation

# Run on specific browsers
npm run test:project:chrome
npm run test:project:firefox
npm run test:project:safari

# View test reports
npm run test:report
```

## 📁 Project Structure

```
test_healthcare_saas_app/
├── package.json                 # Dependencies and scripts
├── playwright.config.ts         # Playwright configuration
├── tests/
│   ├── global-setup.ts         # Global test setup
│   ├── global-teardown.ts      # Global test cleanup
│   ├── fixtures.ts              # Test fixtures and setup
│   ├── helpers.ts               # Reusable helper functions
│   ├── storage-states.ts       # Authentication storage states
│   ├── smoke.spec.ts            # Quick health checks
│   ├── auth.spec.ts             # Authentication tests
│   ├── admin.spec.ts            # Admin workflow tests
│   ├── doctor.spec.ts           # Doctor workflow tests
│   ├── patient.spec.ts          # Patient workflow tests
│   ├── appointments.spec.ts     # Appointment booking tests
│   └── consultation.spec.ts     # Consultation flow tests
├── test-results/                # Test artifacts
├── playwright-report/           # HTML test reports
└── README.md                    # This file
```

## 🧪 Test Categories

### 🚭 Smoke Tests (`smoke.spec.ts`)
Quick health checks to verify application basic functionality:
- ✅ Application loads correctly
- ✅ Login pages accessible
- ✅ API health check
- ✅ Responsiveness
- ✅ Performance checks

### 🔐 Authentication Tests (`auth.spec.ts`)
Login, logout, and security validation:
- ✅ Admin login with valid/invalid credentials
- ✅ Doctor login functionality
- ✅ Patient login functionality
- ✅ Unauthorized access protection
- ✅ Logout and session management

### 👨‍💼 Admin Workflows (`admin.spec.ts`)
Complete administrative operations:
- ✅ Create doctor accounts
- ✅ Create patient accounts
- ✅ Create pharmacy records
- ✅ View and manage all records
- ✅ Search and filter functionality

### 👨‍⚕️ Doctor Workflows (`doctor.spec.ts`)
Doctor-specific operations:
- ✅ Login and dashboard access
- ✅ Create availability slots
- ✅ View appointments
- ✅ Start and manage consultations
- ✅ Prescription management

### 👩‍⚕️ Patient Workflows (`patient.spec.ts`)
Patient-specific operations:
- ✅ Dashboard and profile management
- ✅ View prescriptions and medical history
- ✅ Appointment booking (with dependencies)
- ✅ Billing and insurance information
- ✅ Notifications management

### 📅 Appointment Booking (`appointments.spec.ts`)
**CRITICAL BUSINESS RULES**:
- ✅ **Cannot book without doctor availability**
- ✅ **Doctor must create slots first**
- ✅ **Appointment validation and dependencies**
- ✅ **Cancel and reschedule functionality**
- ✅ **Search and filter appointments**

### 🏥 Consultation Flow (`consultation.spec.ts`)
Complete consultation workflow:
- ✅ Start consultation from appointment
- ✅ Complete consultation form
- ✅ Prescription management
- ✅ Pharmacy integration
- ✅ Consultation validation

## ⚠️ Critical Business Rules

### Appointment Booking Dependency

**This is the most critical business rule enforced in tests:**

1. **Step 1**: Admin creates a doctor
2. **Step 2**: Doctor logs in
3. **Step 3**: Doctor creates availability slots
4. **Step 4**: Slots are marked as AVAILABLE
5. **Step 5**: **THEN** patients can book appointments

**Test Enforcement:**
```typescript
test('CRITICAL: Cannot book appointment without doctor availability', async ({ page }) => {
  // Verify no available slots without doctor availability
  await expect(page.locator('text=No available slots')).toBeVisible();
  await expect(page.locator('.available-slot')).not.toBeVisible();
  await expect(page.locator('button:has-text("Book Appointment")')).toBeDisabled();
});
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):

```env
BASE_URL=http://localhost:5173
API_URL=http://localhost:8000
TEST_TIMEOUT=30000
RETRY_COUNT=2
```

### Playwright Configuration

Key settings in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  baseURL: 'http://localhost:5173',
  use: {
    actionTimeout: 10000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## 🎯 Test Data

### Default Test Credentials

```typescript
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@clinic.com',
    password: 'Admin123!'
  },
  doctor: {
    email: 'doctor@clinic.com',
    password: 'Doctor123!'
  },
  patient: {
    email: 'patient@clinic.com',
    password: 'Patient123!'
  }
};
```

### Test Data Creation

Tests automatically create required test data:
- Doctors, patients, and pharmacies
- Availability slots
- Appointments and consultations
- Medical records and prescriptions

## 📊 Test Reports

### HTML Report

After running tests, view the interactive HTML report:

```bash
npm run test:report
```

Features:
- 📈 Test execution timeline
- 🖼️ Screenshots of failures
- 📹 Video recordings
- 📝 Detailed error messages
- 🏷️ Test filtering and search

### Report Formats

- **HTML**: Interactive report (`playwright-report/index.html`)
- **JSON**: Machine-readable (`test-results.json`)
- **JUnit**: CI/CD integration (`test-results.xml`)

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run with debugger
npm run test:debug

# Run specific test in debug mode
npx playwright test --debug auth.spec.ts
```

### Code Generation

```bash
# Generate selectors interactively
npm run test:codegen

# Generate for specific URL
npx playwright codegen http://localhost:5173
```

### Trace Viewer

```bash
# View trace files
npx playwright show-trace trace.zip
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🚨 Troubleshooting

### Common Issues

1. **Servers Not Running**
   ```
   Error: connect ECONNREFUSED ::1:5173
   ```
   **Solution**: Start both backend and frontend servers

2. **Database Issues**
   ```
   Error: Can't connect to database
   ```
   **Solution**: Ensure test database is running and has admin user

3. **Authentication Failures**
   ```
   Error: Invalid credentials
   ```
   **Solution**: Verify admin user exists with correct credentials

4. **Browser Installation**
   ```
   Error: Executable doesn't exist
   ```
   **Solution**: Run `npm run test:install`

### Test Flakiness

If tests are flaky:

1. Increase timeouts in `playwright.config.ts`
2. Add explicit waits with `page.waitForSelector()`
3. Use more specific selectors
4. Check for race conditions

## 📝 Best Practices

### Test Organization

- ✅ Use descriptive test names
- ✅ Group related tests with `test.describe()`
- ✅ Use `test.beforeEach()` for setup
- ✅ Use `test.afterEach()` for cleanup

### Selectors

- ✅ Use `data-testid` attributes when possible
- ✅ Use semantic selectors (`button:has-text("Submit")`)
- ❌ Avoid brittle selectors (`div > div > span`)

### Waits

- ✅ Use `page.waitForSelector()` for explicit waits
- ✅ Use `page.waitForLoadState()` for navigation
- ❌ Avoid `page.waitForTimeout()` when possible

### Data Management

- ✅ Create test data in `beforeAll()` or `beforeEach()`
- ✅ Clean up test data in `afterEach()` or `afterAll()`
- ✅ Use unique test data to avoid conflicts

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure
2. Use the helper functions provided
3. Update this README if adding new features
4. Test on multiple browsers
5. Ensure tests are independent and repeatable

## 📞 Support

For issues with E2E tests:

1. Check the troubleshooting section above
2. Review test logs and error messages
3. Use debug mode to investigate failures
4. Check the Playwright documentation

## 🎯 Running Tests Independently

This test project is designed to run completely independently:

1. **Separate Dependencies**: Has its own `package.json`
2. **Independent Configuration**: Separate `playwright.config.ts`
3. **Standalone Tests**: All tests are self-contained
4. **No Source Code Dependencies**: Only tests the live application

### To Run Tests:

1. Start the healthcare application servers
2. Navigate to this test project
3. Install dependencies: `npm install`
4. Run tests: `npm test`

---

# From the HealthCare_Application root directory:
cd test_healthcare_saas_app

# Run all tests
npx playwright test

# Run smoke tests
npm run test:smoke

# Run tests with UI
npm run test:ui

# View reports
npx playwright show-report





**Happy Testing! 🧪**

This independent test suite ensures your healthcare application meets all business requirements and provides a reliable, scalable testing solution.
