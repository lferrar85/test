import { SiteShell } from "@/components/layout/SiteShell";
import { Ray } from "@/components/brand/Ray";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container-x grid min-h-[80svh] place-items-center pt-24 text-center">
        <div>
          <Ray mood="thinking" size={160} className="mx-auto" label="Ray looking puzzled" />
          <p className="eyebrow mt-6 text-leaf-2">404</p>
          <h1 className="mt-3 text-[length:var(--step-5)]">That page has gone off-grid.</h1>
          <p className="mx-auto mt-4 max-w-md text-muted">The link may be old or mistyped. Let&apos;s get you back into the sunshine.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/">Back home</Button>
            <Button href="/compare" variant="outline">Compare solar</Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
