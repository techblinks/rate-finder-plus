import { Link } from "react-router-dom";
import { ChevronRight, Clock, Tag, ArrowRight, Database } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import FAQ from "@/components/FAQ";
import PageHeader from "@/components/layout/PageHeader";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import DirectAnswers from "@/components/seo/DirectAnswers";
import { GUIDE_DIRECT_ANSWERS } from "@/data/guideDirectAnswers";
import type { GuideMeta } from "@/data/guides";
import { ALL_GUIDES, isSuburbGuide } from "@/data/allGuides";
import { useRbaRates } from "@/hooks/useRbaRates";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface Props {
  guide: GuideMeta;
  /** URL prefix the canonical URL is rendered under. Defaults to `/guides`. */
  basePath?: "/guides" | "/suburbs";
}

/**
 * Resolves the correct URL prefix for a related guide slug — suburb slugs
 * resolve under /suburbs/, everything else under /guides/. This is what
 * makes cross-mesh linking (city ↔ suburb) work transparently.
 */
const hrefFor = (slug: string) =>
  isSuburbGuide(slug) ? `/suburbs/${slug}` : `/guides/${slug}`;

const GuideArticleShell = ({ guide, basePath = "/guides" }: Props) => {
  const canonical = `${basePath}/${guide.slug}`;
  const breadcrumbLabel = basePath === "/suburbs" ? "Suburb guides" : "Guides";
  const related = guide.relatedGuides
    .map((s) => ALL_GUIDES.find((g) => g.slug === s))
    .filter((g): g is GuideMeta => Boolean(g));

  // Human-readable "Last reviewed" date — kept consistent with the
  // ArticleJsonLd dateModified so Google sees aligned freshness signals.
  const reviewed = new Date(guide.dateModified).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SeoHead
        title={guide.metaTitle}
        description={guide.metaDescription}
        canonical={canonical}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: breadcrumbLabel, path: basePath === "/suburbs" ? "/suburbs" : "/guides" },
          { name: guide.title, path: canonical },
        ]}
      />
      <ArticleJsonLd
        headline={guide.title}
        description={guide.metaDescription}
        path={canonical}
        sectionHeadings={guide.sections.map((s) => s.h2)}
        datePublished={guide.datePublished}
        dateModified={guide.dateModified}
      />
      <FaqJsonLd faqs={guide.faqs} />

      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: breadcrumbLabel, href: basePath === "/suburbs" ? "/suburbs" : "/guides" },
          { label: guide.title },
        ]}
        title={guide.title}
        subtitle={`${guide.category} · ${guide.readMins} min read · Last reviewed ${reviewed}`}
      />

      <article className="page-shell py-8 md:py-10">
        <div className="md:hidden">
          <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link to="/" className="link-accent">Home</Link></li>
              <li className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                <Link to={basePath === "/suburbs" ? "/suburbs" : "/guides"} className="link-accent">{breadcrumbLabel}</Link>
              </li>
              <li className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                <span aria-current="page" className="text-foreground">{guide.title}</span>
              </li>
            </ol>
          </nav>

          <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-3 py-1 text-accent">
              <Tag className="h-3 w-3" /> {guide.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
              <Clock className="h-3 w-3" /> {guide.readMins} min read
            </span>
          </div>

          <h1 className="mb-3">{guide.title}</h1>

          <p className="mb-3 text-[13px] text-muted-foreground">
            Last updated: <time dateTime={guide.dateModified}>{reviewed}</time> · By Calcy Editorial Team
          </p>
        </div>

        {/* Trust signal — data attribution. Required for YMYL ranking eligibility. */}
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground">
          <Database className="h-3.5 w-3.5 text-accent" aria-hidden />
          Median values: CoreLogic/Domain estimates, 2026. Rates: RBA cash rate 4.10%.
        </p>

        <p className="mb-8 text-[16px] leading-relaxed text-foreground/90">{guide.intro}</p>

        {/* AEO: direct-answer Q&A block — citation-friendly for AI Overviews. */}
        {GUIDE_DIRECT_ANSWERS[guide.slug] && (
          <DirectAnswers items={GUIDE_DIRECT_ANSWERS[guide.slug]} className="mb-10" />
        )}


        {/* TOC */}
        <nav aria-label="Table of contents" className="mb-10 rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 text-[14px] font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </h2>
          <ul className="space-y-2 text-[14px]">
            {guide.sections.map((s) => (
              <li key={s.h2}>
                <a href={`#${slugify(s.h2)}`} className="link-accent">{s.h2}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Body */}
        <div className="space-y-10">
          {guide.sections.map((s) => (
            <section key={s.h2} id={slugify(s.h2)}>
              <h2 className="mb-3">{s.h2}</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                {s.blocks.map((b, i) => {
                  if (b.type === "p") return <p key={i}>{b.text}</p>;
                  if (b.type === "h3")
                    return <h3 key={i} className="mt-4 text-[17px] font-semibold text-foreground">{b.text}</h3>;
                  if (b.type === "list")
                    return (
                      <ul key={i} className="list-disc space-y-1 pl-5">
                        {b.items.map((it, j) => <li key={j}>{it}</li>)}
                      </ul>
                    );
                  return (
                    <div key={i} className="overflow-x-auto">
                      <table className="w-full border-collapse text-[14px]">
                        <thead>
                          <tr className="border-b border-border">
                            {b.headers.map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {b.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-border/60">
                              {row.map((cell, ci) => <td key={ci} className="px-3 py-2">{cell}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {b.caption && <p className="mt-2 text-[12px] italic">{b.caption}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Key takeaways */}
        <aside className="mt-12 rounded-2xl border border-accent/30 bg-accent-light p-6">
          <h2 className="mb-3 text-[18px]">Key takeaways</h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] text-foreground/90">
            {guide.keyTakeaways.map((k) => <li key={k}>{k}</li>)}
          </ul>
        </aside>

        {/* Calculator CTA */}
        <div className="mt-10 rounded-2xl bg-foreground p-6 text-background">
          <p className="mb-3 text-[14px] uppercase tracking-wide opacity-70">Try the calculator</p>
          <Link
            to={guide.relatedCalculator.to}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-[14px] font-semibold text-foreground hover:bg-background/90"
          >
            {guide.relatedCalculator.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related guides — cross-mesh aware (city ↔ suburb ↔ editorial). */}
        {related.length > 0 && (
          <section className="mt-12" aria-labelledby="related-guides">
            <h2 id="related-guides" className="mb-4">Related guides</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={hrefFor(g.slug)}
                    className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/50"
                  >
                    <p className="text-[12px] font-medium uppercase tracking-wide text-accent">
                      {g.category}
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-foreground">{g.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Topic FAQ */}
        <div className="mt-12">
          <FAQ items={guide.faqs} />
        </div>

        {/* YMYL disclaimer — required on all guide and suburb pages. */}
        <FinancialDisclaimer className="mt-12" />
      </article>
    </>
  );
};

export default GuideArticleShell;
