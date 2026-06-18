"""Route for listing venues with their access points."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import VenueOut

router = APIRouter()


@router.get("/venues", response_model=list[VenueOut])
def list_venues(db: Session = Depends(get_db)):
    """Return all venues, name-ordered, each with its nested access points."""
    return db.query(models.Venue).order_by(models.Venue.name).all()
