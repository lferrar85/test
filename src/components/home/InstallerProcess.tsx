import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const stages = [
  { title: "Apply", body: "Installers submit company details, certifications, insurance and evidence of their work." },
  { title: "Verify", body: "Our team checks the evidence against the requirements for each technology they want to offer." },
  { title: "Approve", body: "Only an administrator can approve an application. Nothing is automatic and nothing can be bought." },
  { title: "Monitor", body: "Expiry dates are tracked, customer feedback is reviewed and installers are periodically re-verified." },
];

export function InstallerProcess() {
  return (
    <section className="section-y bg-cream-2" id="installers">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-leaf-2">Trusted installers</p>
            <h2 className="mt-4 text-[length:var(--step-5)]">You can&apos;t buy a place on GoSolarCompare.</h2>
            <p className="mt-6 text-[length:var(--step-1)] text-muted">
              Other platforms list anyone who pays. We approve companies on evidence, keep commercial arrangements separate from quality indicators and remove installers who stop meeting the standard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/approved-installers" variant="ink">Our approval process</Button>
              <Button href="/installers/apply" variant="outline">Apply as an installer</Button>
            </div>
          </Reveal>
        </div>
        <Stagger as="ol" className="grid gap-px overflow-hidden rounded-[var(--r-lg)] bg-ink/10 ring-1 ring-ink/10 sm:grid-cols-2 lg:col-span-7">
          {stages.map((s, i) => (
            <StaggerItem as="li" key={s.title} className="bg-white p-8">
              <span className="font-display text-[length:var(--step-3)] font-extrabold text-solar-2">0{i + 1}</span>
              <h3 className="mt-3 text-[length:var(--step-2)]">{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
