import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { getRepository } from "@/lib/data";
import { AppStatusBadge, fmtDate } from "@/components/admin/ui";
import { TECHNOLOGY_LABEL, type ApplicationStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

const filters: { key: string; label: string; statuses?: ApplicationStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending", statuses: ["received", "under_review", "more_info_required"] },
  { key: "approved", label: "Approved", statuses: ["approved"] },
  { key: "suspended", label: "Suspended", statuses: ["suspended"] },
  { key: "rejected", label: "Rejected", statuses: ["rejected"] },
];

function expiringSoon(dates: (string | undefined)[], now: number) {
  return dates.filter((d): d is string => !!d).filter((d) => new Date(d).getTime() - now < 60 * 86400000).length;
}

export default async function InstallersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdminPage();
  const now = new Date().getTime(); // request-time render (see requireAdminPage)
  const { status = "all" } = await searchParams;
  const f = filters.find((x) => x.key === status) ?? filters[0];
  const installers = await getRepository().listInstallers(f.statuses ? { status: f.statuses } : undefined);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Installers</h1>
          <p className="text-sm text-muted">Applications, approvals and monitoring.</p>
        </div>
        <nav aria-label="Filter" className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
          {filters.map((x) => (
            <Link key={x.key} href={`/admin/installers?status=${x.key}`} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", x.key === f.key ? "bg-ink text-cream" : "text-muted hover:text-ink")} aria-current={x.key === f.key ? "page" : undefined}>{x.label}</Link>
          ))}
        </nav>
      </header>
      <div className="overflow-x-auto rounded-[var(--r-md)] border border-ink/10 bg-white">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-cream-2 text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Technologies</th><th className="px-4 py-3">Coverage</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Re-verify by</th><th className="px-4 py-3">Expiring</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {installers.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-muted">No installers in this view.</td></tr>}
            {installers.map((i) => {
              const expiring = expiringSoon([...i.accreditations.map((a) => a.expiresAt), ...i.insurance.map((p) => p.expiresAt)], now);
              return (
                <tr key={i.id} className="hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/installers/${i.id}`} className="font-semibold underline-offset-2 hover:underline">{i.tradingName}</Link>
                    <p className="text-xs text-muted">{i.legalName} · {i.address.town}{i.demo ? " · demo" : ""}</p>
                  </td>
                  <td className="px-4 py-3"><AppStatusBadge status={i.status} /></td>
                  <td className="px-4 py-3">{i.technologies.map((t) => TECHNOLOGY_LABEL[t]).join(", ")}</td>
                  <td className="px-4 py-3 text-muted">{i.coverageAreas.slice(0, 6).join(", ")}{i.coverageAreas.length > 6 ? ` +${i.coverageAreas.length - 6}` : ""}</td>
                  <td className="px-4 py-3">{fmtDate(i.appliedAt)}</td>
                  <td className="px-4 py-3">{fmtDate(i.reverifyBy)}</td>
                  <td className="px-4 py-3">{expiring > 0 ? <span className="font-semibold text-[#8a2f12]">{expiring} within 60 days</span> : <span className="text-muted">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
