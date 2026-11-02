"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Ray } from "@/components/brand/Ray";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const points = [
  { title: "Compare multiple installers", body: "Up to four approved installers, one simple request. No chasing, no repeating yourself." },
  { title: "Save time", body: "Skip the hours of searching, calling and waiting for callbacks. We bring the right companies to you." },
  { title: "Make informed decisions", body: "Prices, warranties, equipment and aftercare laid out side by side so you can see the real differences." },
  { title: "Solutions suited to your home", body: "Matching is based on your property and what you want, not on who paid the most to be seen." },
  { title: "Competitive quotations", body: "Installers know they're being compared on quality and price. That tends to bring out their best offer." },
];

export function WhySection() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <section className="section-y overflow-x-clip bg-ink text-[var(--text-on-ink)]" id="why">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow text-solar">Why GoSolarCompare?</p>
            <h2 className="mt-4 text-[length:var(--step-6)] leading-[0.98]">Solar shopping should be simpler.</h2>
          </Reveal>
          <ul className="mt-10 divide-y divide-[var(--border-on-ink)] border-y border-[var(--border-on-ink)]">
            {points.map((p, i) => (
              <li key={p.title}>
                <button
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-expanded={active === i}
                  className={cn(
                    "flex w-full items-start gap-5 py-5 text-left transition-colors",
                    active === i ? "text-[var(--text-on-ink)]" : "text-[var(--text-on-ink-muted)] hover:text-[var(--text-on-ink)]",
                  )}
                >
                  <span className={cn("mt-1 font-display text-[length:var(--step--1)] font-bold tabular-nums", active === i ? "text-solar" : "")}>0{i + 1}</span>
                  <span className="flex-1">
                    <span className="block font-display text-[length:var(--step-2)] font-semibold tracking-tight">{p.title}</span>
                    <AnimatePresence initial={false}>
                      {active === i && (
                        <motion.span
                          className="block overflow-hidden"
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                        >
                          <span className="block pt-2 text-[var(--text-on-ink-muted)]">{p.body}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button href="/why-choose-us" variant="outline-light" className="mt-8">
            More reasons to choose us
          </Button>
        </div>

        <div className="relative lg:col-span-6">
          <Reveal className="relative mx-auto max-w-md">
            <div className="rounded-[2rem] bg-ink-2 p-8 ring-1 ring-white/10">
              <p className="eyebrow text-[var(--text-on-ink-muted)]">The old way</p>
              <ul className="mt-4 space-y-3 text-[var(--text-on-ink-muted)]">
                {["Search for installers one by one", "Fill in six different forms", "Field a week of sales calls", "Try to compare quotes written in six formats", "Hope you picked a good one"].map((t) => (
                  <li key={t} className="flex items-center gap-3 line-through decoration-coral/70 decoration-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="my-7 h-px bg-white/10" />
              <p className="eyebrow text-solar">The GoSolarCompare way</p>
              <ul className="mt-4 space-y-3">
                {["One two-minute request", "Up to four approved installers", "Quotes you can compare side by side", "A tree planted when you're done"].map((t) => (
                  <li key={t} className="flex items-center gap-3 font-medium">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf text-[10px] text-white" aria-hidden="true">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -top-10 right-0 sm:-right-10">
              <Ray mood={active === 4 ? "celebrate" : active >= 2 ? "happy" : "thinking"} size={120} label="Ray reacting to the comparison" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
