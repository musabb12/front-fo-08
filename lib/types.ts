export interface Capability {
  title: string;
  description: string;
  image: string;
  tag: string;
  details: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface ProcessStep {
  revision: string;
  title: string;
  description: string;
}

export interface Deliverable {
  label: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface HeroSlide {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface ServiceHeroContent {
  primaryCta: string;
  primaryCtaHref: string;
  secondaryCta: string;
  secondaryCtaHref: string;
  rotateIntervalMs: number;
  slides: HeroSlide[];
}

export interface ServiceIntroContent {
  title: string;
  body: string;
  backgroundImage: string;
  sideImage: string;
}

export interface ServiceCtaContent {
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundImage: string;
}

export interface SectionHeading {
  eyebrow: string;
  title: string;
  description: string;
}

export interface PortfolioContent {
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  image: string;
}

export interface ServiceMediaLibraryItem {
  label: string;
  path: string;
}

/** Full content contract for the web-development service page + CMS. */
export interface WebDevelopmentService {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  hero: ServiceHeroContent;
  intro: ServiceIntroContent;
  capabilitiesHeading: SectionHeading;
  capabilities: Capability[];
  processHeading: SectionHeading;
  process: ProcessStep[];
  deliverablesHeading: SectionHeading;
  deliverables: Deliverable[];
  deliverablesBackground: string;
  benefitsHeading: SectionHeading;
  benefits: Benefit[];
  portfolio: PortfolioContent;
  faqsHeading: SectionHeading;
  faqs: Faq[];
  cta: ServiceCtaContent;
}
