import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { Accordion } from "@/components/ui/Accordion";
import { FinalCta } from "@/components/home/FinalCta";
import { faqs } from "@/lib/content/faqs";
import { Ray } from "@/components/brand/Ray";

export const metadata: Metadata = { title: "Frequently asked questions", description: "Straight answers about how GoSolarCompare works, installer verification, costs, batteries, savings and what happens after you submit your details." };

const installerFaqs = [
  { q: "How do I get listed on GoSolarCompare?", a: "Apply through our installer application. We review company details, certifications and insurance against the requirements for the technologies you offer. Only an administrator can approve a listing, and nobody is approved automatically." },
  { q: "Does it cost anything to apply?", a: "No. There is no application or listing fee. We may charge a referral fee on introductions that proceed; terms are shared with approved installers." },
  { q: "Can I pay to appear first?", a: "No. Matching is by coverage and technology and results are listed alphabetically." },
  { q: "What if my certification lapses?", a: "We track expiry dates. Lapsed accreditations are hidden from homeowners until renewed, and approval may be suspended." },
];

export default function Page() {
  return (
    <SiteShell>
      <PageHero tone="cream" eyebrow="FAQs" title="Questions, answered plainly." lead="If you can't find what you need, contact us. A person will reply." aside={<div className="flex justify-center lg:justify-end"><Ray mood="thinking" size={200} label="Ray thinking" /></div>} />
      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><h2 className="text-[length:var(--step-3)] lg:sticky lg:top-28">For homeowners</h2></div>
          <div className="lg:col-span-8"><Accordion items={faqs} /></div>
        </div>
      </section>
      <section className="section-y bg-cream-2" id="installers">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><h2 className="text-[length:var(--step-3)] lg:sticky lg:top-28">For installers</h2></div>
          <div className="lg:col-span-8"><Accordion items={installerFaqs} /></div>
        </div>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
