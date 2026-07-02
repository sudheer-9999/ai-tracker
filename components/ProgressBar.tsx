import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="mb-1 flex items-center justify-between text-sm">
          {label && <span className="text-zinc-600 dark:text-zinc-400">{label}</span>}
          {showPercent && (
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {percent}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all duration-500 dark:bg-zinc-100"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
