import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { getRepository } from "@/lib/data";
import { EnquiryStatusBadge, fmtDate } from "@/components/admin/ui";
import { interestOptions, timingOptions } from "@/lib/journey/options";

export default async function EnquiriesPage() {
  await requireAdminPage();
  const enquiries = await getRepository().listEnquiries();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Customer enquiries</h1>
        <p className="text-sm text-muted">Personal data: handle in line with the privacy policy. Access is logged in production.</p>
      </header>
      <div className="overflow-x-auto rounded-[var(--r-md)] border border-ink/10 bg-white">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-cream-2 text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Postcode</th><th className="px-4 py-3">Interests</th><th className="px-4 py-3">Timing</th><th className="px-4 py-3">Matched</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Received</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {enquiries.map((e) => (
              <tr key={e.id} className="hover:bg-cream/60">
                <td className="px-4 py-3"><Link href={`/admin/enquiries/${e.id}`} className="font-semibold underline-offset-2 hover:underline">{e.reference}</Link><p className="text-xs text-muted">{e.contact.name}</p></td>
                <td className="px-4 py-3"><EnquiryStatusBadge status={e.status} /></td>
                <td className="px-4 py-3">{e.postcode}</td>
                <td className="px-4 py-3">{e.interests.map((i) => interestOptions.find((o) => o.value === i)?.label ?? i).join(", ")}</td>
                <td className="px-4 py-3">{timingOptions.find((o) => o.value === e.timing)?.label}</td>
                <td className="px-4 py-3 tnum">{e.matchedInstallerIds.length}</td>
                <td className="px-4 py-3 text-muted">{e.assignedTo ?? "—"}</td>
                <td className="px-4 py-3">{fmtDate(e.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
