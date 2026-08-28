"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import type { Capability, SectionHeading } from "@/lib/types";

interface ServiceCapabilitiesProps {
  heading: SectionHeading;
  items: Capability[];
}

export function ServiceCapabilities({ heading, items }: ServiceCapabilitiesProps) {
  return (
    <section className="border-b border-grid">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-amber">
            {heading.eyebrow}
          </p>
          <h2 className="mb-12 max-w-2xl text-2xl font-bold text-paper md:mb-14 md:text-3xl">
            {heading.title}
          </h2>
        </Reveal>

        <div className="-mx-6 flex gap-8 overflow-x-auto px-6 pb-3 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-10 md:overflow-visible md:px-0 md:pb-0 lg:gap-12">
          {items.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 70}
              className="w-[78vw] max-w-[280px] shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <CapabilityFlipCard item={item} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityFlipCard({
  item,
  index,
}: {
  item: Capability;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-scene h-[440px] shadow-[0_6px_20px_rgba(0,0,0,0.14)] transition-shadow duration-500 hover:shadow-[0_12px_32px_rgba(0,0,0,0.24)] sm:h-[460px] ${
        flipped ? "is-flipped" : ""
      }`}
      onClick={() => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
          setFlipped((v) => !v);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${item.title} — اضغط لعرض التفاصيل`}
    >
      <div className="flip-card">
        <article className="flip-face flex flex-col overflow-hidden rounded-none bg-canvas-deep">
          <div className="relative aspect-[4/5] max-h-[62%] flex-1">
            <div
              className="absolute inset-0 overflow-hidden bg-canvas-deep"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 78%)" }}
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 768px) 78vw, 25vw"
                className="object-cover"
              />
              <span className="absolute bottom-[42%] right-3 font-mono text-[10px] text-amber md:right-4">
                {item.tag || String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="px-4 pb-5 pt-1 md:px-5 md:pb-6">
            <h3 className="mb-2 text-base font-bold leading-snug text-paper md:text-lg">
              {item.title}
            </h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        </article>

        <article className="flip-face flip-face-back flex flex-col justify-between overflow-hidden rounded-none border border-amber/25 bg-canvas-deep p-5 md:p-6">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber">
              {item.tag || String(index + 1).padStart(2, "0")} — تفاصيل
            </p>
            <h3 className="mb-3 text-lg font-bold leading-snug text-paper">
              {item.title}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-muted">{item.description}</p>
            <ul className="space-y-2.5 border-t border-grid pt-4">
              {item.details.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-paper">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6" onClick={(e) => e.stopPropagation()}>
            <Button
              href={item.ctaHref || "#cta"}
              variant="primary"
              className="w-full rounded-none px-4 py-3 text-xs"
            >
              {item.ctaLabel || "اطلب هذه الخدمة"}
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
