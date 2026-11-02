"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { RayMood } from "@/components/brand/Ray";
import { Button } from "@/components/ui/Button";
import { OptionCard } from "./OptionCard";
import { RayGuide } from "./RayGuide";
import { ContactStep, type ContactValues } from "./ContactStep";
import { Matching } from "./Matching";
import { currentOptions, interestOptions, orientationOptions, ownershipOptions, propertyOptions, roofTypeOptions, timingOptions, PRIVACY_VERSION } from "@/lib/journey/options";
import { clearJourney, initialJourney, loadJourney, saveJourney, STEP_COUNT, type JourneyState } from "@/lib/journey/state";
import { isValidUkPostcode, normalisePostcode } from "@/lib/utils/postcode";
import type { Interest } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

const titles: Record<number, { eyebrow: string; title: string; help?: string }> = {
  1: { eyebrow: "Step 1", title: "Where is your home?", help: "We use your postcode to find approved installers that cover your area." },
  2: { eyebrow: "Step 2", title: "What type of property is it?" },
  3: { eyebrow: "Step 3", title: "Tell us about your roof", help: "A rough idea is fine. The installer will survey it properly." },
  4: { eyebrow: "Step 4", title: "What do you already have?", help: "Select everything that applies, or skip if none." },
  5: { eyebrow: "Step 5", title: "What are you interested in?", help: "Choose as many as you like." },
  6: { eyebrow: "Step 6", title: "Do you own the property?" },
  7: { eyebrow: "Step 7", title: "When are you hoping to go ahead?" },
  8: { eyebrow: "Step 8", title: "Where should installers send your quotes?" },
};

const rayLines: Record<number, { mood: RayMood; text: string }> = {
  1: { mood: "wave", text: "Hello! I'm Ray. Pop in your postcode and we'll find approved installers near you." },
  2: { mood: "happy", text: "Lovely. What kind of home are we working with?" },
  3: { mood: "thinking", text: "Roofs matter. South-facing is ideal, but east and west work well too." },
  4: { mood: "neutral", text: "This helps installers design around what you've already got." },
  5: { mood: "happy", text: "Now the fun part. What would you like to compare?" },
  6: { mood: "neutral", text: "Nearly there. Installers need to know who they'll be dealing with." },
  7: { mood: "thinking", text: "No pressure. 'Just researching' is a perfectly good answer." },
  8: { mood: "happy", text: "Last step. Your details only go to the installers we match you with." },
};

const noop = () => () => {};

/** Renders the journey only on the client so saved answers can be restored without a hydration mismatch. */
export function Journey(props: { initialPostcode?: string; initialInterest?: string }) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return <JourneyFrame progress={0} stepLabel="Loading"><div className="min-h-[50vh]" aria-busy="true" /></JourneyFrame>;
  return <JourneyInner {...props} />;
}

function initialState(initialPostcode?: string, initialInterest?: string): JourneyState {
  let s: JourneyState = loadJourney() ?? initialJourney;
  if (initialPostcode && isValidUkPostcode(initialPostcode)) {
    s = { ...s, postcode: normalisePostcode(initialPostcode), step: Math.max(s.step, 2) };
  }
  const validInterest = interestOptions.find((o) => o.value === initialInterest)?.value;
  if (validInterest && !s.interests.includes(validInterest)) s = { ...s, interests: [...s.interests, validInterest] };
  return s;
}

function JourneyInner({ initialPostcode, initialInterest }: { initialPostcode?: string; initialInterest?: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [state, setState] = useState<JourneyState>(() => initialState(initialPostcode, initialInterest));
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [rayOverride, setRayOverride] = useState<{ mood: RayMood; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; reference: string } | null>(null);
  const [matching, setMatching] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    saveJourney(state);
  }, [state]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [state.step, reduce]);

  const go = useCallback((to: number) => {
    setDir(to > state.step ? 1 : -1);
    setError(null);
    setRayOverride(null);
    setState((s) => ({ ...s, step: to }));
  }, [state.step]);

  const next = useCallback(() => go(Math.min(state.step + 1, STEP_COUNT)), [go, state.step]);
  const back = useCallback(() => go(Math.max(state.step - 1, 1)), [go, state.step]);

  const react = (mood: RayMood, text: string) => setRayOverride({ mood, text });
  const autoAdvance = (delay = 420) => {
    window.setTimeout(() => next(), reduce ? 0 : delay);
  };

  const validateAndNext = () => {
    const s = state;
    if (s.step === 1) {
      const pc = normalisePostcode(s.postcode);
      if (!isValidUkPostcode(pc)) return setError("Please enter a valid UK postcode, e.g. SW1A 1AA");
      setState((x) => ({ ...x, postcode: pc }));
    }
    if (s.step === 2 && !s.propertyType) return setError("Choose your property type to continue");
    if (s.step === 3 && !s.roofType) return setError("Choose your roof type to continue");
    if (s.step === 5 && s.interests.length === 0) return setError("Choose at least one option, or 'Not sure yet'");
    if (s.step === 6 && !s.ownership) return setError("Let us know your situation to continue");
    if (s.step === 7 && !s.timing) return setError("Choose a rough timeframe to continue");
    next();
  };

  const submit = async (v: ContactValues) => {
    setSubmitting(true);
    setServerError(null);
    const payload = {
      postcode: normalisePostcode(v.postcode),
      propertyType: state.propertyType,
      roof: { type: state.roofType, orientation: state.roofOrientation ?? "unsure" },
      current: state.current,
      interests: state.interests,
      ownership: state.ownership,
      timing: state.timing,
      contact: { name: v.name, email: v.email, phone: v.phone, notes: v.notes || "" },
      consent: { shareWithInstallers: true, marketing: v.marketing, privacyVersion: PRIVACY_VERSION },
      website: v.website ?? "",
    };
    setMatching(true);
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult({ id: data.id, reference: data.reference });
    } catch (e) {
      setMatching(false);
      setServerError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const finish = useCallback(() => {
    if (!result) return;
    clearJourney();
    router.push(`/compare/results?id=${encodeURIComponent(result.id)}`);
  }, [result, router]);

  const progress = useMemo(() => (state.step - 1) / STEP_COUNT, [state.step]);
  const ray = rayOverride ?? rayLines[state.step];
  const t = titles[state.step];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : 40 * d }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : -40 * d }),
  };

  if (matching) {
    return (
      <JourneyFrame progress={1} stepLabel="Matching">
        <div className="pb-10 pt-14">
          <Matching done={!!result} onComplete={finish} />
          {serverError && <p role="alert" className="error-text mt-6 text-center">{serverError}</p>}
        </div>
      </JourneyFrame>
    );
  }

  return (
    <JourneyFrame progress={progress} stepLabel={`Step ${state.step} of ${STEP_COUNT}`}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4 lg:pt-6">
          <RayGuide mood={ray.mood} message={ray.text} />
        </aside>
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section
              key={state.step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              aria-labelledby="journey-heading"
            >
              <p className="eyebrow text-leaf-2">{t.eyebrow}</p>
              <h1 id="journey-heading" ref={headingRef} tabIndex={-1} className="mt-3 text-[length:var(--step-4)] outline-none">
                {t.title}
              </h1>
              {t.help && <p className="mt-3 max-w-xl text-muted">{t.help}</p>}

              <div className="mt-8">
                {state.step === 1 && (
                  <div className="max-w-md">
                    <label htmlFor="j-postcode" className="label">Postcode</label>
                    <input
                      id="j-postcode"
                      autoFocus
                      autoComplete="postal-code"
                      className="field text-[length:var(--step-1)] font-semibold tracking-wide"
                      placeholder="e.g. SW1A 1AA"
                      value={state.postcode}
                      onChange={(e) => setState((s) => ({ ...s, postcode: e.target.value.toUpperCase() }))}
                      onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
                      aria-invalid={!!error}
                      aria-describedby={error ? "j-error" : undefined}
                    />
                  </div>
                )}

                {state.step === 2 && (
                  <div role="radiogroup" aria-label="Property type" className="grid gap-3 sm:grid-cols-2">
                    {propertyOptions.map((o, i) => (
                      <OptionCard key={o.value} index={i} {...o} selected={state.propertyType === o.value}
                        onSelect={() => { setState((s) => ({ ...s, propertyType: o.value })); react("happy", o.value === "flat" ? "Flats can work, though you'll usually need the freeholder's permission." : "Great choice of home. Let's talk roofs."); autoAdvance(); }} />
                    ))}
                  </div>
                )}

                {state.step === 3 && (
                  <div className="space-y-8">
                    <div role="radiogroup" aria-label="Roof type" className="grid gap-3 sm:grid-cols-3">
                      {roofTypeOptions.map((o, i) => (
                        <OptionCard key={o.value} index={i} {...o} selected={state.roofType === o.value}
                          onSelect={() => { setState((s) => ({ ...s, roofType: o.value })); react("thinking", o.value === "unsure" ? "No problem, the installer will take a look." : "Noted. Which way does it mostly face, if you know?"); }} />
                      ))}
                    </div>
                    <AnimatePresence>
                      {state.roofType && (
                        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          <p className="label">Roof orientation <span className="font-normal text-muted">(if known)</span></p>
                          <div role="radiogroup" aria-label="Roof orientation" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {orientationOptions.map((o, i) => (
                              <OptionCard key={o.value} index={i} compact {...o} selected={state.roofOrientation === o.value}
                                onSelect={() => { setState((s) => ({ ...s, roofOrientation: o.value })); react("happy", o.value === "north" ? "North-facing roofs produce less, but installers can often use another roof face." : "Perfect, that helps a lot."); }} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {state.step === 4 && (
                  <div role="group" aria-label="Existing equipment" className="grid gap-3 sm:grid-cols-2">
                    {currentOptions.map((o, i) => (
                      <OptionCard key={o.key} index={i} multi label={o.label} icon={o.icon} selected={state.current[o.key]}
                        onSelect={() => { setState((s) => ({ ...s, current: { ...s.current, [o.key]: !s.current[o.key] } })); react("happy", "Good to know. Anything else?"); }} />
                    ))}
                  </div>
                )}

                {state.step === 5 && (
                  <div role="group" aria-label="What you're interested in" className="grid gap-3 sm:grid-cols-2">
                    {interestOptions.map((o, i) => (
                      <OptionCard key={o.value} index={i} multi {...o} selected={state.interests.includes(o.value)}
                        onSelect={() => {
                          setState((s) => {
                            let interests: Interest[];
                            if (o.value === "unsure") interests = s.interests.includes("unsure") ? [] : ["unsure"];
                            else interests = s.interests.includes(o.value) ? s.interests.filter((x) => x !== o.value) : [...s.interests.filter((x) => x !== "unsure"), o.value];
                            return { ...s, interests };
                          });
                          react("celebrate", o.value === "unsure" ? "Totally fine. Installers will talk you through the options." : "Excellent. Our approved installers can quote for that.");
                        }} />
                    ))}
                  </div>
                )}

                {state.step === 6 && (
                  <div role="radiogroup" aria-label="Ownership" className="grid gap-3 sm:grid-cols-3">
                    {ownershipOptions.map((o, i) => (
                      <OptionCard key={o.value} index={i} {...o} selected={state.ownership === o.value}
                        onSelect={() => { setState((s) => ({ ...s, ownership: o.value })); react("happy", o.value === "other" ? "Thanks. Installers may ask who'll be signing the contract." : "Thanks, that's noted."); autoAdvance(); }} />
                    ))}
                  </div>
                )}

                {state.step === 7 && (
                  <div role="radiogroup" aria-label="Timing" className="grid gap-3 sm:grid-cols-2">
                    {timingOptions.map((o, i) => (
                      <OptionCard key={o.value} index={i} {...o} selected={state.timing === o.value}
                        onSelect={() => { setState((s) => ({ ...s, timing: o.value })); react("happy", o.value === "researching" ? "Smart. Quotes are free and there's no obligation." : "Great. Installers will tell you their earliest availability."); autoAdvance(); }} />
                    ))}
                  </div>
                )}

                {state.step === 8 && (
                  <ContactStep
                    defaults={state.contact}
                    postcode={state.postcode}
                    onBack={back}
                    onSubmit={submit}
                    submitting={submitting}
                    serverError={serverError}
                  />
                )}
              </div>

              {error && <p id="j-error" role="alert" className="error-text mt-4">{error}</p>}

              {state.step < 8 && (
                <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink/10 pt-6">
                  <Button type="button" variant="ghost" onClick={back} disabled={state.step === 1} slide={false} className={cn(state.step === 1 && "invisible")}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </Button>
                  <Button type="button" size="lg" onClick={validateAndNext} slide={false} icon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
                    {state.step === 4 && !Object.values(state.current).some(Boolean) ? "None of these" : "Continue"}
                  </Button>
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
    </JourneyFrame>
  );
}

function JourneyFrame({ children, progress, stepLabel }: { children: React.ReactNode; progress: number; stepLabel: string }) {
  return (
    <div className="min-h-[100svh] bg-cream">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Logo />
          <span className="hidden text-[length:var(--step--1)] font-semibold text-muted sm:block" aria-live="polite">{stepLabel}</span>
          <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[length:var(--step--1)] font-semibold text-ink hover:bg-ink/5">
            Save &amp; exit <X className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="h-1 w-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progress">
          <motion.div className="h-full bg-solar" initial={false} animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} />
        </div>
      </header>
      <main id="main" className="container-x py-10 lg:py-16">{children}</main>
      <footer className="container-x pb-10 text-[length:var(--step--2)] text-muted">
        <p>Free, independent and no obligation. Your details are only shared with approved installers you are matched with. <Link href="/privacy" className="underline">Privacy policy</Link>.</p>
      </footer>
    </div>
  );
}
