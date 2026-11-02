import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, PauseCircle, XCircle } from "lucide-react";
import type { ApplicationStatus, EnquiryStatus, PlantingStatus, VerificationState } from "@/lib/domain/types";
import { APPLICATION_STATUS_LABEL, ENQUIRY_STATUS_LABEL } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

/** Status badges always carry an icon + label; colour is never the only signal. */
export function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, { icon: typeof Clock; cls: string }> = {
    received: { icon: CircleDashed, cls: "bg-sky text-ink" },
    under_review: { icon: Clock, cls: "bg-solar/30 text-ink" },
    more_info_required: { icon: AlertTriangle, cls: "bg-[#ffe3d9] text-[#8a2f12]" },
    approved: { icon: CheckCircle2, cls: "bg-leaf-3 text-leaf-2" },
    suspended: { icon: PauseCircle, cls: "bg-cream-3 text-ink" },
    rejected: { icon: XCircle, cls: "bg-[#ffe3d9] text-[#8a2f12]" },
  };
  const { icon: Icon, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  const done = status === "installation_completed";
  const closed = status === "closed";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", done ? "bg-leaf-3 text-leaf-2" : closed ? "bg-cream-3 text-ink" : status === "new" ? "bg-solar/30 text-ink" : "bg-sky text-ink")}>
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />} {ENQUIRY_STATUS_LABEL[status]}
    </span>
  );
}

export function VerificationBadge({ state }: { state: VerificationState }) {
  const map: Record<VerificationState, { icon: typeof Clock; cls: string; label: string }> = {
    unverified: { icon: CircleDashed, cls: "bg-cream-3 text-ink", label: "Unverified" },
    verified: { icon: CheckCircle2, cls: "bg-leaf-3 text-leaf-2", label: "Verified" },
    expired: { icon: AlertTriangle, cls: "bg-[#ffe3d9] text-[#8a2f12]", label: "Expired" },
    rejected: { icon: XCircle, cls: "bg-[#ffe3d9] text-[#8a2f12]", label: "Rejected" },
  };
  const { icon: Icon, cls, label } = map[state];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
    </span>
  );
}

export function PlantingBadge({ status }: { status: PlantingStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", status === "confirmed" ? "bg-leaf-3 text-leaf-2" : "bg-solar/30 text-ink")}>
      {status === "confirmed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />} {status === "confirmed" ? "Confirmed planted" : status === "scheduled" ? "Scheduled" : "Due"}
    </span>
  );
}

export function StatTile({ label, value, hint, href }: { label: string; value: string | number; hint?: string; href?: string }) {
  const inner = (
    <div className="rounded-[var(--r-md)] border border-ink/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 font-display text-[2rem] font-extrabold leading-none tnum">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block transition-transform hover:-translate-y-0.5">{inner}</Link> : inner;
}

export function Card({ title, children, className, action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-[var(--r-md)] border border-ink/10 bg-white", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const adminInput = "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-solar/50";
export const adminBtn = "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-ink-2 disabled:opacity-50";
export const adminBtnLight = "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink";
