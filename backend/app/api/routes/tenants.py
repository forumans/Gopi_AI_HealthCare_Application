"""Tenant routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import CurrentIdentity, get_current_identity, require_roles
from ...core.database import get_db
from ...models import Tenant

router = APIRouter(prefix="/tenants")


class CreateTenantRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    domain: str | None = Field(default=None, max_length=255)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_tenant(
    payload: CreateTenantRequest,
    _: CurrentIdentity = Depends(require_roles("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    tenant = Tenant(name=payload.name.strip(), domain=(payload.domain or "").strip() or None)
    db.add(tenant)
    try:
        await db.flush()
    except IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tenant domain already exists.") from exc

    await db.commit()
    return {"id": tenant.id, "name": tenant.name, "domain": tenant.domain}


@router.get("/debug")
async def debug_tenant_info(
    identity: CurrentIdentity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Debug endpoint to check tenant information"""
    return {
        "identity": {
            "tenant_id": identity.tenant_id,
            "user_id": identity.user_id,
            "role": identity.role
        }
    }


@router.get("/current")
async def get_current_tenant(
    identity: CurrentIdentity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get the current user's tenant information"""
    tenant = (await db.execute(select(Tenant).where(Tenant.id == identity.tenant_id))).scalar_one_or_none()
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found.")
    return {"id": tenant.id, "name": tenant.name, "domain": tenant.domain}


@router.get("/{tenant_id}")
async def get_tenant(
    tenant_id: str,
    _: CurrentIdentity = Depends(require_roles("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    tenant = (await db.execute(select(Tenant).where(Tenant.id == tenant_id))).scalar_one_or_none()
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found.")
    return {"id": tenant.id, "name": tenant.name, "domain": tenant.domain}
