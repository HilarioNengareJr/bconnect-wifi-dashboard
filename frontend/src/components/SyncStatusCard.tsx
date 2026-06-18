import { StatusBadge } from "./StatusBadge";
import type { SyncResult, SyncStatus } from "../types";
import { formatRelativeTime } from "../utils/format";

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
