# Database Schema Updates

## Overview
This document describes the recent updates to the database schema to support additional patient information and doctor availability blocking reasons.

## Changes Made

### 1. Doctor Availability Table (`doctor_availability`)
- **Removed Field**: `is_booked` (BOOLEAN)
  - This column has been removed
  - Status is now determined solely by the `status` column enumeration
- **New Field**: `block_reason` (TEXT, nullable)
  - Stores the reason why a doctor blocked a time slot
  - Required when status is "BLOCKED"
  - Cleared when slot is unblocked or made available
- **Status Column**: Now uses enumeration values exclusively:
  - "AVAILABLE" - Slot is available for booking
  - "BOOKED" - Slot has been booked by a patient
  - "BLOCKED" - Slot is blocked by doctor (with optional reason)

### 2. Patient Table (`patients`)
- **New Fields**:
  - `date_of_birth` (DATE, nullable) - Patient's date of birth
  - `gender` (VARCHAR(20), nullable) - Patient gender
  - `address_line1` (VARCHAR(255), nullable) - Primary street address
  - `address_line2` (VARCHAR(255), nullable) - Secondary address line
  - `city` (VARCHAR(100), nullable) - City name
  - `state` (VARCHAR(100), nullable) - State or province
  - `postal_code` (VARCHAR(20), nullable) - ZIP or postal code
  - `country` (VARCHAR(100), nullable) - Country name

### 3. Gender Type ENUM
- **New ENUM**: `gender_type`
  - Values: 'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'
  - Used for patient gender field

## Frontend Updates

### Patient Registration Forms
- Added all new patient fields to registration forms
- Country dropdown with all countries, defaulting to "USA"
- Gender dropdown with predefined options
- Date of birth field with date picker
- Address fields (line 1, line 2, city, state, postal code, country)

### Doctor Availability Management
- When blocking a slot, doctors are now prompted to enter a reason
- The block reason is stored and displayed in the database

## Backend Updates

### API Endpoints Updated
1. **POST /auth/register** - Patient registration now accepts new fields
2. **POST /admin/users** - Admin user creation now accepts new patient fields
3. **POST /doctor/availability** - Now accepts `block_reason` parameter

### Models Updated
1. `DoctorAvailability` model - Added `block_reason` field
2. `Patient` model - Added all new patient fields
3. Pydantic schemas updated to include new fields

## Migration Instructions

To apply these changes to an existing database:

1. Run the migration script:
```bash
psql -d your_database_name -f server/migrations/001_add_patient_and_availability_fields.sql
```

2. The migration will:
   - Remove `is_booked` column from `doctor_availability` (if it exists)
   - Add `block_reason` column to `doctor_availability`
   - Add all new patient fields to `patients`
   - Create the `gender_type` ENUM

## Notes

- All new fields are optional (nullable) to ensure backward compatibility
- Existing patient records will have NULL values for new fields
- The gender ENUM is created but not enforced on the column yet (can be added later)
- Frontend validates required fields but backend allows NULL values for flexibility
- The `is_booked` column has been removed from `doctor_availability` table
  - All booking status is now tracked through the `status` column enumeration
  - This simplifies the data model and prevents inconsistencies between `is_booked` and `status`
