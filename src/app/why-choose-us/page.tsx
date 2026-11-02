import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { WhySection } from "@/components/home/WhySection";
import { FinalCta } from "@/components/home/FinalCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Why choose GoSolarCompare", description: "Approved installers only, independent matching, transparent fees and a tree planted for every installation." };

const rows = [
  { f: "Installers must apply and pass verification before listing", us: true, them: false },
  { f: "Accreditations shown only once evidence is checked", us: true, them: false },
  { f: "Matching by coverage and technology, never by fee", us: true, them: false },
  { f: "Your details shared with a maximum of four installers", us: true, them: false },
  { f: "Referral fees disclosed on every results page", us: true, them: false },
  { f: "No guaranteed-savings claims", us: true, them: false },
  { f: "Quotes compared side by side on one page", us: true, them: false },
  { f: "A tree planted for every completed installation", us: true, them: false },
];

const values = [
  { h: "Independent", b: "We don't install, we don't manufacture and we're not owned by an energy company. We compare." },
  { h: "Selective", b: "Fewer, better installers beats a long list of unknowns. Approval is earned and can be lost." },
  { h: "Transparent", b: "How we're paid, how we match and what we've verified is written down where you can see it." },
  { h: "Human", b: "Going solar is a big decision. Ray is friendly, but the people behind him are too. Ask us anything." },
];

export default function Page() {
  return (
    <SiteShell theme="dark">
      <PageHero eyebrow="Why choose us" title={<>Compare with <span className="text-solar">confidence.</span></>} lead="Most solar lead-generation sites sell your details to whoever pays. We built GoSolarCompare to be the opposite: approved installers only, honest comparisons and nothing hidden." />
      <section className="section-y bg-cream">
        <div className="container-x">
          <SectionHeading eyebrow="The difference" title="What you get here that you often don't elsewhere" lead="We're describing typical lead-generation practice, not any specific company." />
          <Reveal className="mt-12 overflow-x-auto rounded-[var(--r-lg)] border border-ink/10 bg-white">
            <table className="w-full min-w-[36rem] text-[length:var(--step--1)]">
              <thead className="bg-cream-2 text-left">
                <tr><th className="p-4 font-semibold">Feature</th><th className="p-4 font-display text-[length:var(--step-0)] font-bold text-ink">GoSolarCompare</th><th className="p-4 font-semibold text-muted">Typical lead-gen site</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {rows.map((r) => (
                  <tr key={r.f}>
                    <td className="p-4">{r.f}</td>
                    <td className="p-4"><span className="inline-flex items-center gap-2 font-semibold text-leaf-2"><Check className="h-4 w-4" aria-hidden="true" /> Yes</span></td>
                    <td className="p-4"><span className="inline-flex items-center gap-2 text-muted"><X className="h-4 w-4" aria-hidden="true" /> Often not</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>
      <WhySection />
      <section className="section-y bg-cream-2">
        <div className="container-x">
          <SectionHeading eyebrow="Our values" title="Four words we hold ourselves to" />
          <Stagger as="ul" className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem as="li" key={v.h} className="rounded-[var(--r-lg)] bg-white p-7 ring-1 ring-ink/10">
                <h3 className="text-[length:var(--step-2)]">{v.h}</h3>
                <p className="mt-3 text-muted">{v.b}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
