import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Shown wherever demonstration data is displayed. Never remove without wiring live data. */
export function DemoNotice({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-[var(--r-md)] border border-sky-2 bg-sky/60 px-4 py-3 text-[length:var(--step--1)] text-ink", className)} role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Demonstration data.</strong>{" "}
        {children ?? "The installers, figures and quotes shown here are illustrative placeholders used while the platform is in development. They are not real companies or offers."}
      </p>
    </div>
  );
}
