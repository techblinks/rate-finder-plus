import { lazy, Suspense, useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { findSeoPage, TYPE_KEYWORDS, TYPE_LABELS, seoPages } from "@/data/seo/seoPages";
import { countries } from "@/data/countries";
import { citiesByCountry, getCityBySlug } from "@/data/cities";
import { loadContent, pickRelatedSlugs } from "@/data/seo/contentLoader";
import { buildArticleSchema } from "@/lib/seo/programmaticSchemas";
import { getOverride } from "@/data/seo/adminConfig";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AdPlaceholder, { AffiliateCTA, TrustDisclaimer } from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

// Lazy-load the existing calculator components — zero changes to their internals.
const MortgageCalculator = lazy(() => import("@/components/calculators/MortgageCalculator"));
const LoanCalculator = lazy(() => import("@/components/calculators/LoanCalculator"));
const InterestCalculator = lazy(() => import("@/components/calculators/InterestCalculator"));
const BorrowingPowerCalculator = lazy(() => import("@/components/calculators/BorrowingPowerCalculator"));
const StampDutyCalculator = lazy(() => import("@/components/calculators/StampDutyCalculator"));

const CALC_MAP = {
  mortgage: MortgageCalculator,
  loan: LoanCalculator,
  interest: InterestCalculator,
  "borrowing-power": BorrowingPowerCalculator,
  "stamp-duty": StampDutyCalculator,
} as const;

const CalculatorSkeleton = () => (
  <div className="premium-card p-6 md:p-8 animate-pulse" aria-hidden>
    <div className="h-8 w-2/3 rounded bg-muted mb-4" />
    <div className="h-4 w-1/2 rounded bg-muted mb-8" />
    <div className="space-y-3">
      <div className="h-12 rounded bg-muted" />
      <div className="h-12 rounded bg-muted" />
      <div className="h-12 rounded bg-muted" />
    </div>
  </div>
);

const ProgrammaticSeoPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const page = useMemo(() => findSeoPage(slug), [slug]);

  if (!page) return <Navigate to="/" replace />;

  const country = countries[page.country];
  const city = page.citySlug ? getCityBySlug(page.country, page.citySlug) : undefined;

  const override = getOverride(page.slug);
  const enabled = override.enabled ?? page.enabled;

  const content = useMemo(() => loadContent(page, country, city), [page, country, city]);
  const related = useMemo(() => pickRelatedSlugs(page, seoPages, 4), [page]);

  // Hide the SSR prerender slot once the React app hydrates this route.
  useEffect(() => {
    const el = document.getElementById("prerender-content");
    if (el && el.parentElement) el.parentElement.removeChild(el);
  }, []);

  if (!enabled) {
    return (
      <>
        <SEOHead
          title={`Page disabled — Zune Calculator`}
          description="This calculator page is temporarily disabled."
          canonical={`/seo/${page.slug}`}
          robots="noindex, nofollow"
        />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-3">This page is currently disabled</h1>
          <p className="text-muted-foreground mb-6">Please head back to the homepage to find another calculator.</p>
          <Link to="/" className="text-primary underline">Return home</Link>
        </div>
      </>
    );
  }

  const title = override.title ?? content.title;
  const description = override.description ?? content.metaDescription;
  const canonical = `/seo/${page.slug}`;
  const canonicalAbs = `https://zunecalculator.com${canonical}`;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: country.name, url: `/${country.code}` },
    { name: TYPE_LABELS[page.type], url: `/${country.code}/${TYPE_KEYWORDS[page.type]}` },
    { name: city ? city.name : page.topicLabel ?? content.h1, url: canonical },
  ];

  // Inject Article JSON-LD via a one-off script tag (additive — SEOHead handles
  // FAQ + Breadcrumb already).
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-zune-article-schema", "true");
    script.textContent = JSON.stringify(
      buildArticleSchema({ headline: content.h1, description, url: canonicalAbs }),
    );
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [canonicalAbs, content.h1, description]);

  const Calculator = CALC_MAP[page.type];

  // City pool for internal-linking strip (deterministic).
  const cityPool = (citiesByCountry[country.code] ?? []).filter((c) => c.slug !== page.citySlug).slice(0, 8);

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        country={country.code}
        calculatorType={TYPE_KEYWORDS[page.type]}
        faqs={content.faqs.map((f) => ({ question: f.question, answer: f.answer }))}
        breadcrumbs={breadcrumbs.map((b) => ({ name: b.name, url: b.url }))}
      />

      <div className="container py-7 md:py-10">
        <BreadcrumbNav items={breadcrumbs.slice(1).map((b, i, a) => ({ label: b.name, href: i === a.length - 1 ? undefined : b.url }))} />

        <AdPlaceholder zone="top-banner" className="mb-6" />

        {/* Hero */}
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {country.name} · {TYPE_LABELS[page.type]} Tool
          </p>
          <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4 leading-tight">
            {content.h1}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {content.intro}
          </p>
        </header>

        {/* Embedded existing calculator (lazy-loaded) */}
        <section className="mb-12" aria-label="Calculator">
          <Suspense fallback={<CalculatorSkeleton />}>
            <Calculator country={country} />
          </Suspense>
        </section>

        <AffiliateCTA countryName={country.name} symbol={country.currencySymbol} />

        {/* Long-form sections */}
        <article className="prose-slot mt-10 max-w-3xl space-y-8">
          {content.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-2xl font-bold text-foreground mb-3">{s.h2}</h2>
              <p className="text-base text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}

          <AdPlaceholder zone="in-content" className="my-8" />

          {/* Real-world example */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">{content.example.h2}</h2>
            <p className="text-base text-muted-foreground leading-relaxed">{content.example.body}</p>
          </section>

          {/* Tips */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Tips for {city?.name ?? page.topicLabel ?? country.name} borrowers</h2>
            <ul className="space-y-2 list-disc pl-6 text-muted-foreground">
              {content.tips.map((t, i) => (
                <li key={i} className="leading-relaxed">{t}</li>
              ))}
            </ul>
          </section>
        </article>

        {/* FAQ */}
        <FAQSection faqs={content.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />

        {/* Internal links */}
        <section className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Related calculators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rp) => (
                <Link key={rp.slug} to={`/seo/${rp.slug}`}>
                  <Card className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {rp.city ? `${rp.city} ${TYPE_LABELS[rp.type]} Calculator` : `${rp.topicLabel ?? TYPE_LABELS[rp.type]} Calculator`}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {countries[rp.country].name} · {TYPE_LABELS[rp.type]}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {cityPool.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">{country.name} cities</h2>
              <div className="flex flex-wrap gap-2">
                {cityPool.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/seo/${TYPE_KEYWORDS[page.type]}-${c.slug}`}
                    className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Core tools</h2>
            <div className="flex flex-wrap gap-2">
              <Link to={`/${country.code}`} className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                {country.name} home
              </Link>
              <Link to={`/${country.code}/${TYPE_KEYWORDS[page.type]}`} className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                {TYPE_LABELS[page.type]} calculator
              </Link>
            </div>
          </div>
        </section>

        <TrustDisclaimer />
        <AdPlaceholder zone="post-calculator" className="mt-6" />
      </div>
    </>
  );
};

export default ProgrammaticSeoPage;
