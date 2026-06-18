from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SyncResultOut
from app.services.sync_service import run_sync

router = APIRouter()


@router.post("/sync", response_model=SyncResultOut)
def trigger_sync(db: Session = Depends(get_db)):
    return run_sync(db)
