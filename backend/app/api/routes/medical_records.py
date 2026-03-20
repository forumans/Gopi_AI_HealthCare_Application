"""Medical record routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import CurrentIdentity, get_current_identity, require_roles
from ...core.database import get_db
from ...models import Appointment, Doctor, MedicalRecord
from ...services.audit_service import write_audit_log

router = APIRouter()


class CreateMedicalRecordRequest(BaseModel):
    patient_id: str
    diagnosis: str = Field(min_length=3)
    notes: str = Field(min_length=5)
    lab_results: Optional[str] = None


@router.post("/medical-records", status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    payload: CreateMedicalRecordRequest,
    identity: CurrentIdentity = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    doctor = (
        await db.execute(
            select(Doctor).where(
                Doctor.user_id == identity.user_id,
                Doctor.tenant_id == identity.tenant_id,
                Doctor.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor profile not found.")

    appointment = (
        await db.execute(
            select(Appointment)
            .where(
                and_(
                    Appointment.tenant_id == identity.tenant_id,
                    Appointment.doctor_id == doctor.id,
                    Appointment.patient_id == payload.patient_id,
                    Appointment.deleted_at.is_(None),
                )
            )
            .order_by(Appointment.appointment_time.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No appointment found for selected patient.")

    record = MedicalRecord(
        tenant_id=identity.tenant_id,
        appointment_id=appointment.id,
        diagnosis=payload.diagnosis.strip(),
        symptoms=payload.notes.strip(),
        lab_results=payload.lab_results.strip() if payload.lab_results else None,
    )
    db.add(record)

    try:
        await db.flush()
    except IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Medical record already exists for appointment.") from exc

    await write_audit_log(
        db,
        tenant_id=identity.tenant_id,
        table_name="medical_records",
        record_id=record.id,
        action_type="INSERT",
        old_data=None,
        new_data={"appointment_id": record.appointment_id, "diagnosis": record.diagnosis},
        performed_by=identity.user_id,
    )
    await db.commit()

    return {"id": record.id, "message": "Medical record saved."}


@router.get("/medical-records/{appointment_id}")
async def get_medical_record_by_appointment(
    appointment_id: str,
    identity: CurrentIdentity = Depends(require_roles("ADMIN", "DOCTOR", "PATIENT")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    row = (
        await db.execute(
            select(MedicalRecord).where(
                MedicalRecord.appointment_id == appointment_id,
                MedicalRecord.tenant_id == identity.tenant_id,
                MedicalRecord.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

    return {
        "id": row.id,
        "appointment_id": row.appointment_id,
        "symptoms": row.symptoms,
        "diagnosis": row.diagnosis,
        "lab_results": row.lab_results,
    }
