import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { Forest, GrowingTree } from "@/components/brand/Forest";
import { Counter } from "@/components/ui/Counter";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FinalCta } from "@/components/home/FinalCta";
import { Button } from "@/components/ui/Button";
import { getPublicTreeStats } from "@/lib/data/public-stats";

export const metadata: Metadata = { title: "Our tree-planting promise", description: "For every completed installation through GoSolarCompare, we plant a tree. Verified counts only, with a named planting partner." };

const steps = [
  { h: "Installation completed", b: "An approved installer finishes your system and confirms commissioning to us." },
  { h: "Tree recorded as due", b: "We log one tree against your installation in our planting ledger. It's 'due', not 'planted'." },
  { h: "Planted by our partner", b: "Trees are planted in batches by our planting partner, who provides a confirmation reference." },
  { h: "Verified and counted", b: "Only once the partner confirms planting does the tree join the public counter." },
];

export default function Page() {
  return (
    <SiteShell>
      <PageHero tone="leaf" eyebrow="Our tree-planting promise" title={<>Your solar journey grows <span className="text-solar">more than savings.</span></>} lead="For every completed installation through GoSolarCompare, we'll plant a tree. Not a pledge to offset, not a rounded-up marketing number: a tree, recorded, planted and confirmed." aside={<Reveal className="flex justify-center lg:justify-end"><GrowingTree className="h-72 w-60" /></Reveal>}>
        <Button href="/compare" variant="cream">Start your journey</Button>
      </PageHero>
      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Suspense fallback={<div className="h-48" aria-busy="true" />}>
              <CounterCard />
            </Suspense>
          </div>
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="How the promise works" title="From your roof to the ground" lead="Every number on this page is traceable to a completed installation and a planting confirmation." />
            <Stagger as="ol" className="mt-10 grid gap-4 sm:grid-cols-2">
              {steps.map((s, i) => (
                <StaggerItem as="li" key={s.h} className="rounded-[var(--r-lg)] bg-white p-6 ring-1 ring-ink/10">
                  <span className="font-display text-[length:var(--step-3)] font-extrabold text-leaf">0{i + 1}</span>
                  <h3 className="mt-2 text-[length:var(--step-1)]">{s.h}</h3>
                  <p className="mt-2 text-muted">{s.b}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>
      <section className="grain relative overflow-hidden bg-leaf-2 text-white">
        <div className="container-x section-y">
          <SectionHeading onInk eyebrow="Our planting partner" title="Chosen carefully, announced when signed" lead="We're in conversations with established UK and international tree-planting organisations. We'll name our partner, link to their verification and publish planting locations here once an agreement is in place. Until then, the counter stays honest." />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Native species and biodiversity focus", "Independent verification of planting", "Long-term maintenance, not plant-and-forget"].map((x) => (
              <div key={x} className="rounded-[var(--r-md)] bg-white/10 p-5 ring-1 ring-white/15">{x}</div>
            ))}
          </div>
        </div>
        <Forest trees={30} className="w-full" />
      </section>
      <FinalCta headline="Ready to grow something good?" />
    </SiteShell>
  );
}

async function CounterCard() {
  const s = await getPublicTreeStats();
  return (
    <Reveal className="rounded-[2rem] bg-ink p-8 text-[var(--text-on-ink)]">
      <p className="eyebrow text-solar">Verified trees planted</p>
      <p className="mt-3 font-display text-[length:var(--step-7)] font-extrabold leading-none text-solar"><Counter to={s.treesConfirmedPlanted} /></p>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-[length:var(--step--1)]">
        <div><dt className="text-[var(--text-on-ink-muted)]">Completed installations</dt><dd className="font-semibold tnum">{s.completedInstallations}</dd></div>
        <div><dt className="text-[var(--text-on-ink-muted)]">Trees due for planting</dt><dd className="font-semibold tnum">{s.treesDue}</dd></div>
      </dl>
      <p className="mt-6 text-[length:var(--step--2)] uppercase tracking-[0.12em] text-[var(--text-on-ink-muted)]">{s.plantingPartner ? `Partner: ${s.plantingPartner}` : "Partner: to be announced"}{s.demo ? " · demo ledger" : ""}</p>
    </Reveal>
  );
}
