import { Suspense } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/home/Hero";
import { ScrollSun } from "@/components/home/ScrollSun";
import { TrustSection } from "@/components/home/TrustSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhySection } from "@/components/home/WhySection";
import { TreePromise } from "@/components/home/TreePromise";
import { Solutions } from "@/components/home/Solutions";
import { InstallerProcess } from "@/components/home/InstallerProcess";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { faqs } from "@/lib/content/faqs";
import { site } from "@/lib/config/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: site.name,
        url: site.url,
        logo: `${site.url}/icon.svg`,
        description: site.description,
        areaServed: "GB",
      },
      {
        "@type": "WebSite",
        name: site.name,
        url: site.url,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: typeof f.a === "string" ? f.a : "" },
        })),
      },
    ],
  };
  return (
    <SiteShell theme="dark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollSun />
      <div className="relative">
        <Hero />
        <TrustSection />
        <HowItWorks />
        <WhySection />
        <Suspense fallback={<div className="min-h-[40rem] bg-leaf-2" aria-busy="true" />}>
          <TreePromise />
        </Suspense>
        <Solutions />
        <InstallerProcess />
        <FaqSection limit={6} />
        <FinalCta />
      </div>
    </SiteShell>
  );
}
