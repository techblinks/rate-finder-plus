import { ReactNode } from "react";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd, FaqJsonLd, WebApplicationJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
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
  sections: Section[];
  related: { to: string; label: string }[];
  children: ReactNode;
}

const CalculatorPageShell = ({
  title,
  metaTitle,
  metaDescription,
  canonical,
  faqs,
  sections,
  related,
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
    <FaqJsonLd faqs={faqs} />
    <WebApplicationJsonLd name={title} description={metaDescription} path={canonical} />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current={title} />
      <h1 className="mb-6">{title}</h1>
      <AdSlot slot="header" className="mb-6" />
      {children}
      <AdSlot slot="inline" className="my-10" />
      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-3">{s.heading}</h2>
            <div className="text-[15px] leading-relaxed text-muted-foreground">{s.body}</div>
          </section>
        ))}
        <FAQ items={faqs} />
        <RelatedCalculators items={related} />
      </div>
    </div>
  </>
);

export default CalculatorPageShell;
