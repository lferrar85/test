import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Ray } from "@/components/brand/Ray";
import { PostcodeForm } from "@/components/ui/PostcodeForm";

export const metadata: Metadata = { title: "How it works", description: "Tell us about your home, compare approved installers and choose your solar solution. Free, independent and no obligation." };

const timeline = [
  { t: "Within minutes", h: "Confirmation", b: "You get an email confirming your request and reference number, with a link back to your comparison page." },
  { t: "Within a few working days", h: "Installers get in touch", b: "The approved installers you've been matched with contact you to understand your needs and arrange a survey. Usually a visit, sometimes a video call first." },
  { t: "After the survey", h: "Quotations arrive", b: "Each installer prepares a quotation for your home. Prices, equipment, warranties and availability appear on your comparison page side by side." },
  { t: "Your decision", h: "Choose, or don't", b: "Pick the installer and system that suits you, ask for changes, or walk away. There's never an obligation." },
  { t: "Installation day", h: "A tree is planted", b: "Once your installation is complete and confirmed, we add a tree to our planting ledger and, when our partner confirms it's in the ground, to the public counter." },
];

export default function Page() {
  return (
    <SiteShell theme="dark">
      <PageHero eyebrow="How it works" title={<>Solar made simple. <span className="text-solar">Honestly.</span></>} lead="No forms sold to the highest bidder. No pushy sales calls from companies you've never heard of. Just approved installers, clear comparisons and your decision." aside={<div className="flex justify-center lg:justify-end"><Ray mood="wave" size={240} label="Ray waving" /></div>}>
        <PostcodeForm variant="dark" className="max-w-xl" id="pc-hiw" />
      </PageHero>
      <HowItWorks />
      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHeading eyebrow="After you submit" title="What happens next" lead="A realistic timeline, so there are no surprises." /></div>
          <Stagger as="ol" className="relative space-y-8 border-l-2 border-ink/10 pl-8 lg:col-span-8">
            {timeline.map((x) => (
              <StaggerItem as="li" key={x.h} className="relative">
                <span className="absolute -left-[2.55rem] top-1 h-4 w-4 rounded-full border-4 border-cream bg-solar" aria-hidden="true" />
                <p className="eyebrow text-leaf-2">{x.t}</p>
                <h3 className="mt-1 text-[length:var(--step-2)]">{x.h}</h3>
                <p className="mt-2 max-w-xl text-muted">{x.b}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <FaqSection limit={5} />
      <FinalCta />
    </SiteShell>
  );
}
