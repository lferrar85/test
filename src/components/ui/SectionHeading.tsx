import { cn } from "@/lib/utils/cn";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  onInk = false,
  className,
  titleClassName,
  as = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  onInk?: boolean;
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const Tag = as;
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-4", onInk ? "text-solar" : "text-leaf-2")}>{eyebrow}</p>
      )}
      <Tag className={cn("text-[length:var(--step-5)]", onInk ? "text-[var(--text-on-ink)]" : "text-ink", titleClassName)}>{title}</Tag>
      {lead && (
        <p className={cn("mt-5 max-w-2xl text-[length:var(--step-1)] leading-relaxed", align === "center" && "mx-auto", onInk ? "text-[var(--text-on-ink-muted)]" : "text-muted")}>
          {lead}
        </p>
      )}
    </Reveal>
  );
}
