# b connect — Wi-Fi Controller Integration Dashboard

A small full-stack app that integrates with a (mocked) third-party Wi-Fi controller and surfaces its data in a clean operations dashboard. The backend pulls venues, access points, and connected-user sessions from the controller on demand, stores them in PostgreSQL, and exposes them over a small REST API. The frontend lets an operator trigger a sync, watch its status, and browse what came back.

> Take-home assignment for b connect. Built with judgement and clear structure as the priority over polish.

---

## What it does

- **Sync on demand** — pull the latest venues, access points, and sessions from the Wi-Fi controller
- **Safe re-syncs** — repeated syncs upsert by the provider's own id, so they never create duplicate rows
- **Observable** — every sync run is logged; the dashboard always shows the last sync time, status, and records synced
- **Resilient** — a controller failure is caught, recorded as a failed sync, and shown as a clear error — it never crashes the app

---

## Stack

| Layer              | Tool                              |
| ------------------ | --------------------------------- |
| Backend            | FastAPI (Python 3.11+) + Uvicorn  |
| ORM                | SQLAlchemy 2.0                    |
| Validation         | Pydantic v2                       |
| Database           | PostgreSQL 15                     |
| Frontend           | React 18 + Vite + TypeScript      |
| Styling            | Tailwind CSS v4 (dark theme)      |
| Local orchestration| Docker Compose                   |

---

## Project structure

```
.
├── docker-compose.yml          # PostgreSQL (+ optionally backend/frontend)
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py             # FastAPI app, CORS, router registration
│       ├── config.py           # Settings (DATABASE_URL, FAIL_SYNC, CORS_ORIGINS)
│       ├── database.py         # engine, session, get_db, init_db
│       ├── models.py           # Venue, AccessPoint, Session, SyncLog
│       ├── schemas.py          # Pydantic request/response models
│       ├── routers/            # sync.py, venues.py, sessions.py
│       ├── services/           # sync_service.py (pull → upsert → log)
│       └── mock_controller/    # provider.py + data.json (the fake controller)
└── frontend/
    └── src/
        ├── api/client.ts       # the only place that knows endpoint URLs
        ├── components/         # SyncStatusCard, VenuesTable, SessionsTable, ...
        ├── hooks/useSync.ts
        └── types.ts
```

---

## Getting started

### Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Start PostgreSQL

```bash
docker-compose up -d db
```

This brings up PostgreSQL on `localhost:5432` with a `bconnect` database (see `docker-compose.yml` for credentials).

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # then adjust if needed
uvicorn app.main:app --reload --port 8000
```

Tables are created automatically on startup. The API is now at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173` and talks to the backend at `VITE_API_URL` (defaults to `http://localhost:8000`).

### Environment variables

| Variable       | Where        | Default                                                       | Purpose                                   |
| -------------- | ------------ | ------------------------------------------------------------- | ----------------------------------------- |
| `DATABASE_URL` | backend      | `postgresql+psycopg2://bconnect:bconnect@localhost:5432/bconnect` | Database connection                  |
| `FAIL_SYNC`    | backend      | `false`                                                       | Set `true` to simulate a controller outage |
| `CORS_ORIGINS` | backend      | `http://localhost:5173`                                       | Allowed frontend origin(s)                |
| `VITE_API_URL` | frontend     | `http://localhost:8000`                                       | Backend base URL                          |

---

## API

| Method | Endpoint        | Description                                                       |
| ------ | --------------- | ---------------------------------------------------------------- |
| POST   | `/sync`         | Pull from the controller, upsert by `provider_id`, log the run   |
| GET    | `/venues`       | List venues with their access points                             |
| GET    | `/sessions`     | List sessions (connected users)                                  |
| GET    | `/sync-status`  | Most recent sync: status, last sync time, records synced         |

### Data model

`Venue` 1→N `AccessPoint`, `Venue`/`AccessPoint` 1→N `Session`, plus a `SyncLog` per run. Every synced entity carries a unique `provider_id` — the controller's own identifier and the key that makes re-syncs idempotent.

---

## Design decisions & trade-offs

- **PostgreSQL over SQLite.** Postgres is the target store and better demonstrates the relational modelling the assignment asks about. The models go through SQLAlchemy and a single `DATABASE_URL`, so SQLite remains a drop-in fallback if needed.
- **Upsert by `provider_id`, enforced at the schema level.** `provider_id` is `unique` on every synced table, so duplicate avoidance is a database guarantee, not just application logic. Sync upserts in a fixed order (venues → access points → sessions) to satisfy foreign keys.
- **Mock controller as a swappable module.** The fake provider lives behind a single `fetch_snapshot()` function returning a JSON snapshot, with a `FAIL_SYNC` flag to exercise the error path. Swapping in a real controller client is a one-file change.
- **Every sync writes a log row, even on failure.** This powers the status card and means failures are observable rather than silent.
- **`create_all` instead of migrations.** Acceptable for a take-home; Alembic would be the production choice.
- **Thin routers, logic in services.** Endpoints validate and delegate; all sync/upsert/logging logic lives in `services/`.

---

## Assumptions

- The Wi-Fi controller exposes venues, access points, and sessions, each with a stable unique id (`provider_id`).
- Sync is operator-triggered, not scheduled — there is no background polling.
- A single operator uses the dashboard; no authentication or multi-tenancy is in scope.
- The controller returns a full snapshot per sync (not a delta), so each sync reconciles the full set.
- Session records may be open (`ended_at` null) for currently-connected users.

---

## What I'd improve with more time

- Alembic migrations instead of `create_all`
- Store the raw provider payload alongside normalised rows for auditing
- Pagination and filtering on the sessions endpoint
- A sync history view (not just the latest run) in the UI
- Configurable retry/backoff on transient controller failures
- A proper test suite (pytest + httpx) covering the sync/dedup contract
- Authentication and per-operator scoping
- The optional AI insights panel (venue activity summary, anomaly flags)

---

## Use of AI tools

Built with the assistance of AI coding tools (Claude Code) for scaffolding, boilerplate, and documentation. All architectural decisions, the data model, and the integration approach were directed and reviewed by me.

---

## Status

🚧 In development — see [`context/progress-tracker.md`](context/progress-tracker.md) for the current build state and [`context/build-plan.md`](context/build-plan.md) for the phased plan. (The `context/` directory is personal working notes and is gitignored.)
