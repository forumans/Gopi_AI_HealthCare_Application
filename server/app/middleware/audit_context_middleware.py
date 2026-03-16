"""Audit context middleware.

Captures lightweight metadata for write operations so service/CRUD layers can
persist ``audit_logs`` entries (tenant_id, table_name, record_id, action_type,
old_data, new_data, performed_by) as defined in Healthcare_Postgres_DB_Script.sql.
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class AuditContextMiddleware(BaseHTTPMiddleware):
    """Expose request metadata used by audit services."""

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        tenant_id = getattr(request.state, "tenant_id", None)
        user_id = getattr(request.state, "user_id", None)

        request.state.audit_context = {
            "tenant_id": tenant_id,
            "performed_by": user_id,
            "method": request.method,
            "path": request.url.path,
            "is_write": request.method in WRITE_METHODS,
        }

        return await call_next(request)
