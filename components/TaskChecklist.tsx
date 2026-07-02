"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DayPlan, DayProgress } from "@/lib/types";
import { toggleTask } from "@/app/today/actions";

interface TaskChecklistProps {
  dayPlan: DayPlan;
  progress: DayProgress;
  day: number;
}

export function TaskChecklist({ dayPlan, progress, day }: TaskChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticProgress, setOptimisticProgress] = useOptimistic(
    progress,
    (state, taskId: string) => {
      const completed = state.tasksCompleted.includes(taskId);
      return {
        ...state,
        tasksCompleted: completed
          ? state.tasksCompleted.filter((id) => id !== taskId)
          : [...state.tasksCompleted, taskId],
      };
    },
  );

  function handleToggle(taskId: string) {
    startTransition(async () => {
      setOptimisticProgress(taskId);
      await toggleTask(day, taskId);
      router.refresh();
    });
  }

  return (
    <ul className="space-y-2">
      {dayPlan.tasks.map((task) => {
        const checked = optimisticProgress.tasksCompleted.includes(task.id);
        return (
          <li key={task.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              id={`task-${task.id}`}
              checked={checked}
              disabled={isPending || optimisticProgress.status === "completed"}
              onChange={() => handleToggle(task.id)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100"
            />
            <label
              htmlFor={`task-${task.id}`}
              className={`text-sm ${
                checked
                  ? "text-zinc-400 line-through dark:text-zinc-500"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {task.label}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
