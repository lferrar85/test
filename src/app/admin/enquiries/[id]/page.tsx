import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { getRepository } from "@/lib/data";
import { Card, EnquiryStatusBadge, adminBtn, adminBtnLight, adminInput, fmtDate } from "@/components/admin/ui";
import { ENQUIRY_STATUS_LABEL, type EnquiryStatus } from "@/lib/domain/types";
import { interestOptions, orientationOptions, ownershipOptions, propertyOptions, roofTypeOptions, timingOptions } from "@/lib/journey/options";
import { recordCompletion, updateEnquiry } from "../../actions";
import { matchInstallers } from "@/lib/data/matching";

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const repo = getRepository();
  const e = await repo.getEnquiry(id);
  if (!e) notFound();
  const [installers, quotes, trees] = await Promise.all([repo.listInstallers(), repo.listQuotesForEnquiry(id), repo.listTreePlantings()]);
  const approved = installers.filter((i) => i.status === "approved");
  const suggested = matchInstallers(e, installers).map((i) => i.id);
  const tree = trees.find((t) => t.enquiryId === e.id);
  const statuses = Object.keys(ENQUIRY_STATUS_LABEL) as EnquiryStatus[];
  const label = <T extends string>(opts: { value: T; label: string }[], v?: T) => opts.find((o) => o.value === v)?.label ?? v ?? "—";

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted"><Link href="/admin/enquiries" className="underline">Enquiries</Link> / {e.reference}</nav>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">{e.reference}</h1>
        <EnquiryStatusBadge status={e.status} />
        <span className="text-sm text-muted">Received {fmtDate(e.createdAt)}</span>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Customer">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Name</dt><dd className="font-semibold">{e.contact.name}</dd></div>
              <div><dt className="text-muted">Postcode</dt><dd>{e.postcode}</dd></div>
              <div><dt className="text-muted">Email</dt><dd>{e.contact.email}</dd></div>
              <div><dt className="text-muted">Phone</dt><dd>{e.contact.phone}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Notes</dt><dd>{e.contact.notes || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Consent</dt><dd>Share with installers: yes · Marketing: {e.consent.marketing ? "yes" : "no"} · Privacy v{e.consent.privacyVersion} · {fmtDate(e.consent.recordedAt)}</dd></div>
            </dl>
          </Card>
          <Card title="Requirements">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Property</dt><dd>{label(propertyOptions, e.propertyType)}</dd></div>
              <div><dt className="text-muted">Roof</dt><dd>{label(roofTypeOptions, e.roof.type)} · {label(orientationOptions, e.roof.orientation)}</dd></div>
              <div><dt className="text-muted">Already has</dt><dd>{Object.entries(e.current).filter(([, v]) => v).map(([k]) => k).join(", ") || "Nothing yet"}</dd></div>
              <div><dt className="text-muted">Interested in</dt><dd>{e.interests.map((i) => label(interestOptions, i)).join(", ")}</dd></div>
              <div><dt className="text-muted">Ownership</dt><dd>{label(ownershipOptions, e.ownership)}</dd></div>
              <div><dt className="text-muted">Timing</dt><dd>{label(timingOptions, e.timing)}</dd></div>
            </dl>
          </Card>
          <Card title="Quotations">
            {quotes.length === 0 ? <p className="text-sm text-muted">No quotations recorded yet. Installer quote submission is wired for the Supabase backend.</p> : (
              <ul className="divide-y divide-ink/10 text-sm">
                {quotes.map((q) => (
                  <li key={q.id} className="py-2">£{q.totalPriceGbp.toLocaleString("en-GB")} · {installers.find((i) => i.id === q.installerId)?.tradingName} · {q.systemSizeKwp ?? "—"} kWp · submitted {fmtDate(q.submittedAt)} ({q.source})</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Manage">
            <form action={updateEnquiry} className="space-y-3 text-sm">
              <input type="hidden" name="id" value={e.id} />
              <label className="block text-xs">Status<select name="status" defaultValue={e.status} className={adminInput}>{statuses.map((s) => <option key={s} value={s}>{ENQUIRY_STATUS_LABEL[s]}</option>)}</select></label>
              <label className="block text-xs">Assigned to<input name="assignedTo" defaultValue={e.assignedTo ?? ""} placeholder="team member email" className={adminInput} /></label>
              <fieldset>
                <legend className="text-xs font-semibold">Matched installers</legend>
                <p className="text-xs text-muted">Suggested by coverage and technology are marked ★. Alphabetical, never by fee.</p>
                <div className="mt-1 space-y-1">
                  {approved.map((i) => (
                    <label key={i.id} className="flex items-center gap-2 text-xs"><input type="checkbox" name="matchedInstallerIds" value={i.id} defaultChecked={e.matchedInstallerIds.includes(i.id)} className="accent-[var(--ink)]" />{i.tradingName}{suggested.includes(i.id) ? " ★" : ""}</label>
                  ))}
                </div>
              </fieldset>
              <button className={adminBtn}>Save</button>
            </form>
          </Card>
          <Card title="Completed installation">
            {tree ? (
              <p className="text-sm">Recorded {fmtDate(tree.installationCompletedAt)}. Tree status: <strong>{tree.status}</strong>. <Link href="/admin/trees" className="underline">Open ledger</Link>.</p>
            ) : (
              <form action={recordCompletion} className="space-y-3 text-sm">
                <input type="hidden" name="enquiryId" value={e.id} />
                <label className="block text-xs">Installed by<select name="installerId" className={adminInput} defaultValue={e.matchedInstallerIds[0] ?? ""}>{approved.map((i) => <option key={i.id} value={i.id}>{i.tradingName}</option>)}</select></label>
                <label className="block text-xs">Completion date<input type="date" name="completedAt" className={adminInput} /></label>
                <p className="text-xs text-muted">Recording a completion marks one tree as due for planting. Only confirm when the installer has evidenced commissioning.</p>
                <button className={adminBtnLight}>Record completion</button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
