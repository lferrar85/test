import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "./PageHero";
import { SolutionArt, type SolutionKey } from "@/components/brand/SolutionArt";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion, type QA } from "@/components/ui/Accordion";
import { FinalCta } from "@/components/home/FinalCta";
import { Button } from "@/components/ui/Button";
import { PostcodeForm } from "@/components/ui/PostcodeForm";

export interface SolutionContent {
  key: SolutionKey;
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  interest: string;
  intro: { heading: string; body: string }[];
  goodFit: string[];
  costFactors: { title: string; body: string }[];
  installerChecks: string[];
  faqs: QA[];
  ctaHeadline: string;
}

export function SolutionPage({ c }: { c: SolutionContent }) {
  return (
    <SiteShell theme="dark">
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        lead={c.lead}
        aside={
          <Reveal className="overflow-hidden rounded-[2rem] bg-white/5 p-6 ring-1 ring-white/10">
            <div className="aspect-[3/2]"><SolutionArt kind={c.key} /></div>
          </Reveal>
        }
      >
        <PostcodeForm variant="dark" className="max-w-xl" id={`pc-${c.key}`} buttonLabel="Compare quotes" />
      </PageHero>

      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Stagger className="space-y-10">
              {c.intro.map((p) => (
                <StaggerItem key={p.heading}>
                  <h2 className="text-[length:var(--step-3)]">{p.heading}</h2>
                  <p className="mt-3 max-w-2xl text-[length:var(--step-0)] leading-relaxed text-ink/80">{p.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <aside className="lg:col-span-5">
            <Reveal className="rounded-[var(--r-lg)] bg-ink p-8 text-[var(--text-on-ink)] lg:sticky lg:top-28">
              <p className="eyebrow text-solar">A good fit if</p>
              <ul className="mt-4 space-y-3">
                {c.goodFit.map((g) => (
                  <li key={g} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-solar" aria-hidden="true" />{g}</li>
                ))}
              </ul>
              <Button href={`/compare?interest=${c.interest}`} className="mt-8 w-full">Compare approved installers</Button>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="section-y bg-cream-2">
        <div className="container-x">
          <SectionHeading eyebrow="Costs" title="What affects the price" lead="We don't publish a single price because there isn't one. These are the things that move your quotes up or down." />
          <Stagger as="ul" className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.costFactors.map((f, i) => (
              <StaggerItem as="li" key={f.title} className="rounded-[var(--r-lg)] bg-white p-7 ring-1 ring-ink/10">
                <span className="font-display text-[length:var(--step-3)] font-extrabold text-solar-2">0{i + 1}</span>
                <h3 className="mt-3 text-[length:var(--step-1)]">{f.title}</h3>
                <p className="mt-2 text-muted">{f.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="At the survey" title="What a good installer will check" lead="Every approved installer surveys before quoting. Expect them to look at these." />
          </div>
          <Stagger as="ul" className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {c.installerChecks.map((x) => (
              <StaggerItem as="li" key={x} className="flex items-start gap-3 rounded-[var(--r-md)] bg-white p-5 ring-1 ring-ink/10">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-xs text-white" aria-hidden="true">✓</span>
                <span className="font-medium">{x}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-y bg-cream-2">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHeading eyebrow="Questions" title="Common questions" /></div>
          <div className="lg:col-span-8"><Accordion items={c.faqs} /></div>
        </div>
      </section>

      <FinalCta headline={c.ctaHeadline} />
    </SiteShell>
  );
}
