"""FastAPI app entrypoint: lifespan startup, CORS, and router registration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import insights, sessions, sync, venues


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="b connect Wi-Fi Dashboard", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sync.router)
app.include_router(venues.router)
app.include_router(sessions.router)
app.include_router(insights.router)


@app.get("/health")
def health():
    return {"status": "ok"}
