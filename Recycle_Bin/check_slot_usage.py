import asyncio
from sqlalchemy import select
from server.app.models import Appointment
from server.app.core.database import get_session_maker

async def check_slot_usage():
    async with get_session_maker()() as db:
        # Check if the slot_id is already used
        slot_id = '372555b5-c7d2-4ef0-a6ee-17c78a92cc58'
        result = await db.execute(select(Appointment).where(Appointment.slot_id == slot_id))
        appointments = result.scalars().all()
        print(f'Appointments using slot_id {slot_id}: {len(appointments)}')
        for apt in appointments:
            print(f'  - ID: {apt.id}, slot_id: {apt.slot_id}, time: {apt.appointment_time}, status: {apt.status}, deleted_at: {apt.deleted_at}')

if __name__ == "__main__":
    asyncio.run(check_slot_usage())
