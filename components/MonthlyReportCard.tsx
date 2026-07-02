"use client";

import { useTransition } from "react";
import { updateMonthlyReport } from "@/app/monthly/actions";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionCard } from "@/components/SectionCard";
import { SKILL_CATEGORIES, SKILL_LABELS, type MonthlyReport } from "@/lib/types";

interface MonthlyReportCardProps {
  report: MonthlyReport;
}

export function MonthlyReportCard({ report }: MonthlyReportCardProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <SectionCard title={`Month ${report.month} — ${report.daysRange}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm text-zinc-500">Average Score</p>
            <ScoreBadge score={report.avgScore} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Resume Readiness</p>
            <p className="text-lg font-bold">{report.resumeReadinessScore}/100</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Mock Interview Readiness</p>
            <p className="text-lg font-bold">{report.mockInterviewReadiness}/100</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            AI Engineering Skill Assessment
          </p>
          <div className="space-y-3">
            {SKILL_CATEGORIES.map((skill) => (
              <ProgressBar
                key={skill}
                label={SKILL_LABELS[skill]}
                value={report.skillAssessment[skill]}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Strengths
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {report.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Weaknesses
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {report.weaknesses.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Portfolio Review
          </label>
          <textarea
            rows={3}
            defaultValue={report.portfolioReview}
            disabled={isPending}
            onBlur={(e) => {
              if (e.target.value !== report.portfolioReview) {
                startTransition(() =>
                  updateMonthlyReport(report.month, "portfolioReview", e.target.value),
                );
              }
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Improvement Plan (one item per line)
          </label>
          <textarea
            rows={3}
            defaultValue={report.improvementPlan.join("\n")}
            disabled={isPending}
            onBlur={(e) => {
              if (e.target.value !== report.improvementPlan.join("\n")) {
                startTransition(() =>
                  updateMonthlyReport(report.month, "improvementPlan", e.target.value),
                );
              }
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Updated Roadmap for Next Month
          </label>
          <textarea
            rows={3}
            defaultValue={report.updatedRoadmapNotes}
            disabled={isPending}
            onBlur={(e) => {
              if (e.target.value !== report.updatedRoadmapNotes) {
                startTransition(() =>
                  updateMonthlyReport(report.month, "updatedRoadmapNotes", e.target.value),
                );
              }
            }}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>
    </SectionCard>
  );
}
