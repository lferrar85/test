import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { ContactForm } from "@/components/pages/ContactForm";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Contact us", description: "Get in touch with GoSolarCompare. Homeowner questions, installer applications, press and partnerships." };

export default function Page() {
  return (
    <SiteShell>
      <PageHero tone="cream" eyebrow="Contact" title="Talk to a person." lead="Questions about a comparison, an installer application or our tree-planting promise. We read everything." />
      <section className="section-y bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7"><ContactForm /></div>
          <aside className="space-y-8 lg:col-span-5">
            <div><p className="eyebrow text-leaf-2">Email</p><a href={`mailto:${site.email}`} className="mt-2 block font-display text-[length:var(--step-2)] font-semibold underline-offset-4 hover:underline">{site.email}</a></div>
            <div><p className="eyebrow text-leaf-2">Stop installer contact</p><p className="mt-2 text-muted">Changed your mind? Email us with your reference number and we&apos;ll ask matched installers to stop contacting you.</p></div>
            <div><p className="eyebrow text-leaf-2">Installers</p><p className="mt-2 text-muted">To apply for approval, use the <a href="/installers/apply" className="underline">installer application</a> rather than this form so nothing gets lost.</p></div>
            <div><p className="eyebrow text-leaf-2">Registered details</p><p className="mt-2 text-muted">Company registration number, registered office and ICO registration will be published here before launch.</p></div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
