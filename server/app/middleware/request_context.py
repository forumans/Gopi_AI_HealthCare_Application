"""Request-scoped context storage for tenant-aware FastAPI middleware.

This module centralizes request context in ``contextvars`` so downstream code
(e.g., services, repositories, audit logging hooks) can access the current
tenant/user safely across async boundaries.
"""

from __future__ import annotations

from contextvars import ContextVar, Token
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class RequestContext:
    """Per-request identity context derived from JWT claims."""

    request_id: str
    tenant_id: str
    user_id: str
    role: str


_request_context: ContextVar[Optional[RequestContext]] = ContextVar("request_context", default=None)


def set_request_context(context: RequestContext) -> Token:
    """Store context for the active request and return token for reset."""

    return _request_context.set(context)


def reset_request_context(token: Token) -> None:
    """Reset context after response is produced.

    Always call this in a ``finally`` block to avoid context leakage between
    concurrent requests.
    """

    _request_context.reset(token)


def get_request_context() -> Optional[RequestContext]:
    """Return current request context if available."""

    return _request_context.get()


def get_current_tenant_id() -> Optional[str]:
    """Convenience accessor used by tenant-scoped data layers."""

    context = get_request_context()
    if context is None:
        return None
    return context.tenant_id
