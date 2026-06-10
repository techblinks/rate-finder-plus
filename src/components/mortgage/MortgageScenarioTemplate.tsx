import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import {
  buildMortgageScenarioBreadcrumbSchema,
  buildMortgageScenarioFaqSchema,
  DRAFT_MORTGAGE_SCENARIOS,
  mortgageScenarioPath,
  mortgageScenarioRobots,
  normalizeMortgageScenarioConfig,
  type MortgageScenarioPageConfig,
} from "@/data/mortgageScenarioPages";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import { removeDuplicateCanonicalLinks } from "@/lib/seoCanonical";

const SITE = "https://calcy.com.au";

interface MortgageScenarioTemplateProps {
  scenario: MortgageScenarioPageConfig;
}

const ToolLinks = ({ items }: { items: MortgageScenarioPageConfig["relatedTools"] }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {items.map((item) => (
      <Link
        key={`${item.to}-${item.label}`}
        to={item.to}
        className="rounded-2xl border border-border bg-white p-4 shadow-sm transition-colors hover:border-[#003680]/35"
      >
        <span className="text-[15px] font-semibold text-[#003680]">{item.label}</span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
      </Link>
    ))}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
    <h2 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h2>
    <div className="mt-4 text-[15px] leading-7 text-muted-foreground">{children}</div>
  </section>
);

export const MortgageScenarioTemplate = ({ scenario }: MortgageScenarioTemplateProps) => {
  const normalized = normalizeMortgageScenarioConfig(scenario);
  const canonical = mortgageScenarioPath(normalized.slug);
  const faqSchema = buildMortgageScenarioFaqSchema(normalized);
  const breadcrumbSchema = buildMortgageScenarioBreadcrumbSchema(normalized);
  const isApproved = normalized.approvedForIndex === true;
  const robots = mortgageScenarioRobots(normalized, DRAFT_MORTGAGE_SCENARIOS);

  useEffect(() => {
    removeDuplicateCanonicalLinks(`${SITE}${canonical}`);

    const robotTags = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="robots"]'));
    let keptCurrentRobots = false;
    robotTags.forEach((tag) => {
      if (tag.content === robots && !keptCurrentRobots) {
        keptCurrentRobots = true;
        return;
      }
      tag.remove();
    });
  }, [canonical, robots]);

  return (
    <>
      <Helmet>
        <title>{normalized.metaTitle}</title>
        <meta name="description" content={normalized.metaDescription} />
        <link rel="canonical" href={`${SITE}${canonical}`} />
        <meta name="robots" content={robots} />
        {breadcrumbSchema && (
          <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        )}
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          {normalized.breadcrumbs.map((item, index) => (
            <span key={item.path}>
              {index > 0 && <span className="mx-2">/</span>}
              {index === normalized.breadcrumbs.length - 1 ? (
                <span>{item.name}</span>
              ) : (
                <Link to={item.path} className="text-[#003680] underline-offset-4 hover:underline">
                  {item.name}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <header className="rounded-3xl bg-[#003680] px-5 py-7 text-white shadow-sm md:px-8 md:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
            {isApproved ? "Mortgage scenario" : "Draft mortgage scenario"}
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(32px,5vw,56px)] font-semibold leading-tight">
            {normalized.h1}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/78">{normalized.directAnswer}</p>
          {!isApproved && (
            <p className="mt-5 inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/85">
              Noindex draft. Excluded from sitemap until manually approved.
            </p>
          )}
        </header>

        <div className="mt-6 grid gap-5">
          <Section title="Scenario overview">
            <p>{normalized.intro}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {normalized.summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Calculate this scenario">
            <p>
              Use the mortgage calculator to model repayments, total interest, and payoff timing
              before publishing any scenario values.
            </p>
            <Link
              to="/mortgage-calculator"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#003680] px-4 text-sm font-semibold text-white hover:bg-[#002B66]"
            >
              Open mortgage calculator
            </Link>
          </Section>

          <Section title="Example repayment table">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="border-b border-border py-2 pr-4">Scenario</th>
                    <th className="border-b border-border py-2 pr-4">Repayment</th>
                    <th className="border-b border-border py-2 pr-4">Total interest</th>
                    <th className="border-b border-border py-2 pr-4">Total repaid</th>
                    <th className="border-b border-border py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {normalized.exampleRepaymentTable.map((row) => (
                    <tr key={row.label}>
                      <td className="border-b border-border py-3 pr-4 font-medium text-foreground">{row.label}</td>
                      <td className="border-b border-border py-3 pr-4">{row.repayment}</td>
                      <td className="border-b border-border py-3 pr-4">{row.totalInterest}</td>
                      <td className="border-b border-border py-3 pr-4">{row.totalRepaid}</td>
                      <td className="border-b border-border py-3">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Key insights">
            <ul className="grid gap-3 md:grid-cols-3">
              {normalized.keyInsights.map((insight) => (
                <li key={insight} className="rounded-2xl border border-border bg-white p-4 text-sm leading-6">
                  {insight}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Related calculators">
            <ToolLinks items={normalized.relatedTools} />
          </Section>

          <Section title="Internal links">
            <ToolLinks items={normalized.internalLinks} />
          </Section>

          <Section title="Frequently asked questions">
            <div className="space-y-4">
              {normalized.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Methodology">
            <p>{normalized.methodology}</p>
          </Section>

          <Section title="Important assumptions">
            <ul className="list-disc space-y-2 pl-5">
              {normalized.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </Section>

          <section className="rounded-3xl border border-[#BFDBFE] bg-[#EEF4FF] p-5 md:p-6">
            <h2 className="text-[18px] font-semibold text-[#003680]">Updated and reviewed</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Updated {normalized.updatedDate}. Reviewed {normalized.reviewedDate}.
              {isApproved
                ? " This scenario page has passed Calcy's manual indexing gate."
                : " Draft scenario pages remain noindex until manual approval."}
            </p>
          </section>

          <FinancialDisclaimer />
        </div>
      </main>
    </>
  );
};

export default MortgageScenarioTemplate;
