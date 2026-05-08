import { ReactNode } from "react";
import { SeoHead } from "@/components/seo/SeoHead";
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd, WebApplicationJsonLd } from "@/components/seo/JsonLd";
import { HOW_TOS } from "@/data/howTos";
import Breadcrumb from "@/components/Breadcrumb";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import AdSlot from "@/components/AdSlot";
import StickyMobileAd from "@/components/StickyMobileAd";
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
}: CalculatorPageShellProps) => (
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
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current={title} />
      <h1 className={subheading ? "mb-2" : "mb-6"}>{title}</h1>
      {subheading && (
        <p className="mb-6 text-[15px] text-muted-foreground">{subheading}</p>
      )}
      <AdSlot slot="header" className="mb-6" />
      <div className="min-w-0">
        {children}
        <AdSlot slot="inline" className="my-10" />
      </div>
      <div className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <div key={s.heading} className="space-y-10">
            <section>
              <h2 className="mb-3">{s.heading}</h2>
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
      </div>
    </div>
    <StickyMobileAd />
  </>
);

export default CalculatorPageShell;
