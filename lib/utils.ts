export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function projectHealthLabel(
  health: "excellent" | "good" | "needs_attention" | "at_risk",
): string {
  const labels = {
    excellent: "Excellent",
    good: "Good",
    needs_attention: "Needs Attention",
    at_risk: "At Risk",
  };
  return labels[health];
}

export function projectHealthColor(
  health: "excellent" | "good" | "needs_attention" | "at_risk",
): string {
  const colors = {
    excellent: "text-emerald-600 dark:text-emerald-400",
    good: "text-blue-600 dark:text-blue-400",
    needs_attention: "text-amber-600 dark:text-amber-400",
    at_risk: "text-red-600 dark:text-red-400",
  };
  return colors[health];
}

export function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
