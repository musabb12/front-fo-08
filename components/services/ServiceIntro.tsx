import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { FixedSectionMedia } from "@/components/ui/FixedSectionMedia";
import type { ServiceIntroContent } from "@/lib/types";

interface ServiceIntroProps {
  intro: ServiceIntroContent;
}

export function ServiceIntro({ intro }: ServiceIntroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-grid">
      <FixedSectionMedia
        src={intro.backgroundImage}
        position="center center"
        veil="intro"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-blueprint-grid bg-grid-24 opacity-25"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <Reveal variant="left">
          <div className="max-w-3xl rounded-none border border-grid/50 bg-canvas/70 p-6 sm:border-0 sm:bg-transparent sm:p-0">
            <div className="border-r-2 border-amber pr-6">
              <h2 className="mb-4 text-2xl font-bold text-paper md:text-3xl">
                {intro.title}
              </h2>
              <p className="text-base leading-relaxed text-muted md:text-lg">
                {intro.body}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} variant="scale" className="relative hidden md:block">
          <div className="blueprint-frame group relative aspect-[4/3] overflow-hidden rounded-none border border-grid shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <Image
              src={intro.sideImage}
              alt="استوديو تخطيط وتصميم تقني"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="img-zoom object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/55 via-transparent to-transparent" />
            <p className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-widest text-amber">
              FIG. 00 — Studio
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
