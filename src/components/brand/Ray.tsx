"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils/cn";

export type RayMood = "wave" | "happy" | "thinking" | "celebrate" | "sleepy" | "neutral";

type Props = {
  mood?: RayMood;
  size?: number | string;
  className?: string;
  /** Follow the cursor with the eyes (desktop, pointer: fine only). */
  track?: boolean;
  /** Idle bobbing animation. */
  idle?: boolean;
  label?: string;
};

/**
 * Ray — the GoSolarCompare sun. An original brand character built as a single
 * SVG so it renders identically on web, social and print. Moods are driven by
 * props; blinking, bobbing and eye tracking are motion-driven and respect
 * prefers-reduced-motion.
 */
export function Ray({ mood = "happy", size = 160, className, track = true, idle = true, label }: Props) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [blink, setBlink] = useState(false);

  // Eye tracking
  const ex = useMotionValue(0);
  const ey = useMotionValue(0);
  const sx = useSpring(ex, { stiffness: 120, damping: 14 });
  const sy = useSpring(ey, { stiffness: 120, damping: 14 });

  useEffect(() => {
    if (!track || reduce) return;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const max = 4.5;
        const k = Math.min(1, dist / 400);
        ex.set((dx / dist) * max * k);
        ey.set((dy / dist) * max * k);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [track, reduce, ex, ey]);

  // Blinking
  useEffect(() => {
    if (reduce || mood === "sleepy") return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, 2800 + Math.random() * 3200);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce, mood]);

  const eyes = eyeShape(mood, blink);
  const mouth = mouthPath(mood);
  const bob = idle && !reduce;

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("select-none overflow-visible", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      animate={bob ? { y: [0, -6, 0] } : undefined}
      transition={bob ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <defs>
        <radialGradient id={`${uid}-body`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="55%" stopColor="#ffc32b" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id={`${uid}-ray`} cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#ffd45c" />
          <stop offset="100%" stopColor="#ffb000" />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Glow */}
      <circle cx="100" cy="100" r="72" fill="#ffc32b" opacity="0.18" filter={`url(#${uid}-soft)`} />

      {/* Rays */}
      <motion.g
        style={{ originX: "100px", originY: "100px" }}
        animate={
          reduce
            ? undefined
            : mood === "celebrate"
              ? { rotate: [0, 360] }
              : mood === "thinking"
                ? { rotate: [0, -6, 0] }
                : { rotate: [0, 8, 0] }
        }
        transition={
          mood === "celebrate"
            ? { duration: 6, repeat: Infinity, ease: "linear" }
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30} 100 100)`}>
            <motion.rect
              x="93"
              y="8"
              width="14"
              height="30"
              rx="7"
              fill={`url(#${uid}-ray)`}
              animate={
                reduce
                  ? undefined
                  : mood === "celebrate"
                    ? { scaleY: [1, 1.25, 1] }
                    : mood === "sleepy"
                      ? { scaleY: 0.85 }
                      : { scaleY: [1, 1.08, 1] }
              }
              style={{ originX: "100px", originY: "100px" }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
            />
          </g>
        ))}
      </motion.g>

      {/* Body */}
      <circle cx="100" cy="100" r="58" fill={`url(#${uid}-body)`} />
      <circle cx="100" cy="100" r="58" fill="none" stroke="#e08a00" strokeOpacity="0.25" strokeWidth="1.5" />
      {/* Specular highlight */}
      <ellipse cx="78" cy="72" rx="16" ry="9" fill="#fff" opacity="0.35" transform="rotate(-30 78 72)" />

      {/* Cheeks */}
      <ellipse cx="70" cy="112" rx="9" ry="5.5" fill="#ff6b4a" opacity={mood === "sleepy" ? 0.15 : 0.28} />
      <ellipse cx="130" cy="112" rx="9" ry="5.5" fill="#ff6b4a" opacity={mood === "sleepy" ? 0.15 : 0.28} />

      {/* Eyes */}
      <motion.g style={{ x: sx, y: sy }}>
        {eyes}
      </motion.g>

      {/* Brows (thinking) */}
      {mood === "thinking" && (
        <path d="M70 76 q10 -7 20 -2" fill="none" stroke="#0b1d33" strokeWidth="4" strokeLinecap="round" />
      )}

      {/* Mouth */}
      <motion.path
        d={mouth}
        fill={mood === "celebrate" ? "#0b1d33" : "none"}
        stroke="#0b1d33"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ d: mouth }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      />
      {mood === "celebrate" && <path d="M86 118 q14 10 28 0 q-14 6 -28 0z" fill="#ff6b4a" />}

      {/* Waving hand */}
      {mood === "wave" && (
        <motion.g
          style={{ originX: "154px", originY: "118px" }}
          animate={reduce ? undefined : { rotate: [0, 22, -8, 22, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
        >
          <path d="M152 118 q18 -14 22 -32" fill="none" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
          <circle cx="175" cy="84" r="9" fill="#ffc32b" stroke="#e08a00" strokeOpacity="0.3" strokeWidth="1.5" />
        </motion.g>
      )}

      {/* Sleep z's */}
      {mood === "sleepy" && !reduce && (
        <motion.text
          x="146"
          y="70"
          fontFamily="var(--font-display)"
          fontWeight="800"
          fontSize="18"
          fill="#0b1d33"
          animate={{ y: [70, 58], opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          z
        </motion.text>
      )}
    </motion.svg>
  );
}

function eyeShape(mood: RayMood, blink: boolean) {
  const ink = "#0b1d33";
  if (blink || mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M74 96 q8 5 16 0" />
        <path d="M110 96 q8 5 16 0" />
      </g>
    );
  }
  if (mood === "happy" || mood === "celebrate" || mood === "wave") {
    return (
      <g stroke={ink} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M73 97 q9 -11 18 0" />
        <path d="M109 97 q9 -11 18 0" />
      </g>
    );
  }
  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="82" cy="95" r="5.5" />
        <path d="M110 96 q8 -3 16 0" stroke={ink} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="84" cy="93" r="1.6" fill="#fff" />
      </g>
    );
  }
  // neutral
  return (
    <g fill={ink}>
      <circle cx="82" cy="95" r="6" />
      <circle cx="118" cy="95" r="6" />
      <circle cx="84" cy="93" r="1.8" fill="#fff" />
      <circle cx="120" cy="93" r="1.8" fill="#fff" />
    </g>
  );
}

function mouthPath(mood: RayMood) {
  switch (mood) {
    case "celebrate":
      return "M84 114 q16 22 32 0 z";
    case "thinking":
      return "M94 120 q6 3 12 -1";
    case "sleepy":
      return "M92 120 q8 4 16 0";
    case "neutral":
      return "M88 118 q12 8 24 0";
    default:
      return "M84 115 q16 16 32 0";
  }
}
