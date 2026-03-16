import asyncio
from datetime import datetime, timedelta
from sqlalchemy import text
from server.app.core.database import get_session_maker
from server.app.core.security import hash_password

async def create_initial_data():
    """Clear and create initial data in one transaction."""
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
            
            # Create a doctor user
            doctor_user_result = await db.execute(text("""
                INSERT INTO users (id, tenant_id, email, password_hash, role, is_active, created_at) 
                VALUES (gen_random_uuid(), :tenant_id, :email, :password_hash, 'DOCTOR', true, :created_at)
                RETURNING id
            """), {
                "tenant_id": tenant_id,
                "email": "doctor@clinic.com",
                "password_hash": hash_password("Admin123!"),
                "created_at": datetime.now()
            })
            doctor_user_id = doctor_user_result.scalar()
            print(f"Created doctor user: {doctor_user_id}")
            
            # Create doctor profile
            doctor_result = await db.execute(text("""
                INSERT INTO doctors (id, tenant_id, user_id, full_name, specialty, created_at) 
                VALUES (gen_random_uuid(), :tenant_id, :user_id, 'Dr. John Smith', 'General Practice', :created_at)
                RETURNING id
            """), {
                "tenant_id": tenant_id,
                "user_id": doctor_user_id,
                "created_at": datetime.now()
            })
            doctor_id = doctor_result.scalar()
            print(f"Created doctor: {doctor_id}")
            
            # Create a patient user
            patient_user_result = await db.execute(text("""
                INSERT INTO users (id, tenant_id, email, password_hash, role, is_active, created_at) 
                VALUES (gen_random_uuid(), :tenant_id, :email, :password_hash, 'PATIENT', true, :created_at)
                RETURNING id
            """), {
                "tenant_id": tenant_id,
                "email": "patient@clinic.com",
                "password_hash": hash_password("Admin123!"),
                "created_at": datetime.now()
            })
            patient_user_id = patient_user_result.scalar()
            print(f"Created patient user: {patient_user_id}")
            
            # Create patient profile
            patient_result = await db.execute(text("""
                INSERT INTO patients (id, tenant_id, user_id, full_name, phone, created_at) 
                VALUES (gen_random_uuid(), :tenant_id, :user_id, 'Jane Doe', '+1234567890', :created_at)
                RETURNING id
            """), {
                "tenant_id": tenant_id,
                "user_id": patient_user_id,
                "created_at": datetime.now()
            })
            patient_id = patient_result.scalar()
            print(f"Created patient: {patient_id}")
            
            # Create doctor availability for next 30 days
            base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Create available slots
            for day_offset in range(30):
                current_date = base_date + timedelta(days=day_offset)
                # Skip weekends
                if current_date.weekday() >= 5:
                    continue
                    
                # Create slots from 8 AM to 5 PM
                for hour in range(8, 17):
                    slot_time = current_date.replace(hour=hour)
                    await db.execute(text("""
                        INSERT INTO doctor_availability (id, tenant_id, doctor_id, slot_time, status, created_at) 
                        VALUES (gen_random_uuid(), :tenant_id, :doctor_id, :slot_time, 'AVAILABLE', :created_at)
                    """), {
                        "tenant_id": tenant_id,
                        "doctor_id": doctor_id,
                        "slot_time": slot_time,
                        "created_at": datetime.now()
                    })
            
            # Create blocked slots (doctor vacation) - tomorrow 2-4 PM
            tomorrow = base_date + timedelta(days=1)
            for hour in [14, 15, 16]:
                slot_time = tomorrow.replace(hour=hour)
                await db.execute(text("""
                    INSERT INTO doctor_availability (id, tenant_id, doctor_id, slot_time, status, created_at) 
                    VALUES (gen_random_uuid(), :tenant_id, :doctor_id, :slot_time, 'BLOCKED', :created_at)
                """), {
                    "tenant_id": tenant_id,
                    "doctor_id": doctor_id,
                    "slot_time": slot_time,
                    "created_at": datetime.now()
                })
            
            # Create booked slots (patient appointments) - day after tomorrow 10 AM and 2 PM
            day_after_tomorrow = base_date + timedelta(days=2)
            booked_slots = []
            for hour in [10, 14]:
                slot_time = day_after_tomorrow.replace(hour=hour)
                await db.execute(text("""
                    INSERT INTO doctor_availability (id, tenant_id, doctor_id, slot_time, status, created_at) 
                    VALUES (gen_random_uuid(), :tenant_id, :doctor_id, :slot_time, 'BOOKED', :created_at)
                """), {
                    "tenant_id": tenant_id,
                    "doctor_id": doctor_id,
                    "slot_time": slot_time,
                    "created_at": datetime.now()
                })
                booked_slots.append(slot_time)
            
            # Create appointments for the booked slots
            for slot_time in booked_slots:
                await db.execute(text("""
                    INSERT INTO appointments (id, tenant_id, doctor_id, patient_id, appointment_time, status, notes, created_at) 
                    VALUES (gen_random_uuid(), :tenant_id, :doctor_id, :patient_id, :appointment_time, 'SCHEDULED', 'Regular checkup', :created_at)
                """), {
                    "tenant_id": tenant_id,
                    "doctor_id": doctor_id,
                    "patient_id": patient_id,
                    "appointment_time": slot_time,
                    "created_at": datetime.now()
                })
            
            await db.commit()
            print(f"\nCreated initial data successfully!")
            print(f"Admin login: admin@clinic.com / Admin123!")
            print(f"Doctor login: doctor@clinic.com / Admin123!")
            print(f"Patient login: patient@clinic.com / Admin123!")
            print(f"\nCreated sample data:")
            print(f"- Doctor availability slots for next 30 days (8 AM - 5 PM, weekdays only)")
            print(f"- Blocked slots: Tomorrow 2-4 PM (doctor vacation)")
            print(f"- Booked slots: Day after tomorrow 10 AM and 2 PM (patient appointments)")
            print(f"- 2 appointments created for Jane Doe")
            
        except Exception as e:
            await db.rollback()
            print(f"Error: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(create_initial_data())
