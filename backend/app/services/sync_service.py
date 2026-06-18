"""Sync service: pull the controller snapshot, upsert by provider_id, log the run."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app import models
from app.mock_controller.provider import fetch_snapshot
from app.schemas import SyncResultOut


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_dt(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value)


def _provider_id_map(db: Session, model: type) -> dict[str, int]:
    return {pid: row_id for pid, row_id in db.query(model.provider_id, model.id).all()}


def _upsert(db: Session, model: type, mapped_rows: list[dict]) -> int:
    # Upsert by provider_id is the dedup contract — repeated syncs must update,
    # never duplicate. Order of callers is fixed: venues -> access_points -> sessions.
    count = 0
    for fields in mapped_rows:
        existing = (
            db.query(model)
            .filter_by(provider_id=fields["provider_id"])
            .one_or_none()
        )
        if existing:
            for key, value in fields.items():
                setattr(existing, key, value)
        else:
            db.add(model(**fields))
        count += 1
    return count


def _venue_fields(row: dict) -> dict:
    return {
        "provider_id": row["provider_id"],
        "name": row["name"],
        "address": row.get("address"),
        "city": row.get("city"),
        "timezone": row.get("timezone"),
    }


def _access_point_fields(row: dict, venue_ids: dict[str, int]) -> dict:
    return {
        "provider_id": row["provider_id"],
        "venue_id": venue_ids[row["venue_provider_id"]],
        "name": row["name"],
        "mac_address": row.get("mac_address"),
        "model": row.get("model"),
        "status": row.get("status"),
    }


def _session_fields(
    row: dict, venue_ids: dict[str, int], ap_ids: dict[str, int]
) -> dict:
    return {
        "provider_id": row["provider_id"],
        "venue_id": venue_ids[row["venue_provider_id"]],
        "access_point_id": ap_ids[row["ap_provider_id"]],
        "client_mac": row.get("client_mac"),
        "username": row.get("username"),
        "device_type": row.get("device_type"),
        "started_at": _parse_dt(row.get("started_at")),
        "ended_at": _parse_dt(row.get("ended_at")),
        "bytes_in": row.get("bytes_in", 0),
        "bytes_out": row.get("bytes_out", 0),
    }


def run_sync(db: Session) -> SyncResultOut:
    """Sync the full snapshot in one transaction, writing one sync_logs row either way."""
    log = models.SyncLog(status="running")
    db.add(log)
    db.flush()
    try:
        snapshot = fetch_snapshot()

        venues_synced = _upsert(
            db, models.Venue, [_venue_fields(r) for r in snapshot["venues"]]
        )
        db.flush()
        venue_ids = _provider_id_map(db, models.Venue)

        aps_synced = _upsert(
            db,
            models.AccessPoint,
            [_access_point_fields(r, venue_ids) for r in snapshot["access_points"]],
        )
        db.flush()
        ap_ids = _provider_id_map(db, models.AccessPoint)

        sessions_synced = _upsert(
            db,
            models.Session,
            [_session_fields(r, venue_ids, ap_ids) for r in snapshot["sessions"]],
        )

        total = venues_synced + aps_synced + sessions_synced
        log.status = "completed"
        log.venues_synced = venues_synced
        log.aps_synced = aps_synced
        log.sessions_synced = sessions_synced
        log.records_synced = total
        log.completed_at = _now()
        db.commit()

        return SyncResultOut(
            status="completed", records_synced=total, synced_at=log.completed_at
        )
    except Exception as exc:
        # Roll back any partial upserts and the running log row, then record a
        # single failed sync_logs row — the API must never crash on a bad sync.
        db.rollback()
        failed_at = _now()
        db.add(
            models.SyncLog(
                status="failed", error_message=str(exc), completed_at=failed_at
            )
        )
        db.commit()
        return SyncResultOut(
            status="failed", records_synced=0, synced_at=failed_at, error=str(exc)
        )
