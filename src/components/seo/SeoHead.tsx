import { Helmet } from "react-helmet-async";

const SITE = "https://calcy.com.au";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical: string;
}

export const SeoHead = ({ title, description, canonical }: SeoHeadProps) => {
  const url = `${SITE}${canonical}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Calcy" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
