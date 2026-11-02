"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^[+0-9 ()-]{10,16}$/, "Enter a valid UK phone number"),
  postcode: z.string().trim().min(5, "Enter your postcode"),
  notes: z.string().trim().max(1000, "Please keep this under 1,000 characters").optional().or(z.literal("")),
  shareWithInstallers: z.literal(true, { message: "We need your permission to share your details with matched installers" }),
  marketing: z.boolean(),
  website: z.string().max(0).optional(),
});
export type ContactValues = z.infer<typeof schema>;

export function ContactStep({
  defaults,
  postcode,
  onBack,
  onSubmit,
  submitting,
  serverError,
}: {
  defaults: { name: string; email: string; phone: string; notes: string };
  postcode: string;
  onBack: () => void;
  onSubmit: (v: ContactValues) => void;
  submitting: boolean;
  serverError?: string | null;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaults, postcode, marketing: false, website: "" } as Partial<ContactValues>,
    mode: "onBlur",
  });

  const field = (name: keyof ContactValues) => cn("field", errors[name] && "border-coral");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="c-name" className="label">Your name</label>
          <input id="c-name" autoComplete="name" className={field("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-err" : undefined} {...register("name")} />
          {errors.name && <p id="c-name-err" className="error-text">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email address</label>
          <input id="c-email" type="email" inputMode="email" autoComplete="email" className={field("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-err" : undefined} {...register("email")} />
          {errors.email && <p id="c-email-err" className="error-text">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="c-phone" className="label">Telephone number</label>
          <input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" className={field("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "c-phone-err" : undefined} {...register("phone")} />
          {errors.phone && <p id="c-phone-err" className="error-text">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="c-postcode" className="label">Postcode</label>
          <input id="c-postcode" autoComplete="postal-code" className={field("postcode")} aria-invalid={!!errors.postcode} {...register("postcode")} />
          {errors.postcode && <p className="error-text">{errors.postcode.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-notes" className="label">Anything else we should know? <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="c-notes" rows={3} className={field("notes")} placeholder="e.g. roof age, shading, planned extension, access" {...register("notes")} />
          {errors.notes && <p className="error-text">{errors.notes.message}</p>}
        </div>
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="space-y-3 rounded-[var(--r-md)] bg-cream-2 p-5">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--ink)]" {...register("shareWithInstallers")} aria-invalid={!!errors.shareWithInstallers} />
          <span className="text-[length:var(--step--1)]">
            <strong className="font-semibold">Share my details with matched installers.</strong> I agree that GoSolarCompare may pass my name, contact details and property information to up to four approved installers so they can contact me about a quotation. Required to use the service.
          </span>
        </label>
        {errors.shareWithInstallers && <p className="error-text pl-8">{errors.shareWithInstallers.message}</p>}
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--ink)]" {...register("marketing")} />
          <span className="text-[length:var(--step--1)]">
            <strong className="font-semibold">Keep me posted (optional).</strong> Send me occasional emails from GoSolarCompare about solar, batteries and home energy. No spam, unsubscribe any time.
          </span>
        </label>
        <p className="flex items-start gap-2 pt-1 text-[length:var(--step--2)] text-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            We only share your details with the installers we match you with. We never sell your data. Read our{" "}
            <Link href="/privacy" className="underline">privacy policy</Link>.
          </span>
        </p>
      </div>

      {serverError && <p role="alert" className="error-text">{serverError}</p>}

      <div className="flex items-center justify-between gap-4 pt-2">
        <Button type="button" variant="ghost" onClick={onBack} slide={false}>← Back</Button>
        <Button type="submit" size="lg" disabled={submitting} slide={false}>
          {submitting ? "Sending…" : "Find my matches"}
        </Button>
      </div>
    </form>
  );
}
