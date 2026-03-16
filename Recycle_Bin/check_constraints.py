import asyncio
from sqlalchemy import text
from server.app.core.database import get_session_maker

async def check_constraints():
    async with get_session_maker()() as db:
        # Check the unique constraint on appointments
        result = await db.execute(text("""
            SELECT conname, contype, pg_get_constraintdef(oid) AS definition
            FROM pg_constraint 
            WHERE conrelid = 'appointments'::regclass
            AND contype = 'u'
        """))
        constraints = result.fetchall()
        print('Unique constraints on appointments table:')
        for con in constraints:
            print(f'  - {con[0]}: {con[2]}')

if __name__ == "__main__":
    asyncio.run(check_constraints())
