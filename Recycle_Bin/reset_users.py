import asyncio
from sqlalchemy import delete
from server.app.models import User, Tenant, Doctor, Patient, Admin, DoctorAvailability
from server.app.core.database import get_session_maker

async def reset_users():
    async with get_session_maker()() as db:
        # Delete all existing data
        await db.execute(delete(DoctorAvailability))
        await db.execute(delete(Doctor))
        await db.execute(delete(Patient))
        await db.execute(delete(Admin))
        await db.execute(delete(User))
        await db.execute(delete(Tenant))
        await db.commit()
        print("Deleted all existing data")
        
        # Now run the create_initial_data script
        from create_initial_data import create_initial_data
        await create_initial_data()

if __name__ == "__main__":
    asyncio.run(reset_users())
