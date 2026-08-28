import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { PortfolioContent } from "@/lib/types";

interface ServicePortfolioProps {
  portfolio: PortfolioContent;
}

export function ServicePortfolio({ portfolio }: ServicePortfolioProps) {
  return (
    <section className="border-b border-grid">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <Reveal>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-amber">
            {portfolio.eyebrow}
          </p>
          <h2 className="mb-8 max-w-2xl text-2xl font-bold text-paper md:mb-10 md:text-3xl">
            {portfolio.title}
          </h2>
        </Reveal>

        <Reveal>
          <div className="blueprint-frame group relative overflow-hidden rounded-none border border-dashed border-grid bg-canvas-raised">
            <div className="absolute inset-0 opacity-40">
              <Image
                src={portfolio.image}
                alt=""
                fill
                sizes="100vw"
                className="img-zoom object-cover"
              />
              <div className="absolute inset-0 bg-canvas-raised/75" aria-hidden />
            </div>
            <div className="relative flex flex-col items-start gap-4 p-8 md:p-10">
              <p className="max-w-xl text-sm leading-relaxed text-muted">
                {portfolio.body}
              </p>
              <Button href={portfolio.buttonHref} variant="outline">
                {portfolio.buttonLabel}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
