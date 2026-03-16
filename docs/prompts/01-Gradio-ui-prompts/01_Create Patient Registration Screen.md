# 01-Create Patient Registration Screen (Gradio + FastAPI)

You are building a HIPAA-compliant healthcare SaaS frontend using Gradio.
Backend is FastAPI (REST API, JWT-based authentication).

Create a Patient Registration screen with the following requirements:

CONTEXT:
- Multi-tenant system.
- Tenant is automatically determined after login via backend response.
- This screen is for PATIENT role only.
- Registration is public.
- Backend endpoint: POST /auth/register

INPUT FIELDS:
1. Full Name (required, min 3 characters)
2. Email (required, valid email format)
3. Phone Number (required, US format validation)
4. Password (required, strong password policy)
5. Confirm Password
6. Insurance Provider (optional)
7. Insurance Policy Number (optional)
8. Accept HIPAA Consent (checkbox required)

VALIDATION RULES:
- Email must be valid format.
- Password must:
  - Minimum 12 characters
  - At least 1 uppercase
  - At least 1 lowercase
  - At least 1 number
  - At least 1 special character
- Password and Confirm Password must match.
- Phone number must match US format regex.
- Cannot submit unless HIPAA consent checkbox is checked.

SECURITY REQUIREMENTS:
- Do NOT store password locally.
- Submit over HTTPS.
- Do not log sensitive data.
- Show generic error messages (avoid leaking info).
- Disable submit button during API call.
- Implement client-side + server-side validation.

API REQUEST FORMAT:
{
  "full_name": "",
  "email": "",
  "phone": "",
  "password": "",
  "insurance_provider": "",
  "insurance_policy_number": ""
}

UI REQUIREMENTS:
- Professional healthcare theme.
- Mobile responsive layout.
- Accessible labels and ARIA compliance.
- Show validation errors inline.
- Show success message and redirect to Login page.

OUTPUT:
Generate full Gradio UI code with validation and API integration.
