import { SKILL_LABELS, type SkillCategory } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";

interface SkillBarProps {
  skill: SkillCategory;
  level: number;
}

export function SkillBar({ skill, level }: SkillBarProps) {
  return (
    <ProgressBar
      label={SKILL_LABELS[skill]}
      value={level}
      max={100}
      showPercent
    />
  );
}
