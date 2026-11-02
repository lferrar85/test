import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "solar" | "ink" | "outline" | "outline-light" | "ghost" | "cream";
type Size = "sm" | "md" | "lg";

const base =
  "text-slide-host inline-flex items-center justify-center gap-2 rounded-[var(--r-pill)] font-semibold tracking-[-0.01em] transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[var(--ease-out)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  solar:
    "bg-solar text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_30px_-10px_rgba(255,176,0,0.6)] hover:bg-solar-2 hover:-translate-y-0.5",
  ink: "bg-ink text-[var(--text-on-ink)] hover:bg-ink-2 hover:-translate-y-0.5",
  outline: "border-[1.5px] border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-[var(--text-on-ink)]",
  "outline-light":
    "border-[1.5px] border-[rgba(247,243,234,0.35)] text-[var(--text-on-ink)] hover:border-solar hover:text-solar",
  ghost: "text-ink hover:bg-ink/5",
  cream: "bg-cream text-ink hover:bg-white hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[length:var(--step--1)]",
  md: "px-6 py-3 text-[length:var(--step-0)]",
  lg: "px-8 py-4 text-[length:var(--step-1)]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  slide?: boolean;
  icon?: ReactNode;
};

type ButtonProps = Common & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type LinkProps = Common & ComponentPropsWithoutRef<typeof Link> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "solar", size = "md", className, children, slide = true, icon, ...rest } = props;
  const cls = cn(base, variants[variant], sizes[size], className);
  const inner =
    slide && typeof children === "string" ? (
      <>
        <span className="text-slide">
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
        {icon}
      </>
    ) : (
      <>
        {children}
        {icon}
      </>
    );

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} {...(rest as ButtonProps)}>
      {inner}
    </button>
  );
}
