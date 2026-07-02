import { MONTHS } from "./topics-data";
import { TOTAL_DAYS } from "./constants";
import type { DayPlan, SkillCategory } from "./types";

interface RawDay {
  day: number;
  topic: string;
  learn: string;
  outcome: string;
  practice: string;
  tasks: string[];
}

function skillTagsForMonth(month: number): SkillCategory[] {
  switch (month) {
    case 1:
    case 2:
      return ["llm_rag_agents"];
    case 3:
      return ["llm_rag_agents", "mlops_deployment"];
    case 4:
      return ["mlops_deployment", "interview_readiness"];
    case 5:
      return ["interview_readiness"];
    default:
      return ["llm_rag_agents"];
  }
}

function isRestDay(raw: RawDay): boolean {
  return (
    raw.topic === "Rest" ||
    raw.tasks.length === 0 ||
    raw.tasks.every((t) => t === "Off")
  );
}

function buildDayPlan(
  raw: RawDay,
  month: number,
  monthTitle: string,
  week: number,
  weekTitle: string,
): DayPlan {
  const rest = isRestDay(raw);

  const tasks = rest
    ? [{ id: "rest", label: "Rest day — recharge for the next sprint" }]
    : [
        ...(raw.learn
          ? [{ id: "learn", label: `Study: ${raw.learn.slice(0, 120)}${raw.learn.length > 120 ? "…" : ""}` }]
          : []),
        ...raw.tasks
          .filter((t) => t !== "Off")
          .map((t, i) => ({ id: `task-${i}`, label: t })),
      ];

  const timeEstimate = rest
    ? [{ label: "Rest & optional light reading", minutes: 30 }]
    : [
        { label: "Learn concepts", minutes: 45 },
        { label: "Practice / build", minutes: 90 },
        { label: "Notes & push to GitHub", minutes: 30 },
      ];

  const deliverables = rest
    ? ["Well-rested mind", "Optional light reading"]
    : raw.tasks.filter((t) => t !== "Off");

  const successCriteria = rest
    ? ["Took meaningful rest before the next learning block"]
    : [
        ...(raw.outcome ? [raw.outcome] : []),
        ...(raw.practice ? [`Practice: ${raw.practice}`] : []),
      ];

  return {
    day: raw.day,
    month,
    week,
    weekTitle,
    project: monthTitle,
    goal: rest
      ? "Take a rest day. Recharge so you can sustain the 5-month journey."
      : raw.topic,
    topics: rest ? ["Rest day"] : [raw.topic],
    learn: raw.learn,
    practice: raw.practice,
    isRestDay: rest,
    tasks,
    expectedOutcome:
      raw.outcome ||
      (rest
        ? "You are rested and ready for the next learning block."
        : `Complete today's work on: ${raw.topic}`),
    deliverables,
    timeEstimate,
    successCriteria,
    tomorrowPrep: [],
    skillTags: skillTagsForMonth(month),
  };
}

function buildCurriculum(): DayPlan[] {
  const plans: DayPlan[] = [];

  for (const monthBlock of MONTHS) {
    for (const weekBlock of monthBlock.weeks) {
      for (const rawDay of weekBlock.days as RawDay[]) {
        plans.push(
          buildDayPlan(
            rawDay,
            monthBlock.month,
            monthBlock.title,
            weekBlock.week,
            weekBlock.title,
          ),
        );
      }
    }
  }

  plans.sort((a, b) => a.day - b.day);

  for (let i = 0; i < plans.length; i++) {
    const next = plans[i + 1];
    if (next) {
      plans[i].tomorrowPrep = next.isRestDay
        ? ["Rest tomorrow — plan a lighter day today if needed"]
        : [`Preview tomorrow: ${next.topics[0]}`, next.learn ? `Read ahead: ${next.learn.slice(0, 100)}…` : "Skim tomorrow's tasks in the curriculum"];
    } else {
      plans[i].tomorrowPrep = ["Celebrate — you completed the full journey!"];
    }
  }

  return plans;
}

const CURRICULUM: DayPlan[] = buildCurriculum();

export function getDayPlan(day: number): DayPlan | undefined {
  return CURRICULUM.find((d) => d.day === day);
}

export function getAllDayPlans(): DayPlan[] {
  return CURRICULUM;
}

export function getTotalEstimatedMinutes(plan: DayPlan): number {
  return plan.timeEstimate.reduce((sum, e) => sum + e.minutes, 0);
}

export function getDaysForWeek(week: number): DayPlan[] {
  return CURRICULUM.filter((d) => d.week === week);
}

export function getDaysForMonth(month: number): DayPlan[] {
  return CURRICULUM.filter((d) => d.month === month);
}

export function getWeekForDay(day: number): number {
  return getDayPlan(day)?.week ?? Math.ceil(day / 7);
}

export function getMonthForDay(day: number): number {
  return getDayPlan(day)?.month ?? Math.ceil(day / 28);
}

export function isWeekEndDay(day: number): boolean {
  const plan = getDayPlan(day);
  if (!plan) return false;
  const weekDays = getDaysForWeek(plan.week);
  return weekDays[weekDays.length - 1]?.day === day;
}

export function isMonthEndDay(day: number): boolean {
  const plan = getDayPlan(day);
  if (!plan) return false;
  const monthDays = getDaysForMonth(plan.month);
  return monthDays[monthDays.length - 1]?.day === day;
}

export { TOTAL_DAYS, CURRICULUM };
