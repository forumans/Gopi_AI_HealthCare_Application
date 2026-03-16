# 01-Complete FastAI Backend Generation
You are a senior backend architect.

Generate a production-ready FastAPI backend for a multi-tenant Healthcare SaaS application.

The PostgreSQL database schema is already defined. You MUST follow it exactly. Do NOT redesign tables.

====================================================
DATABASE OVERVIEW (STRICT CONTRACT)
====================================================

Database: healthcare_saas
PostgreSQL
UUID primary keys (uuid_generate_v4())
Multi-tenant architecture using tenant_id in all business tables
Soft delete columns: deleted_at, deleted_by (nullable)
ENUMs:
- user_role: ADMIN, DOCTOR, PATIENT
- appointment_status: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED

Tables:
- tenants
- users
- doctors (1:1 with users)
- patients (1:1 with users)
- doctor_availability
- appointments
- medical_records
- pharmacies
- prescriptions
- patient_documents
- audit_logs

Unique constraints:
- users: UNIQUE(tenant_id, email)
- doctors: UNIQUE(user_id)
- patients: UNIQUE(user_id)
- doctor_availability: UNIQUE(doctor_id, slot_time)
- appointments: UNIQUE(doctor_id, appointment_time)
- appointments: UNIQUE(patient_id, appointment_time)
- medical_records: UNIQUE(appointment_id)
- prescriptions: UNIQUE(medical_record_id)

====================================================
TECH STACK REQUIREMENTS
====================================================

- FastAPI
- SQLAlchemy 2.0 (async)
- asyncpg
- Alembic (migration-ready structure)
- Pydantic v2
- JWT authentication
- Dependency Injection for tenant resolution
- Role-based access control (RBAC)
- Modular architecture

====================================================
PROJECT STRUCTURE
====================================================

Generate project structure:

app/
  main.py
  core/
      config.py
      security.py
      database.py
      dependencies.py
  models/
      base.py
      tenant.py
      user.py
      doctor.py
      patient.py
      appointment.py
      medical_record.py
      pharmacy.py
      prescription.py
      document.py
      audit_log.py
  schemas/
      tenant.py
      user.py
      doctor.py
      patient.py
      appointment.py
      medical_record.py
      prescription.py
      document.py
  crud/
      base.py
      user.py
      doctor.py
      patient.py
      appointment.py
  api/
      deps.py
      routes/
          auth.py
          users.py
          doctors.py
          patients.py
          appointments.py
          medical_records.py
          prescriptions.py
          documents.py
  services/
      audit_service.py
      appointment_service.py
  middleware/
      tenant_middleware.py

====================================================
MULTI-TENANT ENFORCEMENT
====================================================

Tenant must be resolved from:
- JWT token claim: tenant_id

All queries MUST:
- Filter by tenant_id
- Prevent cross-tenant data leakage

Use dependency injection:

get_current_tenant()
get_current_user()

====================================================
AUTHENTICATION
====================================================

Implement:

- Password hashing (bcrypt)
- JWT access tokens
- JWT contains:
    user_id
    tenant_id
    role

RBAC rules:

ADMIN:
- Full access within tenant

DOCTOR:
- Access own appointments
- Access own patients via appointments
- Create medical records for own appointments

PATIENT:
- Access own profile
- View own appointments
- View own prescriptions
- Upload own documents

====================================================
SOFT DELETE HANDLING
====================================================

Soft delete logic:

Instead of deleting records:
- Set deleted_at = now()
- Set deleted_by = current_user.id

All queries must automatically filter:
    deleted_at IS NULL

Provide reusable base query mixin.

====================================================
APPOINTMENT BOOKING LOGIC
====================================================

Implement service layer:

appointment_service.py

Rules:
- Doctor cannot have 2 appointments at same time
- Patient cannot have 2 appointments at same time
- Check doctor_availability.is_booked
- On booking:
    - Insert appointment
    - Mark availability slot is_booked = true
- Use DB transaction
- Handle IntegrityError properly

====================================================
AUDIT LOGGING
====================================================

Implement audit_service.py

On:
- INSERT
- UPDATE
- SOFT DELETE

Insert record into audit_logs table:

Fields:
- tenant_id
- table_name
- record_id
- action_type
- old_data (JSON)
- new_data (JSON)
- performed_by

Hook this into CRUD base class automatically.

====================================================
ENDPOINTS REQUIRED
====================================================

AUTH:
POST /auth/login
POST /auth/register

TENANT (ADMIN only):
POST /tenants
GET /tenants/{id}

USERS:
POST /users
GET /users
GET /users/{id}
DELETE /users/{id} (soft delete)

DOCTORS:
POST /doctors
GET /doctors

PATIENTS:
POST /patients
GET /patients

APPOINTMENTS:
POST /appointments
GET /appointments
PATCH /appointments/{id}/status
DELETE /appointments/{id}

MEDICAL RECORDS:
POST /medical-records
GET /medical-records/{appointment_id}

PRESCRIPTIONS:
POST /prescriptions
GET /prescriptions/{id}

DOCUMENTS:
POST /documents (file upload support)
GET /documents/{patient_id}

====================================================
DATABASE SESSION MANAGEMENT
====================================================

Use async engine:
create_async_engine()
async_sessionmaker()

Use dependency:
get_db()

====================================================
VALIDATION REQUIREMENTS
====================================================

Pydantic must validate:
- Email format
- UUID types
- Enum types
- Non-empty medication_details

====================================================
ERROR HANDLING
====================================================

Handle:
- IntegrityError → 409 Conflict
- Unauthorized → 401
- Forbidden → 403
- Not found → 404

====================================================
OUTPUT FORMAT
====================================================

Provide:

1. Full project structure
2. SQLAlchemy models
3. Pydantic schemas
4. CRUD base class
5. Example route implementation
6. JWT utility code
7. Appointment booking transactional example
8. Audit logging integration example

Code must be clean, production-style, modular, async, and scalable.
Do not redesign database schema.
Do not remove doctors table.
Do not merge users and doctors.
Follow schema strictly.