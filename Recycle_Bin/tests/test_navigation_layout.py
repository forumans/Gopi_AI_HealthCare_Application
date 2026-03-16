"""Unit tests for breadcrumb and menu navigation helpers."""

from __future__ import annotations

import unittest

from Gradio_UI_Files.ui.app import _select_menu_tab, _tab_breadcrumb
from Gradio_UI_Files.ui.components.breadcrumbs import format_breadcrumb


class NavigationLayoutTests(unittest.TestCase):
    def test_format_breadcrumb_joins_parts(self) -> None:
        self.assertEqual(format_breadcrumb(["Home", "Patients", "Login"]), "Home > Patients > Login")

    def test_select_menu_tab_maps_patient_schedule(self) -> None:
        update_payload, breadcrumb = _select_menu_tab("Schedule / Cancel Appointment")
        self.assertEqual(update_payload.get("selected"), "tab-patient-schedule")
        self.assertIn("Patients > Schedule / Cancel Appointment", breadcrumb)

    def test_tab_breadcrumb_for_home(self) -> None:
        self.assertIn("Home", _tab_breadcrumb("tab-home"))


if __name__ == "__main__":
    unittest.main()
