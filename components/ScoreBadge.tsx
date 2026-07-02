import { cn, scoreColor } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const sizes = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-3 py-1",
    lg: "text-2xl px-4 py-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-zinc-100 font-semibold dark:bg-zinc-800",
        scoreColor(score),
        sizes[size],
      )}
    >
      {score}/100
    </span>
  );
}
