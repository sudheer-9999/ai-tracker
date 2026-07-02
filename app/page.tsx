import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionCard } from "@/components/SectionCard";
import { SkillBar } from "@/components/SkillBar";
import { StatCard } from "@/components/StatCard";
import { StreakFlame } from "@/components/StreakFlame";
import { getDayPlan, getMonthForDay, getWeekForDay } from "@/lib/curriculum";
import { TOTAL_DAYS, TOTAL_MONTHS, TOTAL_WEEKS } from "@/lib/constants";
import {
  estimateDaysRemaining,
  getAccountabilityItems,
  getMilestones,
  getOverallProgress,
} from "@/lib/scoring";
import { getDayProgressKey, readState } from "@/lib/store";
import { SKILL_CATEGORIES, createEmptyDayProgress } from "@/lib/types";
import { formatDate, formatMinutes } from "@/lib/utils";

export default async function DashboardPage() {
  const state = await readState();
  const day = state.currentDay;
  const dayPlan = getDayPlan(day);
  const progress =
    state.dayProgress[getDayProgressKey(day)] ?? createEmptyDayProgress();
  const overall = getOverallProgress(state);
  const { daysRemaining, projectedFinishDate } = estimateDaysRemaining(state);
  const accountability = dayPlan
    ? getAccountabilityItems(dayPlan, progress)
    : [];
  const milestones = getMilestones(state);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Your AI Engineer journey — learning by building
        </p>
      </div>

      {milestones.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Milestones
          </p>
          <ul className="mt-2 space-y-1">
            {milestones.map((m) => (
              <li
                key={m}
                className="text-sm text-emerald-700 dark:text-emerald-400"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {accountability.length > 0 && progress.status !== "completed" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Accountability — incomplete for today
          </p>
          <ul className="mt-2 space-y-1">
            {accountability.map((item) => (
              <li
                key={item}
                className="text-sm text-amber-700 dark:text-amber-400"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/today"
            className="mt-3 inline-block text-sm font-medium text-amber-800 underline dark:text-amber-300"
          >
            Go to Today&apos;s tasks
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Day" value={`Day ${day} of ${TOTAL_DAYS}`} />
        <StatCard
          label="Current Week"
          value={`Week ${getWeekForDay(day)} of ${TOTAL_WEEKS}`}
        />
        <StatCard
          label="Current Month"
          value={`Month ${getMonthForDay(day)} of ${TOTAL_MONTHS}`}
        />
        <StatCard
          label="Current Project"
          value={dayPlan?.project ?? "—"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Completion" value={`${overall}%`} />
        <StatCard
          label="Time Spent"
          value={formatMinutes(state.totalTimeSpentMinutes)}
        />
        <StatCard
          label="Days Remaining"
          value={daysRemaining}
          sub={
            projectedFinishDate
              ? `Projected finish: ${formatDate(projectedFinishDate)}`
              : undefined
          }
        />
      </div>

      <SectionCard title="Overall Progress">
        <ProgressBar value={overall} label="Journey completion" />
      </SectionCard>

      <SectionCard title="Streak">
        <StreakFlame
          streak={state.streak}
          longestStreak={state.longestStreak}
        />
      </SectionCard>

      <SectionCard title="Skill Levels">
        <div className="space-y-4">
          {SKILL_CATEGORIES.map((skill) => (
            <SkillBar
              key={skill}
              skill={skill}
              level={state.skillLevels[skill]}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
