"use client";

import { WeeklyReportCard } from "@/components/WeeklyReportCard";
import { useTracker } from "@/components/TrackerProvider";
import type { WeeklyReport } from "@/lib/types";

export default function WeeklyPage() {
  const { state } = useTracker();
  const reports = Object.values(state.weeklyReports).sort(
    (a, b) => b.week - a.week,
  ) as WeeklyReport[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Tracker</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Progress summaries generated every 5 days
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          No weekly reports yet. Complete the last day of each week (days 7, 14,
          21, 28…) to generate your first report.
        </p>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <WeeklyReportCard key={report.week} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
