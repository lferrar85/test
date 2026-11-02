import { Ray } from "@/components/brand/Ray";
import { PostcodeForm } from "@/components/ui/PostcodeForm";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta({ headline = "Ready to make a brighter choice?" }: { headline?: string }) {
  return (
    <section className="grain relative overflow-hidden bg-solar text-ink" id="start">
      <div className="container-x section-y relative grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Reveal>
            <h2 className="text-[length:var(--step-6)] leading-[0.98]">{headline}</h2>
            <p className="mt-5 max-w-xl text-[length:var(--step-1)] text-ink/75">Enter your postcode to start comparing approved installers. Free, independent and no obligation.</p>
            <PostcodeForm className="mt-8 max-w-xl" id="final-postcode" />
          </Reveal>
        </div>
        <div className="hidden justify-end lg:col-span-4 lg:flex">
          <Ray mood="celebrate" size={220} label="Ray celebrating" />
        </div>
      </div>
    </section>
  );
}
