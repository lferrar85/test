"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { JourneyIcon, type JourneyIconName } from "./JourneyIcon";
import { cn } from "@/lib/utils/cn";

export function OptionCard({
  label,
  hint,
  icon,
  selected,
  onSelect,
  multi = false,
  index = 0,
  compact = false,
}: {
  label: string;
  hint?: string;
  icon: JourneyIconName;
  selected: boolean;
  onSelect: () => void;
  multi?: boolean;
  index?: number;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-[var(--r-md)] border-2 bg-white text-left transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-out)]",
        compact ? "px-4 py-3" : "p-5",
        selected ? "border-ink shadow-[0_12px_30px_-16px_rgba(11,29,51,0.4)]" : "border-ink/10 hover:border-ink/40",
      )}
    >
      <span className={cn("grid shrink-0 place-items-center rounded-xl transition-colors duration-300", compact ? "h-10 w-10" : "h-14 w-14", selected ? "bg-solar text-ink" : "bg-cream-2 text-ink group-hover:bg-solar/40")}>
        <JourneyIcon name={icon} className={compact ? "h-6 w-6" : "h-9 w-9"} />
      </span>
      <span className="flex-1">
        <span className={cn("block font-display font-semibold tracking-tight", compact ? "text-[length:var(--step-0)]" : "text-[length:var(--step-1)]")}>{label}</span>
        {hint && <span className="block text-[length:var(--step--1)] text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center border-2 transition-all duration-300",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-ink bg-ink text-cream" : "border-ink/20 text-transparent",
        )}
        aria-hidden="true"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    </motion.button>
  );
}
