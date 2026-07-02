"use client";

import { useTransition } from "react";
import { completeDay } from "@/app/today/actions";

interface CompleteDayButtonProps {
  day: number;
  canComplete: boolean;
  alreadyCompleted: boolean;
  isRestDay?: boolean;
}

export function CompleteDayButton({
  day,
  canComplete,
  alreadyCompleted,
  isRestDay,
}: CompleteDayButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (alreadyCompleted) {
    return (
      <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Day {day} completed! Great work.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!canComplete || isPending}
        onClick={() =>
          startTransition(() => {
            void completeDay(day);
          })
        }
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isPending ? "Completing..." : `Complete Day ${day}`}
      </button>
      {!canComplete && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {isRestDay
            ? "Check the rest day box when you've recharged."
            : "Complete all tasks, fill in reflection, and log time spent to finish this day."}
        </p>
      )}
    </div>
  );
}
