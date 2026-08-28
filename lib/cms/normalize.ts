import { defaultWebDevelopmentService } from "@/lib/cms/defaults";
import type {
  Benefit,
  Capability,
  Deliverable,
  Faq,
  HeroSlide,
  ProcessStep,
  SectionHeading,
  WebDevelopmentService,
} from "@/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function heading(value: unknown, fallback: SectionHeading): SectionHeading {
  if (!isRecord(value)) return fallback;
  return {
    eyebrow: str(value.eyebrow, fallback.eyebrow),
    title: str(value.title, fallback.title),
    description: str(value.description, fallback.description),
  };
}

/**
 * Merge unknown/partial CMS JSON into a full typed service document.
 * Keeps older saves working after schema expansions.
 */
export function normalizeWebDevelopmentService(
  value: unknown
): WebDevelopmentService {
  const d = defaultWebDevelopmentService;
  if (!isRecord(value)) return d;

  const heroIn = isRecord(value.hero) ? value.hero : {};
  const introIn = isRecord(value.intro) ? value.intro : {};
  const ctaIn = isRecord(value.cta) ? value.cta : {};
  const portfolioIn = isRecord(value.portfolio) ? value.portfolio : {};

  const slidesRaw = Array.isArray(heroIn.slides)
    ? heroIn.slides
    : Array.isArray(value.heroSlides)
      ? value.heroSlides
      : null;

  const slides: HeroSlide[] =
    slidesRaw && slidesRaw.length > 0
      ? slidesRaw.map((s, i) => {
          const fb = d.hero.slides[i] ?? d.hero.slides[0]!;
          const row = isRecord(s) ? s : {};
          return {
            image: str(row.image, fb.image),
            eyebrow: str(row.eyebrow, fb.eyebrow),
            title: str(row.title, fb.title),
            subtitle: str(row.subtitle, fb.subtitle),
          };
        })
      : [
          {
            image: d.hero.slides[0]!.image,
            eyebrow: str(heroIn.eyebrow, d.hero.slides[0]!.eyebrow),
            title: str(heroIn.title, d.hero.slides[0]!.title),
            subtitle: str(heroIn.subtitle, d.hero.slides[0]!.subtitle),
          },
          ...d.hero.slides.slice(1),
        ];

  const capabilities: Capability[] = Array.isArray(value.capabilities)
    ? value.capabilities.map((c, i) => {
        const fb = d.capabilities[i] ?? d.capabilities[0]!;
        const row = isRecord(c) ? c : {};
        const details = Array.isArray(row.details)
          ? row.details.filter((x): x is string => typeof x === "string")
          : fb.details;
        return {
          title: str(row.title, fb.title),
          description: str(row.description, fb.description),
          image: str(row.image, fb.image),
          tag: str(row.tag, fb.tag),
          details: details.length ? details : fb.details,
          ctaLabel: str(row.ctaLabel, fb.ctaLabel),
          ctaHref: str(row.ctaHref, fb.ctaHref),
        };
      })
    : d.capabilities;

  const process: ProcessStep[] = Array.isArray(value.process)
    ? value.process.map((p, i) => {
        const fb = d.process[i] ?? d.process[0]!;
        const row = isRecord(p) ? p : {};
        return {
          revision: str(row.revision, fb.revision),
          title: str(row.title, fb.title),
          description: str(row.description, fb.description),
        };
      })
    : d.process;

  const deliverables: Deliverable[] = Array.isArray(value.deliverables)
    ? value.deliverables.map((item, i) => {
        const fb = d.deliverables[i] ?? d.deliverables[0]!;
        const row = isRecord(item) ? item : {};
        return { label: str(row.label, fb.label) };
      })
    : d.deliverables;

  const benefits: Benefit[] = Array.isArray(value.benefits)
    ? value.benefits.map((b, i) => {
        const fb = d.benefits[i] ?? d.benefits[0]!;
        const row = isRecord(b) ? b : {};
        return {
          title: str(row.title, fb.title),
          description: str(row.description, fb.description),
        };
      })
    : d.benefits;

  const faqs: Faq[] = Array.isArray(value.faqs)
    ? value.faqs.map((f, i) => {
        const fb = d.faqs[i] ?? d.faqs[0]!;
        const row = isRecord(f) ? f : {};
        return {
          question: str(row.question, fb.question),
          answer: str(row.answer, fb.answer),
        };
      })
    : d.faqs;

  return {
    slug: "web-development",
    seoTitle: str(value.seoTitle, d.seoTitle),
    seoDescription: str(value.seoDescription, d.seoDescription),
    hero: {
      primaryCta: str(heroIn.primaryCta, d.hero.primaryCta),
      primaryCtaHref: str(heroIn.primaryCtaHref, d.hero.primaryCtaHref),
      secondaryCta: str(heroIn.secondaryCta, d.hero.secondaryCta),
      secondaryCtaHref: str(heroIn.secondaryCtaHref, d.hero.secondaryCtaHref),
      rotateIntervalMs: num(heroIn.rotateIntervalMs, d.hero.rotateIntervalMs),
      slides,
    },
    intro: {
      title: str(introIn.title, d.intro.title),
      body: str(introIn.body, d.intro.body),
      backgroundImage: str(introIn.backgroundImage, d.intro.backgroundImage),
      sideImage: str(introIn.sideImage, d.intro.sideImage),
    },
    capabilitiesHeading: heading(
      value.capabilitiesHeading,
      d.capabilitiesHeading
    ),
    capabilities,
    processHeading: heading(value.processHeading, d.processHeading),
    process,
    deliverablesHeading: heading(
      value.deliverablesHeading,
      d.deliverablesHeading
    ),
    deliverables,
    deliverablesBackground: str(
      value.deliverablesBackground,
      d.deliverablesBackground
    ),
    benefitsHeading: heading(value.benefitsHeading, d.benefitsHeading),
    benefits,
    portfolio: {
      eyebrow: str(portfolioIn.eyebrow, d.portfolio.eyebrow),
      title: str(portfolioIn.title, d.portfolio.title),
      body: str(portfolioIn.body, d.portfolio.body),
      buttonLabel: str(portfolioIn.buttonLabel, d.portfolio.buttonLabel),
      buttonHref: str(portfolioIn.buttonHref, d.portfolio.buttonHref),
      image: str(portfolioIn.image, d.portfolio.image),
    },
    faqsHeading: heading(value.faqsHeading, d.faqsHeading),
    faqs,
    cta: {
      title: str(ctaIn.title, d.cta.title),
      body: str(ctaIn.body, d.cta.body),
      buttonLabel: str(ctaIn.buttonLabel, d.cta.buttonLabel),
      buttonHref: str(ctaIn.buttonHref, d.cta.buttonHref),
      backgroundImage: str(ctaIn.backgroundImage, d.cta.backgroundImage),
    },
  };
}

export function isWebDevelopmentService(
  value: unknown
): value is WebDevelopmentService {
  if (!isRecord(value)) return false;
  if (str(value.slug) !== "web-development") return false;
  const normalized = normalizeWebDevelopmentService(value);
  return (
    normalized.hero.slides.length > 0 &&
    normalized.seoTitle.length > 0 &&
    normalized.capabilities.length >= 0
  );
}
