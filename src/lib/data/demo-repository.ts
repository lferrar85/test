import type {
  Accreditation,
  ApplicationStatus,
  Enquiry,
  Installer,
  Interest,
  PlatformStats,
  Quote,
  ReviewNote,
  TreePlanting,
} from "@/lib/domain/types";
import type { EnquiryInput, InstallerApplicationInput } from "@/lib/domain/schemas";
import type { Repository } from "./repository";
import { buildDemoSeed } from "./demo-seed";
import { matchInstallers } from "./matching";
import { normalisePostcode } from "@/lib/utils/postcode";

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * In-memory repository seeded with clearly labelled demonstration data.
 * State persists for the lifetime of the server process only.
 */
class DemoRepository implements Repository {
  readonly kind = "demo" as const;
  private installers: Installer[];
  private enquiries: Enquiry[];
  private quotes: Quote[];
  private trees: TreePlanting[];

  constructor() {
    const seed = buildDemoSeed();
    this.installers = seed.demoInstallers;
    this.enquiries = seed.demoEnquiries;
    this.quotes = seed.demoQuotes;
    this.trees = seed.demoTreePlantings;
  }

  async listInstallers(filter?: { status?: ApplicationStatus | ApplicationStatus[] }) {
    const statuses = filter?.status ? (Array.isArray(filter.status) ? filter.status : [filter.status]) : null;
    return this.installers.filter((i) => !statuses || statuses.includes(i.status)).map((i) => structuredClone(i));
  }
  async getInstaller(id: string) {
    const i = this.installers.find((x) => x.id === id);
    return i ? structuredClone(i) : null;
  }
  async getInstallerBySlug(slug: string) {
    const i = this.installers.find((x) => x.slug === slug);
    return i ? structuredClone(i) : null;
  }
  async createInstallerApplication(input: InstallerApplicationInput) {
    const now = new Date().toISOString();
    const id = uid("inst");
    const accreditations: Accreditation[] = input.accreditations.map((a) => ({
      type: a.type,
      name: a.name || undefined,
      reference: a.reference || undefined,
      scope: a.scope,
      state: "unverified",
      expiresAt: a.expiresAt || undefined,
      evidenceDocumentIds: [],
    }));
    const installer: Installer = {
      id,
      slug: `${slugify(input.business.tradingName)}-${id.slice(-4)}`,
      legalName: input.business.legalName,
      tradingName: input.business.tradingName,
      companiesHouseNumber: input.business.companiesHouseNumber.toUpperCase(),
      address: { line1: input.business.addressLine1, line2: input.business.addressLine2 || undefined, town: input.business.town, postcode: normalisePostcode(input.business.postcode) },
      website: input.business.website || undefined,
      yearsTrading: input.business.yearsTrading,
      contact: { name: input.business.contactName, role: input.business.contactRole || undefined, phone: input.business.phone, email: input.business.email },
      status: "received",
      appliedAt: now,
      technologies: input.technologies,
      coverageAreas: input.performance.coverageAreas.split(/[,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean),
      accreditations,
      insurance: [
        { kind: "public_liability", insurer: input.protection.publicLiabilityInsurer, coverAmountGbp: input.protection.publicLiabilityCover, expiresAt: input.protection.publicLiabilityExpiry, state: "unverified", evidenceDocumentIds: [] },
        ...(input.protection.employersLiabilityApplicable
          ? [{ kind: "employers_liability" as const, insurer: input.protection.employersLiabilityInsurer || undefined, expiresAt: input.protection.employersLiabilityExpiry || undefined, state: "unverified" as const, evidenceDocumentIds: [] }]
          : []),
      ],
      guarantees: {
        workmanshipYears: input.protection.workmanshipYears,
        insuranceBacked: input.protection.insuranceBacked,
        insuranceBackedProvider: input.protection.insuranceBackedProvider || undefined,
        productWarrantySummary: input.protection.productWarrantySummary || undefined,
        state: "unverified",
        evidenceDocumentIds: [],
      },
      performance: {
        installationsPerYear: input.performance.installationsPerYear,
        installationTeams: input.performance.installationTeams,
        panelBrands: (input.performance.panelBrands || "").split(",").map((s) => s.trim()).filter(Boolean),
        batteryBrands: (input.performance.batteryBrands || "").split(",").map((s) => s.trim()).filter(Boolean),
        customerService: input.performance.customerService || undefined,
        aftercare: input.performance.aftercare || undefined,
      },
      reviews: (input.references.reviewProfiles || "")
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => ({ provider: "Other" as const, url })),
      testimonials: (input.references.testimonials || "")
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((quote) => ({ quote, customer: "Supplied by applicant", verified: false })),
      profile: "",
      documents: input.documents.map((d) => ({
        id: uid("doc"),
        installerId: id,
        category: (d.category as Installer["documents"][number]["category"]) || "other",
        fileName: d.name,
        mimeType: d.type,
        sizeBytes: d.size,
        storagePath: `pending-upload/${id}/${d.name}`,
        uploadedAt: now,
      })),
      reviewNotes: [{ id: uid("rn"), at: now, by: "system", note: "Application received via website.", statusAfter: "received" }],
      demo: false,
    };
    this.installers.unshift(installer);
    return structuredClone(installer);
  }
  async updateInstaller(id: string, patch: Partial<Installer>) {
    const idx = this.installers.findIndex((x) => x.id === id);
    if (idx < 0) throw new Error("Installer not found");
    this.installers[idx] = { ...this.installers[idx], ...patch, id };
    return structuredClone(this.installers[idx]);
  }
  async setInstallerStatus(id: string, status: ApplicationStatus, note: Omit<ReviewNote, "id" | "at" | "statusAfter">) {
    const inst = this.installers.find((x) => x.id === id);
    if (!inst) throw new Error("Installer not found");
    inst.status = status;
    if (status === "approved") {
      inst.approvedAt = new Date().toISOString();
      inst.reverifyBy = new Date(Date.now() + 365 * 86400000).toISOString();
    }
    inst.reviewNotes.push({ id: uid("rn"), at: new Date().toISOString(), by: note.by, note: note.note, statusAfter: status });
    return structuredClone(inst);
  }

  async listEnquiries() {
    return structuredClone(this.enquiries).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async getEnquiry(id: string) {
    const e = this.enquiries.find((x) => x.id === id);
    return e ? structuredClone(e) : null;
  }
  async createEnquiry(input: EnquiryInput, meta: { ipHash?: string }) {
    const now = new Date().toISOString();
    const id = uid("enq");
    const matched = matchInstallers({ postcode: input.postcode, interests: input.interests }, this.installers);
    const enquiry: Enquiry = {
      id,
      reference: `GSC-${now.slice(2, 4)}${now.slice(5, 7)}-${id.slice(-4).toUpperCase()}`,
      createdAt: now,
      postcode: normalisePostcode(input.postcode),
      propertyType: input.propertyType,
      roof: input.roof,
      current: input.current,
      interests: input.interests,
      ownership: input.ownership,
      timing: input.timing,
      contact: { name: input.contact.name, email: input.contact.email, phone: input.contact.phone, notes: input.contact.notes || undefined },
      consent: { shareWithInstallers: true, marketing: input.consent.marketing, privacyVersion: input.consent.privacyVersion, recordedAt: now, ipHash: meta.ipHash },
      status: matched.length ? "matched" : "new",
      matchedInstallerIds: matched.map((m) => m.id),
    };
    this.enquiries.unshift(enquiry);
    return structuredClone(enquiry);
  }
  async updateEnquiry(id: string, patch: Partial<Enquiry>) {
    const idx = this.enquiries.findIndex((x) => x.id === id);
    if (idx < 0) throw new Error("Enquiry not found");
    this.enquiries[idx] = { ...this.enquiries[idx], ...patch, id };
    return structuredClone(this.enquiries[idx]);
  }

  async listQuotesForEnquiry(enquiryId: string) {
    return structuredClone(this.quotes.filter((q) => q.enquiryId === enquiryId));
  }

  async listTreePlantings() {
    return structuredClone(this.trees).sort((a, b) => b.installationCompletedAt.localeCompare(a.installationCompletedAt));
  }
  async recordCompletedInstallation(enquiryId: string, installerId: string, completedAt: string) {
    await this.updateEnquiry(enquiryId, { status: "installation_completed", installationCompletedAt: completedAt, completedByInstallerId: installerId });
    const existing = this.trees.find((t) => t.enquiryId === enquiryId);
    if (existing) return structuredClone(existing);
    const t: TreePlanting = { id: uid("tree"), enquiryId, installerId, installationCompletedAt: completedAt, treesDue: 1, status: "due" };
    this.trees.unshift(t);
    return structuredClone(t);
  }
  async confirmPlanting(id: string, data: { partner: string; confirmationReference: string; location?: string; plantingConfirmedAt: string }) {
    const t = this.trees.find((x) => x.id === id);
    if (!t) throw new Error("Planting record not found");
    Object.assign(t, { ...data, status: "confirmed" as const });
    return structuredClone(t);
  }

  async getStats(): Promise<PlatformStats> {
    const enquiries = this.enquiries;
    const installers = this.installers;
    const completed = enquiries.filter((e) => e.status === "installation_completed").length;
    const sevenDays = Date.now() - 7 * 86400000;
    const byWeek: Record<string, number> = {};
    for (let w = 7; w >= 0; w--) {
      const d = new Date(Date.now() - w * 7 * 86400000);
      byWeek[weekKey(d)] = 0;
    }
    for (const e of enquiries) {
      const k = weekKey(new Date(e.createdAt));
      if (k in byWeek) byWeek[k]++;
    }
    const interestCounts = new Map<Interest, number>();
    for (const e of enquiries) for (const i of e.interests) interestCounts.set(i, (interestCounts.get(i) ?? 0) + 1);
    const statusCounts = new Map<ApplicationStatus, number>();
    for (const i of installers) statusCounts.set(i.status, (statusCounts.get(i.status) ?? 0) + 1);
    return {
      totalEnquiries: enquiries.length,
      newEnquiries: enquiries.filter((e) => new Date(e.createdAt).getTime() > sevenDays).length,
      completedComparisons: enquiries.filter((e) => e.matchedInstallerIds.length > 0).length,
      approvedInstallers: installers.filter((i) => i.status === "approved").length,
      pendingApplications: installers.filter((i) => ["received", "under_review", "more_info_required"].includes(i.status)).length,
      rejectedApplications: installers.filter((i) => i.status === "rejected").length,
      completedInstallations: completed,
      treesDue: this.trees.filter((t) => t.status !== "confirmed").reduce((n, t) => n + t.treesDue, 0),
      treesConfirmedPlanted: this.trees.filter((t) => t.status === "confirmed").reduce((n, t) => n + t.treesDue, 0),
      leadConversionRate: enquiries.length ? completed / enquiries.length : 0,
      enquiriesByWeek: Object.entries(byWeek).map(([week, count]) => ({ week, count })),
      enquiriesByInterest: [...interestCounts.entries()].map(([interest, count]) => ({ interest, count })),
      applicationsByStatus: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
    };
  }
}

function weekKey(d: Date) {
  const day = d.getUTCDay() || 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day + 1));
  return monday.toISOString().slice(0, 10);
}

// Survive HMR / module re-evaluation in dev.
const g = globalThis as unknown as { __gscDemoRepo?: DemoRepository };
export const demoRepository: Repository = g.__gscDemoRepo ?? (g.__gscDemoRepo = new DemoRepository());
