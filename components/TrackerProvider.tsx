"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadState, saveState } from "@/lib/store";
import * as mutations from "@/lib/tracker-mutations";
import { createInitialState, type Reflection, type TrackerState } from "@/lib/types";

interface TrackerContextValue {
  state: TrackerState;
  hydrated: boolean;
  toggleTask: (day: number, taskId: string) => void;
  saveTimeSpent: (day: number, minutes: number) => void;
  saveReflection: (
    day: number,
    field: keyof Reflection,
    value: string,
  ) => void;
  completeDay: (
    day: number,
  ) => { error?: string; success?: boolean; score?: number };
  updateWeeklyReport: (
    week: number,
    field: "githubActivity" | "actionPlan",
    value: string,
  ) => void;
  updateMonthlyReport: (
    month: number,
    field: "portfolioReview" | "updatedRoadmapNotes" | "improvementPlan",
    value: string,
  ) => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const persist = useCallback((updater: (draft: TrackerState) => void) => {
    setState((prev) => {
      const next = structuredClone(prev);
      updater(next);
      saveState(next);
      return next;
    });
  }, []);

  const toggleTask = useCallback(
    (day: number, taskId: string) => {
      persist((s) => mutations.toggleTask(s, day, taskId));
    },
    [persist],
  );

  const saveTimeSpent = useCallback(
    (day: number, minutes: number) => {
      persist((s) => mutations.saveTimeSpent(s, day, minutes));
    },
    [persist],
  );

  const saveReflection = useCallback(
    (day: number, field: keyof Reflection, value: string) => {
      persist((s) => mutations.saveReflection(s, day, field, value));
    },
    [persist],
  );

  const completeDay = useCallback(
    (day: number) => {
      let result: { error?: string; success?: boolean; score?: number } = {};
      persist((s) => {
        result = mutations.completeDay(s, day);
      });
      return result;
    },
    [persist],
  );

  const updateWeeklyReport = useCallback(
    (
      week: number,
      field: "githubActivity" | "actionPlan",
      value: string,
    ) => {
      persist((s) => mutations.updateWeeklyReport(s, week, field, value));
    },
    [persist],
  );

  const updateMonthlyReport = useCallback(
    (
      month: number,
      field: "portfolioReview" | "updatedRoadmapNotes" | "improvementPlan",
      value: string,
    ) => {
      persist((s) => mutations.updateMonthlyReport(s, month, field, value));
    },
    [persist],
  );

  return (
    <TrackerContext.Provider
      value={{
        state,
        hydrated,
        toggleTask,
        saveTimeSpent,
        saveReflection,
        completeDay,
        updateWeeklyReport,
        updateMonthlyReport,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within TrackerProvider");
  }
  return context;
}

export function TrackerGate({ children }: { children: ReactNode }) {
  const { hydrated } = useTracker();

  if (!hydrated) {
    return (
      <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
        Loading your progress...
      </div>
    );
  }

  return children;
}
