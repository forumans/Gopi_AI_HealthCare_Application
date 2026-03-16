# 04-Doctor Dashboard
Create a Doctor Dashboard in Gradio.

After login, role = DOCTOR.

FEATURES:
1. Today's Appointments (table)
2. Upcoming Appointments
3. Patient Quick Search
4. Add Medical Record button
5. View Prescription history
6. Calendar View (optional)

API ENDPOINTS:
GET /doctor/appointments/today
GET /doctor/appointments/upcoming
GET /patients/search?q=
POST /medical-records

UI REQUIREMENTS:
- Clean dashboard layout
- Show appointment time, patient name, status
- Allow clicking appointment to open patient detail modal
- Highlight urgent cases
- Responsive layout

SECURITY:
- Only doctor’s own patients
- Hide soft-deleted records
- No PHI in logs

OUTPUT:
Generate structured Gradio dashboard code.
