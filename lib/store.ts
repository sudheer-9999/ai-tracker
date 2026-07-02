import { createInitialState, type TrackerState } from "./types";

export const STORAGE_KEY = "ai-tracker-state";

export function getDayProgressKey(day: number): string {
  return String(day);
}

export function loadState(): TrackerState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as TrackerState;
    }
  } catch {
    // ignore corrupt storage
  }

  return createInitialState();
}

export function saveState(state: TrackerState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
