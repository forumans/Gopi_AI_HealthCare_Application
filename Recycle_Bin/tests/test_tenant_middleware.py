"""Unit tests for tenant middleware helpers."""

from __future__ import annotations

import unittest

from server.app.middleware.tenant_middleware import extract_bearer_token


class TenantMiddlewareHelperTests(unittest.TestCase):
    def test_extract_bearer_token_valid(self) -> None:
        self.assertEqual(extract_bearer_token("Bearer abc.def.ghi"), "abc.def.ghi")

    def test_extract_bearer_token_rejects_invalid_format(self) -> None:
        self.assertIsNone(extract_bearer_token("Token abc"))
        self.assertIsNone(extract_bearer_token("Bearer"))
        self.assertIsNone(extract_bearer_token(None))


if __name__ == "__main__":
    unittest.main()
