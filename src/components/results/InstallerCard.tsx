import { BadgeCheck, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";
import type { Installer, Quote } from "@/lib/domain/types";
import { ACCREDITATION_LABEL, TECHNOLOGY_LABEL } from "@/lib/domain/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function InstallerCard({ installer, quote, index }: { installer: Installer; quote?: Quote; index: number }) {
  const verified = installer.accreditations.filter((a) => a.state === "verified");
  const initials = installer.tradingName.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <article className="flex h-full flex-col rounded-[var(--r-lg)] border border-ink/10 bg-white p-6 transition-colors hover:border-ink" aria-labelledby={`inst-${installer.id}`}>
      <div className="flex items-start gap-4">
        {/* Logo slot: replace initials with installer-supplied logo once stored */}
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink font-display text-lg font-bold text-solar" aria-hidden="true">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`inst-${installer.id}`} className="text-[length:var(--step-1)]">{installer.tradingName}</h3>
            {installer.demo && <span className="demo-badge">Demo</span>}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[length:var(--step--1)] text-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {installer.address.town} · {installer.yearsTrading} years trading
          </p>
        </div>
        <span className="hidden font-display text-[length:var(--step-2)] font-extrabold text-ink/15 sm:block" aria-hidden="true">0{index + 1}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-3 px-3 py-1 text-[length:var(--step--1)] font-semibold text-leaf-2">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> GoSolarCompare approved
        </span>
        {verified.map((a) => (
          <span key={a.type + a.reference} className="inline-flex items-center gap-1.5 rounded-full bg-cream-2 px-3 py-1 text-[length:var(--step--1)] font-medium text-ink" title={`${ACCREDITATION_LABEL[a.type]} verified`}>
            <BadgeCheck className="h-4 w-4 text-leaf" aria-hidden="true" /> {a.type === "OTHER" ? a.name : a.type}
          </span>
        ))}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-[length:var(--step--1)]">
        <div>
          <dt className="text-muted">Installs</dt>
          <dd className="font-semibold">{installer.technologies.map((t) => TECHNOLOGY_LABEL[t]).join(", ")}</dd>
        </div>
        <div>
          <dt className="text-muted">Workmanship guarantee</dt>
          <dd className="font-semibold">
            {installer.guarantees.workmanshipYears ? `${installer.guarantees.workmanshipYears} years` : "Not stated"}
            {installer.guarantees.insuranceBacked && <span className="block text-leaf-2">Insurance-backed</span>}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Customer reviews</dt>
          <dd className="font-semibold">
            {installer.reviews.length === 0 ? (
              "Not provided"
            ) : installer.reviews[0].rating ? (
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-solar text-solar" aria-hidden="true" /> {installer.reviews[0].rating} ({installer.reviews[0].reviewCount}) on {installer.reviews[0].provider}</span>
            ) : (
              <a href={installer.reviews[0].url} className="underline" rel="noopener noreferrer nofollow" target="_blank">See reviews on {installer.reviews[0].provider}</a>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Verified installations</dt>
          <dd className="font-semibold">{installer.completedInstallationsVerified ? installer.completedInstallationsVerified.toLocaleString("en-GB") : "Awaiting verification"}</dd>
        </div>
      </dl>

      <div className={cn("mt-6 rounded-[var(--r-md)] p-4", quote ? "bg-solar/15" : "bg-cream-2")}>
        {quote ? (
          <>
            <p className="eyebrow text-ink/60">Quote {quote.source === "demo" ? "(demo)" : "received"}</p>
            <p className="mt-1 font-display text-[length:var(--step-3)] font-extrabold tnum">£{quote.totalPriceGbp.toLocaleString("en-GB")}</p>
            <p className="text-[length:var(--step--1)] text-muted">{quote.systemSizeKwp ? `${quote.systemSizeKwp} kWp · ` : ""}{quote.panelManufacturer ?? ""}</p>
          </>
        ) : (
          <>
            <p className="eyebrow text-ink/60">Quote</p>
            <p className="mt-1 flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4" aria-hidden="true" /> Awaiting the installer&apos;s quotation</p>
            <p className="text-[length:var(--step--1)] text-muted">They&apos;ll be in touch to arrange a survey. Prices appear here once submitted.</p>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button href={`/approved-installers/${installer.slug}`} variant="outline" size="sm">View profile</Button>
      </div>
    </article>
  );
}
