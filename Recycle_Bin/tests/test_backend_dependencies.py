"""Basic unit tests for backend dependency guards."""

from __future__ import annotations

import unittest

from fastapi import HTTPException

from server.app.core.dependencies import CurrentIdentity, require_roles


class BackendDependencyTests(unittest.TestCase):
    def test_require_roles_allows_authorized_role(self) -> None:
        checker = require_roles("ADMIN", "DOCTOR")
        identity = CurrentIdentity(tenant_id="t1", user_id="u1", role="doctor")

        validated = checker(identity)
        self.assertEqual(validated.role, "doctor")

    def test_require_roles_blocks_unauthorized_role(self) -> None:
        checker = require_roles("ADMIN")
        identity = CurrentIdentity(tenant_id="t1", user_id="u1", role="patient")

        with self.assertRaises(HTTPException) as exc:
            checker(identity)

        self.assertEqual(exc.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
