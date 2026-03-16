import asyncio
from sqlalchemy import select
from server.app.models import User
from server.app.core.database import get_session_maker
from server.app.core.security import verify_password

async def check_hash_details():
    async with get_session_maker()() as db:
        result = await db.execute(select(User).where(User.email == "patient@clinic.com"))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"Email: {user.email}")
            print(f"Hash length: {len(user.password_hash)}")
            print(f"Hash: '{user.password_hash}'")
            print(f"Hash repr: {repr(user.password_hash)}")
            
            # Test with the exact stored hash
            password = "Admin123!"
            print(f"\nTesting password: '{password}'")
            print(f"Verification result: {verify_password(password, user.password_hash)}")
            
            # Test with our generated hash
            correct_hash = "$2b$12$XVwYbvYSx0nG3.uclfFrh.K7eE4k.szEImHDOw2GGBA8Dxh9TwEvW"
            print(f"\nTesting with correct hash:")
            print(f"Correct hash: '{correct_hash}'")
            print(f"Verification result: {verify_password(password, correct_hash)}")

if __name__ == "__main__":
    asyncio.run(check_hash_details())
