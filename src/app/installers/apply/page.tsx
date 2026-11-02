import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { ApplicationForm } from "@/components/installers/ApplicationForm";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldCheck, Scale, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a GoSolarCompare approved installer",
  description: "Apply to join GoSolarCompare. We work with quality solar businesses that share our commitment to excellent installations, transparent pricing and outstanding customer service.",
};

export default function ApplyPage() {
  return (
    <SiteShell theme="dark">
      <section className="bg-ink text-[var(--text-on-ink)]">
        <div className="container-x pb-16 pt-32 lg:pb-24 lg:pt-40">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-solar">For installers</p>
            <h1 className="mt-4 text-[length:var(--step-6)] leading-[0.98]">Become a GoSolarCompare approved installer.</h1>
            <p className="mt-6 max-w-2xl text-[length:var(--step-1)] text-[var(--text-on-ink-muted)]">
              We work with quality solar businesses that share our commitment to excellent installations, transparent pricing and outstanding customer service.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Approved, not advertised", b: "Homeowners know every company here passed our checks. That trust is worth more than a banner." },
              { icon: Users, t: "Better-qualified enquiries", b: "Homeowners tell us about their property and intentions before we introduce them." },
              { icon: Scale, t: "Fair by design", b: "Matching is by coverage and technology, listed alphabetically. Nobody can pay to be first." },
            ].map((x) => (
              <li key={x.t} className="rounded-[var(--r-lg)] bg-white/5 p-6 ring-1 ring-white/10">
                <x.icon className="h-6 w-6 text-solar" aria-hidden="true" />
                <h2 className="mt-4 text-[length:var(--step-1)]">{x.t}</h2>
                <p className="mt-2 text-[length:var(--step--1)] text-[var(--text-on-ink-muted)]">{x.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="container-x section-y-sm">
        <Suspense fallback={<div className="min-h-[40rem]" aria-busy="true" />}>
          <ApplicationForm />
        </Suspense>
      </section>
    </SiteShell>
  );
}
