# 02-LOGIN SCREEN
Create a Login screen using Gradio.

CONTEXT:
- Backend: FastAPI
- Endpoint: POST /auth/login
- Returns JWT + role + tenant_id

INPUT:
- Email
- Password

REQUIREMENTS:
- Validate email format
- Disable login button while authenticating
- On success:
    - Store JWT securely in session state
    - Extract role from response
    - Redirect:
        ADMIN -> Admin Dashboard
        DOCTOR -> Doctor Dashboard
        PATIENT -> Patient Dashboard
- On failure:
    - Show generic message: "Invalid credentials"

SECURITY:
- No password logging
- No detailed error messages
- Token must be stored in memory only
- Auto logout after inactivity (15 min)
- Add optional “Remember Me” toggle

ACCESSIBILITY:
- Keyboard navigation
- Proper labels
- Screen reader compatible

OUTPUT:
Generate production-ready Gradio login UI with role-based redirection.
