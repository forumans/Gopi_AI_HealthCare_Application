-- Migration: Fix sync_doctor_availability function to use status instead of is_booked
-- Run this manually in PostgreSQL as a superuser or the function owner

-- 1️⃣ Drop the trigger first (this removes dependency)
DROP TRIGGER IF EXISTS trg_sync_availability ON appointments;

-- 2️⃣ Now drop the old function
DROP FUNCTION IF EXISTS public.sync_doctor_availability();

-- 3️⃣ Recreate the function with the new logic
CREATE OR REPLACE FUNCTION public.sync_doctor_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN

    -- INSERT → book slot
    IF TG_OP = 'INSERT' THEN
        UPDATE doctor_availability
        SET status = 'BOOKED'
        WHERE doctor_id = NEW.doctor_id
        AND slot_time = NEW.appointment_time;

        RETURN NEW;
    END IF;

    -- UPDATE
    IF TG_OP = 'UPDATE' THEN

        -- if appointment cancelled → free slot
        IF NEW.status = 'CANCELLED' THEN
            UPDATE doctor_availability
            SET status = 'AVAILABLE'
            WHERE doctor_id = NEW.doctor_id
            AND slot_time = NEW.appointment_time;
        END IF;

        RETURN NEW;

    END IF;

    -- DELETE → free slot
    IF TG_OP = 'DELETE' THEN
        UPDATE doctor_availability
        SET status = 'AVAILABLE'
        WHERE doctor_id = OLD.doctor_id
        AND slot_time = OLD.appointment_time;

        RETURN OLD;
    END IF;

    RETURN NULL;

END;
$$;

-- Recreate the trigger
CREATE TRIGGER trg_sync_availability
AFTER INSERT OR UPDATE OR DELETE
ON appointments
FOR EACH ROW
EXECUTE FUNCTION sync_doctor_availability();

-- Verify
SELECT 'Trigger and function updated successfully' AS result;
