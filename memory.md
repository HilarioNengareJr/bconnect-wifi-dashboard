# Memory — b connect Wi-Fi Dashboard: Foundation (through Feature 03)

Last updated: 2026-06-18

> Reconstructed from verified repo state (git log, progress-tracker, source files), not from a session transcript — the save was run in a fresh session with no recorded work. Treat the "What was built" deltas since 2026-06-16 as repo-derived facts, accurate but without the build-session narrative.

## What was built

**Context layer (via /import):** `./context/` holds the 9 adapted context-template files (`project-overview.md`, `architecture.md`, `code-standards.md`, `build-plan.md`, `library-docs.md`, `progress-tracker.md`, `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`). `context/` is gitignored. Build plan = 5 phases / 13 features.

**README.md** (project root) — submission-ready: PostgreSQL-via-docker-compose setup, four endpoints, schema, trade-offs, assumptions, "what I'd improve", AI-tools note. Forward-looking.

**Feature 01 — Repo Skeleton (DONE, verified live):**
- `backend/requirements.txt` (fastapi, uvicorn[standard], sqlalchemy, pydantic, pydantic-settings, psycopg2-binary, python-dotenv)
- `backend/.env.example` (DATABASE_URL, FAIL_SYNC, CORS_ORIGINS)
- `backend/app/main.py` — FastAPI app + `GET /health` ONLY (still intentionally minimal; CORS/init_db/routers deferred to their own features)
- `backend/app/__init__.py` + empty package homes: `app/routers/`, `app/services/`, `app/mock_controller/` (each with `__init__.py`)
- `frontend/` — Vite + React 18 + TS + Tailwind v4 scaffold (package.json, tsconfig*, vite.config.ts with @vitejs/plugin-react + @tailwindcss/vite, index.html w/ Figtree font, src/main.tsx, src/App.tsx blank dark shell, src/styles/index.css with @theme dark tokens, .env.example w/ VITE_API_URL)
- `docker-compose.yml` — Postgres 15 `db` service only (user bconnect / pw bconnect / db bconnect, port 5432)
- `.gitignore` — Python/Node/env/OS ignores, keeps `context/`

**Feature 03 — Config + Settings (DONE):** `backend/app/config.py` — pydantic-settings v2 `Settings` (env_file=".env", extra="ignore") exposing `database_url` (default `sqlite:///./app.db`), `fail_sync` (default False), `cors_origins` (default `["http://localhost:5173"]`). Module-level `settings = Settings()` singleton.

**Git:** repo initialized; single commit `6bdac09 "Initial boilerplate commit"`. Working tree clean.

## Decisions made

- **Stack:** FastAPI + SQLAlchemy 2.0 + Pydantic v2 + PostgreSQL 15 backend; React 18 + Vite + TS + Tailwind v4 frontend.
- **Database: PostgreSQL is primary** (user explicitly chose it), via docker-compose. SQLite is a drop-in fallback via single `DATABASE_URL` (and is the config default).
- **UI theme: DARK + teal accent.** User-supplied palette (authoritative): bg `#0F1115`–`#151922`, card `#1A1F29`, primary text `#FFFFFF`, secondary `#A0A7B4`, accent/CTA `#18D3C5`, accent hover `#0FB8AA`, borders `#2A3140`. Font: Figtree. Tokens in `frontend/src/styles/index.css` via Tailwind v4 `@theme` (no config file).
- **Core dedup contract:** every synced entity upserts by `provider_id` (unique at DB level). Upsert order fixed: venues → access_points → sessions.
- **Build approach:** backend-first, feature-by-feature, user confirms each feature before the next.
- **03 built before 02.** `database.py` (Feature 02) will import `settings.database_url`, and invariants forbid hardcoding `DATABASE_URL` — so Config was built first as the dependency.
- **`cors_origins` uses `Annotated[list[str], NoDecode]` + a before-validator** that comma-splits. `.env.example` ships `CORS_ORIGINS` as a comma-separated string; pydantic-settings v2 JSON-decodes `list[str]` env values by default, which would crash `Settings()`. NoDecode + the validator splits safely. (Divergence from the `library-docs.md` sample, which omits this.)

## Problems solved

- **"command not found: python"** — on this Mac it's `python3` (3.14.4); inside an activated venv plain `python`/`pip` work.
- **"curl: connection refused" on :8000** — not a bug. `uvicorn` blocks its terminal; run it in one terminal and curl from a second (or append `&`).
- Confirmed venv deps install fine including `psycopg2-binary` 2.9.12 (no Python 3.14 wheel issue).

## Current state

- **Features 01 + 03 DONE.** Feature 01 verified live earlier (`/health` → `{"status":"ok"}`, `/docs` → 200). Backend venv at `backend/.venv` with all requirements installed.
- **Feature 02 — Database Schema: NOT built.** No `database.py`, no `models.py`. This is the gap in Phase 1.
- `main.py` is still skeleton (health only) — init_db not yet wired.
- Frontend scaffold written but **`npm install` / vite dev server NOT yet run** — JS toolchain boot untested.
- No mock controller, sync service, or read endpoints yet (features 04+).
- Git initialized, one commit, clean tree.

## Next session starts with

**Feature 02 — Database Schema.** Create `backend/app/database.py` (engine from `settings.database_url`, SessionLocal, `get_db` dependency, `init_db()` with create_all, DeclarativeBase) and `backend/app/models.py` (Venue, AccessPoint, Session, SyncLog per `context/architecture.md` — `provider_id` unique on venues/access_points/sessions; FKs AccessPoint→Venue, Session→Venue+AccessPoint). Wire `init_db()` into `main.py` startup. Follow the /build skill gate (present sequence, get go-ahead) and update `context/progress-tracker.md` (mark 02 done).

## Open questions

- Optionally run `npm install` + boot both dev servers to confirm the frontend shell renders (deferred for scope).
- AI insights extension (Phase 5, Feature 12) still references OpenAI `gpt-4o-mini` in `library-docs.md`; provider not finalized (optional/bonus only).
