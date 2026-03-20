"""API dependency re-exports for route modules."""

from ..core.database import get_db
from ..core.dependencies import CurrentIdentity, get_current_identity, get_current_tenant, require_roles

__all__ = [
    "CurrentIdentity",
    "get_current_identity",
    "get_current_tenant",
    "get_db",
    "require_roles",
]
