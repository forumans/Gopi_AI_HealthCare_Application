import asyncio
from datetime import datetime
from sqlalchemy import select
from server.app.models import DoctorAvailability
from server.app.core.database import get_session_maker

async def check_availability():
    async with get_session_maker()() as db:
        # Check availability for the specific slot
        result = await db.execute(
            select(DoctorAvailability).where(
                DoctorAvailability.doctor_id == 'feb0a0e2-256d-4e0a-9223-112c26b5c7bf',
                DoctorAvailability.slot_time == datetime.fromisoformat('2026-03-12T10:00:00')
            )
        )
        availability = result.scalar_one_or_none()
        if availability:
            print(f'Found availability record:')
            print(f'  - ID: {availability.id}')
            print(f'  - doctor_id: {availability.doctor_id}')
            print(f'  - slot_time: {availability.slot_time}')
            print(f'  - is_booked: {availability.is_booked}')
        else:
            print('No availability record found for 2026-03-12T10:00:00')

if __name__ == "__main__":
    asyncio.run(check_availability())
