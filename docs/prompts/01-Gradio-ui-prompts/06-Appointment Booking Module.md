# 06-Appointment Booking Module
Create a Gradio appointment booking interface.

FLOW:
1. Select Doctor (dropdown)
2. Fetch available slots (GET /availability/{doctor_id})
3. Display time slots grid
4. Select slot
5. Confirm booking
6. POST /appointments

VALIDATION:
- Cannot select past time
- Must confirm before booking
- Show error if slot already taken

SECURITY:
- Backend enforces unique constraint
- Show generic error if double booking detected

OUTPUT:
Generate booking UI with real-time slot refresh.
