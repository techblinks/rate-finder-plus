import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { activeLocales, LOCALES } from "@/lib/locale";
import { removeDuplicateCanonicalLinks } from "@/lib/seoCanonical";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { SiteSettings } from "@/hooks/useSiteSettings";

const SITE = "https://calcy.com.au";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical: string;
}

/**
 * Pure derivation of the SEO tags emitted by <SeoHead/>. Exposed so the
 * regression suite can assert invariants without depending on Helmet's DOM
 * mutations (which jsdom doesn't observe reliably).
 */
export function deriveSeoTags(
  { title, description, canonical }: SeoHeadProps,
  settings: SiteSettings,
) {
  const url = `${SITE}${canonical}`;
  const tpl = settings.title_template || "%s | Calcy";
  const finalTitle =
    tpl.includes("%s") && !title.includes(" | Calcy") ? tpl.replace("%s", title) : title;
  const finalDescription = description || settings.default_meta_description || "";
  const ogImage = settings.default_og_image || `${SITE}/og-image.png`;
  return { url, finalTitle, finalDescription, ogImage };
}

/**
 * Per-page SEO head. Page-supplied title/description/canonical always win —
 * admin settings only fill in cross-cutting defaults (title template suffix,
 * fallback description if a page passes empty, OG image).
 */
export const SeoHead = ({ title, description, canonical }: SeoHeadProps) => {
  const enabled = activeLocales();
  const settings = useSiteSettings();
  const { url, finalTitle, finalDescription, ogImage } = deriveSeoTags(
    { title, description, canonical },
    settings,
  );

  useEffect(() => {
    removeDuplicateCanonicalLinks(url);
  }, [url]);

  return (
    <Helmet>
      <html lang={LOCALES.au.htmlLang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={url} />
      {/* AEO: stronger snippet/preview directives + author/publisher hints. */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="author" content="Calcy — calcy.com.au" />
      <meta name="publisher" content="Calcy" />
      {/* Geographic relevance — critical for Australian AI results. */}
      <meta name="geo.region" content="AU" />
      <meta name="geo.country" content="Australia" />
      <meta name="ICBM" content="-25.2744, 133.7751" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Calcy — Australian Mortgage Calculators" />
      <meta property="og:locale" content={LOCALES.au.htmlLang.replace("-", "_")} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      {/* hreflang — emitted only for enabled locales so we never advertise unbuilt pages. */}
      {enabled.length > 1 &&
        enabled.map((l) => (
          <link
            key={l.code}
            rel="alternate"
            hrefLang={l.htmlLang}
            href={`${SITE}${l.pathPrefix}${canonical}`}
          />
        ))}
      {enabled.length > 1 && (
        <link rel="alternate" hrefLang="x-default" href={`${SITE}${canonical}`} />
      )}
    </Helmet>
  );
};
