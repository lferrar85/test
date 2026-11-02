import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * GoSolarCompare mark: a solar disc with eight petal rays and an approval tick.
 * The tick is the brand's promise in one glyph: only approved installers.
 */
export function LogoMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  const ink = dark ? "#0b1d33" : "#0b1d33";
  return (
    <svg viewBox="0 0 64 64" className={cn("h-9 w-9", className)} aria-hidden="true" focusable="false">
      <g transform="translate(32 32)">
        <g fill="var(--solar)">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="-2.8" y="-31" width="5.6" height="10" rx="2.8" transform={`rotate(${i * 45})`} />
          ))}
        </g>
        <circle r="16.5" fill="var(--solar)" />
        <path
          d="M-7.5 1.5 L-2 7 L8.5 -5.5"
          fill="none"
          stroke={ink}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  onInk = false,
  compact = false,
}: {
  className?: string;
  onInk?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label="GoSolarCompare home"
    >
      <LogoMark className="h-9 w-9 transition-transform duration-500 ease-[var(--ease-out)] group-hover:rotate-45" />
      {!compact && (
        <span
          className={cn(
            "font-display text-[1.15rem] font-extrabold tracking-[-0.035em] sm:text-[1.35rem]",
            onInk ? "text-[var(--text-on-ink)]" : "text-ink",
          )}
        >
          Go<span className={onInk ? "text-solar" : "text-ink"}>Solar</span>Compare
        </span>
      )}
    </Link>
  );
}
