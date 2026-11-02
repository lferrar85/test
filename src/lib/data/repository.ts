import type {
  ApplicationStatus,
  Enquiry,
  Installer,
  PlatformStats,
  Quote,
  ReviewNote,
  TreePlanting,
} from "@/lib/domain/types";
import type { EnquiryInput, InstallerApplicationInput } from "@/lib/domain/schemas";

/**
 * Storage-agnostic repository. The demo adapter keeps everything in memory;
 * the Supabase adapter maps to the schema in supabase/migrations.
 */
export interface Repository {
  readonly kind: "demo" | "supabase";

  // Installers
  listInstallers(filter?: { status?: ApplicationStatus | ApplicationStatus[] }): Promise<Installer[]>;
  getInstaller(id: string): Promise<Installer | null>;
  getInstallerBySlug(slug: string): Promise<Installer | null>;
  createInstallerApplication(input: InstallerApplicationInput): Promise<Installer>;
  updateInstaller(id: string, patch: Partial<Installer>): Promise<Installer>;
  setInstallerStatus(id: string, status: ApplicationStatus, note: Omit<ReviewNote, "id" | "at" | "statusAfter">): Promise<Installer>;

  // Enquiries
  listEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: string): Promise<Enquiry | null>;
  createEnquiry(input: EnquiryInput, meta: { ipHash?: string }): Promise<Enquiry>;
  updateEnquiry(id: string, patch: Partial<Enquiry>): Promise<Enquiry>;

  // Quotes
  listQuotesForEnquiry(enquiryId: string): Promise<Quote[]>;

  // Trees
  listTreePlantings(): Promise<TreePlanting[]>;
  recordCompletedInstallation(enquiryId: string, installerId: string, completedAt: string): Promise<TreePlanting>;
  confirmPlanting(id: string, data: { partner: string; confirmationReference: string; location?: string; plantingConfirmedAt: string }): Promise<TreePlanting>;

  // Stats
  getStats(): Promise<PlatformStats>;
}
