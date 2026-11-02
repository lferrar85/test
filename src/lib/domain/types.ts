/**
 * GoSolarCompare domain model.
 * Shared by the demo repository, the Supabase adapter, API routes and the UI.
 */

export type Technology = "solar" | "battery" | "ev-charger" | "heat-pump";

export const TECHNOLOGY_LABEL: Record<Technology, string> = {
  solar: "Solar panels",
  battery: "Battery storage",
  "ev-charger": "EV chargers",
  "heat-pump": "Heat pumps",
};

export type ApplicationStatus =
  | "received"
  | "under_review"
  | "more_info_required"
  | "approved"
  | "suspended"
  | "rejected";

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  received: "Application received",
  under_review: "Under review",
  more_info_required: "More information required",
  approved: "Approved",
  suspended: "Suspended",
  rejected: "Rejected",
};

/** Accreditation / registration types we recognise. Extend via config, not code paths. */
export type AccreditationType =
  | "MCS"
  | "TRUSTMARK"
  | "RECC"
  | "HIES"
  | "NICEIC"
  | "NAPIT"
  | "ELECSA"
  | "STROMA"
  | "OTHER";

export const ACCREDITATION_LABEL: Record<AccreditationType, string> = {
  MCS: "MCS certification",
  TRUSTMARK: "TrustMark registration",
  RECC: "RECC membership",
  HIES: "HIES membership",
  NICEIC: "NICEIC registration",
  NAPIT: "NAPIT registration",
  ELECSA: "ELECSA registration",
  STROMA: "Stroma registration",
  OTHER: "Other accreditation",
};

export type VerificationState = "unverified" | "verified" | "expired" | "rejected";

export interface Accreditation {
  type: AccreditationType;
  /** Free-text name when type === "OTHER". */
  name?: string;
  reference?: string;
  /** Technologies this accreditation covers (e.g. MCS for solar and battery). */
  scope: Technology[];
  state: VerificationState;
  verifiedAt?: string;
  verifiedBy?: string;
  expiresAt?: string;
  evidenceDocumentIds: string[];
  notes?: string;
}

export interface InsurancePolicy {
  kind: "public_liability" | "employers_liability" | "professional_indemnity";
  insurer?: string;
  coverAmountGbp?: number;
  expiresAt?: string;
  state: VerificationState;
  evidenceDocumentIds: string[];
}

export interface GuaranteeInfo {
  workmanshipYears?: number;
  insuranceBacked: boolean;
  insuranceBackedProvider?: string;
  productWarrantySummary?: string;
  state: VerificationState;
  evidenceDocumentIds: string[];
}

export interface ReviewProfile {
  provider: "Trustpilot" | "Google" | "Which? Trusted Traders" | "Checkatrade" | "Other";
  url: string;
  /** Only populated when fetched from the provider or verified by an admin. */
  rating?: number;
  reviewCount?: number;
  verifiedAt?: string;
}

export interface UploadedDocument {
  id: string;
  installerId: string;
  category: "accreditation" | "insurance" | "guarantee" | "reference" | "portfolio" | "other";
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Storage key in the private bucket. Never a public URL. */
  storagePath: string;
  uploadedAt: string;
}

export interface ReviewNote {
  id: string;
  at: string;
  by: string;
  note: string;
  statusAfter?: ApplicationStatus;
}

export interface Installer {
  id: string;
  slug: string;
  legalName: string;
  tradingName: string;
  companiesHouseNumber: string;
  address: { line1: string; line2?: string; town: string; postcode: string };
  website?: string;
  yearsTrading: number;
  contact: { name: string; role?: string; phone: string; email: string };
  status: ApplicationStatus;
  appliedAt: string;
  approvedAt?: string;
  /** Next scheduled re-verification. */
  reverifyBy?: string;
  technologies: Technology[];
  /** UK postcode areas (e.g. "SW", "M", "B") served. */
  coverageAreas: string[];
  accreditations: Accreditation[];
  insurance: InsurancePolicy[];
  guarantees: GuaranteeInfo;
  performance: {
    installationsPerYear?: number;
    installationTeams?: number;
    panelBrands: string[];
    batteryBrands: string[];
    customerService?: string;
    aftercare?: string;
  };
  reviews: ReviewProfile[];
  /** Verified by an admin from evidence; otherwise undefined. */
  completedInstallationsVerified?: number;
  testimonials: { quote: string; customer: string; location?: string; verified: boolean }[];
  profile: string;
  documents: UploadedDocument[];
  reviewNotes: ReviewNote[];
  /** True for seeded placeholder records; never shown as real companies. */
  demo: boolean;
}

export type PropertyType = "detached" | "semi-detached" | "terraced" | "bungalow" | "flat" | "other";
export type RoofType = "pitched" | "flat" | "unsure";
export type RoofOrientation = "south" | "south-east" | "south-west" | "east" | "west" | "north" | "unsure";
export type Interest = "solar" | "solar-battery" | "battery" | "ev-charger" | "heat-pump" | "whole-home" | "unsure";
export type Ownership = "homeowner" | "landlord" | "other";
export type Timing = "asap" | "1-3-months" | "3-6-months" | "researching";

export type EnquiryStatus =
  | "new"
  | "matched"
  | "quotes_in_progress"
  | "quotes_received"
  | "installation_booked"
  | "installation_completed"
  | "closed";

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  matched: "Matched",
  quotes_in_progress: "Quotes in progress",
  quotes_received: "Quotes received",
  installation_booked: "Installation booked",
  installation_completed: "Installation completed",
  closed: "Closed",
};

export interface Enquiry {
  id: string;
  reference: string;
  createdAt: string;
  postcode: string;
  propertyType: PropertyType;
  roof: { type: RoofType; orientation: RoofOrientation };
  current: { solar: boolean; battery: boolean; ev: boolean; evCharger: boolean; heatPump: boolean };
  interests: Interest[];
  ownership: Ownership;
  timing: Timing;
  contact: { name: string; email: string; phone: string; notes?: string };
  consent: {
    shareWithInstallers: true;
    marketing: boolean;
    privacyVersion: string;
    recordedAt: string;
    ipHash?: string;
  };
  status: EnquiryStatus;
  matchedInstallerIds: string[];
  assignedTo?: string;
  installationCompletedAt?: string;
  completedByInstallerId?: string;
}

export interface Quote {
  id: string;
  enquiryId: string;
  installerId: string;
  submittedAt: string;
  source: "installer_submitted" | "demo";
  totalPriceGbp: number;
  systemSizeKwp?: number;
  panelManufacturer?: string;
  panelCount?: number;
  inverterManufacturer?: string;
  batteryManufacturer?: string;
  batteryCapacityKwh?: number;
  estimatedAnnualGenerationKwh?: number;
  estimatedAnnualSavingsGbp?: { low: number; high: number };
  warranty: { panelsYears?: number; inverterYears?: number; batteryYears?: number; workmanshipYears?: number };
  earliestInstallation?: string;
  aftercare?: string;
  notes?: string;
}

export type PlantingStatus = "due" | "scheduled" | "confirmed";

export interface TreePlanting {
  id: string;
  enquiryId: string;
  installerId: string;
  installationCompletedAt: string;
  treesDue: number;
  partner?: string;
  status: PlantingStatus;
  plantingConfirmedAt?: string;
  confirmationReference?: string;
  location?: string;
}

export interface PlatformStats {
  totalEnquiries: number;
  newEnquiries: number;
  completedComparisons: number;
  approvedInstallers: number;
  pendingApplications: number;
  rejectedApplications: number;
  completedInstallations: number;
  treesDue: number;
  treesConfirmedPlanted: number;
  leadConversionRate: number; // 0..1, enquiries -> completed installations
  enquiriesByWeek: { week: string; count: number }[];
  enquiriesByInterest: { interest: Interest; count: number }[];
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
}
