import asyncio
from sqlalchemy import select
from server.app.models import User
from server.app.core.database import get_session_maker

async def check_users():
    async with get_session_maker()() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"  - Email: {user.email}")
            print(f"    Password hash: {user.password_hash}")
            print(f"    Role: {user.role}")
            print(f"    Is active: {user.is_active}")
            print()

if __name__ == "__main__":
    asyncio.run(check_users())
