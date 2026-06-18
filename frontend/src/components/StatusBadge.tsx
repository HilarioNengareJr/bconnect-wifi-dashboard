type Tone = "success" | "info" | "error" | "muted";

type Props = {
  label: string;
  tone: Tone;
};

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-light text-success-foreground",
  info: "bg-info-light text-info-foreground",
  error: "bg-error-light text-error-foreground",
  muted: "bg-surface-muted text-text-secondary",
};

export function StatusBadge({ label, tone }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
