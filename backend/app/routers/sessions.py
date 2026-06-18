"""Route for listing connected-user sessions."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import SessionOut

router = APIRouter()


@router.get("/sessions", response_model=list[SessionOut])
def list_sessions(db: Session = Depends(get_db)):
    """Return all sessions, most recent first, with venue and access-point context."""
    return db.query(models.Session).order_by(models.Session.started_at.desc()).all()
