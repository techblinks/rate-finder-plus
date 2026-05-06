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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "1247",
    },
    publisher: {
      "@type": "Organization",
      name: "Calcy",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

interface HowToProps {
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}

export const HowToJsonLd = ({ name, description, totalTime, steps }: HowToProps) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

interface ArticleProps {
  headline: string;
  description: string;
  path: string;
  sectionHeadings?: string[];
  datePublished?: string;
  dateModified?: string;
}

export const ArticleJsonLd = ({
  headline,
  description,
  path,
  sectionHeadings,
  datePublished = "2026-01-01",
  dateModified = new Date().toISOString().slice(0, 10),
}: ArticleProps) => {
  const url = `${SITE}${path}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en-AU",
    datePublished,
    dateModified,
    ...(sectionHeadings && sectionHeadings.length
      ? { articleSection: sectionHeadings }
      : {}),
    author: { "@type": "Organization", name: "Calcy", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "Calcy",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
