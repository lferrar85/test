"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * SIGNATURE: the sun that travels. A soft solar disc that arcs across the
 * viewport as the page scrolls, from sunrise behind the hero to sunset at the
 * final call to action. Decorative, non-interactive and disabled for
 * reduced-motion users.
 */
export function ScrollSun() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });
  const x = useTransform(p, [0, 1], ["78vw", "6vw"]);
  const y = useTransform(p, (v) => `${18 + Math.sin(v * Math.PI) * -12 + v * 60}vh`);
  const scale = useTransform(p, [0, 0.5, 1], [1, 0.55, 1.15]);
  const opacity = useTransform(p, [0, 0.08, 0.9, 1], [0.85, 0.28, 0.28, 0.8]);
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden md:block"
      // Blends over section backgrounds so the sun stays visible without covering content
      style={{ x, y, scale, opacity }}
    >
      <div
        className="h-[22vmin] w-[22vmin] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, #ffe08a 0%, #ffc32b 45%, rgba(255,176,0,0.0) 72%)",
          filter: "blur(16px)",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}
