You are a senior full-stack architect.

You must update an EXISTING Healthcare SaaS application built with:

Backend
- FastAPI
- PostgreSQL
- SQLAlchemy ORM

Frontend
- Gradio UI

The application already contains working authentication, database models, and API routes.

DO NOT rewrite existing working functionality.
ONLY extend the system.

====================================================
GOAL
====================================================

Add a full navigation system, role-based workflows, homepage, and appointment scheduling UI.

The application must support:

1. Patient workflows
2. Doctor workflows
3. Admin workflows

Every page must contain:

• Horizontal navigation menu
• Breadcrumb navigation
• Dynamic page content

====================================================
GLOBAL LAYOUT COMPONENT
====================================================

Create a reusable layout component:

MainLayout()

Responsibilities:

• Render horizontal menu
• Render breadcrumb navigation
• Render page content area
• Provide consistent UI across all pages

File location:

ui/layout/main_layout.py

====================================================
HORIZONTAL MENU
====================================================

Top menu items:

Home
Doctors
Patients
Admin
More

Each menu should support dropdown navigation.

----------------------------------------------------

Patients Menu
-------------
Login
Register
Schedule / Cancel Appointment
Prescriptions
Bill Pay

----------------------------------------------------

Doctors Menu
------------
Login
Register
Appointments
Search Patients
Update Available Slots

----------------------------------------------------

Admin Menu
----------
Register Doctor
Register Patient
Register Admin

====================================================
BREADCRUMB NAVIGATION
====================================================

Add reusable breadcrumb component.

Example:

Home > Patients > Login

Home > Doctors > Appointments

File:

ui/components/breadcrumbs.py

Breadcrumb should dynamically update based on current screen.

====================================================
HOMEPAGE
====================================================

Create:

ui/pages/home_page.py

Homepage must display:

1. Horizontal navigation menu
2. Breadcrumb: Home
3. Medical News section

----------------------------------------------------

Medical News Section

Display:

Latest Medical Breakthroughs

This data must come from a placeholder MCP agent.

Create class:

class MedicalNewsAgent:

    def get_latest_news(self):

        return [
            "AI detects cancer earlier using blood analysis",
            "New Alzheimer’s treatment slows progression",
            "mRNA vaccines expanding to heart disease prevention"
        ]

The homepage should call this function every time the page loads.

IMPORTANT:
This is a placeholder for a future MCP server.

====================================================
PATIENT WORKFLOW
====================================================

----------------------------------
PATIENT LOGIN
----------------------------------

Display login form.

Fields:

Email
Password

After successful authentication show:

Patient Dashboard.

----------------------------------

Patient Dashboard

Display table of last 10 visits.

Columns:

Date
Doctor Name
Problem/Symptoms
Diagnosis & Lab Results
Prescription

Data sources:

appointments
medical_records
prescriptions
doctors

----------------------------------

PATIENT REGISTRATION

Form fields:

Name
Email
Password
Phone
Insurance Provider
Insurance Policy Number

After successful registration:

Redirect to login screen.

====================================================
PATIENT APPOINTMENT SCHEDULING
====================================================

Create weekly schedule table.

Columns:

Monday – Friday

Rows:

08:00
09:00
10:00
11:00
12:00
13:00
14:00
15:00
16:00

Cell states:

Available
Booked
Your Slot
N/A

Behavior:

If patient clicks AVAILABLE:

Create appointment in database.

If patient clicks YOUR SLOT:

Show confirmation dialog:

Cancel Appointment?

YES
NO

If YES:

Delete appointment.

Navigation controls:

← Prev Week
Next Week →

Constraints:

Cannot go earlier than today.

Cannot go beyond 30 days.

====================================================
PATIENT PRESCRIPTIONS
====================================================

Display last 10 prescriptions table.

Columns:

Date
Doctor
Symptoms
Diagnosis
Prescription

====================================================
PATIENT BILL PAY
====================================================

Create credit card form.

Fields:

Card Number
Expiration Date
CVV
Cardholder Name

Display:

Appointment visit + fee.

Payment processing should be simulated.

====================================================
DOCTOR WORKFLOW
====================================================

----------------------------------
DOCTOR LOGIN
----------------------------------

After login display weekly appointment schedule.

Table:

Time
Patient Name
Symptoms

Allow week navigation.

Limit range:

Today → 30 days.

----------------------------------

DOCTOR REGISTRATION

Fields:

Name
Email
Password
Specialty
License Number
Phone

After successful registration redirect to login.

----------------------------------

DOCTOR APPOINTMENTS

Display weekly appointment table.

----------------------------------

SEARCH PATIENTS

Search input:

Patient name.

Display matching patients.

Selecting a patient shows full medical record history.

Columns:

Name
Phone
DOB
Symptoms
Diagnosis
Lab Results
Medication
Prescription Date

----------------------------------

UPDATE AVAILABLE SLOTS

Doctor can toggle availability for the next 30 days.

Grid identical to patient scheduling screen.

Each cell toggles:

Available / Not Available.

Updates doctor_availability table.

====================================================
ADMIN WORKFLOW
====================================================

Admin pages allow registration of:

Doctor
Patient
Admin

Each form should show:

Registration Successful

and remain on same page.

====================================================
BACKEND API ENDPOINTS
====================================================

Add endpoints if missing.

Appointments

GET /appointments/week
POST /appointments
DELETE /appointments/{id}

Doctors

GET /doctor/appointments
POST /doctor/availability

Patients

GET /patients/search

====================================================
CODE STRUCTURE
====================================================

Frontend

ui/
    layout/
    components/
    pages/
        home
        patients
        doctors
        admin

Backend

api/
    routes/
        appointments.py
        doctors.py
        patients.py

services/
    appointment_service.py
    medical_news_agent.py

====================================================
DELIVERABLES
====================================================

Provide:

1. Updated project directory structure
2. Layout component
3. Breadcrumb component
4. Homepage implementation
5. MCP News agent placeholder
6. Patient workflow screens
7. Doctor workflow screens
8. Admin workflow screens
9. Required FastAPI endpoints
10. Example database queries
11. Comments explaining changes

Do not remove existing functionality.

Extend the system safely and cleanly.