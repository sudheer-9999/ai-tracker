"use client";

import { CompleteDayButton } from "@/components/CompleteDayButton";
import { ReflectionForm } from "@/components/ReflectionForm";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionCard } from "@/components/SectionCard";
import { TaskChecklist } from "@/components/TaskChecklist";
import { useTracker } from "@/components/TrackerProvider";
import { TOTAL_DAYS } from "@/lib/constants";
import { getDayPlan } from "@/lib/curriculum";
import { canCompleteDay, getTotalEstimatedMinutes } from "@/lib/scoring";
import { getDayProgressKey } from "@/lib/store";
import { createEmptyDayProgress } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

export default function TodayPage() {
  const { state } = useTracker();
  const day = state.currentDay;
  const dayPlan = getDayPlan(day);

  if (!dayPlan) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Journey Complete!</h1>
        <p className="mt-2 text-zinc-500">
          You&apos;ve completed all {TOTAL_DAYS} days. Congratulations!
        </p>
      </div>
    );
  }

  const progress =
    state.dayProgress[getDayProgressKey(day)] ?? createEmptyDayProgress();
  const estimatedTotal = getTotalEstimatedMinutes(dayPlan);
  const canComplete = canCompleteDay(dayPlan, progress);
  const isCompleted = progress.status === "completed";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Day {day} · Week {dayPlan.week}: {dayPlan.weekTitle} · Month{" "}
          {dayPlan.month}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {dayPlan.isRestDay ? "Rest Day" : dayPlan.project}
        </h1>
        {!dayPlan.isRestDay && (
          <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
            {dayPlan.goal}
          </p>
        )}
        {isCompleted && progress.score !== null && (
          <div className="mt-3">
            <ScoreBadge score={progress.score} size="lg" />
          </div>
        )}
      </div>

      {!dayPlan.isRestDay && dayPlan.learn && (
        <SectionCard title="What to Learn">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {dayPlan.learn}
          </p>
        </SectionCard>
      )}

      <SectionCard title="Today's Goal">
        <p className="text-zinc-700 dark:text-zinc-300">
          {dayPlan.isRestDay
            ? "Take a break. Optional light reading only — no coding required."
            : dayPlan.topics[0]}
        </p>
      </SectionCard>

      <SectionCard title="Tasks">
        <TaskChecklist dayPlan={dayPlan} progress={progress} day={day} />
      </SectionCard>

      {dayPlan.practice && !dayPlan.isRestDay && (
        <SectionCard title="Practice">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {dayPlan.practice}
          </p>
        </SectionCard>
      )}

      <SectionCard title="Expected Outcome">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {dayPlan.expectedOutcome}
        </p>
      </SectionCard>

      {!dayPlan.isRestDay && dayPlan.deliverables.length > 0 && (
        <SectionCard title="Deliverables">
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {dayPlan.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Time Estimate">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 text-left font-medium text-zinc-500">Task</th>
              <th className="py-2 text-right font-medium text-zinc-500">
                Estimate
              </th>
            </tr>
          </thead>
          <tbody>
            {dayPlan.timeEstimate.map((item) => (
              <tr
                key={item.label}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                <td className="py-2 text-zinc-700 dark:text-zinc-300">
                  {item.label}
                </td>
                <td className="py-2 text-right text-zinc-500">
                  {formatMinutes(item.minutes)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Total
              </td>
              <td className="py-2 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                {formatMinutes(estimatedTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </SectionCard>

      <SectionCard title="Success Criteria">
        <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dayPlan.successCriteria.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </SectionCard>

      {!dayPlan.isRestDay && (
        <SectionCard title="Reflection">
          <ReflectionForm
            day={day}
            reflection={progress.reflection}
            timeSpentMinutes={progress.timeSpentMinutes}
            disabled={isCompleted}
          />
        </SectionCard>
      )}

      {dayPlan.tomorrowPrep.length > 0 && (
        <SectionCard title="Tomorrow's Preparation">
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {dayPlan.tomorrowPrep.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </SectionCard>
      )}

      <CompleteDayButton
        day={day}
        canComplete={canComplete}
        alreadyCompleted={isCompleted}
        isRestDay={dayPlan.isRestDay}
      />
    </div>
  );
}
