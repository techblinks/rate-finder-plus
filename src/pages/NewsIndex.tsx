import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NewsCard from "@/components/news/NewsCard";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const PAGE_SIZE = 12;
const SITE = "https://calcy.com.au";

interface NewsRow {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  published_at: string | null;
}

const NewsIndex = () => {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    supabase
      .from("news_articles")
      .select("slug,title,excerpt,body,published_at", { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, to)
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows((data as NewsRow[] | null) || []);
        setTotal(count || 0);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canonical = `${SITE}/news${page > 1 ? `?page=${page}` : ""}`;

  return (
    <div className="page-shell py-10">
      <Helmet>
        <title>Australian Mortgage & Property News</title>
        <meta
          name="description"
          content="Latest RBA rate decisions, property market updates and mortgage news for Australian homeowners and buyers."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Latest mortgage & property news
        </h1>
        <p className="mt-2 text-muted-foreground">
          RBA decisions, property market updates and home loan news for Australians.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Check back soon for the latest RBA and property news.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <NewsCard
                key={r.slug}
                slug={r.slug}
                title={r.title}
                excerpt={r.excerpt}
                body={r.body}
                publishedAt={r.published_at}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  to={`/news?page=${page - 1}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    setParams(page - 1 === 1 ? {} : { page: String(page - 1) });
                  }}
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  to={`/news?page=${page + 1}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    setParams({ page: String(page + 1) });
                  }}
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default NewsIndex;
