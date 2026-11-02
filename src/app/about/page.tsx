import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { Prose } from "@/components/pages/Prose";
import { Ray } from "@/components/brand/Ray";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = { title: "About GoSolarCompare", description: "An independent UK solar comparison platform built around approved installers, honest comparisons and a tree for every installation." };

export default function Page() {
  return (
    <SiteShell theme="dark">
      <PageHero eyebrow="About us" title={<>Better solar. Better choices. <span className="text-solar">A greener future.</span></>} lead="GoSolarCompare exists because going solar in the UK is harder than it should be. Not the technology: the shopping." />
      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Prose>
              <h2>Why we started</h2>
              <p>Ask anyone who has tried to get solar quotes and you&apos;ll hear the same story: a form on a comparison site, then a week of calls from companies they&apos;d never heard of, quotes in six different formats, and no way to tell a good installer from a confident one.</p>
              <p>We think that&apos;s backwards. A comparison service should do the hard work of vetting <em>before</em> you ever speak to anyone, then get out of the way so you can decide.</p>
              <h2>What we do differently</h2>
              <ul>
                <li><strong>Approval, not advertising.</strong> Installers apply, are checked against technology-specific requirements and can be suspended. Nobody pays to appear.</li>
                <li><strong>Matching you can understand.</strong> Coverage and technology decide who you see, listed alphabetically. Never commission.</li>
                <li><strong>Honest numbers.</strong> No guaranteed savings. No invented review scores. Our tree counter starts at zero and only moves on confirmed plantings.</li>
                <li><strong>Respect for your details.</strong> Shared only with the installers you&apos;re matched with, with clear consent and an easy way to stop.</li>
              </ul>
              <h2>How we make money</h2>
              <p>We may receive a referral fee from an installer when a homeowner introduced through GoSolarCompare goes ahead. That fee doesn&apos;t change your price and has no bearing on who we approve or how installers are shown. We&apos;d rather tell you this plainly than bury it in terms.</p>
              <h2>Where we are</h2>
              <p>GoSolarCompare is a new UK business. We&apos;re building our approved installer network region by region and we&apos;ll always be clear about where coverage is still growing. If we can&apos;t match you today, we&apos;ll tell you, and we won&apos;t fill the gap with unapproved companies.</p>
            </Prose>
          </div>
          <aside className="lg:col-span-5">
            <Reveal className="rounded-[2rem] bg-ink p-8 text-[var(--text-on-ink)] lg:sticky lg:top-28">
              <Ray mood="happy" size={140} label="Ray" />
              <p className="eyebrow mt-6 text-solar">Meet Ray</p>
              <h2 className="mt-2 text-[length:var(--step-2)]">Our sun, your guide</h2>
              <p className="mt-3 text-[var(--text-on-ink-muted)]">Ray is the friendly face of GoSolarCompare. He welcomes you, reacts as you answer questions, and celebrates when you find the right installer. He&apos;s also a reminder of what this is all about: making the most of something that shines on every roof in the country for free.</p>
            </Reveal>
          </aside>
        </div>
      </section>
      <section className="section-y bg-cream-2">
        <div className="container-x">
          <SectionHeading eyebrow="Our commitments" title="What you can hold us to" />
          <Stagger as="ul" className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { h: "We will never sell your data", b: "Your details go to matched approved installers, and nowhere else." },
              { h: "We will never rank by payment", b: "Ordering and matching are independent of any commercial arrangement." },
              { h: "We will never fake a number", b: "Trees, reviews, installations: verified or not shown." },
            ].map((c) => (
              <StaggerItem as="li" key={c.h} className="rounded-[var(--r-lg)] bg-white p-7 ring-1 ring-ink/10">
                <h3 className="text-[length:var(--step-1)]">{c.h}</h3>
                <p className="mt-2 text-muted">{c.b}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
