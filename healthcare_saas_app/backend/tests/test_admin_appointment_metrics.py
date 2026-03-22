import unittest
from datetime import datetime
from types import SimpleNamespace

from backend.app.api.routes.admin import _appointment_window_starts, admin_appointment_metrics


class _FakeMappingResult:
    def __init__(self, data: dict):
        self._data = data

    def one(self):
        return self._data


class _FakeExecuteResult:
    def __init__(self, data: dict):
        self._data = data

    def mappings(self):
        return _FakeMappingResult(self._data)


class _FakeDbSession:
    def __init__(self, data: dict):
        self._data = data

    async def execute(self, _stmt):
        return _FakeExecuteResult(self._data)


class AdminAppointmentMetricsTests(unittest.IsolatedAsyncioTestCase):
    def test_appointment_window_starts_are_normalized(self):
        now = datetime(2026, 3, 22, 18, 45, 30)
        windows = _appointment_window_starts(now)

        self.assertEqual(windows["today"], datetime(2026, 3, 22, 0, 0, 0))
        self.assertEqual(windows["week"], datetime(2026, 3, 16, 0, 0, 0))
        self.assertEqual(windows["month"], datetime(2026, 3, 1, 0, 0, 0))
        self.assertEqual(windows["year"], datetime(2026, 1, 1, 0, 0, 0))

    async def test_admin_appointment_metrics_response_shape(self):
        identity = SimpleNamespace(tenant_id="tenant-1")
        db = _FakeDbSession(
            {
                "total_appointments_to_date": 120,
                "total_appointments_year_to_date": 55,
                "total_appointments_this_month": 20,
                "total_appointments_this_week": 6,
                "total_appointments_today": 2,
            }
        )

        payload = await admin_appointment_metrics(identity=identity, db=db)

        self.assertEqual(
            payload,
            {
                "total_appointments_to_date": 120,
                "total_appointments_year_to_date": 55,
                "total_appointments_this_month": 20,
                "total_appointments_this_week": 6,
                "total_appointments_today": 2,
            },
        )


if __name__ == "__main__":
    unittest.main()
