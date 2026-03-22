import unittest
from unittest.mock import patch

from fastapi.responses import JSONResponse

from backend.app.api import health


class _FakeResult:
    def scalar(self):
        return 1


class _FakeConnection:
    async def execute(self, _query):
        return _FakeResult()


class _FakeBeginContext:
    async def __aenter__(self):
        return _FakeConnection()

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _FakeEngine:
    def begin(self):
        return _FakeBeginContext()


class _FailingBeginContext:
    async def __aenter__(self):
        raise RuntimeError("db down")

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _FailingEngine:
    def begin(self):
        return _FailingBeginContext()


class HealthEndpointTests(unittest.IsolatedAsyncioTestCase):
    async def test_health_returns_200_for_healthy_dependencies(self):
        with patch("backend.app.api.health.get_engine", return_value=_FakeEngine()):
            payload = await health.health_check()

        self.assertEqual(payload["status"], "healthy")
        self.assertEqual(payload["database"], "connected")

    async def test_health_returns_503_when_database_is_unavailable(self):
        with patch("backend.app.api.health.get_engine", return_value=_FailingEngine()):
            response = await health.health_check()

        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 503)

    async def test_readiness_returns_503_when_any_dependency_fails(self):
        with patch("backend.app.api.health.get_engine", return_value=_FailingEngine()):
            response = await health.readiness_check()

        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 503)

    async def test_liveness_uses_runtime_timestamp(self):
        payload = await health.liveness_check()

        self.assertEqual(payload["status"], "alive")
        self.assertIn("T", payload["timestamp"])


if __name__ == "__main__":
    unittest.main()
