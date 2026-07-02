export const SKILL_CATEGORIES = [
  "python_ml_foundations",
  "deep_learning_nlp",
  "llm_rag_agents",
  "mlops_deployment",
  "interview_readiness",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_LABELS: Record<SkillCategory, string> = {
  python_ml_foundations: "Python & ML Foundations",
  deep_learning_nlp: "Deep Learning & NLP",
  llm_rag_agents: "LLM, RAG & Agents",
  mlops_deployment: "MLOps & Deployment",
  interview_readiness: "Interview Readiness",
};

export type DayStatus = "not_started" | "in_progress" | "completed";

export interface TaskItem {
  id: string;
  label: string;
}

export interface TimeEstimate {
  label: string;
  minutes: number;
}

export interface DayPlan {
  day: number;
  month: number;
  week: number;
  weekTitle: string;
  project: string;
  goal: string;
  topics: string[];
  learn: string;
  practice: string;
  isRestDay: boolean;
  tasks: TaskItem[];
  expectedOutcome: string;
  deliverables: string[];
  timeEstimate: TimeEstimate[];
  successCriteria: string[];
  tomorrowPrep: string[];
  skillTags: SkillCategory[];
}

export interface Reflection {
  built: string;
  learned: string;
  difficult: string;
  improve: string;
  blockers: string;
}

export const EMPTY_REFLECTION: Reflection = {
  built: "",
  learned: "",
  difficult: "",
  improve: "",
  blockers: "",
};

export interface DayProgress {
  status: DayStatus;
  tasksCompleted: string[];
  timeSpentMinutes: number;
  reflection: Reflection;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
  completedCalendarDate: string | null;
}

export type ProjectHealth = "excellent" | "good" | "needs_attention" | "at_risk";

export interface WeeklyReport {
  week: number;
  daysRange: string;
  avgScore: number;
  projectHealth: ProjectHealth;
  interviewReadinessScore: number;
  progressSummary: string;
  skillsMastered: string[];
  skillsNeedingImprovement: string[];
  githubActivity: string;
  actionPlan: string[];
  generatedAt: string;
}

export interface MonthlyReport {
  month: number;
  daysRange: string;
  avgScore: number;
  resumeReadinessScore: number;
  mockInterviewReadiness: number;
  skillAssessment: Record<SkillCategory, number>;
  portfolioReview: string;
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  updatedRoadmapNotes: string;
  generatedAt: string;
}

export interface TrackerState {
  currentDay: number;
  startDate: string;
  streak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  totalTimeSpentMinutes: number;
  skillLevels: Record<SkillCategory, number>;
  dayProgress: Record<string, DayProgress>;
  weeklyReports: Record<string, WeeklyReport>;
  monthlyReports: Record<string, MonthlyReport>;
}

export function createEmptyDayProgress(): DayProgress {
  return {
    status: "not_started",
    tasksCompleted: [],
    timeSpentMinutes: 0,
    reflection: { ...EMPTY_REFLECTION },
    score: null,
    startedAt: null,
    completedAt: null,
    completedCalendarDate: null,
  };
}

export function createInitialState(startDate?: string): TrackerState {
  const skillLevels = {} as Record<SkillCategory, number>;
  for (const skill of SKILL_CATEGORIES) {
    skillLevels[skill] = 0;
  }

  return {
    currentDay: 1,
    startDate: startDate ?? new Date().toISOString().split("T")[0],
    streak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    totalTimeSpentMinutes: 0,
    skillLevels,
    dayProgress: {},
    weeklyReports: {},
    monthlyReports: {},
  };
}
