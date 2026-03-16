App is now an orchestrator
App.tsx now focuses on:
state + API actions
composing modular layout and page components
See: @frontend/src/App.tsx#1-505
Extracted shared layout components
Header/role chips/top nav: @frontend/src/components/layout/Header.tsx#1-31
Dropdown menu selectors: @frontend/src/components/layout/MenuSelectors.tsx#1-66
Breadcrumb + status panels: @frontend/src/components/layout/StatusPanels.tsx#1-12
Extracted page components
Home
@frontend/src/pages/HomePage.tsx#1-15
Auth pages
Login: @frontend/src/pages/auth/LoginPage.tsx#1-33
Register: @frontend/src/pages/auth/RegisterPage.tsx#1-51
Forgot/Reset password: @frontend/src/pages/auth/PasswordPage.tsx#1-39
Patient pages
Schedule/Cancel: @frontend/src/pages/patient/PatientSchedulePage.tsx#1-57
Prescriptions: @frontend/src/pages/patient/PatientPrescriptionsPage.tsx#1-16
Bill Pay: @frontend/src/pages/patient/PatientBillPayPage.tsx#1-8
Doctor pages
Appointments + save record: @frontend/src/pages/doctor/DoctorAppointmentsPage.tsx#1-50
Search patients: @frontend/src/pages/doctor/DoctorSearchPage.tsx#1-21
Update slots: @frontend/src/pages/doctor/DoctorSlotsPage.tsx#1-24
Admin page
Dashboard + create user form: @frontend/src/pages/admin/AdminDashboardPage.tsx#1-105
App-level utility modules
Role access helper: @frontend/src/app/access.ts#1-8
Breadcrumb mapper: @frontend/src/app/breadcrumbs.ts#1-20
View type union: @frontend/src/app/types.ts#1-12
Basic unit test (frontend helper): @frontend/src/app/access.test.ts#1-13
Verification run
Python tests still pass (backend + archived Gradio-adjacent):
tests.test_ui_navigation
tests.test_navigation_layout
tests.test_backend_dependencies
Note
Your IDE TS errors about react/jsx-runtime / react / vitest are expected until frontend deps are installed in frontend/:

npm install
npm run dev (or npm run test)