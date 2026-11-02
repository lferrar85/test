"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isValidUkPostcode, normalisePostcode } from "@/lib/utils/postcode";

export function PostcodeForm({
  className,
  variant = "light",
  size = "lg",
  buttonLabel = "Compare solar quotes",
  shortLabel = "Compare quotes",
  id = "postcode",
}: {
  className?: string;
  variant?: "light" | "dark";
  size?: "md" | "lg";
  buttonLabel?: string;
  /** Used when the form's own container is narrow. */
  shortLabel?: string;
  id?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pc = normalisePostcode(value);
    if (!isValidUkPostcode(pc)) {
      setError("Please enter a valid UK postcode, e.g. SW1A 1AA");
      return;
    }
    setError(null);
    router.push(`/compare?postcode=${encodeURIComponent(pc)}`);
  }

  const dark = variant === "dark";
  return (
    <form onSubmit={submit} noValidate className={cn("@container w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Your postcode
      </label>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-[1.6rem] p-1.5 @[27rem]:flex-row @[27rem]:items-center @[27rem]:rounded-[var(--r-pill)]",
          dark ? "bg-white/10 ring-1 ring-white/20 backdrop-blur-sm" : "bg-white shadow-[0_20px_60px_-24px_rgba(11,29,51,0.35)] ring-1 ring-ink/10",
        )}
      >
        <input
          id={id}
          name="postcode"
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          placeholder="Enter your postcode"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "min-w-[11rem] flex-1 rounded-[var(--r-pill)] bg-transparent px-5 font-semibold tracking-wide placeholder:font-medium focus:outline-none",
            size === "lg" ? "py-3.5 text-[length:var(--step-1)]" : "py-2.5 text-[length:var(--step-0)]",
            dark ? "text-white placeholder:text-white/60" : "text-ink placeholder:text-ink/45",
          )}
        />
        <button
          type="submit"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-pill)] bg-solar font-bold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300 ease-[var(--ease-out)] hover:bg-solar-2 active:scale-[0.98]",
            size === "lg" ? "px-7 py-3.5 text-[length:var(--step-0)]" : "px-5 py-2.5 text-[length:var(--step--1)]",
          )}
        >
          <span className="@[34rem]:hidden">{shortLabel ?? buttonLabel}</span>
          <span className="hidden @[34rem]:inline">{buttonLabel}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className={cn("mt-2 pl-4 text-[length:var(--step--1)] font-medium", dark ? "text-solar-3" : "text-coral")}>
          {error}
        </p>
      )}
    </form>
  );
}
