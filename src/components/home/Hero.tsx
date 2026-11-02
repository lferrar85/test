"use client";

import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, ArrowDown } from "lucide-react";
import { HomeScene } from "@/components/brand/HomeScene";
import { Ray } from "@/components/brand/Ray";
import { PostcodeForm } from "@/components/ui/PostcodeForm";
import { Button } from "@/components/ui/Button";

const words = ["Go", "solar.", "Get", "more", "from", "your", "energy."];

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="grain relative isolate overflow-hidden bg-ink text-[var(--text-on-ink)]">
      {/* Horizon glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{ background: "radial-gradient(60% 50% at 70% 100%, rgba(255,176,0,0.28), transparent 70%)" }}
      />
      <div className="container-wide relative grid min-h-[100svh] items-center gap-10 pb-16 pt-28 lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-32">
        <div className="relative z-10 lg:col-span-6">
          <motion.p
            className="eyebrow text-solar"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Independent UK solar comparison
          </motion.p>
          <h1 className="mt-5 text-[length:var(--step-7)] leading-[0.95]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] pr-[0.22em] align-bottom">
                <motion.span
                  className={`inline-block ${i === 1 ? "text-solar" : ""}`}
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="mt-6 max-w-xl text-[length:var(--step-1)] leading-relaxed text-[var(--text-on-ink-muted)]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Compare trusted solar installers, find the right solution for your home and discover how much you could save.
          </motion.p>

          <motion.div
            className="mt-9 flex items-end gap-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            <div className="hidden shrink-0 sm:block">
              <Ray mood="wave" size={112} label="Ray, the GoSolarCompare sun, waving hello" />
            </div>
            <div className="w-full max-w-xl">
              <PostcodeForm variant="dark" id="hero-postcode" />
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[length:var(--step--1)] text-[var(--text-on-ink-muted)]">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-solar" aria-hidden="true" /> Only approved installers
                </span>
                <span>Free to use</span>
                <span>No obligation</span>
                <Button href="/how-it-works" variant="ghost" size="sm" className="-ml-3 text-[var(--text-on-ink)] hover:bg-white/10" slide={false} icon={<ArrowDown className="h-4 w-4" aria-hidden="true" />}>
                  How it works
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative lg:col-span-6"
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <HomeScene className="drop-shadow-[0_40px_80px_rgba(0,0,0,0.45)]" />
        </motion.div>
      </div>
    </section>
  );
}
