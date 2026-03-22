"""Small utility to verify PostgreSQL connectivity for local setup.

Usage:
    python .\\test_healthcare_saas_app\\tests\\db_connection_test.py
"""

from __future__ import annotations

import asyncio
import os
from typing import Final

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

DEFAULT_DB_URL: Final[str] = "postgresql+asyncpg://test_user:password@localhost/test_healthcare_db"


def get_database_url() -> str:
    """Read database URL from environment with a local fallback."""
    return os.getenv("DATABASE_URL", DEFAULT_DB_URL)


def redact_db_url(db_url: str) -> str:
    """Mask password in logs while keeping host/db visible for debugging."""
    if "@" not in db_url or "://" not in db_url:
        return db_url

    try:
        scheme, rest = db_url.split("://", 1)
        credentials, host_part = rest.split("@", 1)

        if ":" not in credentials:
            return db_url

        username, _password = credentials.split(":", 1)
        return f"{scheme}://{username}:***@{host_part}"
    except Exception:
        return db_url


async def test_db_connection() -> bool:
    """Attempt a lightweight query and return success/failure."""
    database_url = get_database_url()
    print(f"Using DATABASE_URL: {redact_db_url(database_url)}")

    engine = create_async_engine(database_url, pool_pre_ping=True)

    try:
        async with engine.begin() as connection:
            result = await connection.execute(text("SELECT 1"))
            connected = result.scalar() == 1

        if connected:
            print("SUCCESS: Database connection test passed.")
            return True

        print("ERROR: Database query returned an unexpected result.")
        return False
    except Exception as exc:
        print(f"ERROR: Database connection test failed: {exc}")
        return False
    finally:
        await engine.dispose()


def main() -> int:
    """CLI entrypoint."""
    success = asyncio.run(test_db_connection())
    return 0 if success else 1


if __name__ == "__main__":
    raise SystemExit(main())
