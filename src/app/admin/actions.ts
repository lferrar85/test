"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getRepository } from "@/lib/data";
import { ADMIN_COOKIE, checkAdminPassword, createAdminToken, getAdminSession } from "@/lib/auth/admin-session";
import type { ApplicationStatus, EnquiryStatus, Technology, VerificationState } from "@/lib/domain/types";

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function login(_: { error?: string; email?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!email || !checkAdminPassword(password)) {
    return { error: "Incorrect email or password.", email };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminToken(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const statusSchema = z.enum(["received", "under_review", "more_info_required", "approved", "suspended", "rejected"]);

export async function setInstallerStatus(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const status = statusSchema.parse(formData.get("status"));
  const note = String(formData.get("note") ?? "").trim() || `Status changed to ${status}`;
  const repo = getRepository();
  if (status === "approved") {
    // Guard: every technology needs its required accreditation groups verified.
    const inst = await repo.getInstaller(id);
    if (inst) {
      const { CERTIFICATION_REQUIREMENTS } = await import("@/lib/domain/requirements");
      const missing: string[] = [];
      for (const t of inst.technologies) {
        for (const g of CERTIFICATION_REQUIREMENTS[t]) {
          if (g.level !== "required") continue;
          const ok = inst.accreditations.some((a) => a.state === "verified" && a.scope.includes(t) && g.anyOf.includes(a.type));
          if (!ok) missing.push(`${t}: ${g.label}`);
        }
      }
      if (missing.length) {
        redirect(`/admin/installers/${id}?error=${encodeURIComponent("Cannot approve. Unverified required accreditations: " + missing.join("; "))}`);
      }
    }
  }
  await repo.setInstallerStatus(id, status as ApplicationStatus, { by: admin.email, note });
  revalidatePath("/admin");
  revalidatePath(`/admin/installers/${id}`);
  revalidatePath("/approved-installers");
  redirect(`/admin/installers/${id}`);
}

export async function setAccreditationState(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const index = Number(formData.get("index"));
  const state = z.enum(["unverified", "verified", "expired", "rejected"]).parse(formData.get("state")) as VerificationState;
  const expiresAt = String(formData.get("expiresAt") ?? "");
  const repo = getRepository();
  const inst = await repo.getInstaller(id);
  if (!inst) return;
  const accreditations = inst.accreditations.map((a, i) =>
    i === index ? { ...a, state, verifiedAt: state === "verified" ? new Date().toISOString() : a.verifiedAt, verifiedBy: admin.email, expiresAt: expiresAt || a.expiresAt } : a,
  );
  await repo.updateInstaller(id, { accreditations });
  revalidatePath(`/admin/installers/${id}`);
}

export async function updateInstallerSettings(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const coverage = String(formData.get("coverageAreas") ?? "").split(/[,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  const technologies = formData.getAll("technologies").map(String) as Technology[];
  const reverifyBy = String(formData.get("reverifyBy") ?? "");
  const completed = String(formData.get("completedInstallationsVerified") ?? "");
  await getRepository().updateInstaller(id, {
    coverageAreas: coverage,
    technologies,
    reverifyBy: reverifyBy ? new Date(reverifyBy).toISOString() : undefined,
    completedInstallationsVerified: completed ? Number(completed) : undefined,
  });
  revalidatePath(`/admin/installers/${id}`);
}

export async function addReviewNote(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;
  const repo = getRepository();
  const inst = await repo.getInstaller(id);
  if (!inst) return;
  await repo.updateInstaller(id, { reviewNotes: [...inst.reviewNotes, { id: `rn_${Date.now()}`, at: new Date().toISOString(), by: admin.email, note }] });
  revalidatePath(`/admin/installers/${id}`);
}

export async function updateEnquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = z.enum(["new", "matched", "quotes_in_progress", "quotes_received", "installation_booked", "installation_completed", "closed"]).parse(formData.get("status")) as EnquiryStatus;
  const assignedTo = String(formData.get("assignedTo") ?? "").trim() || undefined;
  const matched = formData.getAll("matchedInstallerIds").map(String);
  await getRepository().updateEnquiry(id, { status, assignedTo, matchedInstallerIds: matched });
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin/enquiries");
}

export async function recordCompletion(formData: FormData) {
  await requireAdmin();
  const enquiryId = String(formData.get("enquiryId"));
  const installerId = String(formData.get("installerId"));
  const completedAt = String(formData.get("completedAt") || new Date().toISOString().slice(0, 10));
  await getRepository().recordCompletedInstallation(enquiryId, installerId, new Date(completedAt).toISOString());
  revalidateTag("trees", "max");
  revalidatePath("/admin");
  revalidatePath("/admin/trees");
  redirect("/admin/trees");
}

export async function confirmPlanting(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const partner = String(formData.get("partner") ?? "").trim();
  const confirmationReference = String(formData.get("confirmationReference") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || undefined;
  const plantingConfirmedAt = String(formData.get("plantingConfirmedAt") || new Date().toISOString().slice(0, 10));
  if (!partner || !confirmationReference) return;
  await getRepository().confirmPlanting(id, { partner, confirmationReference, location, plantingConfirmedAt: new Date(plantingConfirmedAt).toISOString() });
  revalidateTag("trees", "max");
  revalidatePath("/admin/trees");
  revalidatePath("/");
  revalidatePath("/tree-planting");
}
