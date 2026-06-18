from datetime import datetime

from pydantic import BaseModel


class SyncResultOut(BaseModel):
    status: str
    records_synced: int
    synced_at: datetime | None = None
    error: str | None = None
