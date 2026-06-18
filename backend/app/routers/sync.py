"""Routes for triggering a sync and reading the latest sync status."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import SyncResultOut, SyncStatusOut
from app.services.sync_service import run_sync

router = APIRouter()


@router.post("/sync", response_model=SyncResultOut)
def trigger_sync(db: Session = Depends(get_db)):
    """Run a sync and return its result."""
    return run_sync(db)


@router.get("/sync-status", response_model=SyncStatusOut)
def get_sync_status(db: Session = Depends(get_db)):
    """Return the most recent sync run, or an empty state if none has run."""
    log = db.query(models.SyncLog).order_by(models.SyncLog.id.desc()).first()
    if log is None:
        return SyncStatusOut()
    return SyncStatusOut(
        status=log.status,
        last_synced_at=log.completed_at or log.started_at,
        records_synced=log.records_synced,
    )
