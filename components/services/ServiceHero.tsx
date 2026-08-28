"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { HeroSlide, ServiceHeroContent } from "@/lib/types";

interface ServiceHeroProps {
  hero: ServiceHeroContent;
}

export function ServiceHero({ hero }: ServiceHeroProps) {
  const slides = hero.slides.length > 0 ? hero.slides : [];
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const interval = Math.max(2500, hero.rotateIntervalMs || 5000);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setActive((i) => (i + 1) % slides.length);
        setFading(false);
      }, 420);
    }, interval);

    return () => window.clearInterval(id);
  }, [slides.length, interval]);

  if (!slides.length) return null;

  const current = slides[active] ?? slides[0]!;
  const stackOrder = [0, 1, 2].map((offset) => (active + offset) % slides.length);

  return (
    <header className="relative isolate min-h-[min(92vh,820px)] overflow-hidden border-b border-grid">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          key={current.image}
          src={current.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-700 ${
            fading ? "opacity-40" : "opacity-100"
          }`}
        />
      </div>
      <div className="media-veil absolute inset-0 -z-10" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-blueprint-grid bg-grid-24 opacity-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-canvas to-transparent"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:py-28 lg:py-32">
        <div className="relative">
          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              fading ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="h-px w-8 bg-amber" aria-hidden />
              <p className="font-mono text-xs uppercase tracking-widest text-amber">
                {current.eyebrow}
              </p>
            </div>
            <h1 className="mb-5 max-w-xl text-3xl font-extrabold leading-[1.25] text-paper md:text-4xl lg:text-[2.75rem]">
              {current.title}
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-muted md:text-lg">
              {current.subtitle}
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            <Button href={hero.primaryCtaHref} variant="primary">
              {hero.primaryCta}
            </Button>
            <Button href={hero.secondaryCtaHref} variant="outline">
              {hero.secondaryCta}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {slides.map((slide: HeroSlide, i) => (
              <button
                key={`${slide.image}-${i}`}
                type="button"
                aria-label={`عرض الشريحة ${i + 1}`}
                aria-current={i === active}
                onClick={() => {
                  setFading(true);
                  window.setTimeout(() => {
                    setActive(i);
                    setFading(false);
                  }, 380);
                }}
                className={`h-1.5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  i === active ? "w-10 bg-amber" : "w-4 bg-grid hover:bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative mx-auto hidden h-[480px] w-full max-w-[560px] sm:block md:h-[540px] lg:h-[580px]">
          {slides.map((slide, slideIndex) => {
            const depth = stackOrder.indexOf(slideIndex);
            if (depth < 0) return null;
            const isFront = depth === 0;
            const styles =
              depth === 0
                ? "z-30 w-[76%] left-[12%] top-[10%]"
                : depth === 1
                  ? "z-20 w-[70%] left-[0%] top-[4%]"
                  : "z-10 w-[70%] left-[30%] top-[18%]";

            return (
              <div
                key={`${slide.image}-${slideIndex}`}
                className={`absolute aspect-[3/4] overflow-hidden rounded-none border border-grid/80 bg-canvas-deep shadow-[0_24px_60px_rgba(0,0,0,0.4)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${styles} ${
                  isFront ? "scale-100 opacity-100" : "scale-[0.98] opacity-90"
                }`}
              >
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 440px"
                  className="object-cover"
                  priority={slideIndex === 0}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-canvas/60 via-transparent to-transparent transition-opacity duration-700 ${
                    isFront ? "opacity-70" : "opacity-25"
                  }`}
                />
                {isFront ? (
                  <span className="absolute bottom-4 right-4 font-mono text-[10px] tracking-widest text-amber">
                    {String(active + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </span>
                ) : (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-paper/10"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
