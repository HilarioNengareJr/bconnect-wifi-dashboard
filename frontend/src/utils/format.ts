// Formatting helpers for bytes, dates, and relative time.

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];

// Backend timestamps are naive UTC (no zone suffix); append Z so the browser
// parses them as UTC rather than local time.
export function parseUtc(iso: string): number {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  return Date.parse(hasZone ? iso : `${iso}Z`);
}

export function formatRelativeTime(iso: string | null): string {
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

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const ms = parseUtc(iso);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1,
  );
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${BYTE_UNITS[i]}`;
}
