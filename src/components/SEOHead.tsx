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
}

const SEOHead = ({ title, description, canonical, calculatorType, faqs, breadcrumbs }: SEOHeadProps) => {
  const fullTitle = `${title} | Zune Calculator`;
  const baseUrl = "https://zunecalculator.com";
  const canonicalUrl = `${baseUrl}${canonical}`;

  useEffect(() => {
    document.title = fullTitle;

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
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonicalUrl;

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
      });
    }

    return () => {
      document.querySelectorAll('script[data-zune-schema]').forEach((s) => s.remove());
    };
  }, [fullTitle, description, canonicalUrl, faqs, breadcrumbs, calculatorType, title]);

  return null;
};

export default SEOHead;
