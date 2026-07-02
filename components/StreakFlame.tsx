interface StreakFlameProps {
  streak: number;
  longestStreak: number;
}

export function StreakFlame({ streak, longestStreak }: StreakFlameProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl" role="img" aria-label="streak">
        {streak > 0 ? "🔥" : "💤"}
      </span>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {streak} day{streak !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Longest: {longestStreak} day{longestStreak !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
