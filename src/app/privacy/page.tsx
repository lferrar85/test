import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { Prose } from "@/components/pages/Prose";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Privacy policy", description: "How GoSolarCompare collects, uses and shares personal data." };

export default function Page() {
  return (
    <SiteShell>
      <PageHero tone="cream" eyebrow="Legal" title="Privacy policy" lead="Version 2026-11. Draft for legal review before launch." />
      <section className="section-y bg-cream"><div className="container-x"><Prose>
        <h2>Who we are</h2>
        <p>GoSolarCompare (&quot;we&quot;, &quot;us&quot;) operates {site.url}. We are the data controller for the personal data described in this policy. Contact: {site.email}. Our company registration and ICO registration numbers will be published here before launch.</p>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Comparison requests:</strong> name, email address, telephone number, postcode, property details, existing equipment, technologies of interest, ownership status, timing and any notes you add.</li>
          <li><strong>Installer applications:</strong> business and contact details, certifications, insurance, references, testimonials and documents you upload.</li>
          <li><strong>Technical data:</strong> a hashed form of your IP address used for rate limiting and fraud prevention, and essential cookies required for the site and admin area to function. We do not use advertising cookies.</li>
        </ul>
        <h2>Why we use it and our lawful basis</h2>
        <ul>
          <li><strong>To provide the comparison service</strong> (contract / your request): matching you with approved installers and sharing your details with them so they can quote.</li>
          <li><strong>To run the installer approval process</strong> (legitimate interests / contract): verifying businesses, recording decisions and monitoring continued eligibility.</li>
          <li><strong>Marketing emails</strong> (consent): only if you opt in. You can withdraw consent at any time via the link in every email or by contacting us.</li>
          <li><strong>Security and legal compliance</strong> (legitimate interests / legal obligation).</li>
        </ul>
        <h2>Who we share it with</h2>
        <p>We share comparison requests only with the approved installers we match you with (a maximum of four per request) so they can contact you. We do not sell personal data. We use service providers for hosting, email delivery and database services who process data on our instructions. If we partner with a tree-planting organisation, we share only aggregate counts, never your details.</p>
        <h2>How long we keep it</h2>
        <p>Comparison requests are retained for 24 months after the last activity, then deleted or anonymised. Installer records are retained while the installer is listed and for six years afterwards for audit purposes. Marketing preferences are kept until you withdraw consent.</p>
        <h2>Your rights</h2>
        <p>You can ask for access to, correction or erasure of your data, object to or restrict processing, request portability and withdraw consent. You can also ask us to tell matched installers to stop contacting you. Email {site.email}. You have the right to complain to the Information Commissioner&apos;s Office (ico.org.uk).</p>
        <h2>Security</h2>
        <p>Personal data is stored in access-controlled systems with encryption in transit and at rest. Installer documents are held in private storage accessible only to authorised reviewers. Admin access is restricted and logged.</p>
        <h2>Changes</h2>
        <p>We&apos;ll post any changes here and update the version number. Significant changes affecting how we use your data will be communicated by email where we hold your address.</p>
      </Prose></div></section>
    </SiteShell>
  );
}
