-- Test Database Cleanup Script
-- This script cleans up test data for end-to-end testing

-- Delete data in correct order to respect foreign key constraints
DELETE FROM prescriptions WHERE tenant_id = 'test-tenant-id';
DELETE FROM medical_records WHERE tenant_id = 'test-tenant-id';
DELETE FROM patient_documents WHERE tenant_id = 'test-tenant-id';
DELETE FROM doctor_availability WHERE tenant_id = 'test-tenant-id';
DELETE FROM appointments WHERE tenant_id = 'test-tenant-id';
DELETE FROM pharmacies WHERE tenant_id = 'test-tenant-id';
DELETE FROM patients WHERE tenant_id = 'test-tenant-id';
DELETE FROM doctors WHERE tenant_id = 'test-tenant-id';
DELETE FROM admins WHERE tenant_id = 'test-tenant-id';
DELETE FROM users WHERE tenant_id = 'test-tenant-id';
DELETE FROM tenants WHERE id = 'test-tenant-id';

COMMIT;
