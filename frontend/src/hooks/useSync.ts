import { useCallback, useEffect, useState } from "react";

import {
  getSessions,
  getSyncStatus,
  getVenues,
  triggerSync,
} from "../api/client";
import type { Session, SyncResult, SyncStatus, Venue } from "../types";

const LOAD_ERROR = "Could not load dashboard data. Is the backend running?";
const SYNC_ERROR = "Sync failed. Please try again.";

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const refresh = useCallback(async () => {
    const [status, venueList, sessionList] = await Promise.all([
      getSyncStatus(),
      getVenues(),
      getSessions(),
    ]);
    setSyncStatus(status);
    setVenues(venueList);
    setSessions(sessionList);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refresh();
      } catch {
        if (active) setError(LOAD_ERROR);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const runSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await triggerSync();
      setLastSyncResult(result);
      // The backend reports a handled controller failure as status "failed"
      // with HTTP 200, so surface that as an error without throwing.
      if (result.status === "failed") {
        setError(result.error ?? SYNC_ERROR);
      }
      await refresh();
    } catch {
      setError(SYNC_ERROR);
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  return {
    syncStatus,
    venues,
    sessions,
    loading,
    syncing,
    error,
    lastSyncResult,
    runSync,
  };
}
