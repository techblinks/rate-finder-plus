// JSON-LD Article schema for programmatic SEO pages. FAQ + Breadcrumb schemas
// are emitted by the existing SEOHead component; we only add the Article block.

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}

export const buildArticleSchema = ({
  headline,
  description,
  url,
  datePublished = "2025-01-15",
  dateModified = new Date().toISOString().slice(0, 10),
}: ArticleSchemaInput) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline,
  description,
  url,
  datePublished,
  dateModified,
  author: { "@type": "Organization", name: "Zune Calculator Editorial" },
  publisher: {
    "@type": "Organization",
    name: "Zune Calculator",
    url: "https://zunecalculator.com",
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": url },
});
