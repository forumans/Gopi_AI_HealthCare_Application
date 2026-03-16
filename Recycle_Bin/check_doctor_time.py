import asyncio
from datetime import datetime
from sqlalchemy import select
from server.app.models import Appointment
from server.app.core.database import get_session_maker

async def check_doctor_time():
    async with get_session_maker()() as db:
        # Check ALL appointments (including deleted) for this doctor and time
        result = await db.execute(
            select(Appointment).where(
                Appointment.doctor_id == 'feb0a0e2-256d-4e0a-9223-112c26b5c7bf',
                Appointment.appointment_time == datetime(2026, 3, 12, 10, 0)
            )
        )
        appointments = result.scalars().all()
        print(f'Found {len(appointments)} appointments for doctor at this time:')
        for apt in appointments:
            print(f'  - ID: {apt.id}')
            print(f'    slot_id: {apt.slot_id}')
            print(f'    appointment_time: {apt.appointment_time}')
            print(f'    status: {apt.status}')
            print(f'    deleted_at: {apt.deleted_at}')
            print(f'    patient_id: {apt.patient_id}')

if __name__ == "__main__":
    asyncio.run(check_doctor_time())
