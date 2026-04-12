import { Helmet } from "react-helmet-async";
import { FAQItem } from "@/data/faq";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  country?: string;
  calculatorType?: string;
  faqs?: FAQItem[];
  breadcrumbs?: { name: string; url: string }[];
}

const SEOHead = ({ title, description, canonical, country, calculatorType, faqs, breadcrumbs }: SEOHeadProps) => {
  const fullTitle = `${title} | Zune Calculator`;
  const baseUrl = "https://zunecalculator.com";
  const canonicalUrl = `${baseUrl}${canonical}`;

  const faqSchema = faqs && faqs.length > 0 ? {
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
  } : null;

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  } : null;

  const webAppSchema = calculatorType ? {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: canonicalUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {webAppSchema && (
        <script type="application/ld+json">{JSON.stringify(webAppSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
