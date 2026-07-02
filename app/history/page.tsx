import { ScoreBadge } from "@/components/ScoreBadge";
import { getDayPlan } from "@/lib/curriculum";
import { readState } from "@/lib/store";
import type { DayProgress } from "@/lib/types";
import { formatDate, formatMinutes } from "@/lib/utils";

export default async function HistoryPage() {
  const state = await readState();

  const entries = Object.entries(state.dayProgress)
    .filter(([, p]) => (p as DayProgress).status === "completed")
    .map(([dayStr, p]) => {
      const day = parseInt(dayStr, 10);
      const plan = getDayPlan(day);
      return {
        day,
        progress: p as DayProgress,
        project: plan?.project ?? "—",
      };
    })
    .sort((a, b) => b.day - a.day);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Every day you&apos;ve completed on this journey
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          No completed days yet. Head to Today to start Day 1!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">
                  Day
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">
                  Project
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">
                  Score
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map(({ day, progress, project }) => (
                <tr
                  key={day}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="px-4 py-3 font-medium">Day {day}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {progress.completedCalendarDate
                      ? formatDate(progress.completedCalendarDate)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {project}
                  </td>
                  <td className="px-4 py-3">
                    {progress.score !== null ? (
                      <ScoreBadge score={progress.score} size="sm" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {formatMinutes(progress.timeSpentMinutes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
