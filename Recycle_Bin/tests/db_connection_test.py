"""Small connectivity script for healthcare_sas database.

Runs: SELECT * FROM users
"""

from __future__ import annotations

import asyncio
import os
from typing import Any

async def main() -> None:
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
    except ModuleNotFoundError as exc:
        missing = exc.name or "required package"
        print(f"Missing dependency: {missing}")
        print("Install required packages in your active environment: pip install sqlalchemy asyncpg")
        raise SystemExit(1) from exc

    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://healthcare_user:password@localhost:5432/healthcare_saas",
    )
    engine = create_async_engine(database_url, future=True, pool_pre_ping=True)

    try:
        async with engine.connect() as connection:
            result = await connection.execute(text("SELECT * FROM doctors"))
            rows = result.mappings().all()

            print(f"Connected successfully to: {database_url}")
            print(f"Total rows from doctors: {len(rows)}")
            for index, row in enumerate(rows, start=1):
                payload: dict[str, Any] = dict(row)
                print(f"{index}. {payload}")
    except Exception as exc:
        print(f"Database connection/query failed: {exc}")
        raise SystemExit(1) from exc
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
