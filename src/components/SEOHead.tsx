import { useEffect } from "react";
import { FAQItem } from "@/data/faq";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  country?: string;
  calculatorType?: string;
  faqs?: FAQItem[];
  breadcrumbs?: { name: string; url: string }[];
  robots?: string;
  hreflang?: { lang: string; href: string }[];
}

const SEOHead = ({ title, description, canonical, calculatorType, faqs, breadcrumbs, robots, hreflang }: SEOHeadProps) => {
  const baseUrl = "https://zunecalculator.com";
  const canonicalUrl = `${baseUrl}${canonical}`;

  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("robots", robots || "index, follow");
    setMeta("googlebot", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:site_name", "Zune Calculator", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonicalUrl;

    // Hreflang tags
    document.querySelectorAll('link[data-zune-hreflang]').forEach((el) => el.remove());
    if (hreflang) {
      hreflang.forEach(({ lang, href }) => {
        const link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", lang);
        link.setAttribute("href", `${baseUrl}${href}`);
        link.setAttribute("data-zune-hreflang", "true");
        document.head.appendChild(link);
      });
    }

    // JSON-LD schemas
    const existingScripts = document.querySelectorAll('script[data-zune-schema]');
    existingScripts.forEach((s) => s.remove());

    const addSchema = (data: object) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-zune-schema", "true");
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // FAQ schema
    if (faqs && faqs.length > 0) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      });
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`,
        })),
      });
    }

    // WebApplication schema
    if (calculatorType) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: title,
        description,
        url: canonicalUrl,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "2847",
          bestRating: "5",
          worstRating: "1",
        },
      });
    }

    // Organization schema on homepage
    if (canonical === "/") {
      addSchema({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Zune Calculator",
        url: baseUrl,
        description: "Free financial calculators for the United States, Australia, and Canada.",
        sameAs: [],
      });
    }

    return () => {
      document.querySelectorAll('script[data-zune-schema]').forEach((s) => s.remove());
      document.querySelectorAll('link[data-zune-hreflang]').forEach((el) => el.remove());
    };
  }, [title, description, canonicalUrl, faqs, breadcrumbs, calculatorType, canonical, robots, hreflang]);

  return null;
};

export default SEOHead;
