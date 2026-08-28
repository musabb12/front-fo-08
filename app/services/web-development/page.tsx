import type { Metadata } from "next";
import { fetchWebDevelopmentService } from "@/lib/cms/fetch-service";
import { buildFaqSchema, buildServiceSchema } from "@/lib/schema";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceIntro } from "@/components/services/ServiceIntro";
import { ServiceCapabilities } from "@/components/services/ServiceCapabilities";
import { ServiceProcess } from "@/components/services/ServiceProcess";
import { ServiceDeliverables } from "@/components/services/ServiceDeliverables";
import { ServicePortfolio } from "@/components/services/ServicePortfolio";
import { ServiceBenefits } from "@/components/services/ServiceBenefits";
import { ServiceFaqs } from "@/components/services/ServiceFaqs";
import { ServiceCta } from "@/components/services/ServiceCta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const service = await fetchWebDevelopmentService();
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: `/services/${service.slug}`,
      type: "website",
      locale: "ar_SD",
    },
    twitter: {
      card: "summary_large_image",
      title: service.seoTitle,
      description: service.seoDescription,
    },
  };
}

export default async function WebDevelopmentServicePage() {
  const service = await fetchWebDevelopmentService();

  const serviceSchema = buildServiceSchema({
    name: service.seoTitle,
    description: service.seoDescription,
    slug: service.slug,
  });
  const faqSchema = buildFaqSchema(service.faqs);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <ServiceHero hero={service.hero} />
      <ServiceIntro intro={service.intro} />
      <ServiceCapabilities
        heading={service.capabilitiesHeading}
        items={service.capabilities}
      />
      <ServiceProcess heading={service.processHeading} steps={service.process} />
      <ServiceDeliverables
        heading={service.deliverablesHeading}
        items={service.deliverables}
        backgroundImage={service.deliverablesBackground}
      />
      <ServicePortfolio portfolio={service.portfolio} />
      <ServiceBenefits heading={service.benefitsHeading} items={service.benefits} />
      <ServiceFaqs heading={service.faqsHeading} items={service.faqs} />
      <ServiceCta cta={service.cta} />
    </main>
  );
}
