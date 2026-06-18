# Assignment Digest — b connect Take-Home

> Working notes extracted from the assignment email + brief. This is my own
> reference for what's required, the deadline, and the plan. Not the project
> README (that comes later).

## Thread
**Mini Wi-Fi Controller Integration Dashboard** — full-stack take-home.
- **From:** Amritansh Jain (b connect); cc Thibault, Felix
- **To:** Me (Hilario)
- **Deadline:** **Wednesday, June 24, 2026**
- **Time budget:** 2–3 focused hours (not production-ready; judgement > polish)

## What I have to do
- [ ] Build a small full-stack app: **FastAPI backend + React frontend + PostgreSQL** (via an ORM; SQLite allowed if I justify the trade-off)
- [ ] **Mock a third-party Wi-Fi controller** (static JSON / mock endpoint / fake module / seed data) returning venues, access points, and sessions/connected users
- [ ] Implement core endpoints — `POST /sync`, `GET /venues`, `GET /sessions`, `GET /sync-status` — with error handling and **duplicate avoidance** on repeated syncs
- [ ] **React dashboard**: trigger sync, display venues/sessions, show loading + error states, show last sync time / records synced
- [ ] **Model the DB schema**: venues, access points, sessions, sync status/logs
- [ ] Write the **README** (approach + trade-offs)
- [ ] Push to **GitHub** and send Amritansh the link

## Deliverables (all in the submission)
- GitHub repository link
- Setup / execution instructions
- Summary of assumptions made
- "What I'd improve with more time" notes
- Note on whether/how I used AI tools

## Decisions / facts
- Advanced to the next interview stage (this take-home).
- A technical walkthrough session is scheduled **after** they review the submission.

## Optional (only if time allows)
- **AI extension** (after core works): rule-based/mocked/LLM insights — venue activity summary, anomaly flags, suggested action, customer segments, draft marketing message.
- Pagination/filtering on sessions, store raw provider payload, sync log/history table, simulated failed responses + retry logic, basic tests, Dockerise, architecture diagram.

## What they evaluate
Practical functionality · backend structure & API design · DB modelling · API
integration thinking · error & duplicate handling · React structure & clarity ·
README quality · simplicity & maintainability · ability to explain decisions.

## Open questions
- Where exactly to submit — reply to the email thread vs. a form? (Default: email the repo link back to Amritansh.)
- Postgres vs. SQLite for my time budget — my call; just document the trade-off.

## Build plan (~2.5 hrs)
0. Repo skeleton (`backend/` + `frontend/` + docker-compose + README)
1. Data model — Venue → AccessPoint → WifiSession + SyncLog (unique `provider_id` = anti-duplicate key)
2. Mock controller (JSON payload + failure-simulation flag)
3. Sync + endpoints (upsert by `provider_id`, log each run)
4. React dashboard (sync button, status card, venues/sessions tables, loading/error states)
5. AI insights (rule-based, optional)
6. README + assumptions + AI-tools note
