import asyncio
from sqlalchemy import select
from server.app.models import Appointment
from server.app.core.database import get_session_maker

async def check_slot_ids():
    async with get_session_maker()() as db:
        # Check appointments with non-NULL slot_id
        result = await db.execute(select(Appointment).where(Appointment.slot_id.isnot(None)))
        appointments = result.scalars().all()
        print(f'Appointments with non-NULL slot_id: {len(appointments)}')
        for apt in appointments:
            print(f'  - ID: {apt.id}, slot_id: {apt.slot_id}, time: {apt.appointment_time}, status: {apt.status}, deleted_at: {apt.deleted_at}')

if __name__ == "__main__":
    asyncio.run(check_slot_ids())
