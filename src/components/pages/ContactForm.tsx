"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/domain/schemas";
import { Button } from "@/components/ui/Button";
import { Ray } from "@/components/brand/Ray";

export function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: { topic: "homeowner", website: "" } });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function onSubmit(v: ContactInput) {
    setErr(null);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    if (res.ok) setSent(true);
    else setErr("Something went wrong. Please email us directly.");
  }
  if (sent) {
    return (
      <div className="rounded-[var(--r-lg)] bg-white p-10 text-center ring-1 ring-ink/10">
        <Ray mood="celebrate" size={120} className="mx-auto" />
        <h2 className="mt-4 text-[length:var(--step-3)]">Thanks, we&apos;ve got your message.</h2>
        <p className="mt-2 text-muted">We aim to reply within two working days.</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-[var(--r-lg)] bg-white p-8 ring-1 ring-ink/10">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="ct-name">Your name</label><input id="ct-name" className="field" autoComplete="name" {...register("name")} />{errors.name && <p className="error-text">{errors.name.message}</p>}</div>
        <div><label className="label" htmlFor="ct-email">Email</label><input id="ct-email" type="email" className="field" autoComplete="email" {...register("email")} />{errors.email && <p className="error-text">{errors.email.message}</p>}</div>
      </div>
      <div><label className="label" htmlFor="ct-topic">I&apos;m contacting you as</label>
        <select id="ct-topic" className="field" {...register("topic")}><option value="homeowner">A homeowner</option><option value="installer">An installer</option><option value="press">Press or partnerships</option><option value="other">Something else</option></select></div>
      <div><label className="label" htmlFor="ct-msg">Message</label><textarea id="ct-msg" rows={5} className="field" {...register("message")} />{errors.message && <p className="error-text">{errors.message.message}</p>}</div>
      <div className="hidden" aria-hidden="true"><input tabIndex={-1} autoComplete="off" {...register("website")} /></div>
      {err && <p role="alert" className="error-text">{err}</p>}
      <Button type="submit" disabled={isSubmitting} slide={false}>{isSubmitting ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
