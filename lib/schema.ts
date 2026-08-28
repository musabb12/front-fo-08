import { getSiteUrl } from "@/lib/env";
import type { Faq } from "@/lib/types";

const ORG_NAME = "الوكالة";

export function buildServiceSchema(params: {
  name: string;
  description: string;
  slug: string;
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: params.name,
    description: params.description,
    provider: {
      "@type": "Organization",
      name: ORG_NAME,
      url: siteUrl,
    },
    url: `${siteUrl}/services/${params.slug}`,
    areaServed: "SD",
  };
}

export function buildFaqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
