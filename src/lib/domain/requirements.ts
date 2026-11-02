import type { AccreditationType, Technology } from "./types";

/**
 * Configurable certification requirements per technology.
 *
 * "required": at least one of the listed accreditations must be verified for
 *             the installer to be approved for that technology.
 * "anyOf":    groups where one member satisfies the group.
 * "recommended": shown to the installer and the reviewer but not blocking.
 *
 * This is deliberately data, not code: admins can later edit it in the database
 * (see supabase/migrations: certification_requirements).
 */
export interface RequirementGroup {
  label: string;
  anyOf: AccreditationType[];
  level: "required" | "recommended";
  why: string;
}

export const CERTIFICATION_REQUIREMENTS: Record<Technology, RequirementGroup[]> = {
  solar: [
    { label: "MCS certification for solar PV", anyOf: ["MCS"], level: "required", why: "Needed for most export tariffs and a recognised installation standard." },
    { label: "Consumer code membership", anyOf: ["RECC", "HIES"], level: "required", why: "Protects customers on deposits, contracts and complaints." },
    { label: "Electrical competent person registration", anyOf: ["NICEIC", "NAPIT", "ELECSA", "STROMA"], level: "required", why: "Electrical work must be signed off by a registered competent person." },
    { label: "TrustMark registration", anyOf: ["TRUSTMARK"], level: "recommended", why: "Government-endorsed quality mark." },
  ],
  battery: [
    { label: "Electrical competent person registration", anyOf: ["NICEIC", "NAPIT", "ELECSA", "STROMA"], level: "required", why: "Battery systems involve notifiable electrical work." },
    { label: "Consumer code membership", anyOf: ["RECC", "HIES"], level: "required", why: "Protects customers on deposits, contracts and complaints." },
    { label: "MCS battery storage certification", anyOf: ["MCS"], level: "recommended", why: "Recognised standard for storage installations." },
  ],
  "ev-charger": [
    { label: "Electrical competent person registration", anyOf: ["NICEIC", "NAPIT", "ELECSA", "STROMA"], level: "required", why: "EV charge points must be installed and notified by a registered electrician." },
    { label: "TrustMark registration", anyOf: ["TRUSTMARK"], level: "recommended", why: "Government-endorsed quality mark." },
  ],
  "heat-pump": [
    { label: "MCS certification for heat pumps", anyOf: ["MCS"], level: "required", why: "Required for the Boiler Upgrade Scheme and a recognised standard." },
    { label: "Consumer code membership", anyOf: ["RECC", "HIES"], level: "required", why: "Protects customers on deposits, contracts and complaints." },
    { label: "TrustMark registration", anyOf: ["TRUSTMARK"], level: "recommended", why: "Government-endorsed quality mark." },
  ],
};

export const INSURANCE_REQUIREMENTS = [
  { kind: "public_liability" as const, label: "Public liability insurance", level: "required" as const, minimumGbp: 2_000_000 },
  { kind: "employers_liability" as const, label: "Employer's liability insurance", level: "required_if_employees" as const, minimumGbp: 5_000_000 },
  { kind: "professional_indemnity" as const, label: "Professional indemnity insurance", level: "recommended" as const },
];
