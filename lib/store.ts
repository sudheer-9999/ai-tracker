import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createInitialState, type TrackerState } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_PATH = join(DATA_DIR, "tracker-state.json");

async function ensureDataFile(): Promise<void> {
  try {
    await readFile(DATA_PATH, "utf-8");
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    const initial = createInitialState();
    await writeFile(DATA_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export async function readState(): Promise<TrackerState> {
  await ensureDataFile();
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as TrackerState;
}

export async function writeState(state: TrackerState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(state, null, 2), "utf-8");
}

export async function updateState(
  updater: (state: TrackerState) => TrackerState,
): Promise<TrackerState> {
  const state = await readState();
  const updated = updater(state);
  await writeState(updated);
  return updated;
}

export function getDayProgressKey(day: number): string {
  return String(day);
}
