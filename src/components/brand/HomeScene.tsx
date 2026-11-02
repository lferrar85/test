"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Hero illustration: a modern UK detached home with roof-integrated solar,
 * a wall-mounted battery and an EV on the drive. Layered for parallax.
 *
 * PHOTOGRAPHY SLOT: replace or layer with licensed drone photography when
 * available — see docs/IMAGERY.md for the shot list and specs.
 */
export function HomeScene({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cloudsX = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const houseY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 50]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  return (
    <div ref={ref} className={cn("relative aspect-[5/4] w-full", className)}>
      <svg viewBox="0 0 800 640" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1d33" />
            <stop offset="55%" stopColor="#1b3a5e" />
            <stop offset="100%" stopColor="#f0b35a" />
          </linearGradient>
          <linearGradient id="hs-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7f1e4" />
            <stop offset="100%" stopColor="#e7dcc4" />
          </linearGradient>
          <linearGradient id="hs-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1b3a5e" />
            <stop offset="100%" stopColor="#0b1d33" />
          </linearGradient>
          <linearGradient id="hs-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b7d4f2" />
            <stop offset="100%" stopColor="#5f8fc2" />
          </linearGradient>
          <radialGradient id="hs-sunglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd45c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffd45c" stopOpacity="0" />
          </radialGradient>
          <clipPath id="hs-clip">
            <rect x="0" y="0" width="800" height="640" rx="36" />
          </clipPath>
        </defs>

        <g clipPath="url(#hs-clip)">
          <rect width="800" height="640" fill="url(#hs-sky)" />
          {/* Sun glow on horizon */}
          <circle cx="600" cy="330" r="190" fill="url(#hs-sunglow)" />

          {/* Clouds */}
          <motion.g style={{ x: cloudsX }} opacity="0.55" fill="#f7f3ea">
            <ellipse cx="160" cy="130" rx="70" ry="16" />
            <ellipse cx="200" cy="118" rx="40" ry="16" />
            <ellipse cx="560" cy="90" rx="60" ry="14" />
            <ellipse cx="590" cy="80" rx="34" ry="14" />
          </motion.g>

          {/* Distant hills */}
          <path d="M0 420 Q150 360 320 400 T640 390 T800 410 L800 640 L0 640Z" fill="#163a52" />
          <path d="M0 450 Q200 400 400 440 T800 430 L800 640 L0 640Z" fill="#1d5a5a" opacity="0.9" />

          {/* House group */}
          <motion.g style={{ y: houseY }}>
            {/* Garage */}
            <rect x="120" y="360" width="150" height="130" fill="url(#hs-wall)" />
            <path d="M110 360 L195 300 L280 360Z" fill="#2a3b52" />
            <rect x="150" y="400" width="90" height="90" rx="4" fill="#1b2c44" />
            <g stroke="#2d4262" strokeWidth="2">
              <line x1="150" y1="420" x2="240" y2="420" />
              <line x1="150" y1="440" x2="240" y2="440" />
              <line x1="150" y1="460" x2="240" y2="460" />
            </g>
            {/* Battery unit on garage wall */}
            <rect x="124" y="395" width="20" height="60" rx="3" fill="#f7f3ea" stroke="#c9bfa8" />
            <rect x="128" y="402" width="12" height="6" rx="1" fill="#1f9d63" />
            <rect x="128" y="412" width="12" height="6" rx="1" fill="#1f9d63" />
            <rect x="128" y="422" width="12" height="6" rx="1" fill="#1f9d63" />
            <rect x="128" y="432" width="12" height="6" rx="1" fill="#c9bfa8" />

            {/* Main house */}
            <rect x="270" y="300" width="300" height="190" fill="url(#hs-wall)" />
            <path d="M255 300 L420 170 L585 300Z" fill="#273a54" />
            {/* Roof solar array */}
            <g className="panel-sweep-svg">
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3, 4, 5].map((col) => {
                  const w = 42, h = 26;
                  const y = 186 + row * (h + 3);
                  const span = ((y - 170) / 130) * 330;
                  const x0 = 420 - span / 2 + 10;
                  const x = x0 + col * (w + 3) * (span / 330);
                  if (x + w > 420 + span / 2 - 10) return null;
                  return <rect key={`${row}-${col}`} x={x} y={y} width={w * (span / 330)} height={h} rx="2" fill="url(#hs-panel)" stroke="#5f8fc2" strokeOpacity="0.5" strokeWidth="1" />;
                }),
              )}
              {/* sunlight sweep */}
              {!reduce && (
                <motion.rect
                  x="250"
                  y="170"
                  width="60"
                  height="140"
                  fill="#ffe08a"
                  opacity="0.28"
                  style={{ skewX: -18 }}
                  animate={{ x: [-80, 380] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: [0.65, 0.01, 0.05, 0.99], repeatDelay: 1.5 }}
                />
              )}
            </g>
            {/* Windows */}
            <rect x="300" y="330" width="60" height="70" rx="3" fill="url(#hs-glass)" />
            <rect x="480" y="330" width="60" height="70" rx="3" fill="url(#hs-glass)" />
            <rect x="300" y="420" width="60" height="70" rx="3" fill="url(#hs-glass)" />
            <rect x="480" y="420" width="60" height="70" rx="3" fill="url(#hs-glass)" />
            {/* Warm lit window */}
            <rect x="480" y="330" width="60" height="70" rx="3" fill="#ffd45c" opacity="0.75" />
            {/* Door */}
            <rect x="395" y="410" width="50" height="80" rx="3" fill="#0b1d33" />
            <circle cx="435" cy="452" r="3" fill="#ffc32b" />
            {/* Canopy */}
            <rect x="385" y="400" width="70" height="8" rx="2" fill="#273a54" />
          </motion.g>

          {/* Ground */}
          <motion.g style={{ y: fgY }}>
            <rect x="0" y="490" width="800" height="150" fill="#1f9d63" />
            <rect x="0" y="490" width="800" height="150" fill="url(#hs-sky)" opacity="0.15" />
            {/* Drive */}
            <path d="M80 640 L130 490 L290 490 L360 640Z" fill="#d9cfb8" />
            {/* EV */}
            <g transform="translate(150 560)">
              <rect x="0" y="10" width="150" height="40" rx="16" fill="#f7f3ea" />
              <path d="M30 12 L55 -10 L110 -10 L130 12Z" fill="#f7f3ea" />
              <path d="M38 10 L58 -6 L105 -6 L120 10Z" fill="url(#hs-glass)" />
              <circle cx="35" cy="52" r="13" fill="#0b1d33" />
              <circle cx="115" cy="52" r="13" fill="#0b1d33" />
              <circle cx="35" cy="52" r="5" fill="#8d97a8" />
              <circle cx="115" cy="52" r="5" fill="#8d97a8" />
              <rect x="138" y="22" width="12" height="8" rx="2" fill="#ffc32b" />
              {/* charger cable + wallbox */}
              <path d="M150 30 q30 -40 40 -70" fill="none" stroke="#0b1d33" strokeWidth="3" />
              <rect x="180" y="-50" width="22" height="30" rx="5" fill="#f7f3ea" stroke="#c9bfa8" />
              <motion.circle cx="191" cy="-40" r="3.5" fill="#1f9d63" animate={reduce ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            </g>
            {/* Tree */}
            <rect x="676" y="440" width="14" height="80" fill="#5a3a22" />
            <circle cx="683" cy="430" r="46" fill="#157a4b" />
            <circle cx="660" cy="450" r="30" fill="#1f9d63" />
            <circle cx="706" cy="452" r="28" fill="#1f9d63" />
            {/* Hedge */}
            <rect x="400" y="500" width="380" height="24" rx="12" fill="#157a4b" />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
