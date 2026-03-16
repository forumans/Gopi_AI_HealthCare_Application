"""Unit tests for top navigation helpers in Gradio app."""

from __future__ import annotations

import unittest

from Gradio_UI_Files.ui.app import _default_admin_registration_role, _jump_to_tab


class UiNavigationTests(unittest.TestCase):
    def test_jump_to_tab_returns_selected_update(self) -> None:
        update_payload = _jump_to_tab("tab-doctor")

        self.assertEqual(update_payload.get("selected"), "tab-doctor")
        self.assertEqual(update_payload.get("__type__"), "update")

    def test_admin_registration_default_role_is_doctor(self) -> None:
        self.assertEqual(_default_admin_registration_role(), "DOCTOR")


if __name__ == "__main__":
    unittest.main()
