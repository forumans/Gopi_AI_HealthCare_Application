-- Create Database
CREATE DATABASE healthcare_saas;

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');

CREATE TYPE appointment_status AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);

-- TENANTS (Multi-Tenant Root Table)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (tenant_id, email)
);

-- DOCTORS
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    license_number VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PATIENTS
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMINS
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP,
    deleted_by UUID
);


-- DOCTOR AVAILABILITY (Calendar Slots)
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,

    slot_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (doctor_id, slot_time)
);


--APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

    appointment_time TIMESTAMP NOT NULL,
    status appointment_status DEFAULT 'SCHEDULED',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--MEDICAL RECORDS
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,

    symptoms TEXT,
    diagnosis TEXT,
    lab_results TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--PHARMACIES
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- PRESCRIPTIONS
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    medical_record_id UUID NOT NULL UNIQUE REFERENCES medical_records(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL,

    medication_details TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PATIENT DOCUMENTS (HIPAA Forms)
CREATE TABLE patient_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

    document_name VARCHAR(255),
    document_type VARCHAR(100),
    file_path TEXT,
    signed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enforce No Double Booking (Critical)
-- Unique Constraint on Doctor + Time
-- Now:
--   Doctor cannot have 2 appointments at same time
--   Fully safe
--   ACID compliant

ALTER TABLE appointments
ADD CONSTRAINT unique_doctor_time
UNIQUE (doctor_id, appointment_time);

-- Optional: Also Prevent Patient Double Booking
-- Now a patient cannot book two doctors at the same time.
ALTER TABLE appointments
ADD CONSTRAINT unique_patient_time
UNIQUE (patient_id, appointment_time);


-- Add Soft Delete Columns
-- Apply to all business tables:
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_by UUID;

ALTER TABLE doctors ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE doctors ADD COLUMN deleted_by UUID;

ALTER TABLE patients ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE patients ADD COLUMN deleted_by UUID;

ALTER TABLE admins ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE admins ADD COLUMN deleted_by UUID;

ALTER TABLE appointments ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN deleted_by UUID;

ALTER TABLE medical_records ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE medical_records ADD COLUMN deleted_by UUID;

ALTER TABLE prescriptions ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE prescriptions ADD COLUMN deleted_by UUID;

ALTER TABLE pharmacies ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE pharmacies ADD COLUMN deleted_by UUID;

ALTER TABLE patient_documents ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE patient_documents ADD COLUMN deleted_by UUID;

-- Create Audit Log Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    tenant_id UUID,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,

    action_type TEXT NOT NULL, -- INSERT / UPDATE / DELETE

    old_data JSONB,
    new_data JSONB,

    performed_by UUID,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--INDEXES (Performance Optimization)
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_doctors_tenant ON doctors(tenant_id);
CREATE INDEX idx_patients_tenant ON patients(tenant_id);

CREATE INDEX idx_availability_doctor_time ON doctor_availability(doctor_id, slot_time);

CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_time ON appointments(appointment_time);

CREATE INDEX idx_medical_records_tenant ON medical_records(tenant_id);
CREATE INDEX idx_prescriptions_tenant ON prescriptions(tenant_id);
