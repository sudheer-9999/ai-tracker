"use client";

import type { Reflection } from "@/lib/types";
import { useTracker } from "@/components/TrackerProvider";

interface ReflectionFormProps {
  day: number;
  reflection: Reflection;
  timeSpentMinutes: number;
  disabled?: boolean;
}

const REFLECTION_FIELDS: { key: keyof Reflection; label: string }[] = [
  { key: "built", label: "What did you build today?" },
  { key: "learned", label: "What did you learn?" },
  { key: "difficult", label: "What was difficult?" },
  { key: "improve", label: "What would you improve?" },
  { key: "blockers", label: "Any blockers?" },
];

export function ReflectionForm({
  day,
  reflection,
  timeSpentMinutes,
  disabled,
}: ReflectionFormProps) {
  const { saveReflection, saveTimeSpent } = useTracker();

  function handleReflectionBlur(field: keyof Reflection, value: string) {
    if (value === reflection[field]) return;
    saveReflection(day, field, value);
  }

  function handleTimeBlur(value: string) {
    const minutes = parseInt(value, 10) || 0;
    if (minutes === timeSpentMinutes) return;
    saveTimeSpent(day, minutes);
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="time-spent"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Time Spent (minutes)
        </label>
        <input
          id="time-spent"
          type="number"
          min={0}
          defaultValue={timeSpentMinutes || ""}
          disabled={disabled}
          onBlur={(e) => handleTimeBlur(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="e.g. 120"
        />
      </div>

      {REFLECTION_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label
            htmlFor={`reflection-${key}`}
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
          <textarea
            id={`reflection-${key}`}
            rows={2}
            defaultValue={reflection[key]}
            disabled={disabled}
            onBlur={(e) => handleReflectionBlur(key, e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      ))}
    </div>
  );
}
