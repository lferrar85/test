import { cn } from "@/lib/utils/cn";

/** Long-form content wrapper with sensible typographic defaults. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[length:var(--step-0)] leading-relaxed text-ink/85",
        "[&_h2]:mt-12 [&_h2]:text-[length:var(--step-3)] [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:text-[length:var(--step-1)] [&_h3]:text-ink",
        "[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
