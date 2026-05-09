import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd, FaqJsonLd, ArticleJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import AdSlot from "@/components/AdSlot";
import RateFreshnessBadge from "@/components/RateFreshnessBadge";
import NotFound from "./NotFound";

const StampDuty = lazy(() => import("@/components/calculators/StampDuty"));
const MortgageCalculatorRedesign = lazy(
  () => import("@/components/calculators/MortgageCalculatorRedesign"),
);
const Lmi = lazy(() => import("@/components/calculators/Lmi"));
const BorrowingPower = lazy(() => import("@/components/calculators/BorrowingPower"));

interface ProgPage {
  id: string;
  page_type: string;
  url_path: string;
  params: Record<string, unknown>;
  target_keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  intro_text: string | null;
}

const STATE_NAMES: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

function buildSearchParams(pageType: string, p: Record<string, any>): string {
  const sp = new URLSearchParams();
  if (pageType === "stamp_duty") {
    if (p.propertyValue) sp.set("value", String(p.propertyValue));
    if (p.state) sp.set("state", String(p.state));
    if (p.buyerType === "first-home-buyer") sp.set("fhb", "yes");
    else sp.set("fhb", "no");
  } else if (pageType === "mortgage") {
    if (p.loanAmount) sp.set("loan", String(p.loanAmount));
    if (p.interestRate) sp.set("rate", String(p.interestRate));
    if (p.termYears) sp.set("term", String(p.termYears));
  } else if (pageType === "lmi") {
    if (p.propertyValue) sp.set("value", String(p.propertyValue));
    if (p.deposit) sp.set("deposit", String(p.deposit));
  } else if (pageType === "borrowing_power") {
    if (p.annualIncome) sp.set("income", String(p.annualIncome));
    if (p.monthlyExpenses) sp.set("expenses", String(p.monthlyExpenses));
    if (p.deposit) sp.set("deposit", String(p.deposit));
  }
  return sp.toString();
}

function generateIntro(page: ProgPage): string {
  const p = page.params as any;
  if (page.page_type === "stamp_duty") {
    const stateName = STATE_NAMES[p.state] || p.state;
    const isFHB = p.buyerType === "first-home-buyer";
    return `This page calculates the exact stamp duty payable on a ${fmtMoney(Number(p.propertyValue))} property in ${stateName}${isFHB ? " for first home buyers" : ""}. Use the calculator below to see the full breakdown including any first home buyer exemptions and total upfront costs.`;
  }
  if (page.page_type === "mortgage") {
    return `This page calculates exact mortgage repayments on a ${fmtMoney(Number(p.loanAmount))} home loan at ${p.interestRate}% interest over ${p.termYears} years. See weekly, fortnightly, and monthly repayment amounts, total interest paid, and a full amortisation schedule.`;
  }
  if (page.page_type === "borrowing_power") {
    return `This page estimates the borrowing power for someone earning ${fmtMoney(Number(p.annualIncome))} per year in Australia. See your estimated maximum loan amount, maximum purchase price, and personalised tips to increase your borrowing limit.`;
  }
  if (page.page_type === "lmi") {
    const lvr = Math.round(((p.propertyValue - p.deposit) / p.propertyValue) * 100);
    return `This page calculates Lender's Mortgage Insurance (LMI) on a ${fmtMoney(Number(p.propertyValue))} property with a ${fmtMoney(Number(p.deposit))} deposit (${lvr}% LVR). See the exact LMI cost, whether you can avoid it, and what government schemes are available.`;
  }
  return "";
}

function generateContent(page: ProgPage): { sections: { heading: string; body: JSX.Element }[]; faqs: { q: string; a: string }[]; relatedTo: string } {
  const p = page.params as any;
  if (page.page_type === "stamp_duty") {
    const stateName = STATE_NAMES[p.state] || p.state;
    const value = Number(p.propertyValue);
    const isFHB = p.buyerType === "first-home-buyer";
    return {
      relatedTo: "/stamp-duty-calculator",
      sections: [
        {
          heading: `Why stamp duty in ${stateName} matters at this price point`,
          body: (
            <>
              <p>
                A {fmtMoney(value)} property is a common price point for buyers in {stateName} in 2026.
                Stamp duty is the largest upfront cost after your deposit, so understanding the exact
                amount before you make an offer prevents nasty surprises at settlement. The calculator
                above uses the current 2026 {stateName} schedule and applies any concessions automatically.
              </p>
              <p className="mt-3">
                {isFHB
                  ? `As a first home buyer in ${stateName}, you may be eligible for full or partial stamp duty exemption — the calculator shows your exact saving versus a standard buyer.`
                  : `If this is your first home, switch the buyer type to “First home buyer” in the calculator above to see your potential saving.`}
              </p>
            </>
          ),
        },
        {
          heading: "Total upfront costs to budget for",
          body: (
            <p>
              Beyond stamp duty, plan for legal/conveyancing fees ($1,500–$3,000), building and pest
              inspections ($400–$700), loan application fees, mortgage registration, and lender's
              mortgage insurance (LMI) if your deposit is below 20%. For a {fmtMoney(value)} purchase,
              total upfront costs typically sit between 4–6% of the property price for non-FHB buyers.
            </p>
          ),
        },
      ],
      faqs: [
        {
          q: `How much is stamp duty on a ${fmtMoney(value)} property in ${stateName}?`,
          a: `Use the calculator above for the exact figure. ${stateName} uses a tiered schedule for 2026, and the result depends on whether you're a first home buyer, owner-occupier, or investor.`,
        },
        {
          q: `Do first home buyers pay stamp duty in ${stateName} on a ${fmtMoney(value)} property?`,
          a: `It depends on the state's threshold. Toggle the “First home buyer” option in the calculator to see whether you qualify for exemption, concession, or pay the full rate.`,
        },
        {
          q: "When is stamp duty paid?",
          a: "Stamp duty is typically due within 30 days of settlement. Some states require payment before settlement to register the transfer of title.",
        },
      ],
    };
  }
  if (page.page_type === "mortgage") {
    const loan = Number(p.loanAmount);
    return {
      relatedTo: "/mortgage-calculator",
      sections: [
        {
          heading: `Repayments on a ${fmtMoney(loan)} home loan at ${p.interestRate}%`,
          body: (
            <p>
              The calculator above shows your exact principal-and-interest repayment for a {fmtMoney(loan)}
              loan at {p.interestRate}% over {p.termYears} years. Repayment frequency makes a real
              difference: paying fortnightly instead of monthly typically shaves years off your loan and
              saves tens of thousands in interest because you make 26 fortnightly payments per year —
              the equivalent of 13 monthly payments.
            </p>
          ),
        },
        {
          heading: "How a small rate change affects this loan",
          body: (
            <p>
              On a {fmtMoney(loan)} loan, every 0.25% change in interest rate moves your monthly
              repayment by roughly {fmtMoney(Math.round((loan * 0.0025) / 12))}. Use the rate slider in
              the calculator above to model different scenarios — particularly useful when comparing
              lender offers or stress-testing your budget against potential RBA rate changes.
            </p>
          ),
        },
      ],
      faqs: [
        {
          q: `What is the monthly repayment on a ${fmtMoney(loan)} mortgage at ${p.interestRate}%?`,
          a: `The calculator above shows the exact figure for principal-and-interest, fortnightly, weekly and monthly frequencies over a ${p.termYears}-year term.`,
        },
        {
          q: `How much interest will I pay over ${p.termYears} years?`,
          a: "The calculator displays total interest paid over the life of the loan, plus a full amortisation schedule showing how each payment splits between principal and interest.",
        },
        {
          q: "Should I make extra repayments?",
          a: "Even small extra repayments can save tens of thousands and shave years off the loan. Open the “Extra repayments” option in the calculator to model the impact.",
        },
      ],
    };
  }
  if (page.page_type === "lmi") {
    const value = Number(p.propertyValue);
    const deposit = Number(p.deposit);
    const lvr = Math.round(((value - deposit) / value) * 100);
    return {
      relatedTo: "/lmi-calculator",
      sections: [
        {
          heading: `LMI at ${lvr}% LVR — what it costs and how to avoid it`,
          body: (
            <p>
              At a {lvr}% LVR (${fmtMoney(deposit)} deposit on a {fmtMoney(value)} property), Lender's
              Mortgage Insurance protects your lender — not you — and can run into the tens of
              thousands. The calculator above shows your estimated LMI premium and whether
              capitalising it onto the loan or saving a larger deposit gives you the better outcome.
            </p>
          ),
        },
        {
          heading: "Ways to avoid LMI on this purchase",
          body: (
            <p>
              You may be able to skip LMI entirely with a guarantor, the First Home Guarantee scheme,
              or by being in an LMI-waived profession (doctors, accountants, lawyers). Saving to 20%
              deposit ({fmtMoney(value * 0.2)}) eliminates LMI but takes time — the calculator's
              “Pay now vs wait” view shows whether the extra savings are worth the delay given likely
              property growth.
            </p>
          ),
        },
      ],
      faqs: [
        {
          q: `How much is LMI on a ${fmtMoney(value)} property with a ${fmtMoney(deposit)} deposit?`,
          a: `The calculator above estimates LMI at ${lvr}% LVR using current insurer schedules.`,
        },
        {
          q: "Can I avoid LMI with this deposit?",
          a: "You may be eligible for the First Home Guarantee, a guarantor loan, or LMI waivers for certain professions. The calculator shows your options.",
        },
        {
          q: "Should I capitalise LMI onto my loan?",
          a: "Capitalising LMI is common but increases your loan balance and total interest. The calculator compares paying upfront vs capitalising.",
        },
      ],
    };
  }
  if (page.page_type === "borrowing_power") {
    const income = Number(p.annualIncome);
    return {
      relatedTo: "/borrowing-power-calculator",
      sections: [
        {
          heading: `Borrowing power on a ${fmtMoney(income)} salary`,
          body: (
            <p>
              The calculator above estimates how much an Australian lender would lend someone earning
              {" "}{fmtMoney(income)} per year. Lenders apply a serviceability buffer of around 3% above
              the actual rate and use the Household Expenditure Measure (HEM) to estimate living
              expenses, which is why your borrowing capacity is usually less than the rule-of-thumb
              5–6× annual income.
            </p>
          ),
        },
        {
          heading: "How to increase your borrowing power",
          body: (
            <p>
              Reducing credit card limits, paying down personal loans, and adding a partner's income
              to a joint application are the fastest ways to lift borrowing capacity. The calculator
              above lets you toggle joint income, dependants, and existing debts to see the impact.
            </p>
          ),
        },
      ],
      faqs: [
        {
          q: `How much can I borrow on a ${fmtMoney(income)} salary?`,
          a: "The calculator above shows an estimate based on standard lender serviceability assumptions for 2026.",
        },
        {
          q: "What's the difference between maximum loan and maximum purchase price?",
          a: "Maximum purchase price = maximum loan + your deposit – upfront costs (stamp duty, fees, LMI). The calculator shows both figures.",
        },
        {
          q: "Why is my borrowing power lower than 5× my income?",
          a: "Lenders apply an interest rate buffer (~3%) when assessing serviceability. With rates around 6%, this assumes you could afford ~9% — which significantly reduces capacity.",
        },
      ],
    };
  }
  return { sections: [], faqs: [], relatedTo: "/" };
}

function CalcRenderer({ page }: { page: ProgPage }) {
  // Inject pre-fill query string before the calculator reads window.location.search
  useMemo(() => {
    if (typeof window === "undefined") return;
    const qs = buildSearchParams(page.page_type, page.params as any);
    if (qs && window.location.search.replace(/^\?/, "") !== qs) {
      window.history.replaceState(null, "", `${page.url_path}?${qs}`);
    }
  }, [page.id, page.url_path, page.page_type, page.params]);

  const fallback = (
    <div className="h-32 animate-pulse rounded bg-muted" aria-busy="true" />
  );

  if (page.page_type === "stamp_duty") {
    return (
      <Suspense fallback={fallback}>
        <StampDuty />
      </Suspense>
    );
  }
  if (page.page_type === "mortgage") {
    return (
      <Suspense fallback={fallback}>
        <MortgageCalculatorRedesign />
      </Suspense>
    );
  }
  if (page.page_type === "lmi") {
    return (
      <Suspense fallback={fallback}>
        <Lmi />
      </Suspense>
    );
  }
  if (page.page_type === "borrowing_power") {
    return (
      <Suspense fallback={fallback}>
        <BorrowingPower />
      </Suspense>
    );
  }
  return null;
}

const ProgrammaticPage = () => {
  const location = useLocation();
  const urlPath = location.pathname.replace(/\/+$/, "");
  const [page, setPage] = useState<ProgPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("programmatic_pages")
        .select(
          "id,page_type,url_path,params,target_keyword,meta_title,meta_description,h1,intro_text",
        )
        .eq("url_path", urlPath)
        .eq("is_active", true)
        .maybeSingle();
      if (cancel) return;
      setPage((data as ProgPage | null) ?? null);
      setLoading(false);
    }
    load();
    return () => {
      cancel = true;
    };
  }, [urlPath]);

  if (loading) {
    return (
      <div className="page-shell py-16" aria-busy="true">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!page) return <NotFound />;

  const intro = page.intro_text || generateIntro(page);
  const { sections, faqs, relatedTo } = generateContent(page);
  const title = page.h1 || page.meta_title || "";
  const metaTitle = page.meta_title || title;
  const metaDescription = page.meta_description || intro.slice(0, 160);
  const faqItems = faqs.map((f) => ({ question: f.q, answer: f.a }));

  return (
    <>
      <SeoHead title={metaTitle} description={metaDescription} canonical={page.url_path} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Calculate", path: "/calculate" },
          { name: title, path: page.url_path },
        ]}
      />
      <FaqJsonLd faqs={faqItems} />
      <ArticleJsonLd
        headline={metaTitle}
        description={metaDescription}
        path={page.url_path}
        sectionHeadings={sections.map((s) => s.heading)}
      />
      <div className="page-shell py-8 md:py-10">
        <Breadcrumb current={title} />
        <h1 className="mb-3">{title}</h1>
        <p className="mb-4 text-[15px] text-muted-foreground">{intro}</p>
        <RateFreshnessBadge className="mb-6" />
        <AdSlot slot="header" className="mb-6" />

        <div className="min-w-0">
          <CalcRenderer page={page} />
          <AdSlot slot="inline" className="my-10" />

          {sections.map((s) => (
            <section key={s.heading} className="prose-section mt-8">
              <h2 className="mb-3 text-xl font-semibold">{s.heading}</h2>
              <div className="text-[15px] leading-relaxed text-foreground/90">{s.body}</div>
            </section>
          ))}

          {faqItems.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-semibold">Frequently asked questions</h2>
              <FAQ items={faqItems} />
            </section>
          )}

          <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-5">
            <p className="text-sm text-muted-foreground">
              Want to change the inputs?{" "}
              <Link to={relatedTo} className="font-medium text-primary underline">
                Open the full calculator
              </Link>
              {" "}to model your own scenario.
            </p>
          </div>

          <RelatedCalculators
            items={[
              { to: "/mortgage-calculator", label: "Mortgage repayment calculator" },
              { to: "/stamp-duty-calculator", label: "Stamp duty calculator" },
              { to: "/borrowing-power-calculator", label: "Borrowing power calculator" },
              { to: "/lmi-calculator", label: "LMI calculator" },
            ].filter((i) => i.to !== relatedTo)}
          />
        </div>
      </div>
    </>
  );
};

export default ProgrammaticPage;
