You are a senior SaaS frontend architect and UX designer.

Create a modern production-quality Healthcare SaaS web application UI using:

React

TypeScript

Vite

TailwindCSS

ShadCN UI components

React Router v6

TanStack Query (React Query)

Lucide icons

Full responsive design

Accessible UI (ARIA compliant)

The UI should look like a modern healthcare SaaS dashboard similar to Epic / AthenaHealth / Stripe dashboards, not a basic dropdown interface.

The goal is to produce a polished SaaS interface with navigation, dashboards, appointment scheduling, and role-based views for Patients, Doctors, and Admins.

Overall Application Layout

Create a professional SaaS layout with:

Top Navbar

Contains:

Logo: HealthSphere

Navigation menu (horizontal):

Home
Doctors
Patients
Admin
More

Right side:

Search bar
Notifications icon
User avatar dropdown

Sidebar (collapsible)

Left sidebar with icons.

Sections change based on user role:

Patient Sidebar

Dashboard

Schedule Appointment

Prescriptions

Billing

Profile

Doctor Sidebar

Dashboard

Appointments

Search Patients

Availability Slots

Admin Sidebar

Register Doctor

Register Patient

Register Admin

System Dashboard

Breadcrumb Navigation

Every page must display breadcrumbs like:

Home > Patients > Schedule Appointment

Breadcrumb updates automatically using router path.

Main Content Area

Large content panel for dashboards and data tables.

Use card-based layouts.

Homepage Requirements

Homepage contains:

Hero Section

Title:

"Smart Healthcare Management Platform"

Subtitle:

"Manage doctors, patients, appointments, prescriptions, and billing from a single unified platform."

CTA buttons:

Patient Login
Doctor Login

Healthcare News Section

Below the hero section display:

"Latest Medical Breakthroughs"

Implement a placeholder MCP Agent integration.

Create a hook:

useMedicalNewsAgent()

This hook should simulate fetching news from an MCP agent.

Display 5 news cards:

Each card contains:

headline

source

summary

read more link

Use skeleton loading UI.

Routing Structure

Create the following routes.

/
 /patients/login
 /patients/register
 /patients/appointments
 /patients/prescriptions
 /patients/billing

 /doctors/login
 /doctors/register
 /doctors/appointments
 /doctors/search-patients
 /doctors/availability

 /admin/register-doctor
 /admin/register-patient
 /admin/register-admin

Use protected routes after authentication.

Patient Features
Patient Login

Form fields:

Email
Password

After login redirect to:

Patient Dashboard

Patient Dashboard

Display:

Last 10 visits in a table:

Columns:

Date
Doctor Name
Symptoms
Diagnosis & Lab Results
Prescription

Use shadcn table component.

Patient Registration

Form fields:

Name
DOB
Address
Phone
Email
Password

After registration redirect to login.

Schedule / Cancel Appointment

Create a weekly appointment calendar table.

Columns:

Mon
Tue
Wed
Thu
Fri

Rows:

Time slots:

08:00 AM
09:00 AM
10:00 AM
11:00 AM
12:00 PM
01:00 PM
02:00 PM
03:00 PM
04:00 PM

Cells may contain:

Available - White background color
Booked - Red background color
Your Slot - Green background color

Behavior:

If user clicks Available → reserve slot.

Update UI to Your Slot.

If clicking Your Slot:

Open modal:

"Do you want to cancel appointment?"

Yes → delete appointment
No → close modal

Navigation buttons:

Prev Week
Next Week

Constraints:

Cannot schedule earlier than today
Cannot schedule more than 30 days ahead

Prescriptions Page

Display same table as visits:

Date
Doctor
Symptoms
Diagnosis
Prescription

Bill Pay Page

Create payment UI.

Display:

Appointment
Fee Amount
Credit Card Form

Fields:

Card Number
Name
Expiry
CVV

Submit button.

Mock API call.

Doctor Features
Doctor Login

Email
Password

Redirect to Doctor Dashboard.

Doctor Dashboard

Weekly appointments table.

Columns:

Time Slot
Patient Name
Symptoms

Prev Week / Next Week navigation.

Same 30 day constraint.

Doctor Registration

Form:

Name
Specialization
Phone
Email
Password

After success redirect to login.

Search Patients

Search box:

"Search patient by name"

Display results table.

Selecting a patient shows:

Patient Details Table:

Name
DOB
Address
Phone
Symptoms
Diagnosis
Lab Results
Prescription
Prescription Date

Update Available Slots

Weekly grid similar to appointment table.

Doctor clicks cells to toggle:

Available
Unavailable

Booked slots cannot be changed.

Admin Features

Admin pages:

Register Doctor
Register Patient
Register Admin

Forms should be reusable components.

After submission show success toast:

"Registration successful"

UI / UX Requirements

Design should be modern SaaS style.

Use:

card layouts

soft shadows

rounded corners

clean typography

subtle animations

Add:

loading skeletons

error states

empty states

Use React Query for all data fetching.

Folder Structure
src
/components
/layout
/Navbar
/Sidebar
/Breadcrumbs
/pages
/home
/patients
/doctors
/admin
/features
/appointments
/prescriptions
/billing
/hooks
/api
/types
/utils
Types

Create TypeScript types:

Patient
Doctor
Appointment
Prescription
Visit
Payment

Mock API

Use mock service layer.

Create files:

api/patientService.ts
api/doctorService.ts
api/appointmentService.ts
api/adminService.ts
Output

Generate:

Full React project

All pages

Components

Routing

Types

Mock APIs

UI styling

The UI should resemble a modern healthcare SaaS dashboard and should be fully navigable without backend integration.

Goal

Produce a complete SaaS frontend skeleton that looks like a production healthcare management system.

Avoid simple dropdown UI or basic forms. Build a professional multi-page dashboard interface.

Optional (Nice-to-have)

Add:

Dark mode
Notifications
Doctor rating UI
Patient profile page