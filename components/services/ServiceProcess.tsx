import { Reveal } from "@/components/ui/Reveal";
import type { ProcessStep, SectionHeading } from "@/lib/types";

interface ServiceProcessProps {
  heading: SectionHeading;
  steps: ProcessStep[];
}

export function ServiceProcess({ heading, steps }: ServiceProcessProps) {
  const total = steps.length;

  return (
    <section id="process" className="border-b border-grid">
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

        <div className="relative mb-6 hidden md:block" aria-hidden>
          <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-grid" />
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <span
                key={step.revision}
                className="flex h-2.5 w-2.5 items-center justify-center rounded-full border border-amber bg-canvas"
              />
            ))}
          </div>
        </div>

        <ol className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0 md:pb-0 lg:gap-4">
          {steps.map((step, index) => {
            const stepNo = String(index + 1).padStart(2, "0");

            return (
              <Reveal
                key={step.revision}
                as="li"
                delay={index * 60}
                className="w-[72vw] max-w-[240px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <article className="group flex h-full flex-col rounded-none border border-grid bg-canvas-deep p-4 transition-colors duration-500 hover:border-amber lg:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tabular-nums text-amber">
                      {step.revision}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {stepNo}/{String(total).padStart(2, "0")}
                    </span>
                  </div>

                  <span
                    aria-hidden
                    className="mb-2 font-display text-3xl font-extrabold leading-none text-grid transition-colors duration-500 group-hover:text-amber/40"
                  >
                    {stepNo}
                  </span>

                  <h3 className="mb-2 text-sm font-bold leading-snug text-paper md:text-[15px]">
                    {step.title}
                  </h3>
                  <p className="line-clamp-4 text-xs leading-relaxed text-muted md:text-[13px]">
                    {step.description}
                  </p>

                  <span
                    aria-hidden
                    className="mt-4 h-0.5 w-0 bg-amber transition-all duration-500 group-hover:w-full"
                  />
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
