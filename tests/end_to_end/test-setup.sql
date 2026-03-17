-- Test Database Setup for Healthcare Application
-- This script creates test data for end-to-end testing

-- Create test tenant
INSERT INTO tenants (id, name, created_at) VALUES 
('test-tenant-id', 'Test Healthcare Organization', CURRENT_TIMESTAMP);

-- Create test admin user
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at) VALUES 
('test-admin-id', 'test-tenant-id', 'admin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'ADMIN', CURRENT_TIMESTAMP);

-- Create test doctor user
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at) VALUES 
('test-doctor-id', 'test-tenant-id', 'doctor@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'DOCTOR', CURRENT_TIMESTAMP);

-- Create test patient user
INSERT INTO users (id, tenant_id, email, password_hash, role, created_at) VALUES 
('test-patient-id', 'test-tenant-id', 'patient@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'PATIENT', CURRENT_TIMESTAMP);

-- Create test admin profile
INSERT INTO admins (id, tenant_id, user_id, name, phone, created_at) VALUES 
('test-admin-profile-id', 'test-tenant-id', 'test-admin-id', 'Admin User', '1234567890', CURRENT_TIMESTAMP);

-- Create test doctor profile
INSERT INTO doctors (id, tenant_id, user_id, name, specialization, phone, created_at) VALUES 
('test-doctor-profile-id', 'test-tenant-id', 'test-doctor-id', 'Dr. Test Doctor', 'Cardiology', '1234567890', CURRENT_TIMESTAMP);

-- Create test patient profile
INSERT INTO patients (id, tenant_id, user_id, name, email, phone, date_of_birth, created_at) VALUES 
('test-patient-profile-id', 'test-tenant-id', 'test-patient-id', 'Test Patient', 'patient@test.com', '1234567890', '1990-01-01', CURRENT_TIMESTAMP);

-- Create test pharmacies
INSERT INTO pharmacies (id, tenant_id, name, address, phone, created_at) VALUES 
('test-pharmacy-1', 'test-tenant-id', 'Test Pharmacy 1', '123 Main St, City, State 12345', '555-1234', CURRENT_TIMESTAMP),
('test-pharmacy-2', 'test-tenant-id', 'Test Pharmacy 2', '456 Oak Ave, City, State 67890', '555-5678', CURRENT_TIMESTAMP),
('test-pharmacy-3', 'test-tenant-id', 'Test Pharmacy 3', '789 Pine Rd, City, State 13579', '555-9012', CURRENT_TIMESTAMP);

-- Create test appointments
INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, time, status, notes, created_at) VALUES 
('test-appointment-1', 'test-tenant-id', 'test-patient-profile-id', 'test-doctor-profile-id', '2026-03-17 09:00:00', 'CONFIRMED', 'Regular checkup', CURRENT_TIMESTAMP),
('test-appointment-2', 'test-tenant-id', 'test-patient-profile-id', 'test-doctor-profile-id', '2026-03-17 10:00:00', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('test-appointment-3', 'test-tenant-id', 'test-patient-profile-id', 'test-doctor-profile-id', '2026-03-18 14:00:00', 'CONFIRMED', 'Follow-up appointment', CURRENT_TIMESTAMP);

-- Create test medical record
INSERT INTO medical_records (id, tenant_id, appointment_id, diagnosis, notes, lab_results, created_at) VALUES 
('test-medical-record-1', 'test-tenant-id', 'test-appointment-1', 'Common cold', 'Patient reports headache and fever', 'Blood test normal', CURRENT_TIMESTAMP);

-- Create test prescription
INSERT INTO prescriptions (id, tenant_id, medical_record_id, pharmacy_id, medication_details, created_at) VALUES 
('test-prescription-1', 'test-tenant-id', 'test-medical-record-1', 'test-pharmacy-1', 'Paracetamol 500mg - Take twice daily with food', CURRENT_TIMESTAMP);

-- Create test availability slots for doctor
INSERT INTO doctor_availability (id, tenant_id, doctor_id, slot_time, status, created_at) VALUES 
('test-availability-1', 'test-tenant-id', 'test-doctor-profile-id', '2026-03-17 09:00:00', 'BOOKED', CURRENT_TIMESTAMP),
('test-availability-2', 'test-tenant-id', 'test-doctor-profile-id', '2026-03-17 10:00:00', 'AVAILABLE', CURRENT_TIMESTAMP),
('test-availability-3', 'test-tenant-id', 'test-doctor-profile-id', '2026-03-17 11:00:00', 'AVAILABLE', CURRENT_TIMESTAMP),
('test-availability-4', 'test-tenant-id', 'test-doctor-profile-id', '2026-03-17 14:00:00', 'BOOKED', CURRENT_TIMESTAMP),
('test-availability-5', 'test-tenant-id', 'test-doctor-profile-id', '2026-03-18 09:00:00', 'AVAILABLE', CURRENT_TIMESTAMP);

-- Create test patient document
INSERT INTO patient_documents (id, tenant_id, patient_id, filename, description, created_at) VALUES 
('test-document-1', 'test-tenant-id', 'test-patient-profile-id', 'test-report.pdf', 'Test medical report', CURRENT_TIMESTAMP);

COMMIT;
