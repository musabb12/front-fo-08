"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { Faq, SectionHeading } from "@/lib/types";

interface ServiceFaqsProps {
  heading: SectionHeading;
  items: Faq[];
}

export function ServiceFaqs({ heading, items }: ServiceFaqsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

        <Reveal>
          <ul className="space-y-3">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              const stepNo = String(index + 1).padStart(2, "0");

              return (
                <li key={item.question}>
                  <div
                    className={`group overflow-hidden rounded-none border bg-canvas-deep transition-colors duration-500 ${
                      isOpen
                        ? "border-amber"
                        : "border-grid hover:border-amber/50"
                    }`}
                  >
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-right md:gap-5 md:px-5 md:py-5"
                    >
                      <span
                        className={`shrink-0 font-mono text-[10px] tabular-nums transition-colors duration-300 ${
                          isOpen ? "text-amber" : "text-muted"
                        }`}
                      >
                        {stepNo}
                      </span>

                      <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-paper md:text-base">
                        {item.question}
                      </span>

                      <span
                        aria-hidden
                        className={`flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-sm transition-all duration-300 ${
                          isOpen
                            ? "border-amber bg-amber text-canvas"
                            : "border-grid text-amber group-hover:border-amber/60"
                        }`}
                      >
                        {isOpen ? "—" : "+"}
                      </span>
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-grid px-4 pb-5 pt-0 md:px-5">
                          <p className="max-w-3xl pr-8 pt-4 text-sm leading-relaxed text-muted md:pr-12">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
