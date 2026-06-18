import { StatusBadge } from "./StatusBadge";
import type { SyncResult, SyncStatus } from "../types";

type Props = {
  syncStatus: SyncStatus | null;
  syncing: boolean;
  error: string | null;
  lastSyncResult: SyncResult | null;
  onSync: () => void;
};

type Tone = "success" | "info" | "error" | "muted";

const STATUS_TONE: Record<string, Tone> = {
  completed: "success",
  running: "info",
  failed: "error",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  running: "Running",
  failed: "Failed",
};

function parseUtc(iso: string): number {
  // Backend timestamps are naive UTC (no zone suffix); append Z so the browser
  // parses them as UTC rather than local time.
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  return Date.parse(hasZone ? iso : `${iso}Z`);
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = parseUtc(iso);
  if (Number.isNaN(then)) return "—";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function SyncStatusCard({
  syncStatus,
  syncing,
  error,
  lastSyncResult,
  onSync,
}: Props) {
  const status = syncStatus?.status ?? null;
  const tone = status ? STATUS_TONE[status] ?? "muted" : "muted";
  const label = status ? STATUS_LABEL[status] ?? status : "Never run";
  const recordsSynced = syncStatus?.records_synced ?? null;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold leading-6 text-text-primary">
            Sync Status
          </h2>
          <p className="text-xs font-normal leading-4 text-text-secondary">
            Last sync {formatRelativeTime(syncStatus?.last_synced_at ?? null)}
          </p>
        </div>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <StatusBadge label={label} tone={tone} />
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold leading-9 text-text-primary">
            {recordsSynced ?? "—"}
          </span>
          <span className="text-xs font-normal leading-4 text-text-secondary">
            records synced
          </span>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-xs font-medium leading-4 text-error-foreground">
          {error}
        </p>
      ) : lastSyncResult?.status === "completed" ? (
        <p className="mt-4 text-xs font-medium leading-4 text-success-foreground">
          Synced {lastSyncResult.records_synced} records.
        </p>
      ) : null}
    </section>
  );
}
