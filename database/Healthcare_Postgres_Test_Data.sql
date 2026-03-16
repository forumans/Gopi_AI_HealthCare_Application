-- Insert Tenants
INSERT INTO tenants (id, name, domain)
VALUES
(uuid_generate_v4(), 'HealthyLife Clinic', 'healthylife.com'),
(uuid_generate_v4(), 'CarePlus Hospital', 'careplus.com');

--Insert Users (Admin, Doctor, Patient)
-- ADMIN USERS
INSERT INTO users (id, tenant_id, email, password_hash, role)
SELECT uuid_generate_v4(), id, 'admin@' || domain, 'admin123', 'ADMIN'
FROM tenants;

-- DOCTOR USERS
INSERT INTO users (id, tenant_id, email, password_hash, role)
SELECT uuid_generate_v4(), id, 'doctor1@' || domain, 'doctor123', 'DOCTOR'
FROM tenants;

-- PATIENT USERS
INSERT INTO users (id, tenant_id, email, password_hash, role)
SELECT uuid_generate_v4(), id, 'patient1@' || domain, 'patient123', 'PATIENT'
FROM tenants;

--Insert Doctors
INSERT INTO doctors (id, tenant_id, user_id, full_name, specialty, license_number)
SELECT
    uuid_generate_v4(),
    t.id,
    u.id,
    'Dr. John Smith',
    'General Medicine',
    'LIC-' || FLOOR(random()*10000)
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE u.role = 'DOCTOR';


--Insert Patients
INSERT INTO patients (
    id, tenant_id, user_id,
    full_name, phone,
    insurance_provider, insurance_policy_number
)
SELECT
    uuid_generate_v4(),
    t.id,
    u.id,
    'Alice Johnson',
    '555-123-4567',
    'BlueCross',
    'POL-' || FLOOR(random()*100000)
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE u.role = 'PATIENT';


--Insert Pharmacies
INSERT INTO pharmacies (id, tenant_id, name, location)
SELECT
    uuid_generate_v4(),
    id,
    'City Pharmacy',
    'Downtown'
FROM tenants;


--Generate 30-Day Doctor Availability
DO $$
DECLARE
    doc RECORD;
    day_offset INTEGER;
    slot_time TIMESTAMP;
    current_day DATE;
BEGIN
    FOR doc IN SELECT id, tenant_id FROM doctors LOOP
        
        FOR day_offset IN 0..30 LOOP
            current_day := current_date + day_offset;

            -- Monday = 1, Friday = 5
            IF EXTRACT(DOW FROM current_day) BETWEEN 1 AND 5 THEN

                FOR hour IN 8..15 LOOP  -- 8AM to 3PM (8 slots)
                    
                    slot_time := current_day + (hour || ' hours')::interval;

                    INSERT INTO doctor_availability (
                        id,
                        tenant_id,
                        doctor_id,
                        slot_time
                    )
                    VALUES (
                        uuid_generate_v4(),
                        doc.tenant_id,
                        doc.id,
                        slot_time
                    );

                END LOOP;

            END IF;
        END LOOP;

    END LOOP;
END $$;


--Create Sample Appointment
INSERT INTO appointments (
    id, tenant_id, doctor_id, patient_id,
    appointment_time, status, notes
)
SELECT
    uuid_generate_v4(),
    d.tenant_id,
    d.id,
    p.id,
    da.slot_time,
    'CONFIRMED',
    'Regular checkup'
FROM doctors d
JOIN patients p ON p.tenant_id = d.tenant_id
JOIN doctor_availability da ON da.doctor_id = d.id
WHERE da.is_booked = false
LIMIT 2;

--Update Slots as Booked
UPDATE doctor_availability da
SET is_booked = true
FROM appointments a
WHERE da.slot_time = a.appointment_time
AND da.doctor_id = a.doctor_id;


--Insert Medical Records
INSERT INTO medical_records (
    id, tenant_id, appointment_id,
    symptoms, diagnosis, lab_results
)
SELECT
    uuid_generate_v4(),
    tenant_id,
    id,
    'Fever and headache',
    CASE WHEN random() > 0.5 THEN 'Problem-A' ELSE 'Problem-B' END,
    'Blood test normal'
FROM appointments;

--Insert Prescriptions
INSERT INTO prescriptions (
    id, tenant_id, medical_record_id,
    pharmacy_id, medication_details
)
SELECT
    uuid_generate_v4(),
    mr.tenant_id,
    mr.id,
    ph.id,
    'Paracetamol 500mg twice daily for 5 days'
FROM medical_records mr
JOIN pharmacies ph ON ph.tenant_id = mr.tenant_id;

--Insert Patient Documents
INSERT INTO patient_documents (
    id, tenant_id, patient_id,
    document_name, document_type,
    file_path, signed_at
)
SELECT
    uuid_generate_v4(),
    p.tenant_id,
    p.id,
    'HIPAA Consent Form',
    'CONSENT',
    '/documents/hipaa_form.pdf',
    CURRENT_TIMESTAMP
FROM patients p;

