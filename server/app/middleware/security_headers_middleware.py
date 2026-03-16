"""Security headers middleware for production-grade healthcare APIs.

These headers improve baseline browser-side protections for API responses.
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach common security headers to every response."""

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        response = await call_next(request)

        # Prevent MIME-type sniffing.
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        # Limit data leakage via Referer header.
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        # Mitigate clickjacking.
        response.headers.setdefault("X-Frame-Options", "DENY")
        # Restrict browser capabilities by default.
        response.headers.setdefault(
            "Permissions-Policy",
            "geolocation=(), camera=(), microphone=(), payment=()",
        )
        # Avoid exposing internals in browser cache history.
        response.headers.setdefault("Cache-Control", "no-store")
        # Encourage HTTPS usage (safe when deployed behind TLS).
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

        return response
