import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { ServiceCtaContent } from "@/lib/types";

interface ServiceCtaProps {
  cta: ServiceCtaContent;
}

export function ServiceCta({ cta }: ServiceCtaProps) {
  return (
    <section id="cta" className="relative isolate overflow-hidden border-t border-grid">
      <div className="absolute inset-0 -z-20">
        <Image
          src={cta.backgroundImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="media-veil-center absolute inset-0 -z-10" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-blueprint-grid bg-grid-24 opacity-25"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-6 py-24 text-right md:py-28">
        <Reveal>
          <h2 className="text-2xl font-bold text-paper md:text-3xl">{cta.title}</h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="max-w-xl text-base leading-relaxed text-muted">{cta.body}</p>
        </Reveal>
        <Reveal delay={180}>
          <Button href={cta.buttonHref} variant="primary">
            {cta.buttonLabel}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
