"""Security helpers for password hashing and JWT handling."""

from __future__ import annotations

import hashlib
import hmac
import os
from datetime import UTC, datetime, timedelta
from typing import Any, Dict

import jwt

from .config import settings


def hash_password(password: str) -> str:
    """Hash password for persistence.

    Uses PBKDF2 for consistency.
    """
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return f"pbkdf2${salt.hex()}${digest.hex()}"


def verify_password(password: str, hashed_value: str) -> bool:
    """Verify incoming password against stored hash."""

    if hashed_value.startswith("pbkdf2$"):
        try:
            _, salt_hex, digest_hex = hashed_value.split("$", maxsplit=2)
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(digest_hex)
        except ValueError:
            return False
        current = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
        return hmac.compare_digest(current, expected)

    # For backward compatibility with bcrypt hashes
    try:
        import bcrypt  # type: ignore
        return bcrypt.checkpw(password.encode("utf-8"), hashed_value.encode("utf-8"))
    except Exception:
        return False


def create_access_token(*, user_id: str, tenant_id: str, role: str, expires_minutes: int | None = None) -> str:
    """Create JWT access token with required tenant/user claims."""

    ttl = timedelta(minutes=expires_minutes or settings.access_token_minutes)
    now = datetime.now(tz=UTC)
    payload: Dict[str, Any] = {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + ttl).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
