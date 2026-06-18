"""Route for the rule-based insights summary."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import InsightsOut
from app.services.insights import build_insights

router = APIRouter()


@router.get("/insights", response_model=InsightsOut)
def get_insights(db: Session = Depends(get_db)):
    """Return the computed insights for the currently synced data."""
    return build_insights(db)
