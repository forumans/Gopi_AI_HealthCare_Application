# 03-Forgot Password Flow
Create a two-step Forgot Password flow using Gradio.

STEP 1:
- Input: Email
- Call POST /auth/forgot-password
- Show generic message:
   "If an account exists, a reset link has been sent."

STEP 2 (Reset Page):
- Input:
    - New Password
    - Confirm Password
    - Hidden token from URL
- Validate strong password rules (same as registration)
- Call POST /auth/reset-password

SECURITY:
- Token expires in 15 minutes (handled by backend)
- Do not reveal if email exists
- Mask password fields
- Disable copy-paste on password fields (optional)

OUTPUT:
Generate both UI screens and logic.
