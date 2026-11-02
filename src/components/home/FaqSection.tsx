import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { faqs } from "@/lib/content/faqs";

export function FaqSection({ items = faqs, limit }: { items?: typeof faqs; limit?: number }) {
  const list = limit ? items.slice(0, limit) : items;
  return (
    <section className="section-y bg-cream" id="faqs">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Questions" title="Straight answers about going solar." lead="No jargon, no guaranteed-savings nonsense." />
          <Button href="/faqs" variant="outline" className="mt-8">All FAQs</Button>
        </div>
        <div className="lg:col-span-8">
          <Accordion items={list} />
        </div>
      </div>
    </section>
  );
}
