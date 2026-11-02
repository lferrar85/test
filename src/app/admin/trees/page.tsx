import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { getRepository } from "@/lib/data";
import { Card, PlantingBadge, StatTile, adminBtn, adminInput, fmtDate } from "@/components/admin/ui";
import { confirmPlanting } from "../actions";

export default async function TreesPage() {
  await requireAdminPage();
  const repo = getRepository();
  const [trees, installers, enquiries] = await Promise.all([repo.listTreePlantings(), repo.listInstallers(), repo.listEnquiries()]);
  const due = trees.filter((t) => t.status !== "confirmed").reduce((n, t) => n + t.treesDue, 0);
  const confirmed = trees.filter((t) => t.status === "confirmed").reduce((n, t) => n + t.treesDue, 0);
  const partner = process.env.TREE_PARTNER_NAME;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Tree-planting ledger</h1>
        <p className="text-sm text-muted">One tree per completed installation. The public counter shows <strong>confirmed</strong> plantings only.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Completed installations" value={trees.length} />
        <StatTile label="Trees due" value={due} hint="Awaiting partner confirmation" />
        <StatTile label="Trees confirmed planted" value={confirmed} hint="Shown publicly" />
      </div>
      <Card title="Planting partner">
        <p className="text-sm">{partner ? <>Current partner: <strong>{partner}</strong>.</> : <>No partner configured yet. Set <code className="rounded bg-cream-2 px-1">TREE_PARTNER_NAME</code> once a partnership is agreed; the API hooks (<code className="rounded bg-cream-2 px-1">TREE_PARTNER_API_URL</code>) are ready for batch ordering and confirmation import.</>}</p>
      </Card>
      <div className="overflow-x-auto rounded-[var(--r-md)] border border-ink/10 bg-white">
        <table className="w-full min-w-[64rem] text-sm">
          <thead className="bg-cream-2 text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Installation</th><th className="px-4 py-3">Installer</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Trees</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Confirmation</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {trees.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-muted">No completed installations recorded yet.</td></tr>}
            {trees.map((t) => (
              <tr key={t.id} className="align-top">
                <td className="px-4 py-3"><Link href={`/admin/enquiries/${t.enquiryId}`} className="font-semibold underline-offset-2 hover:underline">{enquiries.find((e) => e.id === t.enquiryId)?.reference ?? t.enquiryId}</Link></td>
                <td className="px-4 py-3">{installers.find((i) => i.id === t.installerId)?.tradingName ?? t.installerId}</td>
                <td className="px-4 py-3">{fmtDate(t.installationCompletedAt)}</td>
                <td className="px-4 py-3 tnum">{t.treesDue}</td>
                <td className="px-4 py-3"><PlantingBadge status={t.status} /></td>
                <td className="px-4 py-3">
                  {t.status === "confirmed" ? (
                    <p className="text-xs">{t.partner} · ref {t.confirmationReference} · {fmtDate(t.plantingConfirmedAt)}{t.location ? ` · ${t.location}` : ""}</p>
                  ) : (
                    <form action={confirmPlanting} className="grid grid-cols-2 gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <input name="partner" placeholder="Partner" defaultValue={partner ?? ""} required className={adminInput} />
                      <input name="confirmationReference" placeholder="Confirmation ref" required className={adminInput} />
                      <input name="location" placeholder="Location (optional)" className={adminInput} />
                      <input type="date" name="plantingConfirmedAt" className={adminInput} />
                      <button className={`${adminBtn} col-span-2`}>Confirm planting</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
