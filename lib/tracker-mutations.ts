import { getDayPlan, isMonthEndDay, isWeekEndDay } from "@/lib/curriculum";
import { TOTAL_DAYS } from "@/lib/constants";
import {
  applySkillGrowth,
  buildMonthlyReport,
  buildWeeklyReport,
  canCompleteDay,
  computeDayScore,
  updateStreak,
} from "@/lib/scoring";
import { getDayProgressKey } from "@/lib/store";
import {
  createEmptyDayProgress,
  type DayProgress,
  type Reflection,
  type TrackerState,
} from "@/lib/types";

function ensureProgress(
  dayProgress: Record<string, DayProgress>,
  day: number,
): DayProgress {
  const key = getDayProgressKey(day);
  if (!dayProgress[key]) {
    dayProgress[key] = createEmptyDayProgress();
  }
  const progress = dayProgress[key];
  if (progress.status === "not_started") {
    progress.status = "in_progress";
    progress.startedAt = new Date().toISOString();
  }
  return progress;
}

export function toggleTask(
  state: TrackerState,
  day: number,
  taskId: string,
): void {
  if (day !== state.currentDay) return;

  const progress = ensureProgress(state.dayProgress, day);
  const idx = progress.tasksCompleted.indexOf(taskId);
  if (idx >= 0) {
    progress.tasksCompleted.splice(idx, 1);
  } else {
    progress.tasksCompleted.push(taskId);
  }
}

export function saveTimeSpent(
  state: TrackerState,
  day: number,
  minutes: number,
): void {
  if (day !== state.currentDay) return;

  const progress = ensureProgress(state.dayProgress, day);
  progress.timeSpentMinutes = Math.max(0, minutes);
}

export function saveReflection(
  state: TrackerState,
  day: number,
  field: keyof Reflection,
  value: string,
): void {
  if (day !== state.currentDay) return;

  const progress = ensureProgress(state.dayProgress, day);
  progress.reflection[field] = value;
}

export function completeDay(
  state: TrackerState,
  day: number,
): { error?: string; success?: boolean; score?: number } {
  if (day !== state.currentDay) {
    return { error: "Can only complete the current day" };
  }

  const dayPlan = getDayPlan(day);
  if (!dayPlan) return { error: "Day plan not found" };

  const progress = ensureProgress(state.dayProgress, day);

  if (!canCompleteDay(dayPlan, progress)) {
    return { error: "Not all requirements met" };
  }

  const score = computeDayScore(dayPlan, progress);
  const today = new Date().toISOString().split("T")[0];

  progress.status = "completed";
  progress.score = score;
  progress.completedAt = new Date().toISOString();
  progress.completedCalendarDate = today;

  const { streak, longestStreak } = updateStreak(state, today);
  state.streak = streak;
  state.longestStreak = longestStreak;
  state.lastCompletionDate = today;
  state.totalTimeSpentMinutes += progress.timeSpentMinutes;
  state.skillLevels = applySkillGrowth(state, dayPlan, score);

  if (isWeekEndDay(day)) {
    const week = dayPlan.week;
    state.weeklyReports[String(week)] = buildWeeklyReport(state, week);
  }

  if (isMonthEndDay(day)) {
    const month = dayPlan.month;
    state.monthlyReports[String(month)] = buildMonthlyReport(state, month);
  }

  if (day <= TOTAL_DAYS) {
    state.currentDay = day + 1;
  }

  return { success: true, score };
}

export function updateWeeklyReport(
  state: TrackerState,
  week: number,
  field: "githubActivity" | "actionPlan",
  value: string,
): void {
  const key = String(week);
  const report = state.weeklyReports[key];
  if (!report) return;

  if (field === "githubActivity") {
    report.githubActivity = value;
  } else {
    report.actionPlan = value.split("\n").filter(Boolean);
  }
}

export function updateMonthlyReport(
  state: TrackerState,
  month: number,
  field: "portfolioReview" | "updatedRoadmapNotes" | "improvementPlan",
  value: string,
): void {
  const key = String(month);
  const report = state.monthlyReports[key];
  if (!report) return;

  if (field === "portfolioReview") {
    report.portfolioReview = value;
  } else if (field === "updatedRoadmapNotes") {
    report.updatedRoadmapNotes = value;
  } else {
    report.improvementPlan = value.split("\n").filter(Boolean);
  }
}
