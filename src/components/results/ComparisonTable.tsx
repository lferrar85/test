"use client";

import { useState } from "react";
import type { Installer, Quote } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

type Row = { label: string; get: (i: Installer, q?: Quote) => string | null };

const rows: Row[] = [
  { label: "Total quoted price", get: (_, q) => (q ? `£${q.totalPriceGbp.toLocaleString("en-GB")}` : null) },
  { label: "System size", get: (_, q) => (q?.systemSizeKwp ? `${q.systemSizeKwp} kWp` : null) },
  { label: "Panel manufacturer", get: (_, q) => q?.panelManufacturer ?? null },
  { label: "Battery capacity", get: (_, q) => (q?.batteryCapacityKwh ? `${q.batteryCapacityKwh} kWh` : null) },
  { label: "Estimated annual generation", get: (_, q) => (q?.estimatedAnnualGenerationKwh ? `${q.estimatedAnnualGenerationKwh.toLocaleString("en-GB")} kWh` : null) },
  { label: "Estimated annual savings*", get: (_, q) => (q?.estimatedAnnualSavingsGbp ? `£${q.estimatedAnnualSavingsGbp.low}–£${q.estimatedAnnualSavingsGbp.high}` : null) },
  { label: "Panel warranty", get: (_, q) => (q?.warranty.panelsYears ? `${q.warranty.panelsYears} years` : null) },
  { label: "Inverter warranty", get: (_, q) => (q?.warranty.inverterYears ? `${q.warranty.inverterYears} years` : null) },
  { label: "Battery warranty", get: (_, q) => (q?.warranty.batteryYears ? `${q.warranty.batteryYears} years` : null) },
  { label: "Workmanship guarantee", get: (i, q) => (q?.warranty.workmanshipYears ?? i.guarantees.workmanshipYears) ? `${q?.warranty.workmanshipYears ?? i.guarantees.workmanshipYears} years${i.guarantees.insuranceBacked ? " (insurance-backed)" : ""}` : null },
  { label: "Earliest installation", get: (_, q) => (q?.earliestInstallation ? new Date(q.earliestInstallation).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null) },
  { label: "Aftercare", get: (i, q) => q?.aftercare ?? i.performance.aftercare ?? null },
  { label: "Customer service", get: (i) => i.performance.customerService ?? null },
];

export function ComparisonTable({ installers, quotes }: { installers: Installer[]; quotes: Quote[] }) {
  const [diffOnly, setDiffOnly] = useState(false);
  const byInstaller = new Map(quotes.map((q) => [q.installerId, q]));
  const visible = rows.filter((r) => {
    const vals = installers.map((i) => r.get(i, byInstaller.get(i.id)));
    if (vals.every((v) => v === null)) return false;
    if (!diffOnly) return true;
    return new Set(vals).size > 1;
  });
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[length:var(--step-3)]">Side by side</h2>
        <label className="inline-flex items-center gap-2 text-[length:var(--step--1)] font-medium">
          <input type="checkbox" className="h-4 w-4 accent-[var(--ink)]" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
          Show differences only
        </label>
      </div>
      <div className="overflow-x-auto rounded-[var(--r-lg)] border border-ink/10 bg-white">
        <table className="w-full min-w-[40rem] border-collapse text-[length:var(--step--1)]">
          <thead>
            <tr className="bg-cream-2">
              <th scope="col" className="sticky left-0 bg-cream-2 p-4 text-left font-semibold">Compare</th>
              {installers.map((i) => (
                <th key={i.id} scope="col" className="p-4 text-left font-display text-[length:var(--step-0)] font-semibold">
                  {i.tradingName}
                  {i.demo && <span className="demo-badge ml-2">Demo</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const vals = installers.map((i) => r.get(i, byInstaller.get(i.id)));
              const differs = new Set(vals).size > 1;
              return (
                <tr key={r.label} className="border-t border-ink/10">
                  <th scope="row" className="sticky left-0 bg-white p-4 text-left font-medium text-muted">{r.label}</th>
                  {vals.map((v, idx) => (
                    <td key={idx} className={cn("p-4 align-top", differs && "font-semibold", v === null && "text-ink/40")}>
                      {v ?? "Awaiting quote"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[length:var(--step--2)] text-muted">
        *Savings estimates are provided by installers based on your property and are not guaranteed. Actual savings depend on usage, tariff and system performance.
      </p>
    </div>
  );
}
