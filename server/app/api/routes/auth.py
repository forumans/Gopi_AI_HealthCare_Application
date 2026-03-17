"""Authentication routes used by Gradio UI screens.

Implements:
- POST /auth/register
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password
"""

from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import hash_password, verify_password, create_access_token
from ...core.dependencies import CurrentIdentity, get_current_identity, require_roles
from ...core.database import get_db
from ...models import Patient, Tenant, User
from ...services.audit_service import write_audit_log

router = APIRouter(prefix="/auth")


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=255)
    email: str
    phone: str | None = None
    password: str = Field(min_length=5)
    insurance_provider: str | None = None
    insurance_policy_number: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=5)


async def _ensure_default_tenant(db: AsyncSession) -> Tenant:
    """Get/create a default tenant for bootstrap flows.

    In production, tenant onboarding should be a dedicated admin flow.
    """

    existing = (await db.execute(select(Tenant).limit(1))).scalar_one_or_none()
    if existing:
        return existing

    tenant = Tenant(name="Default Tenant", domain="default.local")
    db.add(tenant)
    await db.flush()
    return tenant


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> dict:
    tenant = await _ensure_default_tenant(db)

    user = User(
        tenant_id=tenant.id,
        email=str(request.email).lower(),
        password_hash=hash_password(request.password),
        role="PATIENT",
        is_active=True,
    )
    db.add(user)

    try:
        await db.flush()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists in tenant.") from exc

    patient = Patient(
        tenant_id=tenant.id,
        user_id=user.id,
        full_name=request.full_name.strip(),
        phone=(request.phone or "").strip() or None,
        insurance_provider=(request.insurance_provider or "").strip() or None,
        insurance_policy_number=(request.insurance_policy_number or "").strip() or None,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        address_line1=(request.address_line1 or "").strip() or None,
        address_line2=(request.address_line2 or "").strip() or None,
        city=(request.city or "").strip() or None,
        state=(request.state or "").strip() or None,
        postal_code=(request.postal_code or "").strip() or None,
        country=(request.country or "").strip() or None,
    )
    db.add(patient)

    await write_audit_log(
        db,
        tenant_id=tenant.id,
        table_name="users",
        record_id=user.id,
        action_type="INSERT",
        old_data=None,
        new_data={"email": user.email, "role": user.role},
        performed_by=user.id,
    )
    await db.commit()

    return {"message": "Registration successful"}


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> dict:
    stmt = select(User).where(User.email == str(request.email).lower(), User.deleted_at.is_(None), User.is_active.is_(True))
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")

    token = create_access_token(user_id=user.id, tenant_id=user.tenant_id, role=user.role)

    # Fetch patient details if role is PATIENT
    patient_name = None
    insurance_provider = None
    insurance_policy_id = None
    if user.role == "PATIENT":
        patient_stmt = select(Patient).where(
            Patient.user_id == user.id,
            Patient.tenant_id == user.tenant_id,
            Patient.deleted_at.is_(None)
        )
        patient = (await db.execute(patient_stmt)).scalar_one_or_none()
        if patient:
            patient_name = patient.full_name
            insurance_provider = patient.insurance_provider
            insurance_policy_id = patient.insurance_policy_number

    return {
        "access_token": token,
        "refresh_token": "",
        "role": user.role,
        "tenant_id": user.tenant_id,
        "user_name": patient_name,
        "insurance_provider": insurance_provider,
        "insurance_policy_id": insurance_policy_id,
    }


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest) -> dict:
    # Security best practice: always return generic success response.
    print(f"[DEBUG] Forgot password requested for email: {request.email}")
    return {"message": "If an account exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest) -> dict:
    # Placeholder until secure reset-token persistence/verification is added.
    _ = request
    return {"message": "Password reset flow accepted."}
