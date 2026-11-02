import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { InstallerProcess } from "@/components/home/InstallerProcess";
import { FinalCta } from "@/components/home/FinalCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { CERTIFICATION_REQUIREMENTS, INSURANCE_REQUIREMENTS } from "@/lib/domain/requirements";
import { TECHNOLOGY_LABEL, type Technology } from "@/lib/domain/types";
import { getRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Approved installers", description: "How GoSolarCompare approves solar installers: verification, configurable certification requirements and ongoing monitoring. Businesses cannot pay to be listed." };

export default function Page() {
  const techs = Object.keys(TECHNOLOGY_LABEL) as Technology[];
  return (
    <SiteShell theme="dark">
      <PageHero eyebrow="Approved installers" title={<>Quality installers. <span className="text-solar">Nothing bought.</span></>} lead="Every company on GoSolarCompare applied, was checked by a person against the requirements for the technologies it offers, and is re-checked over time. A listing can't be purchased, and approval can be withdrawn.">
        <div className="flex flex-wrap gap-3">
          <Button href="/compare">Compare approved installers</Button>
          <Button href="/installers/apply" variant="outline-light">Apply as an installer</Button>
        </div>
      </PageHero>
      <div id="process"><InstallerProcess /></div>
      <section className="section-y bg-cream">
        <div className="container-x">
          <SectionHeading eyebrow="Requirements" title="What we check, by technology" lead="Requirements differ by technology, so we don't assume every accreditation applies to every service. 'Required' groups must be verified before approval for that technology; 'recommended' ones are noted." />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {techs.map((t) => (
              <Reveal key={t} className="rounded-[var(--r-lg)] bg-white p-7 ring-1 ring-ink/10">
                <h3 className="text-[length:var(--step-2)]">{TECHNOLOGY_LABEL[t]}</h3>
                <ul className="mt-4 space-y-3">
                  {CERTIFICATION_REQUIREMENTS[t].map((g) => (
                    <li key={g.label} className="flex gap-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${g.level === "required" ? "bg-coral" : "bg-sky-2"}`} aria-hidden="true" />
                      <div>
                        <p className="font-semibold">{g.label} <span className="font-normal text-muted">· {g.level}</span></p>
                        <p className="text-[length:var(--step--1)] text-muted">{g.why} Accepted: {g.anyOf.join(" or ")}.</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
            <Reveal className="rounded-[var(--r-lg)] bg-ink p-7 text-[var(--text-on-ink)] md:col-span-2">
              <h3 className="text-[length:var(--step-2)]">Every installer, regardless of technology</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                <li>Companies House registration and trading history checked</li>
                {INSURANCE_REQUIREMENTS.map((i) => (
                  <li key={i.kind}>{i.label} {i.level === "required" ? "(required" : i.level === "required_if_employees" ? "(required where staff are employed" : "(recommended"}{"minimumGbp" in i && i.minimumGbp ? `, minimum £${(i.minimumGbp / 1_000_000).toFixed(0)}m` : ""})</li>
                ))}
                <li>Workmanship guarantee terms reviewed; insurance-backed guarantees noted</li>
                <li>Review profiles and references recorded; ratings shown only when verified</li>
                <li>Expiry dates tracked; periodic re-verification scheduled</li>
              </ul>
              <p className="mt-6 text-[length:var(--step--1)] text-[var(--text-on-ink-muted)]">We only display an accreditation once we have checked evidence for it. If a certificate lapses, the badge is removed until renewed.</p>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="section-y bg-cream-2" id="directory">
        <div className="container-x">
          <SectionHeading eyebrow="Directory" title="Currently approved installers" lead="Listed alphabetically. Use the comparison to find the ones covering your postcode." />
          <Suspense fallback={<p className="mt-10 text-muted">Loading…</p>}>
            <Directory />
          </Suspense>
        </div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}

async function Directory() {
  const repo = getRepository();
  const list = (await repo.listInstallers({ status: "approved" })).sort((a, b) => a.tradingName.localeCompare(b.tradingName));
  return (
    <div className="mt-10 space-y-6">
      {repo.kind === "demo" && <DemoNotice>These placeholder companies demonstrate the directory layout. Real approved installers will replace them as applications are verified.</DemoNotice>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((i) => (
          <li key={i.id}>
            <Link href={`/approved-installers/${i.slug}`} className="group flex h-full flex-col rounded-[var(--r-lg)] bg-white p-6 ring-1 ring-ink/10 transition-colors hover:ring-ink">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink font-display font-bold text-solar">{i.tradingName.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                <div>
                  <p className="font-display text-[length:var(--step-1)] font-semibold">{i.tradingName}</p>
                  <p className="text-[length:var(--step--1)] text-muted">{i.address.town}{i.demo ? " · demo" : ""}</p>
                </div>
              </div>
              <p className="mt-4 text-[length:var(--step--1)] text-muted">{i.technologies.map((t) => TECHNOLOGY_LABEL[t]).join(" · ")}</p>
              <p className="mt-auto pt-4 text-[length:var(--step--1)] font-semibold text-leaf-2 group-hover:underline">View profile →</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
