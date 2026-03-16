import asyncio
from datetime import datetime
from sqlalchemy import text
from server.app.core.database import get_session_maker
from server.app.core.security import hash_password

async def create_admin_only():
    """Create only an Admin user."""
    async with get_session_maker()() as db:
        try:
            # Clear all existing data first
            await db.execute(text("DELETE FROM appointments"))
            await db.execute(text("DELETE FROM doctor_availability"))
            await db.execute(text("DELETE FROM medical_records"))
            await db.execute(text("DELETE FROM prescriptions"))
            await db.execute(text("DELETE FROM patient_documents"))
            await db.execute(text("DELETE FROM audit_logs"))
            await db.execute(text("DELETE FROM patients"))
            await db.execute(text("DELETE FROM doctors"))
            await db.execute(text("DELETE FROM admins"))
            await db.execute(text("DELETE FROM users"))
            await db.execute(text("DELETE FROM tenants"))
            
            # Create a tenant
            tenant_result = await db.execute(text("""
                INSERT INTO tenants (id, name, created_at) 
                VALUES (gen_random_uuid(), 'Healthcare Clinic', :created_at)
                RETURNING id
            """), {"created_at": datetime.now()})
            tenant_id = tenant_result.scalar()
            print(f"Created tenant: {tenant_id}")
            
            # Create an admin user
            admin_user_result = await db.execute(text("""
                INSERT INTO users (id, tenant_id, email, password_hash, role, is_active, created_at) 
                VALUES (gen_random_uuid(), :tenant_id, :email, :password_hash, 'ADMIN', true, :created_at)
                RETURNING id
            """), {
                "tenant_id": tenant_id,
                "email": "admin@clinic.com",
                "password_hash": hash_password("Admin123!"),
                "created_at": datetime.now()
            })
            admin_user_id = admin_user_result.scalar()
            print(f"Created admin user: {admin_user_id}")
            
            # Create admin profile
            await db.execute(text("""
                INSERT INTO admins (id, tenant_id, user_id, full_name, created_at) 
                VALUES (gen_random_uuid(), :tenant_id, :user_id, 'System Administrator', :created_at)
            """), {
                "tenant_id": tenant_id,
                "user_id": admin_user_id,
                "created_at": datetime.now()
            })
            
            await db.commit()
            print("\n✅ Admin user created successfully!")
            print("\n📋 Login Credentials:")
            print("   Email: admin@clinic.com")
            print("   Password: Admin123!")
            print("\n🔗 You can now login at:")
            print("   Frontend: http://127.0.0.1:5173/admin/login")
            print("   API Docs: http://127.0.0.1:8000/docs")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(create_admin_only())
