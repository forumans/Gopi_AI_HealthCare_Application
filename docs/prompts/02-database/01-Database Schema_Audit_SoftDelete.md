# 01-Database Schema, Audit, SoftDelete
You are a senior PostgreSQL database architect.

Generate a complete PostgreSQL database creation script for a multi-tenant Healthcare SaaS application.

This database must match the following architecture exactly. Do NOT redesign the structure. Preserve the domain model as described below.

GENERAL REQUIREMENTS:

- Use PostgreSQL
- Use UUID primary keys via uuid_generate_v4()
- Enable extension: uuid-ossp
- Use ENUM types where specified
- All foreign keys must explicitly define ON DELETE behavior
- All business tables must include tenant_id
- Maintain existing table separation between users, doctors, and patients
- Include soft delete columns exactly as described
- Include all unique constraints and indexes exactly as described

--------------------------------------------------
DATABASE STRUCTURE
--------------------------------------------------

1) DATABASE
Create a database named:
    healthcare_saas

Enable:
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
ENUM TYPES
--------------------------------------------------

Create ENUM user_role:
    'ADMIN'
    'DOCTOR'
    'PATIENT'

Create ENUM appointment_status:
    'SCHEDULED'
    'CONFIRMED'
    'CANCELLED'
    'COMPLETED'

--------------------------------------------------
TABLE: tenants
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- name VARCHAR(255) NOT NULL
- domain VARCHAR(255) UNIQUE
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

--------------------------------------------------
TABLE: users
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- email VARCHAR(255) NOT NULL
- password_hash TEXT NOT NULL
- role user_role NOT NULL
- is_active BOOLEAN DEFAULT TRUE
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Constraints:
- UNIQUE (tenant_id, email)

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

Index:
- CREATE INDEX idx_users_tenant ON users(tenant_id)

--------------------------------------------------
TABLE: doctors
--------------------------------------------------

Purpose:
Separate clinical profile from authentication user.

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
- full_name VARCHAR(255) NOT NULL
- specialty VARCHAR(255)
- license_number VARCHAR(100)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

Index:
- CREATE INDEX idx_doctors_tenant ON doctors(tenant_id)

--------------------------------------------------
TABLE: patients
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
- full_name VARCHAR(255) NOT NULL
- phone VARCHAR(50)
- insurance_provider VARCHAR(255)
- insurance_policy_number VARCHAR(255)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

Index:
- CREATE INDEX idx_patients_tenant ON patients(tenant_id)

--------------------------------------------------
TABLE: doctor_availability
--------------------------------------------------

Purpose:
Stores 1-hour time slots per doctor.

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE
- slot_time TIMESTAMP NOT NULL
- is_booked BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Constraints:
- UNIQUE (doctor_id, slot_time)

Index:
- CREATE INDEX idx_availability_doctor_time ON doctor_availability(doctor_id, slot_time)

--------------------------------------------------
TABLE: appointments
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE
- patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE
- appointment_time TIMESTAMP NOT NULL
- status appointment_status DEFAULT 'SCHEDULED'
- notes TEXT
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Constraints:
- UNIQUE (doctor_id, appointment_time)
- UNIQUE (patient_id, appointment_time)

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

Indexes:
- CREATE INDEX idx_appointments_doctor ON appointments(doctor_id)
- CREATE INDEX idx_appointments_patient ON appointments(patient_id)
- CREATE INDEX idx_appointments_time ON appointments(appointment_time)

--------------------------------------------------
TABLE: medical_records
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE
- symptoms TEXT
- diagnosis TEXT
- lab_results TEXT
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

Index:
- CREATE INDEX idx_medical_records_tenant ON medical_records(tenant_id)

--------------------------------------------------
TABLE: pharmacies
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- name VARCHAR(255) NOT NULL
- location VARCHAR(255)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

--------------------------------------------------
TABLE: prescriptions
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- medical_record_id UUID NOT NULL UNIQUE REFERENCES medical_records(id) ON DELETE CASCADE
- pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL
- medication_details TEXT NOT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

Index:
- CREATE INDEX idx_prescriptions_tenant ON prescriptions(tenant_id)

--------------------------------------------------
TABLE: patient_documents
--------------------------------------------------

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
- patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE
- document_name VARCHAR(255)
- document_type VARCHAR(100)
- file_path TEXT
- signed_at TIMESTAMP
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Soft Delete Columns:
- deleted_at TIMESTAMP
- deleted_by UUID

--------------------------------------------------
TABLE: audit_logs
--------------------------------------------------

Purpose:
Track insert/update/delete activity.

Columns:
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- tenant_id UUID
- table_name TEXT NOT NULL
- record_id UUID NOT NULL
- action_type TEXT NOT NULL
- old_data JSONB
- new_data JSONB
- performed_by UUID
- performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

--------------------------------------------------

Ensure the script outputs:
- CREATE DATABASE
- CREATE EXTENSION
- CREATE TYPE statements
- CREATE TABLE statements
- ALTER TABLE statements for constraints
- CREATE INDEX statements
- All soft delete columns included

Do NOT add additional tables.
Do NOT redesign relationships.
Replicate structure exactly as defined above.
