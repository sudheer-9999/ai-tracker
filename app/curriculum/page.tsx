import { CurriculumOutline } from "@/components/CurriculumOutline";
import { StatCard } from "@/components/StatCard";
import { TOTAL_DAYS, TOTAL_MONTHS, TOTAL_WEEKS } from "@/lib/constants";
import { getMonthForDay, getWeekForDay } from "@/lib/curriculum";
import { readState } from "@/lib/store";
import { MONTHS } from "@/lib/topics-data";

export default async function CurriculumPage() {
  const state = await readState();
  const currentDay = state.currentDay;
  const currentMonth = MONTHS.find((m) => m.month === getMonthForDay(currentDay));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Full 140-day AI Engineer learning path — all months, weeks, and
          daily topics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Days" value={TOTAL_DAYS} />
        <StatCard label="Total Weeks" value={TOTAL_WEEKS} />
        <StatCard label="Total Months" value={TOTAL_MONTHS} />
        <StatCard
          label="You Are Here"
          value={
            currentDay > TOTAL_DAYS
              ? "Complete"
              : `Day ${currentDay}`
          }
          sub={
            currentDay <= TOTAL_DAYS
              ? `Month ${getMonthForDay(currentDay)} · Week ${getWeekForDay(currentDay)} · ${currentMonth?.title ?? ""}`
              : undefined
          }
        />
      </div>

      <CurriculumOutline state={state} />
    </div>
  );
}
