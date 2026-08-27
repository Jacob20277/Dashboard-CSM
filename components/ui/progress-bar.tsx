import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  danger: "bg-status-danger-fg",
  warning: "bg-status-warning-fg",
  success: "bg-status-success-fg",
} as const;

export function ProgressBar({
  percent,
  tone,
  className,
}: {
  percent: number;
  tone: "danger" | "warning" | "success";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all", TONE_CLASSES[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
