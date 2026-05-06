import { Helmet } from "react-helmet-async";
import type { FaqItem } from "@/data/faqs";

const SITE = "https://calcy.com.au";

interface BreadcrumbProps {
  items: { name: string; path: string }[];
}

export const BreadcrumbJsonLd = ({ items }: BreadcrumbProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export const FaqJsonLd = ({ faqs }: { faqs: FaqItem[] }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

interface WebApplicationProps {
  name: string;
  description: string;
  path: string;
}

export const WebApplicationJsonLd = ({ name, description, path }: WebApplicationProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE}${path}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
    publisher: { "@type": "Organization", name: "Calcy", url: SITE },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
