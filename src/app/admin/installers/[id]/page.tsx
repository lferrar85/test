import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { getRepository } from "@/lib/data";
import { AppStatusBadge, Card, VerificationBadge, adminBtn, adminBtnLight, adminInput, fmtDate } from "@/components/admin/ui";
import { ACCREDITATION_LABEL, APPLICATION_STATUS_LABEL, TECHNOLOGY_LABEL, type ApplicationStatus, type Technology } from "@/lib/domain/types";
import { CERTIFICATION_REQUIREMENTS } from "@/lib/domain/requirements";
import { addReviewNote, setAccreditationState, setInstallerStatus, updateInstallerSettings } from "../../actions";

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  received: ["under_review", "rejected"],
  under_review: ["more_info_required", "approved", "rejected"],
  more_info_required: ["under_review", "rejected"],
  approved: ["suspended"],
  suspended: ["approved", "rejected"],
  rejected: ["under_review"],
};

export default async function InstallerDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const { error } = await searchParams;
  const inst = await getRepository().getInstaller(id);
  if (!inst) notFound();

  const technologies = Object.keys(TECHNOLOGY_LABEL) as Technology[];
  const requirementRows = inst.technologies.flatMap((t) =>
    CERTIFICATION_REQUIREMENTS[t].map((g) => ({
      tech: t,
      ...g,
      met: inst.accreditations.some((a) => a.state === "verified" && a.scope.includes(t) && g.anyOf.includes(a.type)),
    })),
  );

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted"><Link href="/admin/installers" className="underline">Installers</Link> / {inst.tradingName}</nav>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{inst.tradingName}</h1>
            <AppStatusBadge status={inst.status} />
            {inst.demo && <span className="demo-badge">Demo record</span>}
          </div>
          <p className="mt-1 text-sm text-muted">{inst.legalName} · Companies House {inst.companiesHouseNumber} · {inst.yearsTrading} years trading</p>
          <p className="text-sm text-muted">{inst.address.line1}{inst.address.line2 ? `, ${inst.address.line2}` : ""}, {inst.address.town}, {inst.address.postcode}</p>
          <p className="text-sm text-muted">{inst.contact.name}{inst.contact.role ? ` (${inst.contact.role})` : ""} · {inst.contact.phone} · {inst.contact.email}{inst.website ? ` · ${inst.website}` : ""}</p>
        </div>
        <div className="text-right text-sm text-muted">
          <p>Applied {fmtDate(inst.appliedAt)}</p>
          {inst.approvedAt && <p>Approved {fmtDate(inst.approvedAt)}</p>}
          {inst.reverifyBy && <p>Re-verify by {fmtDate(inst.reverifyBy)}</p>}
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg border border-coral/40 bg-[#ffe3d9] px-4 py-3 text-sm font-medium text-[#8a2f12]">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Requirements for approval">
            <p className="mb-3 text-xs text-muted">Derived from the technologies this installer offers. Every &quot;required&quot; row must be met before approval is allowed.</p>
            <ul className="divide-y divide-ink/10 text-sm">
              {requirementRows.map((r) => (
                <li key={r.tech + r.label} className="flex items-center justify-between gap-4 py-2">
                  <span><span className="text-xs font-semibold uppercase tracking-wider text-muted">{TECHNOLOGY_LABEL[r.tech]}</span><br />{r.label} <span className="text-muted">({r.anyOf.join(" / ")})</span></span>
                  <span className={r.met ? "font-semibold text-leaf-2" : r.level === "required" ? "font-semibold text-[#8a2f12]" : "text-muted"}>{r.met ? "Met" : r.level === "required" ? "Not met" : "Optional"}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Accreditations">
            {inst.accreditations.length === 0 && <p className="text-sm text-muted">None supplied.</p>}
            <ul className="space-y-4">
              {inst.accreditations.map((a, i) => (
                <li key={i} className="rounded-lg border border-ink/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{a.type === "OTHER" ? a.name : ACCREDITATION_LABEL[a.type]} <span className="font-normal text-muted">{a.reference}</span></p>
                    <VerificationBadge state={a.state} />
                  </div>
                  <p className="mt-1 text-xs text-muted">Covers: {a.scope.map((t) => TECHNOLOGY_LABEL[t]).join(", ")} · Expires {fmtDate(a.expiresAt)}{a.verifiedAt ? ` · Verified ${fmtDate(a.verifiedAt)} by ${a.verifiedBy}` : ""} · Evidence: {a.evidenceDocumentIds.length} document{a.evidenceDocumentIds.length === 1 ? "" : "s"}</p>
                  <form action={setAccreditationState} className="mt-3 flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={inst.id} />
                    <input type="hidden" name="index" value={i} />
                    <label className="text-xs">State<select name="state" defaultValue={a.state} className={adminInput}><option value="unverified">Unverified</option><option value="verified">Verified</option><option value="expired">Expired</option><option value="rejected">Rejected</option></select></label>
                    <label className="text-xs">Expiry<input type="date" name="expiresAt" defaultValue={a.expiresAt?.slice(0, 10)} className={adminInput} /></label>
                    <button className={adminBtnLight}>Save</button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Insurance & guarantees">
            <ul className="divide-y divide-ink/10 text-sm">
              {inst.insurance.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-2">
                  <span>{p.kind.replace("_", " ")} · {p.insurer ?? "—"} · {p.coverAmountGbp ? `£${p.coverAmountGbp.toLocaleString("en-GB")}` : "—"} · expires {fmtDate(p.expiresAt)}</span>
                  <VerificationBadge state={p.state} />
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 py-2">
                <span>Workmanship {inst.guarantees.workmanshipYears ?? "—"} yrs · {inst.guarantees.insuranceBacked ? `insurance-backed (${inst.guarantees.insuranceBackedProvider ?? "provider not stated"})` : "not insurance-backed"}</span>
                <VerificationBadge state={inst.guarantees.state} />
              </li>
            </ul>
            {inst.guarantees.productWarrantySummary && <p className="mt-3 text-sm text-muted">{inst.guarantees.productWarrantySummary}</p>}
          </Card>

          <Card title="Performance, references & documents">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Installs per year</dt><dd>{inst.performance.installationsPerYear ?? "—"}</dd></div>
              <div><dt className="text-muted">Teams</dt><dd>{inst.performance.installationTeams ?? "—"}</dd></div>
              <div><dt className="text-muted">Panel brands</dt><dd>{inst.performance.panelBrands.join(", ") || "—"}</dd></div>
              <div><dt className="text-muted">Battery brands</dt><dd>{inst.performance.batteryBrands.join(", ") || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Customer service</dt><dd>{inst.performance.customerService ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Aftercare</dt><dd>{inst.performance.aftercare ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Review profiles</dt><dd>{inst.reviews.length ? inst.reviews.map((r) => <a key={r.url} href={r.url} className="mr-3 underline" target="_blank" rel="noopener noreferrer">{r.provider}</a>) : "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Testimonials supplied ({inst.testimonials.length})</dt><dd className="space-y-1">{inst.testimonials.map((t, i) => <blockquote key={i} className="border-l-2 border-ink/20 pl-3 text-muted">{t.quote}</blockquote>)}</dd></div>
            </dl>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Uploaded documents</h3>
            {inst.documents.length === 0 ? <p className="mt-1 text-sm text-muted">No documents on file.</p> : (
              <ul className="mt-2 divide-y divide-ink/10 text-sm">
                {inst.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2">
                    <span>{d.fileName} <span className="text-muted">· {d.category} · {(d.sizeBytes / 1024 / 1024).toFixed(1)} MB</span></span>
                    <span className="text-xs text-muted" title="Signed URL access is wired in the Supabase adapter">Open (requires storage)</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Decision">
            <p className="mb-3 text-xs text-muted">Current: <strong>{APPLICATION_STATUS_LABEL[inst.status]}</strong>. Only administrators can change status; every change is logged.</p>
            <form action={setInstallerStatus} className="space-y-3">
              <input type="hidden" name="id" value={inst.id} />
              <label className="block text-xs">New status
                <select name="status" className={adminInput} defaultValue={transitions[inst.status][0]}>
                  {transitions[inst.status].map((s) => <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>)}
                </select>
              </label>
              <label className="block text-xs">Review note<textarea name="note" rows={3} className={adminInput} placeholder="What was checked, what's missing, why this decision" /></label>
              <button className={adminBtn}>Apply status</button>
            </form>
          </Card>

          <Card title="Listing settings">
            <form action={updateInstallerSettings} className="space-y-3 text-sm">
              <input type="hidden" name="id" value={inst.id} />
              <fieldset>
                <legend className="text-xs font-semibold">Technologies offered</legend>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {technologies.map((t) => (
                    <label key={t} className="inline-flex items-center gap-2 text-xs"><input type="checkbox" name="technologies" value={t} defaultChecked={inst.technologies.includes(t)} className="accent-[var(--ink)]" />{TECHNOLOGY_LABEL[t]}</label>
                  ))}
                </div>
              </fieldset>
              <label className="block text-xs">Coverage areas (postcode areas)<input name="coverageAreas" defaultValue={inst.coverageAreas.join(", ")} className={adminInput} /></label>
              <label className="block text-xs">Re-verification date<input type="date" name="reverifyBy" defaultValue={inst.reverifyBy?.slice(0, 10)} className={adminInput} /></label>
              <label className="block text-xs">Verified completed installations<input type="number" min={0} name="completedInstallationsVerified" defaultValue={inst.completedInstallationsVerified ?? ""} className={adminInput} /></label>
              <button className={adminBtnLight}>Save settings</button>
            </form>
          </Card>

          <Card title="Review notes">
            <ul className="space-y-3 text-sm">
              {inst.reviewNotes.slice().reverse().map((n) => (
                <li key={n.id} className="rounded-lg bg-cream-2 p-3">
                  <p>{n.note}</p>
                  <p className="mt-1 text-xs text-muted">{fmtDate(n.at)} · {n.by}{n.statusAfter ? ` · → ${APPLICATION_STATUS_LABEL[n.statusAfter]}` : ""}</p>
                </li>
              ))}
            </ul>
            <form action={addReviewNote} className="mt-3 space-y-2">
              <input type="hidden" name="id" value={inst.id} />
              <textarea name="note" rows={2} className={adminInput} placeholder="Add a note" />
              <button className={adminBtnLight}>Add note</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
