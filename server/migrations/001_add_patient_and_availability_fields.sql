-- Migration 001: Add new fields to patients and doctor_availability tables
-- Run this migration to update the database schema

-- First, remove the is_booked column if it exists
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_availability' 
        AND column_name = 'is_booked'
    ) THEN
        ALTER TABLE doctor_availability DROP COLUMN is_booked;
    END IF;
END $$;

-- Add block_reason column to doctor_availability table
ALTER TABLE doctor_availability 
ADD COLUMN block_reason TEXT;

-- Add new columns to patients table
ALTER TABLE patients 
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender VARCHAR(20),
ADD COLUMN address_line1 VARCHAR(255),
ADD COLUMN address_line2 VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN postal_code VARCHAR(20),
ADD COLUMN country VARCHAR(100);

-- Create the gender_type ENUM type (PostgreSQL)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
    END IF;
END $$;

-- Update the gender column to use the new ENUM (optional, can be done later)
-- ALTER TABLE patients ALTER COLUMN gender TYPE gender_type USING gender::gender_type;

-- Add comments for documentation
COMMENT ON COLUMN doctor_availability.block_reason IS 'Reason why a doctor blocked this time slot';
COMMENT ON COLUMN patients.date_of_birth IS 'Patient date of birth';
COMMENT ON COLUMN patients.gender IS 'Patient gender: MALE, FEMALE, OTHER, or PREFER_NOT_TO_SAY';
COMMENT ON COLUMN patients.address_line1 IS 'Primary street address';
COMMENT ON COLUMN patients.address_line2 IS 'Secondary address line (apartment, suite, etc.)';
COMMENT ON COLUMN patients.city IS 'City name';
COMMENT ON COLUMN patients.state IS 'State or province';
COMMENT ON COLUMN patients.postal_code IS 'ZIP or postal code';
COMMENT ON COLUMN patients.country IS 'Country name';
