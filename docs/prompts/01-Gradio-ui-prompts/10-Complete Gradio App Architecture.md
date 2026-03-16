# 10-Complete Gradio App Architecture
Generate a full Gradio frontend architecture for the healthcare SaaS backend.

REQUIREMENTS:
- Role-based dashboards
- Token-based authentication
- Auto-detect tenant after login
- Secure session management
- Global error handling
- Reusable UI components
- Soft delete UI behavior
- Audit log viewer
- Appointment calendar
- Admin analytics dashboard

STRUCTURE:
- auth.py
- dashboards/
    - admin.py
    - doctor.py
    - patient.py
- components/
- api_client.py
- state_manager.py
- app.py

UI STANDARDS:
- Clean healthcare theme
- Mobile responsive
- Accessible
- Disable buttons during API calls
- Show loading indicators
- Handle 401 auto logout

OUTPUT:
Generate modular Gradio app code with navigation and role routing.
