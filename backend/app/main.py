from fastapi import FastAPI

app = FastAPI(title="b connect Wi-Fi Dashboard")

# Skeleton only. CORS, init_db(), and routers are wired in their own features
# (config 03, schema 02, endpoints onward) — not here.


@app.get("/health")
def health():
    return {"status": "ok"}
