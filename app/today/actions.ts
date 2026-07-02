"use server";

import { revalidatePath } from "next/cache";
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
import { getDayProgressKey, readState, writeState } from "@/lib/store";
import {
  createEmptyDayProgress,
  type DayProgress,
  type Reflection,
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

export async function toggleTask(day: number, taskId: string) {
  const state = await readState();
  if (day !== state.currentDay) return;

  const progress = ensureProgress(state.dayProgress, day);
  const idx = progress.tasksCompleted.indexOf(taskId);
  if (idx >= 0) {
    progress.tasksCompleted.splice(idx, 1);
  } else {
    progress.tasksCompleted.push(taskId);
  }

  await writeState(state);
  revalidatePath("/today");
  revalidatePath("/");
}

export async function saveTimeSpent(day: number, minutes: number) {
  const state = await readState();
  if (day !== state.currentDay) return;

  const progress = ensureProgress(state.dayProgress, day);
  progress.timeSpentMinutes = Math.max(0, minutes);

  await writeState(state);
  revalidatePath("/today");
  revalidatePath("/");
}

export async function saveReflection(
  day: number,
  field: keyof Reflection,
  value: string,
) {
  const state = await readState();
  if (day !== state.currentDay) return;

  const progress = ensureProgress(state.dayProgress, day);
  progress.reflection[field] = value;

  await writeState(state);
  revalidatePath("/today");
  revalidatePath("/");
}

export async function completeDay(day: number) {
  const state = await readState();
  if (day !== state.currentDay) return { error: "Can only complete the current day" };

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

  await writeState(state);
  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/weekly");
  revalidatePath("/monthly");
  revalidatePath("/history");

  return { success: true, score };
}
