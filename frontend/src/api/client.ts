// API client — the only module that knows the backend base URL and endpoints.
import type { Insights, Venue, Session, SyncStatus, SyncResult } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const triggerSync = () =>
  fetch(`${BASE}/sync`, { method: "POST" }).then(json<SyncResult>);

export const getSyncStatus = () =>
  fetch(`${BASE}/sync-status`).then(json<SyncStatus>);

export const getVenues = () => fetch(`${BASE}/venues`).then(json<Venue[]>);

export const getSessions = () => fetch(`${BASE}/sessions`).then(json<Session[]>);

export const getInsights = () => fetch(`${BASE}/insights`).then(json<Insights>);
