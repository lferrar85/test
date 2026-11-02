import type { Enquiry, Installer, Interest, Technology } from "@/lib/domain/types";
import { postcodeArea } from "@/lib/utils/postcode";

/** Map a homeowner interest to the technologies an installer must offer. */
export function technologiesForInterests(interests: Interest[]): Technology[] {
  const set = new Set<Technology>();
  for (const i of interests) {
    if (i === "solar") set.add("solar");
    if (i === "solar-battery") { set.add("solar"); set.add("battery"); }
    if (i === "battery") set.add("battery");
    if (i === "ev-charger") set.add("ev-charger");
    if (i === "heat-pump") set.add("heat-pump");
    if (i === "whole-home") { set.add("solar"); set.add("battery"); }
    // "unsure" adds nothing: any approved solar installer can advise
  }
  if (set.size === 0) set.add("solar");
  return [...set];
}

/**
 * Deterministic matching: approved status, coverage area, technology fit.
 * Order is alphabetical by trading name. There is NO commercial weighting and
 * no ranking by fee. Keep it that way.
 */
export function matchInstallers(enquiry: Pick<Enquiry, "postcode" | "interests">, installers: Installer[], max = 4): Installer[] {
  const area = postcodeArea(enquiry.postcode);
  const needed = technologiesForInterests(enquiry.interests);
  return installers
    .filter((i) => i.status === "approved")
    .filter((i) => i.coverageAreas.includes(area))
    .filter((i) => needed.every((t) => i.technologies.includes(t)))
    .sort((a, b) => a.tradingName.localeCompare(b.tradingName))
    .slice(0, max);
}
