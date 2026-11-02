"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type QA = { q: string; a: React.ReactNode };

export function Accordion({ items, className, onInk = false }: { items: QA[]; className?: string; onInk?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  const reduce = useReducedMotion();
  return (
    <div className={cn("divide-y", onInk ? "divide-[var(--border-on-ink)]" : "divide-ink/10", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        const btnId = `${base}-b-${i}`;
        const panelId = `${base}-p-${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "group flex w-full items-center justify-between gap-6 py-6 text-left font-display text-[length:var(--step-1)] font-semibold tracking-[-0.015em] transition-colors",
                  onInk ? "text-[var(--text-on-ink)] hover:text-solar" : "text-ink hover:text-leaf-2",
                )}
              >
                <span>{it.q}</span>
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out)]",
                    onInk ? "border-[var(--border-on-ink)]" : "border-ink/15",
                    isOpen && (onInk ? "rotate-45 bg-solar text-ink border-solar" : "rotate-45 bg-ink text-cream border-ink"),
                  )}
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <div className={cn("max-w-2xl pb-7 text-[length:var(--step-0)] leading-relaxed", onInk ? "text-[var(--text-on-ink-muted)]" : "text-muted")}>{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
