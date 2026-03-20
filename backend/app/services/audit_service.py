"""Audit logging service.

Persists `audit_logs` records according to Healthcare_Postgres_DB_Script.sql.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AuditLog


async def write_audit_log(
    db: AsyncSession,
    *,
    tenant_id: str | None,
    table_name: str,
    record_id: str,
    action_type: str,
    old_data: dict[str, Any] | None,
    new_data: dict[str, Any] | None,
    performed_by: str | None,
) -> None:
    """Persist a single audit log row.

    Caller controls transaction boundaries.
    """

    db.add(
        AuditLog(
            tenant_id=tenant_id,
            table_name=table_name,
            record_id=record_id,
            action_type=action_type,
            old_data=old_data,
            new_data=new_data,
            performed_by=performed_by,
        )
    )
