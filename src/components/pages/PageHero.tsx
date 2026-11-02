import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

export function PageHero({ eyebrow, title, lead, children, tone = "ink", aside }: { eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; tone?: "ink" | "cream" | "leaf" | "solar"; aside?: React.ReactNode }) {
  const dark = tone === "ink" || tone === "leaf";
  return (
    <section className={cn("grain relative overflow-hidden", tone === "ink" && "bg-ink text-[var(--text-on-ink)]", tone === "leaf" && "bg-leaf-2 text-white", tone === "cream" && "bg-cream-2 text-ink", tone === "solar" && "bg-solar text-ink")}>
      <div className="container-x grid items-center gap-10 pb-16 pt-32 lg:grid-cols-12 lg:pb-24 lg:pt-40">
        <Reveal className={cn(aside ? "lg:col-span-7" : "lg:col-span-9")}>
          {eyebrow && <p className={cn("eyebrow", dark ? "text-solar" : "text-leaf-2")}>{eyebrow}</p>}
          <h1 className="mt-4 text-[length:var(--step-6)] leading-[0.98]">{title}</h1>
          {lead && <p className={cn("mt-6 max-w-2xl text-[length:var(--step-1)] leading-relaxed", dark ? "text-[var(--text-on-ink-muted)]" : "text-ink/75")}>{lead}</p>}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </div>
    </section>
  );
}
