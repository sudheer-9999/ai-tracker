"use server";

import { revalidatePath } from "next/cache";
import { readState, writeState } from "@/lib/store";

export async function updateWeeklyReport(
  week: number,
  field: "githubActivity" | "actionPlan",
  value: string,
) {
  const state = await readState();
  const key = String(week);
  const report = state.weeklyReports[key];
  if (!report) return;

  if (field === "githubActivity") {
    report.githubActivity = value;
  } else {
    report.actionPlan = value.split("\n").filter(Boolean);
  }

  await writeState(state);
  revalidatePath("/weekly");
}
