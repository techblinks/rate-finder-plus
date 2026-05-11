import { Link } from "react-router-dom";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd, FaqJsonLd, ArticleJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import LastReviewed from "@/components/LastReviewed";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import RateFreshnessBadge from "@/components/RateFreshnessBadge";
import AdSlot from "@/components/AdSlot";
import StickyMobileAd from "@/components/StickyMobileAd";

const TITLE = "Best Home Loans Australia 2026";
const META_TITLE = "Best Home Loans Australia 2026 — Compare Rates, Features & Lenders | Calcy";
const META_DESCRIPTION =
  "Compare the best Australian home loans for 2026 — fixed vs variable, big-four vs neobanks, offset accounts, and how to switch. Independent, no sign-up.";
const CANONICAL = "/best-home-loans-australia";

const FAQS = [
  {
    question: "What is the best home loan rate in Australia right now?",
    answer:
      "Variable rates from competitive lenders sit in the high-5% range for owner-occupiers with strong deposits, while sharper fixed rates are sometimes offered as headline products. The 'best' rate depends on your LVR, loan type, and how much you value features like offset and redraw — a rate 0.10% lower with no offset can cost more than a 0.10% higher rate that lets you park savings against the loan.",
  },
  {
    question: "Are fixed or variable rates better in 2026?",
    answer:
      "With the RBA cash rate stabilising in 2025–2026, variable rates have become the more popular choice because they pass on cuts immediately. Fixed rates lock in certainty but often carry break costs and don't allow extra repayments freely. Many borrowers split their loan — half fixed, half variable — to balance certainty with flexibility.",
  },
  {
    question: "Should I go with a big-four bank or a smaller lender?",
    answer:
      "Big-four banks offer branch service and bundled banking, but smaller lenders, mutuals, and digital banks frequently undercut them on rate by 0.20–0.50%. Over a 30-year $600,000 loan, 0.30% saves roughly $50,000 in interest. Service quality varies — check independent reviews and ask about turnaround times for approvals and discharges.",
  },
  {
    question: "What is an offset account and is it worth it?",
    answer:
      "An offset is a transaction account linked to your home loan. Funds in the offset reduce the interest charged on your loan, dollar for dollar. If you keep $30,000 in offset against a 6% loan, you save approximately $1,800 a year in interest — usually more than annual package fees. Offset is worth it if you typically carry $10k+ in savings.",
  },
  {
    question: "How often should I review my home loan?",
    answer:
      "Every 18–24 months. Lenders aggressively discount for new business but rarely volunteer rate cuts to existing customers — this is the 'loyalty tax'. A quick refinance or even a phone call to your existing lender's retention team typically delivers 0.20–0.40% in savings.",
  },
];

const SECTIONS = [
  {
    heading: "How to think about the best Australian home loan in 2026",
    body: (
      <>
        <p>
          The 'best home loan' is the one that minimises your total cost of borrowing over the
          life of the loan — not the one with the lowest headline rate. In Australia in 2026,
          three factors do most of the work: the interest rate (variable or fixed), whether the
          loan includes an offset account, and the fee structure (no-fees-flat, or a $300–$400
          annual package fee that bundles offset, credit card, and rate discount).
        </p>
        <p className="mt-3">
          As a rule of thumb, a loan with a 0.10% higher rate but a full-featured offset will
          beat a 0.10% lower rate with no offset for most owner-occupiers who keep more than
          $5,000 in savings. Investors generally prefer interest-only periods to maximise tax
          deductibility, and trade off slightly higher rates accordingly.
        </p>
      </>
    ),
  },
  {
    heading: "Variable vs fixed in 2026's rate environment",
    body: (
      <>
        <p>
          With the RBA cash rate at 4.35% through most of 2025 and easing in late 2025–2026,
          variable rates have outperformed fixed for new borrowers entering the market — each RBA
          cut flowed through to variable customers within weeks, while fixed customers stayed
          locked in at older rates. The flip side: if the RBA holds or hikes, fixed-rate borrowers
          benefit from certainty.
        </p>
        <p className="mt-3">
          A split loan — for example 30% fixed for two years, 70% variable with offset — gives
          you a hedge: certainty on a portion of repayments, plus full flexibility on the rest.
          Most major lenders allow splits at no extra cost.
        </p>
      </>
    ),
  },
  {
    heading: "Big-four banks vs digital and neobank lenders",
    body: (
      <>
        <p>
          The big-four banks (CBA, Westpac, NAB, ANZ) hold roughly 75% of the Australian
          mortgage market. They offer brand familiarity, branch presence, and bundled banking
          packages. However, smaller lenders — mutuals, digital banks, and broker-only
          wholesalers — frequently advertise rates 0.20–0.50% sharper, particularly for
          straightforward owner-occupier purchases with 20%+ deposits.
        </p>
        <p className="mt-3">
          For a $600,000 loan over 30 years, a 0.30% rate difference compounds to approximately
          $50,000 in extra interest over the term. The trade-offs to weigh: turnaround time for
          approval (some smaller lenders take longer), branch access (often digital-only), and
          servicing buffers (some apply tighter income tests than the majors).
        </p>
      </>
    ),
  },
  {
    heading: "Features that pay back their cost",
    body: (
      <>
        <p>
          The single most valuable feature for most owner-occupiers is a 100% offset account.
          Funds in the offset directly reduce the interest charged on the loan, with no minimum
          balance and full liquidity. For a household keeping $30,000+ in savings, this routinely
          saves $1,500–$2,000 a year in interest — more than the package fee that typically
          comes with offset eligibility.
        </p>
        <p className="mt-3">
          Other features worth paying for: free redraw (so you can pull extra repayments back if
          needed), unlimited extra repayments on variable loans, and a fee-free switch between
          fixed and variable. Avoid paying for: branch access if you bank digitally, credit cards
          bundled into the package, and 'rate-cut guarantees' that often only apply on portions
          of your balance.
        </p>
      </>
    ),
  },
  {
    heading: "How to switch lenders the right way",
    body: (
      <>
        <p>
          Refinancing in Australia in 2026 is faster than ever — most lenders complete a
          straightforward refinance in 2–4 weeks. Before switching, call your existing lender's
          retention team and ask for a rate match: in 2025 over 60% of retention calls resulted
          in some discount, with an average reduction of 0.25%. If they decline or only offer a
          token cut, switching to a better lender is straightforward and discharge fees are
          typically modest ($300–$400).
        </p>
        <p className="mt-3">
          Use the Calcy{" "}
          <Link to="/refinance-calculator" className="font-medium text-accent underline">
            refinance calculator
          </Link>{" "}
          to see whether a switch saves enough to justify the paperwork. As a rule of thumb, a
          0.30% rate reduction on a $500,000+ loan saves enough in year one to cover all switching
          costs, with everything after that going straight to your pocket.
        </p>
      </>
    ),
  },
];

const BestHomeLoansAustralia = () => (
  <>
    <SeoHead title={META_TITLE} description={META_DESCRIPTION} canonical={CANONICAL} />
    <BreadcrumbJsonLd
      items={[
        { name: "Home", path: "/" },
        { name: TITLE, path: CANONICAL },
      ]}
    />
    <FaqJsonLd faqs={FAQS} />
    <ArticleJsonLd
      headline={META_TITLE}
      description={META_DESCRIPTION}
      path={CANONICAL}
      sectionHeadings={SECTIONS.map((s) => s.heading)}
    />

    <div className="page-shell pt-6">
      <Breadcrumb current={TITLE} />
      <h1
        className="mb-2 font-serif font-normal tracking-tight text-[clamp(32px,4vw,48px)] leading-[1.1]"
        style={{ fontFamily: "var(--font-display-serif)" }}
      >
        {TITLE}
      </h1>
      <p className="mb-3 text-[15px] text-muted-foreground">
        Independent guide to choosing a 2026 Australian home loan — variable vs fixed, the
        big-four versus digital lenders, the features worth paying for, and how to switch
        without paying the 'loyalty tax'.
      </p>
      <RateFreshnessBadge className="mb-4" />
      <AdSlot slot="header" className="mb-6" />
    </div>

    <div className="page-shell py-6 md:py-8">
      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
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
            {(i + 1) % 2 === 0 && i < SECTIONS.length - 1 && <AdSlot slot="inline" />}
          </div>
        ))}

        <FAQ items={FAQS} />

        <RelatedCalculators
          items={[
            { to: "/mortgage-calculator", label: "Mortgage repayment calculator" },
            { to: "/borrowing-power-calculator", label: "How much can I borrow?" },
            { to: "/refinance-calculator", label: "Refinance calculator" },
            { to: "/loan-comparison-calculator", label: "Compare two home loans" },
            { to: "/extra-repayments-calculator", label: "Extra repayments calculator" },
            { to: "/lmi-calculator", label: "LMI calculator" },
          ]}
        />

        <FinancialDisclaimer />

        <div className="pt-2">
          <LastReviewed />
        </div>
      </div>
    </div>
    <StickyMobileAd />
  </>
);

export default BestHomeLoansAustralia;
