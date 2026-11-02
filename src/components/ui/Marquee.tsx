import { cn } from "@/lib/utils/cn";

export function Marquee({ items, className, itemClassName }: { items: string[]; className?: string; itemClassName?: string }) {
  const doubled = [...items, ...items];
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
      aria-hidden="true"
    >
      <div className="marquee-track gap-10 py-3">
        {doubled.map((t, i) => (
          <span key={i} className={cn("inline-flex items-center gap-10 whitespace-nowrap font-display text-[length:var(--step-1)] font-semibold tracking-[-0.01em]", itemClassName)}>
            {t}
            <span className="inline-block h-2 w-2 rounded-full bg-solar" />
          </span>
        ))}
      </div>
    </div>
  );
}
