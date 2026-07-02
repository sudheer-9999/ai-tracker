"use client";

import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionCard } from "@/components/SectionCard";
import { useTracker } from "@/components/TrackerProvider";
import type { WeeklyReport } from "@/lib/types";
import { projectHealthColor, projectHealthLabel } from "@/lib/utils";

interface WeeklyReportCardProps {
  report: WeeklyReport;
}

export function WeeklyReportCard({ report }: WeeklyReportCardProps) {
  const { updateWeeklyReport } = useTracker();

  return (
    <SectionCard title={`Week ${report.week} — ${report.daysRange}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm text-zinc-500">Average Score</p>
            <ScoreBadge score={report.avgScore} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Project Health</p>
            <p
              className={`font-semibold ${projectHealthColor(report.projectHealth)}`}
            >
              {projectHealthLabel(report.projectHealth)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Interview Readiness</p>
            <p className="text-lg font-bold">{report.interviewReadinessScore}/100</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Progress Summary
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {report.progressSummary}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Skills Mastered
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {report.skillsMastered.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Skills Needing Improvement
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {report.skillsNeedingImprovement.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            GitHub Activity Review
          </label>
          <textarea
            rows={3}
            defaultValue={report.githubActivity}
            onBlur={(e) => {
              if (e.target.value !== report.githubActivity) {
                updateWeeklyReport(report.week, "githubActivity", e.target.value);
              }
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Action Plan for Next Week (one item per line)
          </label>
          <textarea
            rows={3}
            defaultValue={report.actionPlan.join("\n")}
            onBlur={(e) => {
              const newVal = e.target.value;
              if (newVal !== report.actionPlan.join("\n")) {
                updateWeeklyReport(report.week, "actionPlan", newVal);
              }
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>
    </SectionCard>
  );
}
