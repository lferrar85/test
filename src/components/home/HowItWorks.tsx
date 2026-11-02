"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    n: "01",
    title: "Tell us about your home",
    body: "Your postcode, property type, roof and what you're interested in. It takes about two minutes.",
    art: (
      <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
        <path d="M20 70 L80 22 L140 70Z" fill="#273a54" />
        <rect x="34" y="70" width="92" height="40" fill="#f3ecdc" />
        <rect x="46" y="80" width="22" height="30" rx="2" fill="#0b1d33" />
        <rect x="86" y="80" width="26" height="18" rx="2" fill="#b7d4f2" />
        <motion.circle cx="128" cy="26" r="14" fill="#ffc32b" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Compare approved installers",
    body: "We match you with approved installers that cover your area. Compare their quotes, warranties and aftercare side by side.",
    art: (
      <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.g key={i} initial={{ y: 0 }} animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, delay: i * 0.3, repeat: Infinity }}>
            <rect x={14 + i * 46} y="24" width="40" height="72" rx="8" fill="#fff" stroke="#0b1d33" strokeOpacity="0.15" />
            <rect x={22 + i * 46} y="34" width="24" height="6" rx="3" fill="#0b1d33" />
            <rect x={22 + i * 46} y="46" width="16" height="4" rx="2" fill="#c9bfa8" />
            <rect x={22 + i * 46} y="54" width="20" height="4" rx="2" fill="#c9bfa8" />
            <circle cx={34 + i * 46} cy="80" r="7" fill={i === 1 ? "#1f9d63" : "#ffc32b"} />
          </motion.g>
        ))}
      </svg>
    ),
  },
  {
    n: "03",
    title: "Choose your solar solution",
    body: "Pick the installer and system that suits you. We plant a tree when your installation is complete.",
    art: <TickArt />,
  },
];

function TickArt() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <svg ref={ref} viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <circle cx="80" cy="60" r="40" fill="#1f9d63" opacity="0.15" />
      <motion.path
        d="M56 62 L72 78 L106 44"
        fill="none" stroke="#1f9d63" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 0.9, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
      />
    </svg>
  );
}

export function HowItWorks() {
  const lineRef = useRef<SVGSVGElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  return (
    <section className="section-y bg-cream-2" id="how-it-works">
      <div className="container-x">
        <SectionHeading eyebrow="How it works" title="Three steps. One brighter home." lead="Comparing solar installers should feel as simple as comparing anything else." />
        <div className="relative mt-16">
          <svg ref={lineRef} className="absolute left-0 top-10 hidden h-1 w-full lg:block" viewBox="0 0 100 1" preserveAspectRatio="none" aria-hidden="true">
            <motion.line
              x1="0" y1="0.5" x2="100" y2="0.5" stroke="#0b1d33" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke"
              initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: lineInView || reduce ? 1 : 0 }} transition={{ duration: 1.6, ease: [0.23, 1, 0.32, 1] }}
            />
          </svg>
          <ol className="grid gap-8 lg:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.12} className="relative">
                <div className="flex items-center gap-4">
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-ink font-display text-[length:var(--step-2)] font-bold text-solar">{s.n}</span>
                  <div className="h-24 w-36 overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">{s.art}</div>
                </div>
                <h3 className="mt-7 text-[length:var(--step-2)]">{s.title}</h3>
                <p className="mt-3 max-w-sm text-muted">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal className="mt-14">
          <Button href="/compare" size="lg">Start comparing</Button>
        </Reveal>
      </div>
    </section>
  );
}
