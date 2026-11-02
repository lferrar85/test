import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { Ray } from "@/components/brand/Ray";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Button } from "@/components/ui/Button";
import { InstallerCard } from "@/components/results/InstallerCard";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import { getRepository } from "@/lib/data";
import { interestOptions, propertyOptions, timingOptions } from "@/lib/journey/options";

export const metadata: Metadata = { title: "Your solar matches", robots: { index: false, follow: false } };

export default function ResultsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return (
    <SiteShell>
      <div className="pt-24 lg:pt-28">
        <Suspense fallback={<div className="container-x section-y-sm min-h-[60vh]" aria-busy="true">Loading your matches…</div>}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </SiteShell>
  );
}

async function Results({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const repo = getRepository();
  const enquiry = id ? await repo.getEnquiry(id) : null;

  if (!enquiry) {
    return (
      <div className="container-x section-y text-center">
        <Ray mood="thinking" size={140} className="mx-auto" />
        <h1 className="mt-6 text-[length:var(--step-4)]">We couldn&apos;t find that comparison</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">Comparison links are private to the person who created them. Start a new comparison and we&apos;ll match you again in two minutes.</p>
        <Button href="/compare" className="mt-8">Start a new comparison</Button>
      </div>
    );
  }

  const installers = (await Promise.all(enquiry.matchedInstallerIds.map((i) => repo.getInstaller(i)))).filter((x): x is NonNullable<typeof x> => !!x);
  const quotes = await repo.listQuotesForEnquiry(enquiry.id);
  const interests = enquiry.interests.map((i) => interestOptions.find((o) => o.value === i)?.label ?? i);
  const property = propertyOptions.find((o) => o.value === enquiry.propertyType)?.label;
  const timing = timingOptions.find((o) => o.value === enquiry.timing)?.label;

  return (
    <>
      <section className="bg-ink text-[var(--text-on-ink)]">
        <div className="container-x section-y-sm grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow text-solar">Reference {enquiry.reference}</p>
            <h1 className="mt-3 text-[length:var(--step-5)]">
              {installers.length > 0 ? (
                <>We found <span className="text-solar">{installers.length} approved installer{installers.length === 1 ? "" : "s"}</span> for {enquiry.postcode.split(" ")[0]}.</>
              ) : (
                <>We&apos;re still growing our approved network near {enquiry.postcode.split(" ")[0]}.</>
              )}
            </h1>
            <p className="mt-4 max-w-2xl text-[length:var(--step-0)] text-[var(--text-on-ink-muted)]">
              {installers.length > 0
                ? "Each installer below has passed our approval process. They'll contact you to arrange a survey, and their quotations will appear here so you can compare them properly. Keep this page bookmarked."
                : "Your request is saved. As soon as an approved installer covering your area and technologies joins GoSolarCompare, we'll match you and let you know by email. We never pass your details to unapproved companies to fill the gap."}
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[length:var(--step--1)]">
              <div><dt className="inline text-[var(--text-on-ink-muted)]">Property: </dt><dd className="inline font-semibold">{property}</dd></div>
              <div><dt className="inline text-[var(--text-on-ink-muted)]">Interested in: </dt><dd className="inline font-semibold">{interests.join(", ")}</dd></div>
              <div><dt className="inline text-[var(--text-on-ink-muted)]">Timing: </dt><dd className="inline font-semibold">{timing}</dd></div>
            </dl>
          </div>
          <div className="hidden justify-end lg:col-span-4 lg:flex">
            <Ray mood={installers.length ? "celebrate" : "thinking"} size={200} label={installers.length ? "Ray celebrating your matches" : "Ray thinking"} />
          </div>
        </div>
      </section>

      <section className="container-x section-y-sm space-y-12">
        {repo.kind === "demo" && (
          <DemoNotice>
            The installers and any quote figures shown below are illustrative placeholders used while GoSolarCompare is in development. They are not real companies, prices or offers, and nobody will contact you from this demonstration.
          </DemoNotice>
        )}

        {installers.length > 0 && (
          <>
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-[length:var(--step-3)]">Your matched installers</h2>
                <p className="max-w-md text-[length:var(--step--1)] text-muted">Listed alphabetically. We never rank installers by commission or payment.</p>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {installers.map((i, idx) => (
                  <InstallerCard key={i.id} installer={i} quote={quotes.find((q) => q.installerId === i.id)} index={idx} />
                ))}
              </div>
            </div>
            <ComparisonTable installers={installers} quotes={quotes} />
          </>
        )}

        <div className="grid gap-6 rounded-[var(--r-lg)] bg-cream-2 p-8 md:grid-cols-3">
          <div>
            <h3 className="text-[length:var(--step-1)]">What happens next</h3>
            <p className="mt-2 text-[length:var(--step--1)] text-muted">Installers contact you within a few working days to arrange a survey. You&apos;re free to speak to all of them or just one.</p>
          </div>
          <div>
            <h3 className="text-[length:var(--step-1)]">How we make money</h3>
            <p className="mt-2 text-[length:var(--step--1)] text-muted">We may receive a referral fee from an installer if you go ahead. It doesn&apos;t change your price and never affects matching or ordering.</p>
          </div>
          <div>
            <h3 className="text-[length:var(--step-1)]">Changed your mind?</h3>
            <p className="mt-2 text-[length:var(--step--1)] text-muted">
              <Link href="/contact" className="underline">Contact us</Link> quoting {enquiry.reference} and we&apos;ll ask installers to stop contacting you.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
