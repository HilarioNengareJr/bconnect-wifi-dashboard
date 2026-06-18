# Features

A walkthrough of every feature in the b connect Wi-Fi Dashboard, in build order. The app was built in vertical slices: model the data, stand up the mock provider, make sync work through the API, build the dashboard, then layer on insights.

All features are complete and verified on both SQLite and PostgreSQL.

---

## Phase 1 — Foundation

### 01 — Repo Skeleton

The project shell: a FastAPI backend package (`backend/app/`), a Vite + React + TypeScript + Tailwind v4 frontend (`frontend/`), an optional `docker-compose.yml` for PostgreSQL, and a health-check endpoint. Establishes the structure every later feature slots into.

- **Key files:** `backend/app/main.py` (health route), `frontend/` scaffold, `docker-compose.yml`

### 02 — Database Schema

The four SQLAlchemy 2.0 models — `Venue`, `AccessPoint`, `Session`, `SyncLog` — with their relationships (`Venue` 1→N `AccessPoint`, `Venue`/`AccessPoint` 1→N `Session`) and a unique, indexed `provider_id` on every synced table (the dedup key). Tables are created on startup via `init_db()`.

- **Key files:** `backend/app/database.py` (engine, session, `get_db`, `init_db`), `backend/app/models.py`
- **Decisions:** startup wired through a `lifespan` handler (not the deprecated `@app.on_event`); timestamps use `datetime.now(timezone.utc)`; the `Session` model name collides with SQLAlchemy's `Session`, so models are always referenced as `models.X`.

### 03 — Config + Settings

A single Pydantic `Settings` object — `database_url`, `fail_sync`, `cors_origins` — loaded once and imported everywhere. No scattered `os.environ` reads.

- **Key files:** `backend/app/config.py`, `backend/.env.example`
- **Decisions:** `CORS_ORIGINS` ships as a comma-separated string, so `NoDecode` + a validator splits it (avoids pydantic-settings JSON-decoding it and crashing); `DATABASE_URL` defaults to SQLite so a fresh clone runs with zero setup.

---

## Phase 2 — Mock Controller + Sync

### 04 — Mock Wi-Fi Controller

The fake third-party provider. `fetch_snapshot()` returns a parsed JSON snapshot (3 venues, 6 access points, 10 sessions — including one offline AP and several live sessions). A `FAIL_SYNC` flag makes it raise `ControllerError` to exercise the failure path.

- **Key files:** `backend/app/mock_controller/provider.py`, `backend/app/mock_controller/data.json`
- **Decisions:** the controller knows nothing about our DB — it only returns data; entities reference each other by `provider_id`.

### 05 — Sync Service + POST /sync

The heart of the integration. `run_sync(db)` opens a `running` sync-log row, pulls the snapshot, upserts venues → access points → sessions keyed on `provider_id` (mapping provider refs to local FK ids), records per-entity counts, and commits once. On any failure it rolls back and writes a single `failed` log row.

- **Key files:** `backend/app/services/sync_service.py`, `backend/app/routers/sync.py`, `backend/app/schemas.py`
- **Decisions:** upsert order is fixed (venues → access points → sessions) for FK integrity; `POST /sync` returns HTTP 200 with a `status` field even on a handled controller failure (never a crash); exactly one sync-log row per run; CORS wired here (first endpoint).

### 06 — GET /sync-status

Exposes the most recent sync run — status, last sync time, records synced — or a never-run empty state. A direct router read (no service).

- **Key files:** `backend/app/routers/sync.py`

---

## Phase 3 — Read Endpoints

### 07 — GET /venues

Lists all venues ordered by name, each with its access points nested (name, status, model, MAC) via the ORM relationship.

- **Key files:** `backend/app/routers/venues.py`, `backend/app/schemas.py` (`VenueOut`, `AccessPointOut`)

### 08 — GET /sessions

Lists sessions (connected users), most-recent first, each with slim venue + access-point context, client device, start time, and data usage.

- **Key files:** `backend/app/routers/sessions.py`, `backend/app/schemas.py` (`SessionOut`, `VenueRefOut`)
- **Decisions:** nests a slim `VenueRefOut` (not the full `VenueOut`) to avoid dragging every venue's AP list into each session row.

---

## Phase 4 — React Dashboard

### 09 — API Client + Types

The frontend's typed contract with the backend. `types.ts` mirrors the real Pydantic schemas; `api/client.ts` is the only place that knows endpoint URLs and the base URL (`VITE_API_URL`), with an `ok`-checking JSON helper so hooks can show error states.

- **Key files:** `frontend/src/types.ts`, `frontend/src/api/client.ts`, `frontend/src/vite-env.d.ts`
- **Decisions:** also repaired a pre-existing scaffold defect — the frontend `tsc -b` build was broken (composite project layout); fixed to the canonical Vite 3-file tsconfig split.

### 10 — Dashboard UI + Sync Status Card

The dashboard shell and sync control. A single `useSync` hook owns the whole data lifecycle (status, venues, sessions, insights, loading/error, and the `runSync` action); `App` calls it once and passes data down. `SyncStatusCard` shows the run status pill, records synced, relative last-sync time, and the **Sync Now** button with loading/error states.

- **Key files:** `frontend/src/hooks/useSync.ts`, `frontend/src/components/SyncStatusCard.tsx`, `frontend/src/components/StatusBadge.tsx`, `frontend/src/App.tsx`
- **Decisions:** components are presentational (data via props/hook, never inline `fetch`); backend timestamps are parsed as UTC client-side so relative time isn't skewed.

### 11 — Venues + Sessions Tables

The data views. `VenuesTable` renders each venue as a block with an access-point sub-table (status badges; offline → red). `SessionsTable` is a flat table — venue, AP, device, start time, data usage, and an active/ended status badge. Both have empty states before the first sync.

- **Key files:** `frontend/src/components/VenuesTable.tsx`, `frontend/src/components/SessionsTable.tsx`, `frontend/src/components/EmptyState.tsx`, `frontend/src/utils/format.ts`
- **Decisions:** shared formatters (`formatBytes`, `formatDateTime`, `parseUtc`) extracted to `utils/format.ts`.

---

## Phase 5 — Extensions

### 12 — Rule-Based Insights

A `GET /insights` endpoint and dashboard panel that summarise the synced data — venue/AP/session counts, online ratio, total data throughput, busiest venue (by active sessions), and anomaly flags (e.g. an offline access point). Pure rule-based aggregation; no external AI API or key required.

- **Key files:** `backend/app/services/insights.py`, `backend/app/routers/insights.py`, `frontend/src/components/InsightsPanel.tsx`
- **Decisions:** insights live in a service (aggregation/anomaly logic, not a plain read); an LLM-backed natural-language summary would layer over this, gated behind a key, with the rule-based output as the fallback.

### 13 — README + Submission Notes

Setup/run instructions (SQLite quick-start + PostgreSQL target), the environment-variable reference, design decisions, assumptions, and trade-offs — written so a fresh clone runs from the README alone.

- **Key files:** `README.md`

---

## The integration contract

Two invariants hold across every feature and are the point of the whole app:

1. **Idempotent sync** — repeated syncs upsert by `provider_id` and never create duplicate rows. Enforced at the schema level (`unique`), verified directly in the database on both SQLite and Postgres.
2. **Observable, resilient sync** — every run writes exactly one sync-log row; a controller failure is caught, logged as `failed`, and returned as a clean error without crashing the API or corrupting existing data.
