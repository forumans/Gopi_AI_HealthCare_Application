# Healthcare Application End-to-End Tests

This directory contains comprehensive end-to-end tests for the Healthcare Application using Playwright.

## Test Coverage

### Patient Tests (`patient_e2e.test.ts`)
- Patient Registration
- Patient Login
- View Appointments
- View Prescriptions
- Book Appointments
- Update Profile
- View Medical History
- Upload Documents

### Doctor Tests (`doctor_e2e.test.ts`)
- Doctor Registration
- Doctor Login
- View Today's Appointments
- Manage Availability
- View All Appointments
- Conduct Consultation
- Search Patients
- View Patient Profiles
- Update Profile
- Cancel Appointments
- View Availability Calendar

### Admin Tests (`admin_e2e.test.ts`)
- Admin Registration
- Admin Login
- View Dashboard Statistics
- Manage Users
- View Patients List
- View Doctors List
- View Appointments
- View System Health
- Search Users
- Deactivate Users
- View Audit Logs
- Filter Audit Logs
- View System Reports
- Generate Reports
- Manage System Settings
- Update Settings
- View Database Statistics

## Setup Instructions

### Prerequisites
- Node.js installed
- Playwright installed

### Installation

1. Navigate to the tests directory:
```bash
cd tests/end_to_end
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install-browsers
```

### Running Tests

Make sure your backend server is running on `http://localhost:8000` and frontend on `http://localhost:5173`.

#### Run all tests:
```bash
npm test
```

#### Run specific role tests:
```bash
# Patient tests only
npm run test:patient

# Doctor tests only
npm run test:doctor

# Admin tests only
npm run test:admin
```

#### Run tests with UI (browser visible):
```bash
npm run test:headed
```

#### Run tests with Playwright UI:
```bash
npm run test:ui
```

#### Debug tests:
```bash
npm run test:debug
```

#### View test reports:
```bash
npm run test:report
```

## Test Data Strategy

The tests use the following test data:
- **Patient**: `patient@test.com` / `password123`
- **Doctor**: `doctor@test.com` / `password123`
- **Admin**: `admin@test.com` / `admin123`

## Test Data Attributes

The tests use `data-testid` attributes to locate elements. Make sure your frontend components include these attributes for proper test coverage.

### Required data-testid attributes:
- `patient-name`, `patient-email`, `patient-phone`, `patient-dob`, `patient-password`, `patient-confirm-password`
- `doctor-name`, `doctor-email`, `doctor-phone`, `doctor-specialization`, `doctor-password`, `doctor-confirm-password`
- `admin-name`, `admin-email`, `admin-phone`, `admin-password`, `admin-confirm-password`
- `email`, `password`, `login-button`, `register-button`
- Navigation links: `appointments-link`, `prescriptions-link`, `profile-link`, `availability-link`, etc.
- Form elements: `symptoms`, `diagnosis`, `lab-results`, `medication`, `dosage`, `instructions`, `pharmacy-select`

## CI/CD Integration

These tests are designed to work with CI/CD pipelines. The configuration automatically:
- Runs tests in parallel
- Takes screenshots on failure
- Generates HTML reports
- Uses CI-specific settings

## Troubleshooting

### Common Issues:
1. **Tests fail to find elements**: Ensure `data-testid` attributes are present in your frontend components
2. **Server not available**: Make sure both frontend and backend servers are running
3. **Authentication issues**: Verify test users exist in your database
4. **Timeout errors**: Increase timeout values in playwright.config.ts if needed

### Debugging:
- Use `npm run test:debug` to step through tests
- Use `npm run test:ui` to see live test execution
- Check HTML reports for detailed failure information

## Best Practices

1. **Isolate tests**: Each test should be independent and not rely on other tests
2. **Clean state**: Tests should clean up after themselves
3. **Realistic data**: Use realistic test data that matches your application
4. **Error handling**: Test both success and failure scenarios
5. **Performance**: Keep tests focused and fast for better CI/CD performance

## Adding New Tests

When adding new tests:
1. Follow the existing naming convention
2. Use descriptive test names
3. Include proper assertions
4. Add data-testid attributes to your frontend components
5. Update this README with new test descriptions

## File Structure

```
tests/end_to_end/
├── patient_e2e.test.ts     # Patient-related tests
├── doctor_e2e.test.ts      # Doctor-related tests
├── admin_e2e.test.ts       # Admin-related tests
├── playwright.config.ts    # Playwright configuration
├── package.json           # Test dependencies
└── README.md              # This file
```
