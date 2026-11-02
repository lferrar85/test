import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/pages/PageHero";
import { Prose } from "@/components/pages/Prose";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Terms and conditions", description: "Terms for homeowners and installers using GoSolarCompare." };

export default function Page() {
  return (
    <SiteShell>
      <PageHero tone="cream" eyebrow="Legal" title="Terms and conditions" lead="Draft for legal review before launch. These terms govern use of the GoSolarCompare website and comparison service." />
      <section className="section-y bg-cream"><div className="container-x"><Prose>
        <h2>1. About the service</h2>
        <p>GoSolarCompare is an independent comparison and introduction service. We introduce homeowners to installation businesses that have passed our approval process. We do not design, sell or install equipment, we are not party to any contract between you and an installer, and we are not a lender or financial adviser.</p>
        <h2>2. For homeowners</h2>
        <ul>
          <li>The service is free to use. We may receive a referral fee from an installer if you proceed with them. Fees do not affect matching or display order.</li>
          <li>Quotations, savings estimates, warranties and availability are provided by installers. We display them as supplied and do not guarantee their accuracy or any outcome. Savings depend on your property, usage and tariff.</li>
          <li>&quot;Approved&quot; means an installer passed our verification process at the time of approval and remains subject to monitoring. It is not a guarantee of workmanship. You should carry out your own checks and read the installer&apos;s contract carefully.</li>
          <li>You must provide accurate information and have authority to request quotations for the property.</li>
        </ul>
        <h2 id="installers">3. For installers</h2>
        <ul>
          <li>Submitting an application does not create a listing. Every application enters a pending review state; approval is at our sole discretion and only an administrator may grant it.</li>
          <li>You must hold and maintain the certifications, registrations and insurance relevant to the technologies you offer, provide truthful evidence and notify us of any change, lapse, complaint or enforcement action.</li>
          <li>We may request further information, re-verify, suspend or remove a listing at any time, including for customer complaints, lapsed accreditation or conduct inconsistent with our standards.</li>
          <li>Homeowner details are provided solely to quote for the stated enquiry. You must handle them in accordance with data protection law, must not share or sell them and must stop contact when asked.</li>
          <li>Referral fee terms are provided separately to approved installers.</li>
        </ul>
        <h2>4. Tree-planting promise</h2>
        <p>We commit to arranging the planting of one tree for each installation completed through an introduction made by GoSolarCompare, subject to confirmation of completion by the installer. Plantings are carried out by a third-party partner and counted publicly only when confirmed.</p>
        <h2>5. Liability</h2>
        <p>To the extent permitted by law, we are not liable for the acts or omissions of installers, for decisions you make based on information displayed, or for indirect or consequential loss. Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be limited by law.</p>
        <h2>6. Intellectual property</h2>
        <p>The GoSolarCompare name, logo, the character &quot;Ray&quot; and all site content are our property or used under licence and may not be reproduced without permission.</p>
        <h2>7. General</h2>
        <p>These terms are governed by the laws of England and Wales. We may update them; the version in force is the one published at the time of use. Contact: {site.email}.</p>
      </Prose></div></section>
    </SiteShell>
  );
}
