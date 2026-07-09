import { cn } from "@/lib/utils";

/**
 * Five-segment difficulty gauge — terminal vernacular for a 1–5 scale.
 * Presentational only; the interactive rater lives in CtfActions.
 */
function DifficultyMeter({
  value,
  className,
  segmentClassName,
}: {
  value: number;
  className?: string;
  segmentClassName?: string;
}) {
  const filled = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          className={cn("h-3 w-[3px] rounded-full", level <= filled ? "bg-brand" : "bg-border", segmentClassName)}
          key={level}
        />
      ))}
    </span>
  );
}

export default DifficultyMeter;
