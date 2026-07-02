import type { DayPlan, DayProgress, TrackerState } from "./types";
import { SKILL_CATEGORIES } from "./types";
import { TOTAL_DAYS } from "./constants";
import { getAllDayPlans, getDaysForMonth, getDaysForWeek } from "./curriculum";

export function getTotalEstimatedMinutes(plan: DayPlan): number {
  return plan.timeEstimate.reduce((sum, e) => sum + e.minutes, 0);
}

export function computeDayScore(
  dayPlan: DayPlan,
  progress: DayProgress,
): number {
  if (dayPlan.isRestDay) {
    return progress.tasksCompleted.includes("rest") ? 100 : 0;
  }

  const totalTasks = dayPlan.tasks.length;
  const completedTasks = progress.tasksCompleted.length;
  const taskScore =
    totalTasks > 0 ? (completedTasks / totalTasks) * 60 : 0;

  const reflectionFields = Object.values(progress.reflection);
  const filledFields = reflectionFields.filter((v) => v.trim().length > 0).length;
  const reflectionScore = (filledFields / reflectionFields.length) * 25;

  const estimatedMinutes = getTotalEstimatedMinutes(dayPlan);
  let timeScore = 0;
  if (progress.timeSpentMinutes > 0 && estimatedMinutes > 0) {
    const ratio = progress.timeSpentMinutes / estimatedMinutes;
    if (ratio >= 0.5 && ratio <= 2.0) {
      timeScore = 15;
    } else if (ratio >= 0.25 || ratio <= 3.0) {
      timeScore = 8;
    } else {
      timeScore = 3;
    }
  }

  return Math.round(Math.min(100, taskScore + reflectionScore + timeScore));
}

export function isReflectionComplete(progress: DayProgress): boolean {
  return Object.values(progress.reflection).every((v) => v.trim().length > 0);
}

export function areAllTasksComplete(
  dayPlan: DayPlan,
  progress: DayProgress,
): boolean {
  return dayPlan.tasks.every((t) => progress.tasksCompleted.includes(t.id));
}

export function canCompleteDay(
  dayPlan: DayPlan,
  progress: DayProgress,
): boolean {
  if (dayPlan.isRestDay) {
    return progress.tasksCompleted.includes("rest");
  }

  return (
    areAllTasksComplete(dayPlan, progress) &&
    isReflectionComplete(progress) &&
    progress.timeSpentMinutes > 0
  );
}

export function updateStreak(
  state: TrackerState,
  completionDate: string,
): { streak: number; longestStreak: number } {
  let streak = state.streak;

  if (!state.lastCompletionDate) {
    streak = 1;
  } else {
    const last = new Date(state.lastCompletionDate);
    const current = new Date(completionDate);
    const diffDays = Math.floor(
      (current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      // Same calendar day — keep streak
    } else if (diffDays === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  return {
    streak,
    longestStreak: Math.max(state.longestStreak, streak),
  };
}

const DAYS_PER_SKILL: Record<string, number> = {};
for (const plan of getAllDayPlans()) {
  for (const tag of plan.skillTags) {
    DAYS_PER_SKILL[tag] = (DAYS_PER_SKILL[tag] ?? 0) + 1;
  }
}

export function applySkillGrowth(
  state: TrackerState,
  dayPlan: DayPlan,
  score: number,
): Record<(typeof SKILL_CATEGORIES)[number], number> {
  const updated = { ...state.skillLevels };

  for (const tag of dayPlan.skillTags) {
    const totalDays = DAYS_PER_SKILL[tag] ?? 1;
    const increment = (score / 100) * (100 / totalDays);
    updated[tag] = Math.min(100, Math.round((updated[tag] + increment) * 10) / 10);
  }

  return updated;
}

export function getCompletedDaysCount(state: TrackerState): number {
  return Object.values(state.dayProgress).filter(
    (p) => p.status === "completed",
  ).length;
}

export function getOverallProgress(state: TrackerState): number {
  return Math.round((getCompletedDaysCount(state) / TOTAL_DAYS) * 100);
}

export function estimateDaysRemaining(state: TrackerState): {
  daysRemaining: number;
  projectedFinishDate: string | null;
} {
  const daysRemaining = Math.max(0, TOTAL_DAYS - state.currentDay + 1);
  const completed = getCompletedDaysCount(state);

  if (completed === 0) {
    return { daysRemaining, projectedFinishDate: null };
  }

  const start = new Date(state.startDate);
  const today = new Date();
  const calendarDaysElapsed = Math.max(
    1,
    Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const avgCalendarDaysPerTrackerDay = calendarDaysElapsed / completed;
  const projectedDays = Math.ceil(daysRemaining * avgCalendarDaysPerTrackerDay);

  const projected = new Date(today);
  projected.setDate(projected.getDate() + projectedDays);

  return {
    daysRemaining,
    projectedFinishDate: projected.toISOString().split("T")[0],
  };
}

function avgScoreForDays(
  state: TrackerState,
  days: number[],
): number {
  const scores = days
    .map((d) => state.dayProgress[String(d)]?.score)
    .filter((s): s is number => s !== null && s !== undefined);

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function projectHealthFromScore(avg: number): "excellent" | "good" | "needs_attention" | "at_risk" {
  if (avg >= 85) return "excellent";
  if (avg >= 70) return "good";
  if (avg >= 50) return "needs_attention";
  return "at_risk";
}

export function buildWeeklyReport(
  state: TrackerState,
  week: number,
): import("./types").WeeklyReport {
  const days = getDaysForWeek(week);
  const dayNumbers = days.map((d) => d.day);
  const avgScore = avgScoreForDays(state, dayNumbers);

  const allTopics = days.flatMap((d) => d.topics);
  const skillsMastered =
    avgScore >= 70
      ? allTopics.slice(0, 3)
      : avgScore >= 50
        ? allTopics.slice(0, 1)
        : [];

  const skillsNeedingImprovement =
    avgScore < 70
      ? allTopics.slice(-2)
      : avgScore < 85
        ? [allTopics[allTopics.length - 1]]
        : [];

  const interviewReadinessScore = Math.round(
    state.skillLevels.interview_readiness * 0.4 +
      state.skillLevels.python_ml_foundations * 0.15 +
      state.skillLevels.deep_learning_nlp * 0.15 +
      state.skillLevels.llm_rag_agents * 0.15 +
      state.skillLevels.mlops_deployment * 0.15,
  );

  return {
    week,
    daysRange: `Days ${dayNumbers[0]}–${dayNumbers[dayNumbers.length - 1]}`,
    avgScore,
    projectHealth: projectHealthFromScore(avgScore),
    interviewReadinessScore,
    progressSummary: `Week ${week} (${days[0].project}): completed ${dayNumbers.length} days with an average score of ${avgScore}/100. Focus was ${days[0].topics[0].split(",")[0]}.`,
    skillsMastered,
    skillsNeedingImprovement,
    githubActivity: "Review your GitHub commits for this week and note key contributions.",
    actionPlan: [
      `Continue building on ${days[0].project}`,
      skillsNeedingImprovement.length > 0
        ? `Spend extra time on: ${skillsNeedingImprovement.join(", ")}`
        : "Maintain momentum and start next week's topics early",
      "Push all code and update README before next session",
    ],
    generatedAt: new Date().toISOString(),
  };
}

export function buildMonthlyReport(
  state: TrackerState,
  month: number,
): import("./types").MonthlyReport {
  const days = getDaysForMonth(month);
  const dayNumbers = days.map((d) => d.day);
  const avgScore = avgScoreForDays(state, dayNumbers);

  const resumeReadinessScore = Math.round(
    getOverallProgress(state) * 0.3 +
      state.skillLevels.mlops_deployment * 0.25 +
      state.skillLevels.interview_readiness * 0.25 +
      avgScore * 0.2,
  );

  const mockInterviewReadiness = Math.round(
    state.skillLevels.interview_readiness * 0.35 +
      state.skillLevels.python_ml_foundations * 0.2 +
      state.skillLevels.deep_learning_nlp * 0.2 +
      state.skillLevels.llm_rag_agents * 0.15 +
      avgScore * 0.1,
  );

  const skillAssessment = { ...state.skillLevels };

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const skill of SKILL_CATEGORIES) {
    if (state.skillLevels[skill] >= 60) {
      strengths.push(skill.replace(/_/g, " "));
    } else if (state.skillLevels[skill] < 30) {
      weaknesses.push(skill.replace(/_/g, " "));
    }
  }

  if (strengths.length === 0) strengths.push("Consistent daily practice");
  if (weaknesses.length === 0 && avgScore < 80) weaknesses.push("Time management under estimates");

  return {
    month,
    daysRange: `Days ${dayNumbers[0]}–${dayNumbers[dayNumbers.length - 1]}`,
    avgScore,
    resumeReadinessScore,
    mockInterviewReadiness,
    skillAssessment,
    portfolioReview: `Month ${month} focused on ${days[0].project}. Review your GitHub repos and deployed demos for portfolio inclusion.`,
    strengths,
    weaknesses,
    improvementPlan: [
      weaknesses.length > 0
        ? `Focus next month on improving: ${weaknesses.join(", ")}`
        : "Deepen expertise in capstone project",
      "Add 1 new project to portfolio with architecture diagram",
      "Practice 2 mock interview questions per week",
    ],
    updatedRoadmapNotes: `After month ${month}, overall progress is ${getOverallProgress(state)}%. Adjust pace if behind schedule.`,
    generatedAt: new Date().toISOString(),
  };
}

export function getMilestones(state: TrackerState): string[] {
  const milestones: string[] = [];
  const completed = getCompletedDaysCount(state);

  if (completed >= 1) milestones.push("First day completed!");
  if (completed >= 5) milestones.push("First week completed!");
  if (completed >= 28) milestones.push("Month 1 complete — RAG Chatbot shipped!");
  if (completed >= 56) milestones.push("Month 2 complete — Tool-Using Agents done!");
  if (completed >= 84) milestones.push("Month 3 complete — LangChain + Production done!");
  if (completed >= 112) milestones.push("Month 4 complete — Capstone deployed!");
  if (completed >= TOTAL_DAYS) milestones.push("Journey complete — Industry-ready AI Engineer!");

  const recentScores = Object.values(state.dayProgress)
    .filter((p) => p.status === "completed" && p.score !== null)
    .map((p) => p.score as number);

  if (recentScores.some((s) => s >= 90)) {
    milestones.push("Scored 90+ on a day — excellent work!");
  }

  return milestones;
}

export function getAccountabilityItems(
  dayPlan: DayPlan,
  progress: DayProgress,
): string[] {
  if (dayPlan.isRestDay) {
    if (!progress.tasksCompleted.includes("rest")) {
      return ["Mark your rest day as complete when you've recharged"];
    }
    return [];
  }

  const items: string[] = [];

  for (const task of dayPlan.tasks) {
    if (!progress.tasksCompleted.includes(task.id)) {
      items.push(`Incomplete task: ${task.label}`);
    }
  }

  if (!isReflectionComplete(progress)) {
    items.push("Reflection not fully filled in");
  }

  if (progress.timeSpentMinutes <= 0) {
    items.push("Time spent not logged");
  }

  return items;
}
