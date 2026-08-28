import { Reveal } from "@/components/ui/Reveal";
import type { Benefit, SectionHeading } from "@/lib/types";

interface ServiceBenefitsProps {
  heading: SectionHeading;
  items: Benefit[];
}

export function ServiceBenefits({ heading, items }: ServiceBenefitsProps) {
  return (
    <section className="border-b border-grid">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <Reveal>
          <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-amber">
                {heading.eyebrow}
              </p>
              <h2 className="max-w-xl text-2xl font-bold text-paper md:text-3xl">
                {heading.title}
              </h2>
            </div>
            {heading.description ? (
              <p className="max-w-xs text-sm leading-relaxed text-muted md:text-left">
                {heading.description}
              </p>
            ) : null}
          </div>
        </Reveal>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {items.map((item, index) => (
            <Reveal key={item.title} as="li" delay={index * 70}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-none border border-grid bg-canvas-deep p-5 transition-colors duration-500 hover:border-amber">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-right scale-x-0 bg-amber transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />

                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] tabular-nums text-amber">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="h-px w-8 bg-grid transition-all duration-500 group-hover:w-12 group-hover:bg-amber/60"
                  />
                </div>

                <h3 className="mb-2 text-base font-bold leading-snug text-paper">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted md:text-[13px]">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
