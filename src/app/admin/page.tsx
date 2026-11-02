import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { getRepository } from "@/lib/data";
import { AppStatusBadge, Card, EnquiryStatusBadge, StatTile, fmtDate } from "@/components/admin/ui";
import { WeeklyBars } from "@/components/admin/WeeklyBars";
import { interestOptions } from "@/lib/journey/options";
import { APPLICATION_STATUS_LABEL } from "@/lib/domain/types";

export default async function AdminOverview() {
  await requireAdminPage();
  const repo = getRepository();
  const [stats, installers, enquiries] = await Promise.all([repo.getStats(), repo.listInstallers(), repo.listEnquiries()]);
  const pending = installers.filter((i) => ["received", "under_review", "more_info_required"].includes(i.status)).slice(0, 5);
  const recent = enquiries.slice(0, 5);
  const totalInterest = Math.max(1, ...stats.enquiriesByInterest.map((x) => x.count));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Overview</h1>
        <p className="text-sm text-muted">Platform health at a glance.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Total enquiries" value={stats.totalEnquiries} href="/admin/enquiries" />
        <StatTile label="New (7 days)" value={stats.newEnquiries} href="/admin/enquiries" />
        <StatTile label="Completed comparisons" value={stats.completedComparisons} hint="Enquiries with at least one match" />
        <StatTile label="Approved installers" value={stats.approvedInstallers} href="/admin/installers?status=approved" />
        <StatTile label="Pending applications" value={stats.pendingApplications} href="/admin/installers?status=pending" />
        <StatTile label="Rejected applications" value={stats.rejectedApplications} href="/admin/installers?status=rejected" />
        <StatTile label="Completed installations" value={stats.completedInstallations} />
        <StatTile label="Trees due" value={stats.treesDue} href="/admin/trees" />
        <StatTile label="Trees confirmed planted" value={stats.treesConfirmedPlanted} href="/admin/trees" hint="Only partner-confirmed plantings" />
        <StatTile label="Lead conversion" value={`${(stats.leadConversionRate * 100).toFixed(1)}%`} hint="Enquiries to completed installations" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Enquiries per week" className="xl:col-span-2">
          <WeeklyBars data={stats.enquiriesByWeek} label="Enquiries per week, last eight weeks" />
        </Card>
        <Card title="Interest mix">
          <ul className="space-y-3">
            {stats.enquiriesByInterest.sort((a, b) => b.count - a.count).map((x) => (
              <li key={x.interest}>
                <div className="flex justify-between text-sm"><span>{interestOptions.find((o) => o.value === x.interest)?.label ?? x.interest}</span><span className="tnum font-semibold">{x.count}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-cream-2"><div className="h-full rounded-full bg-ink" style={{ width: `${(x.count / totalInterest) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Applications by status</h3>
          <ul className="mt-2 divide-y divide-ink/10 text-sm">
            {stats.applicationsByStatus.map((x) => (
              <li key={x.status} className="flex justify-between py-1.5"><span>{APPLICATION_STATUS_LABEL[x.status]}</span><span className="tnum font-semibold">{x.count}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Applications awaiting action" action={<Link href="/admin/installers?status=pending" className="text-sm font-semibold underline">View all</Link>}>
          <ul className="divide-y divide-ink/10">
            {pending.length === 0 && <li className="py-3 text-sm text-muted">Nothing pending.</li>}
            {pending.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link href={`/admin/installers/${i.id}`} className="font-semibold underline-offset-2 hover:underline">{i.tradingName}</Link>
                  <p className="text-xs text-muted">Applied {fmtDate(i.appliedAt)} · {i.address.town}</p>
                </div>
                <AppStatusBadge status={i.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Latest enquiries" action={<Link href="/admin/enquiries" className="text-sm font-semibold underline">View all</Link>}>
          <ul className="divide-y divide-ink/10">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link href={`/admin/enquiries/${e.id}`} className="font-semibold underline-offset-2 hover:underline">{e.reference}</Link>
                  <p className="text-xs text-muted">{e.postcode} · {fmtDate(e.createdAt)} · {e.matchedInstallerIds.length} matched</p>
                </div>
                <EnquiryStatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
