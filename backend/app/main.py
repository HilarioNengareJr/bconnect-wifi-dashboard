from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="b connect Wi-Fi Dashboard", lifespan=lifespan)

# CORS and routers are wired in their own features (endpoints onward) — not here.


@app.get("/health")
def health():
    return {"status": "ok"}
