"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { nav } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { SolutionArt, type SolutionKey } from "@/components/brand/SolutionArt";

const artFor: Record<string, SolutionKey> = {
  "/solar-panels": "solar",
  "/battery-storage": "battery",
  "/ev-chargers": "ev",
  "/heat-pumps": "heat-pump",
};

export function Header({ theme = "light" }: { theme?: "light" | "dark" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes (state adjustment during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
    setSolutionsOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const onInk = theme === "dark" && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-solar focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-out)]",
          scrolled ? "bg-cream/85 shadow-[0_1px_0_rgba(11,29,51,0.08)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="container-wide flex h-[4.5rem] items-center justify-between gap-3 lg:h-20 lg:gap-6">
          <Logo onInk={onInk} />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.primary.map((item) =>
                item.children ? (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setSolutionsOpen(true)}
                    onMouseLeave={() => setSolutionsOpen(false)}
                  >
                    <button
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors",
                        onInk ? "text-[var(--text-on-ink)] hover:bg-white/10" : "text-ink hover:bg-ink/5",
                      )}
                      aria-expanded={solutionsOpen}
                      aria-haspopup="true"
                      onClick={() => setSolutionsOpen((v) => !v)}
                      onKeyDown={(e) => e.key === "Escape" && setSolutionsOpen(false)}
                    >
                      {item.label}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", solutionsOpen && "rotate-180")} aria-hidden="true" />
                    </button>
                    <AnimatePresence>
                      {solutionsOpen && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute left-1/2 top-full z-50 w-[36rem] -translate-x-1/2 pt-3"
                        >
                          <div className="grid grid-cols-2 gap-1 rounded-[var(--r-lg)] border border-ink/10 bg-white p-2 shadow-[0_30px_80px_-30px_rgba(11,29,51,0.4)]">
                            {item.children.map((c) => (
                              <Link
                                key={c.href}
                                href={c.href}
                                className="group flex items-center gap-4 rounded-[var(--r-md)] p-3 transition-colors hover:bg-cream"
                              >
                                <span className="h-14 w-20 shrink-0 overflow-hidden rounded-[0.6rem] bg-cream-2 ring-1 ring-ink/5">
                                  <SolutionArt kind={artFor[c.href]} />
                                </span>
                                <span>
                                  <span className="block font-display font-semibold text-ink">{c.label}</span>
                                  <span className="block text-[0.85rem] text-muted">{c.blurb}</span>
                                </span>
                              </Link>
                            ))}
                            <Link
                              href="/compare"
                              className="col-span-2 mt-1 flex items-center justify-between rounded-[var(--r-md)] bg-ink px-4 py-3 text-[0.95rem] font-semibold text-cream transition-colors hover:bg-ink-2"
                            >
                              Not sure what you need? Start a comparison
                              <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors",
                        onInk ? "text-[var(--text-on-ink)] hover:bg-white/10" : "text-ink hover:bg-ink/5",
                        pathname === item.href && (onInk ? "bg-white/10" : "bg-ink/5"),
                      )}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/installers/apply"
              className={cn("link-wipe px-3 py-2 text-[0.95rem] font-semibold", onInk ? "text-[var(--text-on-ink)]" : "text-ink")}
            >
              For installers
            </Link>
            <Button href="/compare" size="sm" className="px-5 py-2.5">
              Compare solar
            </Button>
          </div>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <Button href="/compare" size="sm" className="px-3.5 py-2">
              Compare
            </Button>
            <button
              onClick={() => setOpen(true)}
              className={cn("grid h-11 w-11 place-items-center rounded-full", onInk ? "text-[var(--text-on-ink)]" : "text-ink")}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduce ? false : { clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.7, ease: [0.65, 0.01, 0.05, 0.99] }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink text-cream"
          >
            <div className="container-wide flex h-[4.5rem] items-center justify-between">
              <Logo onInk />
              <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full text-cream" aria-label="Close menu">
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="container-wide flex-1 overflow-y-auto pb-10 pt-6">
              <ul className="space-y-1">
                {[
                  { label: "Compare solar", href: "/compare" },
                  { label: "How it works", href: "/how-it-works" },
                  { label: "Solar panels", href: "/solar-panels" },
                  { label: "Battery storage", href: "/battery-storage" },
                  { label: "EV chargers", href: "/ev-chargers" },
                  { label: "Heat pumps", href: "/heat-pumps" },
                  { label: "Approved installers", href: "/approved-installers" },
                  { label: "Tree-planting promise", href: "/tree-planting" },
                  { label: "Why choose us", href: "/why-choose-us" },
                  { label: "About", href: "/about" },
                  { label: "FAQs", href: "/faqs" },
                  { label: "Contact", href: "/contact" },
                ].map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link
                      href={l.href}
                      className={cn(
                        "block border-b border-white/10 py-3.5 font-display text-[1.6rem] font-semibold tracking-tight",
                        l.href === "/compare" && "text-solar",
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <Button href="/compare" size="lg">
                  Compare solar quotes
                </Button>
                <Button href="/installers/apply" variant="outline-light">
                  Become an approved installer
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
