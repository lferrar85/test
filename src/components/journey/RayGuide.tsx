"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Ray, type RayMood } from "@/components/brand/Ray";

export function RayGuide({ mood, message, size = 150 }: { mood: RayMood; message: string; size?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-6">
      <div className="shrink-0">
        <Ray mood={mood} size={size} label="Ray, your solar guide" />
      </div>
      <div className="relative max-w-xs rounded-[1.25rem] rounded-bl-md bg-white px-5 py-4 text-[length:var(--step-0)] font-medium text-ink shadow-[0_12px_40px_-20px_rgba(11,29,51,0.35)] ring-1 ring-ink/10 lg:rounded-bl-[1.25rem] lg:rounded-tl-md" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
