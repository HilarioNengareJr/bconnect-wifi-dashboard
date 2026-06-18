from sqlalchemy.orm import Session

from app import models
from app.schemas import InsightFlag, InsightsOut


def build_insights(db: Session) -> InsightsOut:
    venues = db.query(models.Venue).all()
    access_points = db.query(models.AccessPoint).all()
    sessions = db.query(models.Session).all()

    online = sum(1 for ap in access_points if ap.status == "online")
    offline = sum(1 for ap in access_points if ap.status == "offline")
    active_sessions = [s for s in sessions if s.ended_at is None]
    total_bytes = sum((s.bytes_in or 0) + (s.bytes_out or 0) for s in sessions)

    venue_names = {venue.id: venue.name for venue in venues}
    active_by_venue: dict[int, int] = {}
    for session in active_sessions:
        active_by_venue[session.venue_id] = active_by_venue.get(session.venue_id, 0) + 1

    busiest_venue = (
        venue_names.get(max(active_by_venue, key=active_by_venue.get))
        if active_by_venue
        else None
    )

    flags: list[InsightFlag] = []
    for ap in access_points:
        if ap.status == "offline":
            flags.append(
                InsightFlag(
                    level="warning", message=f"Access point '{ap.name}' is offline"
                )
            )
    for venue in venues:
        if venue.id not in active_by_venue:
            flags.append(
                InsightFlag(
                    level="info", message=f"Venue '{venue.name}' has no active sessions"
                )
            )

    return InsightsOut(
        total_venues=len(venues),
        total_access_points=len(access_points),
        online_access_points=online,
        offline_access_points=offline,
        total_sessions=len(sessions),
        active_sessions=len(active_sessions),
        busiest_venue=busiest_venue,
        total_bytes=total_bytes,
        flags=flags,
    )
