import asyncio
from sqlalchemy import text
from server.app.core.database import get_session_maker

async def drop_constraint():
    async with get_session_maker()() as db:
        # Drop the unique_doctor_time constraint
        try:
            await db.execute(text('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS unique_doctor_time'))
            await db.commit()
            print('Successfully dropped unique_doctor_time constraint')
        except Exception as e:
            print(f'Error dropping constraint: {e}')

if __name__ == "__main__":
    asyncio.run(drop_constraint())
