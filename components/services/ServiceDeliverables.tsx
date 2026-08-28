import { Reveal } from "@/components/ui/Reveal";
import { FixedSectionMedia } from "@/components/ui/FixedSectionMedia";
import type { Deliverable, SectionHeading } from "@/lib/types";

interface ServiceDeliverablesProps {
  heading: SectionHeading;
  items: Deliverable[];
  backgroundImage: string;
}

export function ServiceDeliverables({
  heading,
  items,
  backgroundImage,
}: ServiceDeliverablesProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-grid">
      <FixedSectionMedia
        src={backgroundImage}
        position="left center"
        shape="deliverables-wedge"
        veil="deliverables"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-l from-canvas via-canvas/50 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-amber">
            {heading.eyebrow}
          </p>
          <h2 className="mb-3 max-w-2xl text-2xl font-bold text-paper md:text-3xl">
            {heading.title}
          </h2>
          {heading.description ? (
            <p className="mb-12 max-w-xl text-sm leading-relaxed text-muted md:mb-14">
              {heading.description}
            </p>
          ) : (
            <div className="mb-12 md:mb-14" />
          )}
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {items.map((item, index) => (
            <Reveal key={item.label} as="li" delay={index * 70}>
              <div className="group relative flex min-h-[88px] items-stretch overflow-hidden rounded-none border border-grid bg-canvas-deep/95 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors duration-500 hover:border-amber">
                <span
                  aria-hidden
                  className="absolute inset-y-0 right-0 w-[3px] origin-bottom scale-y-0 bg-amber transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
                />

                <div className="flex w-14 shrink-0 flex-col items-center justify-center border-l border-grid bg-canvas/50">
                  <span className="font-mono text-[10px] text-muted transition-colors duration-300 group-hover:text-amber">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-1 items-start gap-3 px-4 py-4 md:px-5 md:py-5">
                  <span
                    aria-hidden
                    className="mt-0.5 font-mono text-sm text-amber transition-transform duration-300 group-hover:scale-110"
                  >
                    ✓
                  </span>
                  <p className="text-sm leading-relaxed text-paper md:text-[15px]">
                    {item.label}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
