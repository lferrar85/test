import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SolutionArt, type SolutionKey } from "@/components/brand/SolutionArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

export const solutions: { key: SolutionKey; title: string; body: string; href: string; tone: string }[] = [
  { key: "solar", title: "Solar panels", body: "Generate your own clean electricity and cut what you buy from the grid.", href: "/solar-panels", tone: "bg-sky" },
  { key: "solar-battery", title: "Solar panels and battery storage", body: "Capture daytime sunshine and use it in the evening when it matters most.", href: "/battery-storage?with=solar", tone: "bg-solar-3/60" },
  { key: "battery", title: "Home battery storage", body: "Already have solar, or on a smart tariff? Store cheap or surplus energy for later.", href: "/battery-storage", tone: "bg-leaf-3" },
  { key: "ev", title: "EV chargers", body: "Charge at home, overnight or on your own solar, with a smart home charge point.", href: "/ev-chargers", tone: "bg-cream-3" },
  { key: "heat-pump", title: "Heat pumps", body: "Low-carbon heating and hot water, designed around your home.", href: "/heat-pumps", tone: "bg-[#ffe3d9]" },
  { key: "whole-home", title: "Complete home energy", body: "Solar, battery, EV charging and heating planned together as one system.", href: "/compare?interest=whole-home", tone: "bg-ink text-cream" },
];

export function Solutions() {
  return (
    <section className="section-y bg-cream" id="solutions">
      <div className="container-x">
        <SectionHeading eyebrow="Solar solutions" title="Whatever you're planning, start here." lead="From a first set of panels to a complete home energy system, our approved installers cover it." />
        <Stagger as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {solutions.map((s, i) => (
            <StaggerItem
              as="li"
              key={s.key}
              className={cn(
                "group",
                i === 0 || i === 1 ? "lg:col-span-3" : "lg:col-span-2",
              )}
            >
              <Link
                href={s.href}
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-[var(--r-lg)] ring-1 ring-ink/10 transition-all duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:ring-ink",
                  s.tone,
                )}
              >
                <div className={cn("relative overflow-hidden", i < 2 ? "aspect-[16/8]" : "aspect-[16/9]")}>
                  <div className="absolute inset-0 p-6 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.06]">
                    <SolutionArt kind={s.key} />
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between gap-4 p-6">
                  <div>
                    <h3 className="text-[length:var(--step-1)]">{s.title}</h3>
                    <p className={cn("mt-2 text-[length:var(--step--1)]", s.key === "whole-home" ? "text-cream/75" : "text-muted")}>{s.body}</p>
                  </div>
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-500 group-hover:rotate-45", s.key === "whole-home" ? "bg-solar text-ink" : "bg-ink text-cream")}>
                    <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
