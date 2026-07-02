import { MonthlyReportCard } from "@/components/MonthlyReportCard";
import { readState } from "@/lib/store";
import type { MonthlyReport } from "@/lib/types";

export default async function MonthlyPage() {
  const state = await readState();
  const reports = Object.values(state.monthlyReports).sort(
    (a, b) => b.month - a.month,
  ) as MonthlyReport[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monthly Tracker</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Portfolio and skill assessments generated every 30 days
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          No monthly reports yet. Complete the last day of each month (days 28, 56, 84, 112, 140) to generate your first report.
          your first report.
        </p>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <MonthlyReportCard key={report.month} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
