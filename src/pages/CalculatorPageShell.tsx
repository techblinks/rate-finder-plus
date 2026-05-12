import { ReactNode } from "react";
import { SeoHead } from "@/components/seo/SeoHead";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  DatasetJsonLd,
  FaqJsonLd,
  HowToJsonLd,
  SpeakableJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { HOW_TOS } from "@/data/howTos";
import Breadcrumb from "@/components/Breadcrumb";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import AdSlot from "@/components/AdSlot";
import StickyMobileAd from "@/components/StickyMobileAd";
import RateFreshnessBadge from "@/components/RateFreshnessBadge";
import LastReviewed from "@/components/LastReviewed";
import PageHeader from "@/components/layout/PageHeader";
import MobileCalcHeader from "@/components/mobile/MobileCalcHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import MobileRelatedSections from "@/components/mobile/MobileRelatedSections";
import MobileTrustStrip from "@/components/mobile/MobileTrustStrip";
import MobileLearnMore from "@/components/mobile/MobileLearnMore";
import QuickAnswer from "@/components/seo/QuickAnswer";
import DataSources from "@/components/seo/DataSources";
import { QUICK_ANSWERS } from "@/data/quickAnswers";
import { DATA_SOURCES } from "@/data/dataSources";
import type { FaqItem } from "@/data/faqs";


interface Section {
  heading: string;
  body: ReactNode;
}

interface CalculatorPageShellProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  faqs: FaqItem[];
  /** Optional override for FAQPage JSON-LD only. Visible FAQ section still uses `faqs`. */
  seoFaqs?: FaqItem[];
  sections: Section[];
  related: { to: string; label: string }[];
  /** Optional sub-heading rendered directly below the H1. */
  subheading?: string;
  /**
   * Inject an inline ad slot between SEO sections every N sections (e.g. 2 = after every 2nd).
   * Non-blocking: AdSlot renders a labelled placeholder until AdSense/Ezoic is configured.
   */
  interleaveAdsEvery?: number;
  children: ReactNode;
}

const CalculatorPageShell = ({
  title,
  metaTitle,
  metaDescription,
  canonical,
  faqs,
  seoFaqs,
  sections,
  related,
  subheading,
  interleaveAdsEvery,
  children,
}: CalculatorPageShellProps) => {
  const isMobile = useIsMobile();
  const swipe = useSwipeNavigation(isMobile);

  const quickAnswer = QUICK_ANSWERS[canonical];
  const dataSources = DATA_SOURCES[canonical];

  // SEO heads always render — JSON-LD is invisible and benefits both desktop & SSR.
  const heads = (
    <>
      <SeoHead title={metaTitle} description={metaDescription} canonical={canonical} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: title, path: canonical },
        ]}
      />
      <FaqJsonLd faqs={seoFaqs ?? faqs} />
      <WebApplicationJsonLd name={title} description={metaDescription} path={canonical} />
      {HOW_TOS[canonical] && <HowToJsonLd {...HOW_TOS[canonical]} />}
      <ArticleJsonLd
        headline={metaTitle}
        description={metaDescription}
        path={canonical}
        sectionHeadings={sections.map((s) => s.heading)}
      />
      <DatasetJsonLd
        name={metaTitle}
        description={metaDescription}
        path={canonical}
        variableMeasured={sections.map((s) => s.heading).slice(0, 6)}
      />
      <SpeakableJsonLd
        name={metaTitle}
        selectors={[".page-header-title", ".faq-answer", ".quick-answer-a", ".live-rate-chip"]}
      />
    </>
  );


  if (isMobile) {
    // Native-app feel: only the calculator. No breadcrumbs, no SEO sections,
    // no ads between inputs, no related links. Pure tool focus.
    // Bottom padding leaves room for sticky result bar (56) + tabs (64) + safe-area.
    return (
      <>
        {heads}
        <MobileCalcHeader title={title} />
        <div
          className="px-4 pt-3 min-w-0"
          style={{ paddingBottom: `calc(56px + 24px)` }}
        >
          {children}
          {quickAnswer && <QuickAnswer data={quickAnswer} className="mt-6" />}
          <MobileTrustStrip />
          <FAQ items={faqs} />
          <MobileLearnMore sections={sections} />
          {dataSources && <DataSources sources={dataSources} className="mt-6" />}
          {swipe.index >= 0 && (
            <div className="mt-6 flex items-center justify-center gap-1.5 pb-2">
              {Array.from({ length: swipe.total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === swipe.index ? "w-4 bg-accent" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          )}
          <MobileRelatedSections canonical={canonical} related={related} />
        </div>
      </>
    );
  }

  return (
    <>
      {heads}

      {/* Desktop: navy hero band */}
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
        title={title}
        subtitle={subheading}
        liveChip="Rates current — updated today"
      />

      {/* Mobile: keep legacy breadcrumb + H1 untouched */}
      <div className="page-shell pt-6 md:hidden">
        <Breadcrumb current={title} />
        <h1
          className={`${subheading ? "mb-2" : "mb-3"} font-serif font-normal tracking-tight text-[clamp(32px,4vw,48px)] leading-[1.1] text-[hsl(var(--foreground))]`}
          style={{ fontFamily: "var(--font-display-serif)" }}
        >
          {title}
        </h1>
        {subheading && (
          <p className="mb-3 text-[15px] text-muted-foreground">{subheading}</p>
        )}
        <RateFreshnessBadge className="mb-2" />
      </div>

      {/* AEO: direct-answer pill, citation-friendly, before any ad. */}
      {quickAnswer && (
        <div className="page-shell pt-4">
          <QuickAnswer data={quickAnswer} />
        </div>
      )}

      {/* Top banner — above the fold but BELOW the calculator hero, so it
          never delays interaction with the tool. Lazy-loaded by AdSlot. */}
      <div className="page-shell pt-4">
        <AdSlot slot="header" />
      </div>

      <div className="page-shell py-8 md:py-10">
        <div className="min-w-0">
          {children}
          {/* After-calculator slot: highest-value placement, right under the
              result, before any SEO content. */}
          <AdSlot slot="inline" className="my-10" />
        </div>
        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <div key={s.heading} className="space-y-10">
              <section>
                <h2
                  className="mb-3 hidden md:block text-[28px] font-normal leading-[1.15] tracking-tight"
                  style={{ fontFamily: "var(--font-display-serif)", color: "var(--c-navy)" }}
                >
                  {s.heading}
                </h2>
                <h2 className="mb-3 md:hidden">{s.heading}</h2>
                <div className="text-[15px] leading-relaxed text-muted-foreground">{s.body}</div>
              </section>
              {interleaveAdsEvery &&
                (i + 1) % interleaveAdsEvery === 0 &&
                i < sections.length - 1 && <AdSlot slot="inline" />}
            </div>
          ))}
          <FAQ items={faqs} />
          <RelatedGuides canonical={canonical} />
          <RelatedCalculators items={related} />
          {dataSources && <DataSources sources={dataSources} className="mt-4" />}
          <div className="pt-2">
            <LastReviewed />
          </div>

        </div>
      </div>
      <StickyMobileAd />
    </>
  );
};

export default CalculatorPageShell;
