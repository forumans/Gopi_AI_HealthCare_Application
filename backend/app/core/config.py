"""Application configuration.

Centralizes environment-driven settings for database/JWT so both middleware and
API dependencies read from one source of truth.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://healthcare_user:password@localhost/healthcare_saas")
    test_database_url: str = os.getenv("TEST_DATABASE_URL", "postgresql+asyncpg://test_user:password@localhost/test_healthcare_db")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_minutes: int = int(os.getenv("ACCESS_TOKEN_MINUTES", "30"))
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173")
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))


# Create a singleton instance
settings = Settings()
