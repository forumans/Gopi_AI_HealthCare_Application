import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from backend.app.api.routes.auth import LoginRequest, login


class _FakeExecuteResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class _FakeDbSession:
    def __init__(self, user):
        self._user = user

    async def execute(self, _stmt):
        return _FakeExecuteResult(self._user)


class AuthLoginTests(unittest.IsolatedAsyncioTestCase):
    async def test_login_raises_401_when_user_missing(self):
        request = LoginRequest(email="missing@example.com", password="secret", remember_me=False)
        db = _FakeDbSession(user=None)

        with self.assertRaises(HTTPException) as ctx:
            await login(request=request, db=db)

        self.assertEqual(ctx.exception.status_code, 401)

    async def test_login_returns_token_payload_for_valid_credentials(self):
        request = LoginRequest(email="admin@example.com", password="Admin123!", remember_me=False)
        user = SimpleNamespace(
            id="user-1",
            tenant_id="tenant-1",
            role="ADMIN",
            password_hash="hashed-password",
        )
        db = _FakeDbSession(user=user)

        with patch("backend.app.api.routes.auth.verify_password", return_value=True), patch(
            "backend.app.api.routes.auth.create_access_token", return_value="token-123"
        ):
            payload = await login(request=request, db=db)

        self.assertEqual(payload["access_token"], "token-123")
        self.assertEqual(payload["role"], "ADMIN")
        self.assertEqual(payload["tenant_id"], "tenant-1")
        self.assertIsNone(payload["user_name"])


if __name__ == "__main__":
    unittest.main()
