"""Admin Password Reset Routes"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, validator

from ...core.database import get_db
from ...core.dependencies import CurrentIdentity, require_roles
from ...core.security import hash_password
from ...models import User

class PasswordResetRequest(BaseModel):
    email: str
    role: str
    new_password: str

    @validator('email')
    def validate_email(cls, v):
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()

router = APIRouter()

@router.post("/reset-password")
async def reset_user_password(
    request: PasswordResetRequest,
    identity: CurrentIdentity = Depends(require_roles("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Reset password for a user by email and role"""
    
    # Validate role
    valid_roles = ["PATIENT", "DOCTOR", "ADMIN"]
    if request.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Validate password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Find user by email and role
    user = (
        await db.execute(
            select(User).where(
                and_(
                    User.email == request.email,
                    User.role == request.role,
                    User.tenant_id == identity.tenant_id,
                    User.deleted_at.is_(None),
                )
            )
        )
    ).scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found with the provided email and role combination"
        )
    
    # Update password
    user.password_hash = hash_password(request.new_password)
    await db.commit()
    
    return {
        "message": "Password reset successfully",
        "user_email": request.email,
        "user_role": request.role,
        "reset_by": identity.user_id
    }

@router.get("/roles")
async def get_available_roles(
    identity: CurrentIdentity = Depends(require_roles("ADMIN")),
) -> list[dict]:
    """Get available user roles for password reset"""
    return [
        {"value": "PATIENT", "label": "Patients"},
        {"value": "DOCTOR", "label": "Doctors"},
        {"value": "ADMIN", "label": "Admin"},
    ]
