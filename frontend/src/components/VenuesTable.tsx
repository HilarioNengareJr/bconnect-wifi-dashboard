import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { Venue } from "../types";

type Props = {
  venues: Venue[];
  loading: boolean;
};

type Tone = "success" | "error" | "muted";

function apTone(status: string | null): Tone {
  if (status === "online") return "success";
  if (status === "offline") return "error";
  return "muted";
}

function apLabel(status: string | null): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const TH = "px-3 py-2 text-left text-xs font-medium uppercase text-text-secondary";
const TD = "px-3 py-2 text-sm font-medium text-text-primary";

export function VenuesTable({ venues, loading }: Props) {
  if (loading) {
    return <p className="py-4 text-xs font-normal text-text-secondary">Loading…</p>;
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        title="No venues yet"
        message="Run a sync to load venues and their access points."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {venues.map((venue) => (
        <div key={venue.provider_id} className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium leading-5 text-text-primary">
              {venue.name}
            </span>
            {venue.city ? (
              <span className="text-xs font-normal leading-4 text-text-secondary">
                {venue.city}
              </span>
            ) : null}
          </div>

          {venue.access_points.length === 0 ? (
            <p className="text-xs font-normal text-text-secondary">
              No access points.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Access Point</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Model</th>
                  <th className={TH}>MAC</th>
                </tr>
              </thead>
              <tbody>
                {venue.access_points.map((ap) => (
                  <tr
                    key={ap.provider_id}
                    className="border-t border-border hover:bg-surface-secondary"
                  >
                    <td className={TD}>{ap.name}</td>
                    <td className={TD}>
                      <StatusBadge label={apLabel(ap.status)} tone={apTone(ap.status)} />
                    </td>
                    <td className={`${TD} text-text-secondary`}>{ap.model ?? "—"}</td>
                    <td className={`${TD} text-text-secondary`}>
                      {ap.mac_address ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
