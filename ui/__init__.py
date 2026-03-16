"""Compatibility package for archived Gradio modules.

This keeps legacy imports like `from ui.app import ...` working after the
Gradio source was moved into `Gradio_UI_Files/ui`.
"""

from __future__ import annotations

from pathlib import Path

_archived_ui_path = Path(__file__).resolve().parents[1] / "Gradio_UI_Files" / "ui"
if _archived_ui_path.exists():
    __path__.append(str(_archived_ui_path))
