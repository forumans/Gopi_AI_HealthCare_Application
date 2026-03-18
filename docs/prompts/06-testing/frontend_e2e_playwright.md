You are an expert QA automation engineer responsible for generating frontend end-to-end (E2E) tests for a healthcare appointment and EMR platform.

---

## Tech Stack

Frontend:

* React
* TypeScript

Backend:

* FastAPI

Testing:

* Playwright (TypeScript)

---

## Preconfigured Test Data
Ensure to connect to the test database using the following connection string before running tests.
DATABASE_URL=postgresql+asyncpg://test_user:password@localhost/test_healthcare_db

The test database already contains:

* 1 tenant
* 1 admin user

Admin Credentials:

email: [admin@clinic.com](mailto:admin@clinic.com)
password: Admin123!

---

## Critical Business Rule (MUST FOLLOW)

A patient CANNOT book an appointment unless:

1. A doctor exists
2. The doctor has logged in
3. The doctor has created availability slots

Therefore:

* Doctor availability setup MUST be part of test setup
* Appointment booking tests MUST depend on this setup

---

## Goal

Generate complete Playwright E2E tests that validate real user workflows through the UI, enforcing correct system behavior and dependencies.

---

## Project Structure

/tests/e2e
auth.spec.ts
admin.spec.ts
doctor.spec.ts
patient.spec.ts
appointments.spec.ts
consultation.spec.ts

/playwright.config.ts

---

## Global Setup

1. Configure baseURL (e.g., http://localhost:3000)
2. Use storageState to persist login sessions
3. Create reusable login helpers for:

   * admin
   * doctor
   * patient

---

## Required Test Flow Dependency

Before ANY appointment booking test runs:

1. Admin creates a doctor
2. Doctor logs in
3. Doctor navigates to availability screen
4. Doctor creates availability slots:

   * date range (e.g., next 7–30 days)
   * time slots (8 AM – 5 PM, 1-hour slots)
5. Validate slots are visible in UI

Only AFTER this:

➡ Patients are allowed to book appointments

---

## Core Test Scenarios

### 1. Authentication (auth.spec.ts)

* Login using admin credentials
* Validate redirect to dashboard
* Invalid login fails

---

### 2. Admin Workflows (admin.spec.ts)

* Create doctor
* Create patient
* Create pharmacy
* Validate all records appear in UI

---

### 3. Doctor Availability Setup (doctor.spec.ts)

* Login as doctor
* Navigate to "Availability" page
* Create availability slots for multiple days

Validate:

* slots appear in UI
* correct time ranges shown
* slots marked as AVAILABLE

---

### 4. Patient Appointment Flow (appointments.spec.ts)

IMPORTANT: This test MUST depend on doctor availability setup

Steps:

1. Login as patient
2. Navigate to appointment booking page
3. Select doctor
4. Enter problem description

Validate:

* available slots are visible (ONLY if doctor created them)

5. Select date and time

Validate:

* slot becomes unavailable
* slot no longer selectable
* selected slot appears in appointment list

---

### 5. Negative Scenario (VERY IMPORTANT)

* Attempt booking WITHOUT doctor availability

Validate:

* slot can't be clicked

---

### 6. Doctor Workflow (doctor.spec.ts)

* View today's appointments
* Start consultation
* View patient notes

---

### 7. Consultation Flow (consultation.spec.ts)

* Enter:

  * symptoms
  * diagnosis
  * lab results
  * Add prescription details
  * Select pharmacy (optional)
* Save consultation

Validate:

* data persists

---

### 8. Patient View (patient.spec.ts)

* View prescriptions
* View medical history

---

## Playwright Requirements

Use:

* test.describe
* test.beforeEach / test.beforeAll (for availability setup)
* page.locator
* expect assertions

---

## Reusability (MANDATORY)

Create helper functions:

* loginAsAdmin(page)
* loginAsDoctor(page)
* loginAsPatient(page)
* createDoctor(page)
* createPatient(page)
* createAvailability(page)
* bookAppointment(page)

---

## Selector Strategy

* Use data-testid attributes
* If missing, update frontend code to include them

---

## Assertions

Validate:

* UI text
* slot visibility changes
* successful booking
* dependency enforcement (no availability = no booking)

---

## Edge Cases

* booking already booked slot
* booking without availability
* invalid form submission
* unauthorized access redirect

---

## Output Requirements

Generate:

1. Full Playwright test suite
2. playwright.config.ts
3. Helper utilities
4. Test data setup logic (doctor availability)
5. Instructions to run:

   npx playwright test

---

## Code Quality

* TypeScript strict mode
* reusable helpers
* no hardcoded waits
* stable selectors

---

## Final Goal

The test suite must:

* enforce real-world workflow dependencies
* ensure doctor availability is REQUIRED before booking
* simulate real user behavior end-to-end
* be stable and repeatable
