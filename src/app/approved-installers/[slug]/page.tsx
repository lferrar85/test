import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { getRepository } from "@/lib/data";
import { ACCREDITATION_LABEL, TECHNOLOGY_LABEL } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Installer profile" };

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <SiteShell>
      <div className="pt-24 lg:pt-28">
        <Suspense fallback={<div className="container-x section-y" aria-busy="true">Loading…</div>}>
          <Profile params={params} />
        </Suspense>
      </div>
    </SiteShell>
  );
}

async function Profile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const i = await repo.getInstallerBySlug(slug);
  if (!i || i.status !== "approved") notFound();
  const verified = i.accreditations.filter((a) => a.state === "verified");
  return (
    <>
      <section className="bg-ink text-[var(--text-on-ink)]">
        <div className="container-x section-y-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-solar font-display text-2xl font-bold text-ink">{i.tradingName.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
            <div>
              <h1 className="text-[length:var(--step-4)]">{i.tradingName}</h1>
              <p className="flex items-center gap-2 text-[var(--text-on-ink-muted)]"><MapPin className="h-4 w-4" aria-hidden="true" /> {i.address.town} · {i.yearsTrading} years trading · {i.legalName}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-3 py-1 text-[length:var(--step--1)] font-semibold text-white"><ShieldCheck className="h-4 w-4" /> GoSolarCompare approved</span>
            {verified.map((a) => <span key={a.type + a.reference} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[length:var(--step--1)] font-medium"><BadgeCheck className="h-4 w-4 text-solar" /> {a.type === "OTHER" ? a.name : ACCREDITATION_LABEL[a.type]}</span>)}
          </div>
        </div>
      </section>
      <section className="container-x section-y-sm grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {i.demo && <DemoNotice />}
          <div>
            <h2 className="text-[length:var(--step-2)]">About</h2>
            <p className="mt-3 text-ink/80">{i.profile || "Profile text to be supplied by the installer and reviewed by GoSolarCompare."}</p>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2">
            <div><dt className="eyebrow text-leaf-2">Technologies</dt><dd className="mt-2 font-semibold">{i.technologies.map((t) => TECHNOLOGY_LABEL[t]).join(", ")}</dd></div>
            <div><dt className="eyebrow text-leaf-2">Coverage</dt><dd className="mt-2 font-semibold">{i.coverageAreas.join(", ")} postcode areas</dd></div>
            <div><dt className="eyebrow text-leaf-2">Workmanship guarantee</dt><dd className="mt-2 font-semibold">{i.guarantees.workmanshipYears ? `${i.guarantees.workmanshipYears} years` : "Not stated"}{i.guarantees.insuranceBacked ? ` · insurance-backed${i.guarantees.insuranceBackedProvider ? ` (${i.guarantees.insuranceBackedProvider})` : ""}` : ""}</dd></div>
            <div><dt className="eyebrow text-leaf-2">Product warranties</dt><dd className="mt-2 font-semibold">{i.guarantees.productWarrantySummary ?? "Provided with quotation"}</dd></div>
            <div><dt className="eyebrow text-leaf-2">Panel brands</dt><dd className="mt-2 font-semibold">{i.performance.panelBrands.join(", ") || "Various"}</dd></div>
            <div><dt className="eyebrow text-leaf-2">Battery brands</dt><dd className="mt-2 font-semibold">{i.performance.batteryBrands.join(", ") || "—"}</dd></div>
            <div className="sm:col-span-2"><dt className="eyebrow text-leaf-2">Customer service & aftercare</dt><dd className="mt-2">{i.performance.customerService ?? "—"} {i.performance.aftercare ?? ""}</dd></div>
            <div><dt className="eyebrow text-leaf-2">Reviews</dt><dd className="mt-2">{i.reviews.length ? i.reviews.map((r) => <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">{r.provider}{r.rating ? ` ${r.rating}★ (${r.reviewCount})` : ""}</a>) : "Not provided"}</dd></div>
            <div><dt className="eyebrow text-leaf-2">Verified installations</dt><dd className="mt-2">{i.completedInstallationsVerified?.toLocaleString("en-GB") ?? "Awaiting verification"}</dd></div>
          </dl>
          <p className="text-[length:var(--step--2)] text-muted">Accreditations displayed have been checked by GoSolarCompare against evidence supplied by the installer. We re-verify periodically and remove badges that lapse. Ratings are only shown when sourced from the review provider or verified by us.</p>
        </div>
        <aside className="lg:col-span-4">
          <div className="rounded-[var(--r-lg)] bg-cream-2 p-7 lg:sticky lg:top-28">
            <h2 className="text-[length:var(--step-1)]">Get a quote from {i.tradingName}</h2>
            <p className="mt-2 text-[length:var(--step--1)] text-muted">Start a comparison. If {i.tradingName} covers your postcode and technology, they&apos;ll be one of your matches alongside other approved installers.</p>
            <Button href="/compare" className="mt-5 w-full">Compare solar quotes</Button>
          </div>
        </aside>
      </section>
    </>
  );
}
