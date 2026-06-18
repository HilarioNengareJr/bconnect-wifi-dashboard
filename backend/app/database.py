"""Database engine, session factory, and the FastAPI session dependency."""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# SQLite needs check_same_thread disabled for FastAPI's threaded request handling;
# the flag is harmless and ignored for Postgres.
_connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(settings.database_url, future=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    """Yield a database session per request and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables on startup (Alembic would replace this in production)."""
    # Acceptable for a take-home; production would use Alembic migrations.
    from app import models  # noqa: F401  ensure models are registered on Base

    Base.metadata.create_all(bind=engine)
