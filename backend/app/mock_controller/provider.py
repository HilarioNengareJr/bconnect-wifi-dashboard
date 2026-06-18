import json
from pathlib import Path

from app.config import settings

DATA = Path(__file__).parent / "data.json"


class ControllerError(Exception):
    """Raised when the (mocked) Wi-Fi controller is unreachable."""


def fetch_snapshot() -> dict:
    # FAIL_SYNC simulates a provider outage so the sync failure path is exercisable.
    if settings.fail_sync:
        raise ControllerError("Wi-Fi controller unreachable (simulated)")
    return json.loads(DATA.read_text())
