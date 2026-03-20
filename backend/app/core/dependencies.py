"""FastAPI dependencies for current tenant/user context and RBAC checks."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from fastapi import Depends, HTTPException, Request, status


@dataclass(frozen=True)
class CurrentIdentity:
    tenant_id: str
    user_id: str
    role: str


def get_current_identity(request: Request) -> CurrentIdentity:
    """Read identity populated by `TenantContextMiddleware`."""

    tenant_id = getattr(request.state, "tenant_id", None)
    user_id = getattr(request.state, "user_id", None)
    role = getattr(request.state, "role", None)

    if not tenant_id or not user_id or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")

    return CurrentIdentity(tenant_id=tenant_id, user_id=user_id, role=role)


def get_current_tenant(identity: CurrentIdentity = Depends(get_current_identity)) -> str:
    """Return active tenant_id for tenant-scoped queries."""

    return identity.tenant_id


def require_roles(*roles: str) -> Callable[[CurrentIdentity], CurrentIdentity]:
    """Build dependency that enforces role-based access."""

    normalized_roles = {r.upper() for r in roles}

    def _checker(identity: CurrentIdentity = Depends(get_current_identity)) -> CurrentIdentity:
        if identity.role.upper() not in normalized_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden for this role.")
        return identity

    return _checker
