import { BadgeCheck, Building2, FileCheck2, RefreshCcw } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";

const indicators = [
  { icon: Building2, title: "Verified installer businesses", body: "We check the company behind the brand: registration, trading history and the people who run it." },
  { icon: BadgeCheck, title: "Relevant certifications checked", body: "We review the certifications that matter for each technology an installer offers, and only display what we've verified." },
  { icon: FileCheck2, title: "Insurance and company details reviewed", body: "Public liability cover, guarantees and consumer protection arrangements are reviewed before approval." },
  { icon: RefreshCcw, title: "Ongoing approval monitoring", body: "Approval isn't forever. Expiry dates are tracked and installers are periodically re-verified." },
];

export function TrustSection() {
  return (
    <section className="section-y relative bg-cream" id="trust">
      <Marquee
        className="mb-16 text-ink/70"
        items={["Solar made simple", "Compare with confidence", "Quality installers. Competitive prices.", "Your home. Your energy. Your choice.", "A brighter way to go solar"]}
      />
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-leaf-2">Why trust matters</p>
            <h2 className="mt-4 text-[length:var(--step-6)] leading-[0.98]">
              Not just any installer. <span className="text-leaf-2">The right installer.</span>
            </h2>
            <p className="mt-6 max-w-md text-[length:var(--step-1)] text-muted">
              Anyone can list on most comparison sites. Not here. Every company must apply, pass our approval process and keep passing it to stay listed.
            </p>
            <Button href="/approved-installers" variant="outline" className="mt-8">
              See how we approve installers
            </Button>
          </Reveal>
        </div>
        <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {indicators.map((it, i) => (
            <StaggerItem
              as="li"
              key={it.title}
              className={`group rounded-[var(--r-lg)] border border-ink/10 bg-white p-7 transition-colors duration-500 hover:border-ink ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-solar/20 text-ink transition-colors duration-500 group-hover:bg-solar">
                <it.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-[length:var(--step-1)]">{it.title}</h3>
              <p className="mt-3 text-muted">{it.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
