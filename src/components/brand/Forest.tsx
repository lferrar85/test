"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Animated forest for the tree-planting promise. Trees grow in on view.
 * In-view detection is on the <svg> (SVG <g> elements have no layout box).
 * Purely illustrative: counts are never derived from this artwork.
 */
export function Forest({ trees = 14, className }: { trees?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = reduce || inView;
  const items = Array.from({ length: trees }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    return {
      x: 40 + i * (1520 / Math.max(1, trees - 1)) + (r - 0.5) * 40,
      h: 70 + r * 70,
      tone: i % 3 === 0 ? "#157a4b" : i % 3 === 1 ? "#1f9d63" : "#2bb673",
      delay: (i % 7) * 0.08 + r * 0.2,
    };
  });
  return (
    <svg ref={ref} viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="forest-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f9d63" />
          <stop offset="100%" stopColor="#157a4b" />
        </linearGradient>
      </defs>
      <ellipse cx="800" cy="240" rx="840" ry="40" fill="url(#forest-ground)" />
      {items.map((t, i) => (
        <motion.g
          key={i}
          style={{ originX: `${t.x}px`, originY: "230px" }}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: t.delay }}
        >
          <rect x={t.x - 4} y={230 - t.h * 0.35} width="8" height={t.h * 0.35} rx="2" fill="#5a3a22" />
          <path d={`M${t.x} ${230 - t.h} L${t.x + t.h * 0.42} ${230 - t.h * 0.3} L${t.x - t.h * 0.42} ${230 - t.h * 0.3}Z`} fill={t.tone} />
          <path d={`M${t.x} ${230 - t.h * 0.8} L${t.x + t.h * 0.34} ${230 - t.h * 0.2} L${t.x - t.h * 0.34} ${230 - t.h * 0.2}Z`} fill={t.tone} opacity="0.92" />
        </motion.g>
      ))}
    </svg>
  );
}

/** A single seed-to-tree growth animation used in the promise explainer. */
export function GrowingTree({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = reduce || inView;
  const t = { duration: 1.4, ease: [0.23, 1, 0.32, 1] as const };
  return (
    <svg ref={ref} viewBox="0 0 200 240" className={className} aria-hidden="true">
      <ellipse cx="100" cy="222" rx="70" ry="12" fill="#157a4b" opacity="0.35" />
      <motion.rect
        x="94" y="120" width="12" height="100" rx="4" fill="#5a3a22"
        style={{ originY: "220px", originX: "100px" }}
        initial={reduce ? false : { scaleY: 0 }}
        animate={{ scaleY: show ? 1 : 0 }} transition={{ ...t, delay: 0.2 }}
      />
      {[
        { cy: 120, r: 48, c: "#157a4b", d: 0.8 },
        { cy: 90, r: 40, c: "#1f9d63", d: 1.0 },
        { cy: 60, r: 30, c: "#2bb673", d: 1.2 },
      ].map((b, i) => (
        <motion.circle
          key={i} cx="100" cy={b.cy} r={b.r} fill={b.c}
          style={{ originX: "100px", originY: `${b.cy}px` }}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: show ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 12, delay: b.d }}
        />
      ))}
      <motion.circle
        cx="100" cy="212" r="7" fill="#ffc32b"
        initial={reduce ? false : { scale: 1, opacity: 1 }}
        animate={show ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
      />
    </svg>
  );
}
