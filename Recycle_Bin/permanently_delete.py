import asyncio
from sqlalchemy import delete
from server.app.models import Appointment
from server.app.core.database import get_session_maker

async def permanently_delete():
    async with get_session_maker()() as db:
        # Permanently delete the cancelled appointment
        stmt = delete(Appointment).where(
            Appointment.id == 'ae7be47f-2303-4cbb-b231-fc41d51cd249'
        )
        result = await db.execute(stmt)
        await db.commit()
        print(f'Permanently deleted {result.rowcount} appointment(s)')

if __name__ == "__main__":
    asyncio.run(permanently_delete())
