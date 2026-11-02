import { Forest, GrowingTree } from "@/components/brand/Forest";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getPublicTreeStats } from "@/lib/data/public-stats";

export async function TreePromise() {
  const stats = await getPublicTreeStats();
  return (
    <section className="grain relative overflow-hidden bg-leaf-2 text-white" id="tree-promise">
      <div className="container-x section-y relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-solar">Our tree-planting promise</p>
              <h2 className="mt-4 text-[length:var(--step-6)] leading-[0.98]">
                Good for your home. <span className="text-solar">Better for the planet.</span>
              </h2>
              <p className="mt-6 max-w-xl text-[length:var(--step-1)] text-white/80">
                For every completed installation through GoSolarCompare, we&apos;ll plant a tree. Your solar journey grows more than savings.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/tree-planting" variant="cream">Read the full promise</Button>
                <Button href="/compare" variant="outline-light" className="border-white/40 text-white hover:border-solar">Start your journey</Button>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal className="rounded-[2rem] bg-white/10 p-8 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <GrowingTree className="h-40 w-32 shrink-0" />
                <div>
                  <p className="eyebrow text-white/70">Verified trees planted</p>
                  <p className="mt-2 font-display text-[length:var(--step-6)] font-extrabold leading-none text-solar">
                    <Counter to={stats.treesConfirmedPlanted} />
                  </p>
                  <p className="mt-3 text-[length:var(--step--1)] text-white/75">
                    {stats.treesConfirmedPlanted === 0
                      ? "Our counter starts at zero and only moves when a planting is confirmed by our partner. No estimates, no rounding up."
                      : "Only confirmed plantings are counted."}
                  </p>
                  {stats.treesDue > 0 && (
                    <p className="mt-2 text-[length:var(--step--1)] text-white/75">
                      <span className="font-semibold text-white">{stats.treesDue}</span> tree{stats.treesDue === 1 ? "" : "s"} due for planting from completed installations.
                    </p>
                  )}
                  <p className="mt-3 text-[length:var(--step--2)] uppercase tracking-[0.12em] text-white/60">
                    {stats.plantingPartner ? `Planting partner: ${stats.plantingPartner}` : "Planting partner: to be announced"}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      <Forest trees={30} className="relative -mb-2 w-full" />
    </section>
  );
}
