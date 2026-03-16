"""Appointment booking service with transaction-safe constraints."""

from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Appointment, DoctorAvailability


async def book_appointment(
    db: AsyncSession,
    *,
    tenant_id: str,
    doctor_id: str,
    patient_id: str,
    appointment_time: datetime,
    notes: str | None,
) -> Appointment:
    """Book an appointment and mark corresponding availability as booked.

    Enforces no-double-booking constraints from DB unique indexes and performs
    availability check before insert.
    """
    
    availability_stmt = (
        select(DoctorAvailability)
        .where(
            and_(
                DoctorAvailability.tenant_id == tenant_id,
                DoctorAvailability.doctor_id == doctor_id,
                DoctorAvailability.slot_time == appointment_time,
            )
        )
        .with_for_update()
    )
    availability = (await db.execute(availability_stmt)).scalar_one_or_none()
    
    if availability is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Requested slot is not available.")
    
    if availability.status != "AVAILABLE":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Requested slot is not available.")

    record = Appointment(
        tenant_id=tenant_id,
        doctor_id=doctor_id,
        patient_id=patient_id,
        slot_id=availability.id,  # Use the availability record's id as slot_id
        appointment_time=appointment_time,
        notes=notes,
    )
    db.add(record)
    availability.status = "BOOKED"

    try:
        await db.flush()
    except IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Appointment conflicts with existing booking.") from exc

    return record
