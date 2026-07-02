import Link from "next/link";
import { TOTAL_DAYS } from "@/lib/constants";
import { getMonthForDay, getWeekForDay } from "@/lib/curriculum";
import { getDayProgressKey } from "@/lib/store";
import { MONTHS } from "@/lib/topics-data";
import type { DayProgress, TrackerState } from "@/lib/types";

interface CurriculumOutlineProps {
  state: TrackerState;
}

function dayStatus(
  day: number,
  currentDay: number,
  progress: DayProgress | undefined,
): "completed" | "current" | "upcoming" {
  if (progress?.status === "completed") return "completed";
  if (day === currentDay) return "current";
  return "upcoming";
}

const STATUS_STYLES = {
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  current: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  upcoming: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
} as const;

function isRestDay(topic: string, tasks: string[]) {
  return topic === "Rest" || tasks.every((task) => task === "Off");
}

export function CurriculumOutline({ state }: CurriculumOutlineProps) {
  const currentDay = state.currentDay;
  const currentMonth = getMonthForDay(currentDay);
  const currentWeek = getWeekForDay(currentDay);

  return (
    <div className="space-y-4">
      {MONTHS.map((month) => (
        <details
          key={month.month}
          open={month.month === currentMonth}
          className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        >
          <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
            <div className="flex items-start gap-3">
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: month.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Month {month.month}: {month.title}
                  </h2>
                  {month.month === currentMonth && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {month.weeks.length} weeks ·{" "}
                  {month.weeks.reduce((sum, week) => sum + week.days.length, 0)}{" "}
                  days
                </p>
              </div>
              <span className="text-sm text-zinc-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </div>
          </summary>

          <div className="space-y-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-900">
            {month.weeks.map((week) => (
              <details
                key={week.week}
                open={week.week === currentWeek}
                className="rounded-lg border border-zinc-100 dark:border-zinc-900"
              >
                <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        Week {week.week}: {week.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Days {week.days[0]?.day}–
                        {week.days[week.days.length - 1]?.day}
                      </p>
                    </div>
                    {week.week === currentWeek && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Current
                      </span>
                    )}
                  </div>
                </summary>

                <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {week.days.map((rawDay) => {
                    const rest = isRestDay(rawDay.topic, rawDay.tasks);
                    const progress = state.dayProgress[
                      getDayProgressKey(rawDay.day)
                    ] as DayProgress | undefined;
                    const status = dayStatus(
                      rawDay.day,
                      currentDay,
                      progress,
                    );
                    const isCurrent = status === "current";

                    return (
                      <li
                        key={rawDay.day}
                        className={`px-4 py-3 ${isCurrent ? "bg-amber-50/80 dark:bg-amber-950/30" : ""}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                Day {rawDay.day}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
                              >
                                {status}
                              </span>
                              {rest && (
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                  Rest
                                </span>
                              )}
                            </div>
                            <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                              {rawDay.topic}
                            </p>
                            {!rest && rawDay.learn && (
                              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                {rawDay.learn}
                              </p>
                            )}
                            {!rest && rawDay.outcome && (
                              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                                Outcome: {rawDay.outcome}
                              </p>
                            )}
                            {!rest && rawDay.tasks.length > 0 && (
                              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                                {rawDay.tasks
                                  .filter((task) => task !== "Off")
                                  .map((task) => (
                                    <li key={task}>{task}</li>
                                  ))}
                              </ul>
                            )}
                          </div>
                          {isCurrent && (
                            <Link
                              href="/today"
                              className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                            >
                              Open today
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </details>
      ))}

      {currentDay > TOTAL_DAYS && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          You&apos;ve completed all {TOTAL_DAYS} days. Great work!
        </p>
      )}
    </div>
  );
}
