"use server";

import { revalidatePath } from "next/cache";
import { readState, writeState } from "@/lib/store";

export async function updateMonthlyReport(
  month: number,
  field: "portfolioReview" | "updatedRoadmapNotes" | "improvementPlan",
  value: string,
) {
  const state = await readState();
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

  await writeState(state);
  revalidatePath("/monthly");
}
