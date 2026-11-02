"use client";

import { useState } from "react";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, FileText, Plus, Trash2, Upload } from "lucide-react";
import { installerApplicationSchema, type InstallerApplicationFormInput, type InstallerApplicationInput } from "@/lib/domain/schemas";
import { CERTIFICATION_REQUIREMENTS } from "@/lib/domain/requirements";
import { ACCREDITATION_LABEL, TECHNOLOGY_LABEL, type AccreditationType, type Technology } from "@/lib/domain/types";
import { Button } from "@/components/ui/Button";
import { Ray } from "@/components/brand/Ray";
import { cn } from "@/lib/utils/cn";

const sections = ["Business", "Technologies & certifications", "Protection", "Performance", "References & documents", "Declarations"];
const technologies = Object.keys(TECHNOLOGY_LABEL) as Technology[];
const accreditationTypes = Object.keys(ACCREDITATION_LABEL) as AccreditationType[];
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";
const MAX_MB = 10;

type DocMeta = { name: string; size: number; type: string; category: string };

export function ApplicationForm() {
  const reduce = useReducedMotion();
  const [section, setSection] = useState(0);
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [docError, setDocError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string } | null>(null);

  const form = useForm<InstallerApplicationFormInput, unknown, InstallerApplicationInput>({
    resolver: zodResolver(installerApplicationSchema),
    mode: "onBlur",
    defaultValues: {
      business: { legalName: "", tradingName: "", companiesHouseNumber: "", addressLine1: "", addressLine2: "", town: "", postcode: "", website: "", yearsTrading: 0, contactName: "", contactRole: "", phone: "", email: "" },
      technologies: [],
      accreditations: [{ type: "MCS", name: "", reference: "", scope: [], expiresAt: "" }],
      protection: { publicLiabilityInsurer: "", publicLiabilityCover: 2000000, publicLiabilityExpiry: "", employersLiabilityApplicable: true, employersLiabilityInsurer: "", employersLiabilityExpiry: "", workmanshipYears: 0, insuranceBacked: false, insuranceBackedProvider: "", productWarrantySummary: "" },
      performance: { installationsPerYear: 0, coverageAreas: "", installationTeams: 1, panelBrands: "", batteryBrands: "", customerService: "", aftercare: "" },
      references: { testimonials: "", reviewProfiles: "", exampleInstallations: "", references: "" },
      documents: [],
      declarations: { accurate: undefined as unknown as true, terms: undefined as unknown as true },
      website_hp: "",
    },
  });
  const { register, handleSubmit, watch, setValue, trigger, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "accreditations" });
  const chosenTech = watch("technologies");
  const elApplicable = watch("protection.employersLiabilityApplicable");
  const ibg = watch("protection.insuranceBacked");

  const sectionFields: (keyof InstallerApplicationFormInput)[][] = [["business"], ["technologies", "accreditations"], ["protection"], ["performance"], ["references"], ["declarations"]];

  async function nextSection() {
    const ok = await trigger(sectionFields[section] as never);
    if (!ok) return;
    setSection((s) => Math.min(s + 1, sections.length - 1));
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>, category: string) {
    setDocError(null);
    const files = Array.from(e.target.files ?? []);
    const next: DocMeta[] = [];
    for (const f of files) {
      if (f.size > MAX_MB * 1024 * 1024) { setDocError(`${f.name} is larger than ${MAX_MB} MB`); continue; }
      if (!/\.(pdf|png|jpe?g|webp)$/i.test(f.name)) { setDocError(`${f.name} is not a PDF or image`); continue; }
      next.push({ name: f.name, size: f.size, type: f.type, category });
    }
    const all = [...docs, ...next];
    setDocs(all);
    setValue("documents", all);
    e.target.value = "";
  }

  async function onSubmit(values: InstallerApplicationInput) {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/installers/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, documents: docs }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setDone({ id: data.id });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function onInvalid(errs: FieldErrors<InstallerApplicationFormInput>) {
    const idx = sectionFields.findIndex((keys) => keys.some((k) => errs[k]));
    if (idx >= 0) setSection(idx);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl rounded-[var(--r-lg)] bg-white p-10 text-center ring-1 ring-ink/10">
        <Ray mood="celebrate" size={140} className="mx-auto" />
        <p className="eyebrow mt-6 text-leaf-2">Application received</p>
        <h2 className="mt-3 text-[length:var(--step-4)]">Thank you. Your application is now pending review.</h2>
        <p className="mt-4 text-muted">
          Our team will check your company details, certifications and insurance against the requirements for each technology you&apos;ve selected. We&apos;ll email you if we need more information. Nobody is approved automatically, and we aim to respond within ten working days.
        </p>
        <p className="mt-4 text-[length:var(--step--1)] text-muted">Reference: <span className="font-mono font-semibold text-ink">{done.id}</span></p>
        <Button href="/" variant="outline" className="mt-8">Back to the homepage</Button>
      </div>
    );
  }

  const input = (name: string, hasError: boolean) => cn("field", hasError && "border-coral");

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="grid gap-10 lg:grid-cols-12">
      {/* Section nav */}
      <nav aria-label="Application sections" className="min-w-0 lg:col-span-3">
        <ol className="flex max-w-full gap-2 overflow-x-auto no-scrollbar lg:sticky lg:top-28 lg:flex-col">
          {sections.map((s, i) => (
            <li key={s}>
              <button type="button" onClick={() => setSection(i)} aria-current={section === i ? "step" : undefined}
                className={cn("flex w-full items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-left text-[length:var(--step--1)] font-semibold transition-colors lg:whitespace-normal", section === i ? "bg-ink text-cream" : "text-muted hover:bg-ink/5")}>
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem]", section === i ? "bg-solar text-ink" : i < section ? "bg-leaf text-white" : "bg-ink/10")}>
                  {i < section ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-w-0 lg:col-span-9">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={section} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="rounded-[var(--r-lg)] bg-white p-6 ring-1 ring-ink/10 sm:p-10">
            <p className="eyebrow text-leaf-2">Section {section + 1} of {sections.length}</p>
            <h2 className="mt-2 text-[length:var(--step-3)]">{sections[section]}</h2>

            {section === 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Registered business name" error={errors.business?.legalName?.message} className="sm:col-span-2"><input className={input("legalName", !!errors.business?.legalName)} {...register("business.legalName")} /></Field>
                <Field label="Trading name" error={errors.business?.tradingName?.message}><input className={input("tradingName", !!errors.business?.tradingName)} {...register("business.tradingName")} /></Field>
                <Field label="Companies House number" error={errors.business?.companiesHouseNumber?.message} hint="8 characters, e.g. 01234567"><input className={input("ch", !!errors.business?.companiesHouseNumber)} {...register("business.companiesHouseNumber")} /></Field>
                <Field label="Address line 1" error={errors.business?.addressLine1?.message} className="sm:col-span-2"><input autoComplete="address-line1" className={input("a1", !!errors.business?.addressLine1)} {...register("business.addressLine1")} /></Field>
                <Field label="Address line 2 (optional)"><input autoComplete="address-line2" className="field" {...register("business.addressLine2")} /></Field>
                <Field label="Town or city" error={errors.business?.town?.message}><input autoComplete="address-level2" className={input("town", !!errors.business?.town)} {...register("business.town")} /></Field>
                <Field label="Postcode" error={errors.business?.postcode?.message}><input autoComplete="postal-code" className={input("pc", !!errors.business?.postcode)} {...register("business.postcode")} /></Field>
                <Field label="Website (optional)" error={errors.business?.website?.message}><input type="url" placeholder="https://" className={input("web", !!errors.business?.website)} {...register("business.website")} /></Field>
                <Field label="Years trading" error={errors.business?.yearsTrading?.message}><input type="number" min={0} className="field" {...register("business.yearsTrading")} /></Field>
                <Field label="Main contact name" error={errors.business?.contactName?.message}><input autoComplete="name" className={input("cn", !!errors.business?.contactName)} {...register("business.contactName")} /></Field>
                <Field label="Role (optional)"><input className="field" {...register("business.contactRole")} /></Field>
                <Field label="Telephone" error={errors.business?.phone?.message}><input type="tel" autoComplete="tel" className={input("ph", !!errors.business?.phone)} {...register("business.phone")} /></Field>
                <Field label="Email" error={errors.business?.email?.message}><input type="email" autoComplete="email" className={input("em", !!errors.business?.email)} {...register("business.email")} /></Field>
              </div>
            )}

            {section === 1 && (
              <div className="mt-8 space-y-10">
                <div>
                  <p className="label">Which technologies do you install?</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {technologies.map((t) => {
                      const on = chosenTech.includes(t);
                      return (
                        <label key={t} className={cn("flex cursor-pointer items-center gap-3 rounded-[var(--r-md)] border-2 p-4 transition-colors", on ? "border-ink" : "border-ink/10 hover:border-ink/40")}>
                          <input type="checkbox" value={t} className="h-5 w-5 accent-[var(--ink)]" {...register("technologies")} />
                          <span className="font-semibold">{TECHNOLOGY_LABEL[t]}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.technologies && <p className="error-text">{errors.technologies.message as string}</p>}
                </div>

                {chosenTech.length > 0 && (
                  <div className="rounded-[var(--r-md)] bg-cream-2 p-5">
                    <p className="font-semibold">What we&apos;ll look for</p>
                    <p className="mt-1 text-[length:var(--step--1)] text-muted">Requirements depend on the technologies you offer. Only verified accreditations are displayed to homeowners.</p>
                    <ul className="mt-4 space-y-3">
                      {chosenTech.map((t) => (
                        <li key={t}>
                          <p className="text-[length:var(--step--1)] font-semibold uppercase tracking-wider text-leaf-2">{TECHNOLOGY_LABEL[t]}</p>
                          <ul className="mt-1 space-y-1 text-[length:var(--step--1)]">
                            {CERTIFICATION_REQUIREMENTS[t].map((r) => (
                              <li key={r.label} className="flex gap-2">
                                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", r.level === "required" ? "bg-coral" : "bg-sky-2")} aria-hidden="true" />
                                <span><strong>{r.label}</strong> <span className="text-muted">({r.level}; {r.anyOf.join(" or ")})</span></span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <p className="label mb-0">Certifications and accreditations</p>
                    <Button type="button" variant="outline" size="sm" slide={false} onClick={() => append({ type: "TRUSTMARK", name: "", reference: "", scope: [], expiresAt: "" })} icon={<Plus className="h-4 w-4" />}>Add another</Button>
                  </div>
                  <div className="mt-3 space-y-4">
                    {fields.map((f, i) => (
                      <div key={f.id} className="rounded-[var(--r-md)] border border-ink/10 p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Type"><select className="field" {...register(`accreditations.${i}.type` as const)}>{accreditationTypes.map((a) => <option key={a} value={a}>{ACCREDITATION_LABEL[a]}</option>)}</select></Field>
                          {watch(`accreditations.${i}.type`) === "OTHER" && <Field label="Name"><input className="field" {...register(`accreditations.${i}.name` as const)} /></Field>}
                          <Field label="Reference / certificate number"><input className="field" {...register(`accreditations.${i}.reference` as const)} /></Field>
                          <Field label="Expiry or renewal date"><input type="date" className="field" {...register(`accreditations.${i}.expiresAt` as const)} /></Field>
                          <div className="sm:col-span-2">
                            <p className="label">Covers which technologies?</p>
                            <div className="flex flex-wrap gap-2">
                              {technologies.map((t) => (
                                <label key={t} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-[length:var(--step--1)]">
                                  <input type="checkbox" value={t} className="accent-[var(--ink)]" {...register(`accreditations.${i}.scope` as const)} /> {TECHNOLOGY_LABEL[t]}
                                </label>
                              ))}
                            </div>
                            {errors.accreditations?.[i]?.scope && <p className="error-text">{errors.accreditations[i]?.scope?.message as string}</p>}
                          </div>
                        </div>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(i)} className="mt-3 inline-flex items-center gap-1 text-[length:var(--step--1)] font-semibold text-coral"><Trash2 className="h-4 w-4" /> Remove</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 2 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Public liability insurer" error={errors.protection?.publicLiabilityInsurer?.message}><input className={input("pli", !!errors.protection?.publicLiabilityInsurer)} {...register("protection.publicLiabilityInsurer")} /></Field>
                <Field label="Cover amount (£)" error={errors.protection?.publicLiabilityCover?.message}><input type="number" min={0} step={100000} className="field" {...register("protection.publicLiabilityCover")} /></Field>
                <Field label="Public liability expiry" error={errors.protection?.publicLiabilityExpiry?.message}><input type="date" className={input("ple", !!errors.protection?.publicLiabilityExpiry)} {...register("protection.publicLiabilityExpiry")} /></Field>
                <label className="flex items-center gap-3 self-end pb-3">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--ink)]" {...register("protection.employersLiabilityApplicable")} />
                  <span className="font-semibold">We employ staff (employer&apos;s liability applies)</span>
                </label>
                {elApplicable && (
                  <>
                    <Field label="Employer's liability insurer"><input className="field" {...register("protection.employersLiabilityInsurer")} /></Field>
                    <Field label="Employer's liability expiry"><input type="date" className="field" {...register("protection.employersLiabilityExpiry")} /></Field>
                  </>
                )}
                <Field label="Workmanship guarantee (years)" error={errors.protection?.workmanshipYears?.message}><input type="number" min={0} max={50} className="field" {...register("protection.workmanshipYears")} /></Field>
                <label className="flex items-center gap-3 self-end pb-3">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--ink)]" {...register("protection.insuranceBacked")} />
                  <span className="font-semibold">Guarantee is insurance-backed</span>
                </label>
                {ibg && <Field label="Insurance-backed guarantee provider" className="sm:col-span-2"><input className="field" {...register("protection.insuranceBackedProvider")} /></Field>}
                <Field label="Product warranties (summary)" className="sm:col-span-2" hint="e.g. panels 25 years product / 30 years performance; inverter 10 years; battery 10 years"><textarea rows={3} className="field" {...register("protection.productWarrantySummary")} /></Field>
              </div>
            )}

            {section === 3 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Installations completed per year" error={errors.performance?.installationsPerYear?.message}><input type="number" min={0} className="field" {...register("performance.installationsPerYear")} /></Field>
                <Field label="Number of installation teams" error={errors.performance?.installationTeams?.message}><input type="number" min={1} className="field" {...register("performance.installationTeams")} /></Field>
                <Field label="Areas covered" className="sm:col-span-2" hint="Postcode areas separated by commas, e.g. LS, BD, HG, YO" error={errors.performance?.coverageAreas?.message}><input className={input("cov", !!errors.performance?.coverageAreas)} {...register("performance.coverageAreas")} /></Field>
                <Field label="Solar panel brands used" hint="Comma separated"><input className="field" {...register("performance.panelBrands")} /></Field>
                <Field label="Battery brands used" hint="Comma separated"><input className="field" {...register("performance.batteryBrands")} /></Field>
                <Field label="Customer service arrangements" className="sm:col-span-2"><textarea rows={3} className="field" {...register("performance.customerService")} /></Field>
                <Field label="Aftercare arrangements" className="sm:col-span-2"><textarea rows={3} className="field" {...register("performance.aftercare")} /></Field>
              </div>
            )}

            {section === 4 && (
              <div className="mt-8 space-y-6">
                <Field label="Customer testimonials" hint="Separate each with a blank line. We may contact customers to verify."><textarea rows={4} className="field" {...register("references.testimonials")} /></Field>
                <Field label="External review profiles" hint="One URL per line (Trustpilot, Google, Which? Trusted Traders, Checkatrade...)"><textarea rows={3} className="field" {...register("references.reviewProfiles")} /></Field>
                <Field label="Example completed installations" hint="Location, system size, date and anything notable"><textarea rows={4} className="field" {...register("references.exampleInstallations")} /></Field>
                <Field label="References" hint="Trade or customer references we may contact"><textarea rows={3} className="field" {...register("references.references")} /></Field>

                <div>
                  <p className="label">Documents</p>
                  <p className="help mb-3">PDF or image files up to {MAX_MB} MB each. Upload certificates, insurance schedules, guarantee documents and example installation photos.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[["accreditation", "Certificates & accreditations"], ["insurance", "Insurance documents"], ["guarantee", "Guarantee documents"], ["portfolio", "Installation photos"]].map(([cat, label]) => (
                      <label key={cat} className="flex cursor-pointer items-center gap-3 rounded-[var(--r-md)] border-2 border-dashed border-ink/20 p-4 transition-colors hover:border-ink">
                        <Upload className="h-5 w-5" aria-hidden="true" />
                        <span className="font-semibold">{label}</span>
                        <input type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => onFiles(e, cat)} />
                      </label>
                    ))}
                  </div>
                  {docError && <p className="error-text">{docError}</p>}
                  {docs.length > 0 && (
                    <ul className="mt-4 divide-y divide-ink/10 rounded-[var(--r-md)] border border-ink/10">
                      {docs.map((d, i) => (
                        <li key={i} className="flex items-center gap-3 px-4 py-3 text-[length:var(--step--1)]">
                          <FileText className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                          <span className="flex-1 truncate">{d.name}</span>
                          <span className="text-muted">{(d.size / 1024 / 1024).toFixed(1)} MB · {d.category}</span>
                          <button type="button" aria-label={`Remove ${d.name}`} onClick={() => { const n = docs.filter((_, j) => j !== i); setDocs(n); setValue("documents", n); }} className="text-coral"><Trash2 className="h-4 w-4" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-[length:var(--step--2)] text-muted">In this development build, document contents are not transmitted; only file names and sizes are recorded so the review workflow can be tested. Production uploads go directly to private, access-controlled storage.</p>
                </div>
              </div>
            )}

            {section === 5 && (
              <div className="mt-8 space-y-5">
                <div className="rounded-[var(--r-md)] bg-cream-2 p-5 text-[length:var(--step--1)] text-muted">
                  <p>Submitting an application does not list your business on GoSolarCompare. Every application enters a pending review state. Our team checks evidence against the requirements for each technology, may request more information, and only an administrator can approve a listing. Approval is reviewed periodically and can be suspended or withdrawn.</p>
                </div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--ink)]" {...register("declarations.accurate")} />
                  <span>I confirm that the information provided is accurate and complete, and that I am authorised to apply on behalf of this business.</span>
                </label>
                {errors.declarations?.accurate && <p className="error-text pl-8">{errors.declarations.accurate.message}</p>}
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--ink)]" {...register("declarations.terms")} />
                  <span>I have read and accept the <a href="/terms#installers" className="underline">installer terms</a> and the <a href="/privacy" className="underline">privacy policy</a>.</span>
                </label>
                {errors.declarations?.terms && <p className="error-text pl-8">{errors.declarations.terms.message}</p>}
                <div className="hidden" aria-hidden="true"><input tabIndex={-1} autoComplete="off" {...register("website_hp")} /></div>
                {serverError && <p role="alert" className="error-text">{serverError}</p>}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink/10 pt-6">
              <Button type="button" variant="ghost" slide={false} onClick={() => setSection((s) => Math.max(0, s - 1))} className={cn(section === 0 && "invisible")}>← Back</Button>
              {section < sections.length - 1 ? (
                <Button type="button" slide={false} onClick={nextSection}>Continue →</Button>
              ) : (
                <Button type="submit" size="lg" slide={false} disabled={submitting}>{submitting ? "Submitting…" : "Submit application"}</Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </form>
  );
}

function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="help mt-1 block">{hint}</span>}
      {error && <span className="error-text block">{error}</span>}
    </label>
  );
}
