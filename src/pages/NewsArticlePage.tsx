import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const SITE = "https://calcy.com.au";

interface Article {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  published_at: string | null;
  author: string | null;
}

const RELATED = [
  { to: "/mortgage-calculator", label: "Mortgage calculator" },
  { to: "/borrowing-power-calculator", label: "Borrowing power calculator" },
  { to: "/refinance-calculator", label: "Refinance calculator" },
];

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    supabase
      .from("news_articles")
      .select("title,slug,excerpt,body,published_at,author")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) setNotFound(true);
        else setArticle(data as Article);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="page-shell py-10" aria-busy="true">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="page-shell py-16 text-center">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <p className="mt-2 text-muted-foreground">
          The article you're looking for doesn't exist or hasn't been published yet.
        </p>
        <Link to="/news" className="mt-4 inline-block text-accent hover:underline">
          ← Back to all news
        </Link>
      </div>
    );
  }

  const url = `${SITE}/news/${article.slug}`;
  const author = article.author || "Calcy Team";
  const description = (article.excerpt || "").trim();
  const date = formatDate(article.published_at);

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: description || article.title,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en-AU",
    ...(article.published_at ? { datePublished: article.published_at } : {}),
    author: { "@type": "Organization", name: author },
    publisher: {
      "@type": "Organization",
      name: "Calcy",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
    },
  };

  return (
    <div className="page-shell py-10">
      <Helmet>
        <title>{article.title}</title>
        {description && <meta name="description" content={description} />}
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(newsArticleSchema)}</script>
      </Helmet>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: article.title, path: `/news/${article.slug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {date && <span>{date}</span>}
            {date && <span className="mx-2">·</span>}
            <span>By {author}</span>
          </p>
        </header>

        {article.body && (
          <div
            className="article-content prose prose-slate max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        )}

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Related calculators</h2>
          <ul className="mt-3 space-y-2">
            {RELATED.map((r) => (
              <li key={r.to}>
                <Link to={r.to} className="text-accent hover:underline">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
};

export default NewsArticlePage;
