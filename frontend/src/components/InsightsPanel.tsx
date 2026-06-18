// InsightsPanel — summary stats and anomaly flags from the rule-based insights endpoint.
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { Insights } from "../types";
import { formatBytes } from "../utils/format";

type Props = {
  insights: Insights | null;
  loading: boolean;
};

type Tone = "warning" | "info";

function flagTone(level: string): Tone {
  return level === "warning" ? "warning" : "info";
}

export function InsightsPanel({ insights, loading }: Props) {
  if (loading) {
    return <p className="py-4 text-xs font-normal text-text-secondary">Loading…</p>;
  }

  if (!insights || insights.total_access_points === 0) {
    return (
      <EmptyState
        title="No insights yet"
        message="Run a sync to generate venue and network insights."
      />
    );
  }

  const stats = [
    { label: "Venues", value: String(insights.total_venues) },
    {
      label: "Access points online",
      value: `${insights.online_access_points}/${insights.total_access_points}`,
    },
    {
      label: "Active sessions",
      value: `${insights.active_sessions}/${insights.total_sessions}`,
    },
    { label: "Data throughput", value: formatBytes(insights.total_bytes) },
    { label: "Busiest venue", value: insights.busiest_venue ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span className="text-xs font-normal leading-4 text-text-secondary">
              {stat.label}
            </span>
            <span className="text-lg font-semibold leading-7 text-text-primary">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {insights.flags.length === 0 ? (
        <p className="text-xs font-normal leading-4 text-text-secondary">
          No anomalies detected.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {insights.flags.map((flag) => (
            <li key={flag.message} className="flex items-center gap-2">
              <StatusBadge
                label={flag.level === "warning" ? "Warning" : "Info"}
                tone={flagTone(flag.level)}
              />
              <span className="text-sm font-medium leading-5 text-text-primary">
                {flag.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
