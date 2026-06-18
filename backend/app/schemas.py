"""Pydantic request/response schemas for the API."""

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


class VenueRefOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    provider_id: str
    name: str
    city: str | None = None


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    provider_id: str
    venue: VenueRefOut | None = None
    access_point: AccessPointOut | None = None
    client_mac: str | None = None
    username: str | None = None
    device_type: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    bytes_in: int
    bytes_out: int


class InsightFlag(BaseModel):
    level: str
    message: str


class InsightsOut(BaseModel):
    total_venues: int
    total_access_points: int
    online_access_points: int
    offline_access_points: int
    total_sessions: int
    active_sessions: int
    busiest_venue: str | None = None
    total_bytes: int
    flags: list[InsightFlag] = []
