import { Helmet } from "react-helmet-async";
import { activeLocales, LOCALES } from "@/lib/locale";

const SITE = "https://calcy.com.au";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical: string;
}

export const SeoHead = ({ title, description, canonical }: SeoHeadProps) => {
  const url = `${SITE}${canonical}`;
  const enabled = activeLocales();

  return (
    <Helmet>
      <html lang={LOCALES.au.htmlLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Calcy" />
      <meta property="og:locale" content={LOCALES.au.htmlLang.replace("-", "_")} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
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
