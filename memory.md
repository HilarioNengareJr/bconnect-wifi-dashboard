# Memory — b connect Wi-Fi Dashboard: context setup + Feature 01 (Repo Skeleton)

Last updated: 2026-06-16

## What was built

**Context layer (via /import):** Imported the personal context-template dir from `~/Desktop/myCodingW:Flow/context/` into `./context/` and adapted all 9 files from the source "JobPilot" project to THIS project (FastAPI + React + PostgreSQL Wi-Fi dashboard): `project-overview.md`, `architecture.md`, `code-standards.md`, `build-plan.md`, `library-docs.md`, `progress-tracker.md`, `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`. `context/` is gitignored.

**README.md** (project root) — full submission-ready README documenting PostgreSQL-via-docker-compose setup, the four endpoints, schema, trade-offs, assumptions, "what I'd improve", and AI-tools note. It is forward-looking (describes planned layout).

**Feature 01 — Repo Skeleton (DONE, verified live):**
- `backend/requirements.txt` (fastapi, uvicorn[standard], sqlalchemy, pydantic, pydantic-settings, psycopg2-binary, python-dotenv)
- `backend/.env.example` (DATABASE_URL, FAIL_SYNC, CORS_ORIGINS)
- `backend/app/main.py` — FastAPI app + `GET /health` ONLY (intentionally minimal)
- `backend/app/__init__.py` + empty package homes: `app/routers/`, `app/services/`, `app/mock_controller/` (each with `__init__.py`)
- `frontend/` — Vite + React 18 + TS + Tailwind v4 scaffold: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` (@vitejs/plugin-react + @tailwindcss/vite), `index.html` (Figtree font link), `src/main.tsx`, `src/App.tsx` (blank dark shell), `src/styles/index.css` (@import tailwindcss + dark @theme tokens), `.env.example` (VITE_API_URL)
- `docker-compose.yml` — Postgres 15 `db` service only (user bconnect / pw bconnect / db bconnect, port 5432)
- `.gitignore` — Python/Node/env/OS ignores, keeps `context/`

## Decisions made

- **Stack:** FastAPI + SQLAlchemy 2.0 + Pydantic v2 + PostgreSQL 15 backend; React 18 + Vite + TS + Tailwind v4 frontend.
- **Database: PostgreSQL is primary** (user explicitly chose it), documented via docker-compose. SQLite remains a drop-in fallback via single `DATABASE_URL`.
- **UI theme: DARK + teal accent.** User-supplied palette (authoritative; supersedes the light/indigo b-connect.co.uk capture): bg `#0F1115`–`#151922`, card `#1A1F29`, primary text `#FFFFFF`, secondary `#A0A7B4`, accent/CTA `#18D3C5`, accent hover `#0FB8AA`, borders `#2A3140`. Font: Figtree. Tokens live in `frontend/src/styles/index.css` via `@theme` (Tailwind v4, no config file).
- **Core dedup contract:** every synced entity upserts by `provider_id` (unique at DB level). Upsert order fixed: venues → access_points → sessions.
- **Build approach:** backend-first, feature-by-feature, user confirms each feature before the next. 5 phases / 13 features in `context/build-plan.md`.
- **main.py kept minimal in Feature 01** — CORS/init_db/routers deferred to their own features (02 schema, 03 config, 04+ endpoints) to avoid importing non-existent modules.

## Problems solved

- **"command not found: python"** — on this Mac it's `python3` (Python 3.14.4); inside an activated venv plain `python`/`pip` work.
- **"curl: connection refused" on :8000** — not a bug. `uvicorn` is a foreground process that blocks its terminal; user curled from the same terminal / server wasn't up. Fix: run uvicorn in one terminal, curl in a second (or append `&`).
- Confirmed venv deps all installed fine including `psycopg2-binary` 2.9.12 (no Python 3.14 wheel issue materialized).

## Current state

- **Feature 01 fully verified LIVE:** booted `uvicorn app.main:app` → `/health` returns `{"status":"ok"}`, `/docs` returns 200. Test server was stopped; port 8000 free.
- Backend venv exists at `backend/.venv` with all requirements installed.
- Frontend scaffold written but **`npm install` / `vite` dev server NOT yet run** — JS toolchain boot is untested.
- No DB models, config, routers, services, or mock controller logic yet (those are features 02+).
- Not a git repo yet (no `git init` run).

## Next session starts with

**Feature 02 — Database Schema.** Create `backend/app/database.py` (engine, SessionLocal, get_db dependency, init_db with create_all, DeclarativeBase) and `backend/app/models.py` (Venue, AccessPoint, Session, SyncLog per `context/architecture.md` schema — `provider_id` unique on venues/access_points/sessions; FKs AccessPoint→Venue, Session→Venue+AccessPoint). Wire `init_db()` into `main.py` startup. Follow the /build skill gate (present sequence, get go-ahead) and update `context/progress-tracker.md`.

## Open questions

- Optionally run `npm install` + boot both dev servers to confirm the frontend shell renders (deferred for scope).
- `git init` + first commit not done — will be needed before the GitHub push deliverable.
- AI insights extension (Phase 5) still uses OpenAI `gpt-4o-mini` in `library-docs.md`; provider not finalized (optional/bonus only).
