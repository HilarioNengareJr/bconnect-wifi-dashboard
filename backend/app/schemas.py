from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SyncResultOut(BaseModel):
    status: str
    records_synced: int
    synced_at: datetime | None = None
    error: str | None = None


class SyncStatusOut(BaseModel):
    status: str | None = None
    last_synced_at: datetime | None = None
    records_synced: int | None = None


class AccessPointOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    provider_id: str
    name: str
    status: str | None = None
    model: str | None = None
    mac_address: str | None = None


class VenueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    provider_id: str
    name: str
    address: str | None = None
    city: str | None = None
    access_points: list[AccessPointOut] = []
