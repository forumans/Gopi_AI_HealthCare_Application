import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from server.app.models import User, Tenant, Doctor, Patient, Admin, DoctorAvailability, Appointment
from server.app.core.database import get_session_maker
from server.app.core.security import hash_password

async def create_initial_data():
    async with get_session_maker()() as db:
        # Check if data already exists
        existing_tenant = (await db.execute(select(Tenant).limit(1))).scalar_one_or_none()
        if existing_tenant:
            print("Data already exists. Please truncate all tables before running this script.")
            return
        
        # Create a tenant
        tenant = Tenant(
            name="Healthcare Clinic",
            created_at=datetime.utcnow()
        )
        db.add(tenant)
        await db.flush()
        print(f"Created tenant: {tenant.id}")
        
        # Create an admin user
        admin_user = User(
            tenant_id=tenant.id,
            email="admin@clinic.com",
            password_hash=hash_password("Admin123!"),
            role="ADMIN",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(admin_user)
        await db.flush()
        print(f"Created admin user: {admin_user.id}")
        
        admin = Admin(
            tenant_id=tenant.id,
            user_id=admin_user.id,
            full_name="System Administrator",
            created_at=datetime.utcnow()
        )
        db.add(admin)
        await db.flush()
        
        # Create a doctor user
        doctor_user = User(
            tenant_id=tenant.id,
            email="doctor@clinic.com",
            password_hash=hash_password("Admin123!"),
            role="DOCTOR",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(doctor_user)
        await db.flush()
        print(f"Created doctor user: {doctor_user.id}")
        
        doctor = Doctor(
            tenant_id=tenant.id,
            user_id=doctor_user.id,
            full_name="Dr. John Smith",
            specialty="General Practice",
            created_at=datetime.utcnow()
        )
        db.add(doctor)
        await db.flush()
        print(f"Created doctor: {doctor.id}")
        
        # Create a patient user
        patient_user = User(
            tenant_id=tenant.id,
            email="patient@clinic.com",
            password_hash=hash_password("Admin123!"),
            role="PATIENT",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(patient_user)
        await db.flush()
        print(f"Created patient user: {patient_user.id}")
        
        patient = Patient(
            tenant_id=tenant.id,
            user_id=patient_user.id,
            full_name="Jane Doe",
            phone="+1234567890",
            created_at=datetime.utcnow()
        )
        db.add(patient)
        await db.flush()
        print(f"Created patient: {patient.id}")
        
        # Create doctor availability for next 30 days
        base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for day_offset in range(30):
            current_date = base_date + timedelta(days=day_offset)
            # Skip weekends
            if current_date.weekday() >= 5:
                continue
                
            # Create slots from 8 AM to 5 PM
            for hour in range(8, 17):
                slot_time = current_date.replace(hour=hour)
                availability = DoctorAvailability(
                    tenant_id=tenant.id,
                    doctor_id=doctor.id,
                    slot_time=slot_time,
                    status="AVAILABLE",
                    created_at=datetime.utcnow()
                )
                db.add(availability)
        
        # Create some sample blocked slots (doctor vacation)
        # Block tomorrow 2-4 PM as example
        tomorrow = base_date + timedelta(days=1)
        for hour in [14, 15, 16]:
            slot_time = tomorrow.replace(hour=hour)
            blocked_slot = DoctorAvailability(
                tenant_id=tenant.id,
                doctor_id=doctor.id,
                slot_time=slot_time,
                status="BLOCKED",
                created_at=datetime.utcnow()
            )
            db.add(blocked_slot)
        
        # Create some sample booked slots (patient appointments)
        # Book day after tomorrow 10 AM and 2 PM
        day_after_tomorrow = base_date + timedelta(days=2)
        booked_slots = []
        for hour in [10, 14]:
            slot_time = day_after_tomorrow.replace(hour=hour)
            booked_slot = DoctorAvailability(
                tenant_id=tenant.id,
                doctor_id=doctor.id,
                slot_time=slot_time,
                status="BOOKED",
                created_at=datetime.utcnow()
            )
            db.add(booked_slot)
            booked_slots.append(slot_time)
        
        # Create appointments for the booked slots
        for slot_time in booked_slots:
            appointment = Appointment(
                tenant_id=tenant.id,
                doctor_id=doctor.id,
                patient_id=patient.id,
                appointment_time=slot_time,
                status="SCHEDULED",
                notes="Regular checkup",
                created_at=datetime.utcnow()
            )
            db.add(appointment)
        
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

if __name__ == "__main__":
    asyncio.run(create_initial_data())
