import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Ray } from "@/components/brand/Ray";
import { nav, site } from "@/lib/config/site";

const cols: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Compare", links: nav.footer.compare },
  { title: "Company", links: nav.footer.company },
  { title: "Installers", links: nav.footer.installers },
  { title: "Help & legal", links: nav.footer.legal },
];

export function Footer() {
  return (
    <footer className="grain bg-ink text-[var(--text-on-ink)]">
      <div className="container-wide pt-16 pb-10 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo onInk />
            <p className="mt-6 max-w-sm text-[length:var(--step-0)] text-[var(--text-on-ink-muted)]">
              Better solar. Better choices. A greener future. An independent comparison service connecting UK homeowners with approved solar installers.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Ray mood="sleepy" size={72} track={false} />
              <p className="max-w-[16rem] text-[length:var(--step--1)] text-[var(--text-on-ink-muted)]">
                Ray is resting. He&apos;ll be back to help you compare tomorrow — or right now, if you click below.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="font-sans text-[length:var(--step--1)] font-semibold uppercase tracking-[0.14em] text-solar">{c.title}</h3>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="link-wipe text-[length:var(--step-0)] text-[var(--text-on-ink)]/85 hover:text-[var(--text-on-ink)]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-[var(--border-on-ink)] pt-8">
          <p className="max-w-4xl text-[length:var(--step--1)] leading-relaxed text-[var(--text-on-ink-muted)]">
            GoSolarCompare is an independent comparison and introduction service. We do not install solar equipment, and we are not a lender.
            Installers must apply and be approved before appearing on the platform; approval is based on our verification checks and cannot be purchased.
            We may receive a referral fee from an installer when you proceed with them. Fees never influence how installers are ranked or displayed.
            Any savings figures are estimates and are not guaranteed; actual performance depends on your property, usage, tariff and system design.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-[length:var(--step--1)] text-[var(--text-on-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 {site.name}. All rights reserved.</p>
            <p>Made in the UK with sunshine (and a lot of tea).</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
