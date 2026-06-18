// SessionsTable — flat table of connected-user sessions with venue/AP context and data usage.
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { Session } from "../types";
import { formatBytes, formatDateTime } from "../utils/format";

type Props = {
  sessions: Session[];
  loading: boolean;
};

const TH = "px-3 py-2 text-left text-xs font-medium uppercase text-text-secondary";
const TD = "px-3 py-2 text-sm font-medium text-text-primary";

export function SessionsTable({ sessions, loading }: Props) {
  if (loading) {
    return <p className="py-4 text-xs font-normal text-text-secondary">Loading…</p>;
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No sessions yet"
        message="Run a sync to load connected-user sessions."
      />
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className={TH}>Venue</th>
          <th className={TH}>Access Point</th>
          <th className={TH}>Device</th>
          <th className={TH}>Started</th>
          <th className={TH}>Data</th>
          <th className={TH}>Status</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => {
          const active = session.ended_at === null;
          return (
            <tr
              key={session.provider_id}
              className="border-t border-border hover:bg-surface-secondary"
            >
              <td className={TD}>{session.venue?.name ?? "—"}</td>
              <td className={TD}>{session.access_point?.name ?? "—"}</td>
              <td className={TD}>
                <span>{session.device_type ?? "—"}</span>
                {session.client_mac ? (
                  <span className="block text-xs font-normal text-text-secondary">
                    {session.client_mac}
                  </span>
                ) : null}
              </td>
              <td className={`${TD} text-text-secondary`}>
                {formatDateTime(session.started_at)}
              </td>
              <td className={`${TD} text-text-secondary`}>
                {formatBytes(session.bytes_in)} in · {formatBytes(session.bytes_out)} out
              </td>
              <td className={TD}>
                <StatusBadge
                  label={active ? "Active" : "Ended"}
                  tone={active ? "accent" : "muted"}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
