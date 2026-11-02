"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Ray } from "@/components/brand/Ray";
import { cn } from "@/lib/utils/cn";

const stages = ["Checking your location", "Finding suitable installers", "Checking service coverage", "Preparing your comparison"];

/**
 * Premium matching screen. The visual sequence is paced for ~4s while the real
 * request to /api/enquiries runs in parallel; we only navigate when BOTH are done.
 */
export function Matching({ done, onComplete }: { done: boolean; onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const per = reduce ? 300 : 950;
    const t = setInterval(() => setStage((s) => Math.min(s + 1, stages.length)), per);
    return () => clearInterval(t);
  }, [reduce]);

  useEffect(() => {
    if (done && stage >= stages.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [done, stage, onComplete]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center" role="status" aria-live="polite">
      <div className="relative">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -m-10 rounded-full bg-solar/30 blur-2xl"
          animate={reduce ? undefined : { scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <Ray mood={stage >= stages.length ? "celebrate" : "thinking"} size={180} label="Ray finding your matches" />
      </div>
      <h1 className="mt-8 text-[length:var(--step-4)]">Finding your solar matches…</h1>
      <ul className="mt-8 w-full space-y-3 text-left">
        {stages.map((s, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "todo";
          return (
            <motion.li
              key={s}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: state === "todo" ? 0.45 : 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-[var(--r-md)] bg-white px-5 py-4 ring-1 ring-ink/10"
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-full transition-colors duration-500", state === "done" ? "bg-leaf text-white" : state === "active" ? "bg-solar text-ink" : "bg-cream-2 text-ink/40")}>
                {state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                ) : state === "active" ? (
                  <motion.span className="h-2.5 w-2.5 rounded-full bg-ink" animate={reduce ? undefined : { scale: [1, 1.5, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-ink/20" />
                )}
              </span>
              <span className="font-medium">{s}</span>
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-6 text-[length:var(--step--1)] text-muted">This matches against our approved installer records by location and technology. It is not a live credit or identity check.</p>
    </div>
  );
}
