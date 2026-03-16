import asyncio
from sqlalchemy import text
from server.app.core.database import get_session_maker

async def truncate_all_tables():
    async with get_session_maker()() as db:
        # List of tables to truncate
        tables = [
            'appointments',
            'doctor_availability',
            'patients',
            'doctors',
            'admins',
            'users',
            'tenants'
        ]
        
        for table in tables:
            await db.execute(text(f'TRUNCATE TABLE {table} RESTART IDENTITY CASCADE'))
            print(f"Truncated table: {table}")
        
        await db.commit()
        print("\nAll tables truncated successfully!")

if __name__ == "__main__":
    asyncio.run(truncate_all_tables())
