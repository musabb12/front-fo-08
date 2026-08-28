import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Consistent section rhythm: eyebrow (mono, small) → h2 (display) → content.
 */
export function Section({ id, eyebrow, title, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-16 md:py-24 ${className}`}>
      <Reveal>
        {eyebrow ? (
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-amber">{eyebrow}</p>
        ) : null}
        <h2 className="mb-10 max-w-2xl text-2xl font-bold text-paper md:text-3xl">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}
