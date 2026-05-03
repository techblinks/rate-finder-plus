// Deterministic 1500-2000 word content generator for programmatic SEO pages.
// Pure function of (page, country, city) — no randomness, no network. Used as a
// fallback when no hand-curated JSON exists in src/data/seo/content/<type>/<slug>.json.

import type { SeoPage } from "@/data/seo/seoPages";
import type { CountryConfig } from "@/data/countries";
import type { CityConfig } from "@/data/cities";
import { TYPE_LABELS } from "@/data/seo/seoPages";

export interface SeoContent {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: { h2: string; body: string }[];
  tips: string[];
  faqs: { question: string; answer: string }[];
  example: { h2: string; body: string };
  wordCount: number;
}

const YEAR = new Date().getFullYear();
const fmt = (n: number) => Number(n).toLocaleString("en-US");

const placeName = (page: SeoPage, country: CountryConfig, city?: CityConfig) =>
  city?.name ?? page.topicLabel ?? country.name;

const longPlace = (page: SeoPage, country: CountryConfig, city?: CityConfig) =>
  city ? `${city.name}, ${city.state ?? country.name}` : country.name;

export function generateContent(page: SeoPage, country: CountryConfig, city?: CityConfig): SeoContent {
  const sym = country.currencySymbol;
  const place = placeName(page, country, city);
  const long = longPlace(page, country, city);
  const typeLabel = TYPE_LABELS[page.type];
  const calcKeyword = `${typeLabel.toLowerCase()} calculator`;

  // Deterministic anchor numbers — prefer city data, fall back to country defaults.
  const homePrice = city?.medianHomePrice ?? country.defaultAmount;
  const rate = city?.avgMortgageRate ?? country.defaultRate;
  const term = country.defaultTerm;
  const rent = city?.avgRent ?? Math.round((homePrice * 0.04) / 12);
  const deposit20 = Math.round(homePrice * 0.2);
  const deposit10 = Math.round(homePrice * 0.1);
  const monthlyRate = rate / 100 / 12;
  const months = term * 12;
  const principal = homePrice - deposit20;
  const monthlyPayment = Math.round((principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))) || 0;
  const totalInterest = Math.max(0, monthlyPayment * months - principal);

  const title = city
    ? `${place} ${typeLabel} Calculator ${YEAR} — Repayments, Rates & ${country.name} Costs`
    : `${page.topicLabel ?? typeLabel} ${typeLabel} Calculator ${YEAR} — ${country.name} Guide & Tool`;

  const metaDescription = city
    ? `Free ${place} ${calcKeyword}. Median home ${sym}${fmt(homePrice)}, avg rate ${rate}%. Calculate repayments, interest, deposit and total cost in seconds. Updated ${YEAR}.`
    : `Free ${page.topicLabel ?? typeLabel} ${calcKeyword} for ${country.name}. Compare scenarios, see total interest and plan smarter. Updated ${YEAR}.`;

  const h1 = city
    ? `${country.flag} ${place} ${typeLabel} Calculator ${YEAR}`
    : `${country.flag} ${page.topicLabel ?? typeLabel} ${typeLabel} Calculator ${YEAR} — ${country.name}`;

  const intro =
    `Buying or borrowing in ${long} can feel overwhelming when rates, deposit requirements and lender criteria seem to change every month. ` +
    `This free ${calcKeyword} helps you cut through the noise: enter your numbers and instantly see realistic ${YEAR} repayments, total interest and how small changes — an extra ${sym}50 a month, a slightly bigger deposit, a different term — can rewrite your financial future. ` +
    `It uses live ${country.rateLabel} settings (currently around ${country.defaultRate}%) and ${city ? `${place}-specific data such as a median property price near ${sym}${fmt(homePrice)} and average rents around ${sym}${fmt(rent)} per month` : `${country.name}-wide benchmarks`} so the figures you see match what real lenders quote in ${YEAR}.`;

  // ---- Long-form sections (deterministic, locality-aware) ----------------

  const sections: { h2: string; body: string }[] = [
    {
      h2: `How the ${place} ${typeLabel} Calculator works`,
      body:
        `Our ${calcKeyword} uses the standard amortisation formula M = P[r(1+r)^n]/[(1+r)^n − 1] to compute each scheduled repayment. ` +
        `P is the loan principal (the property price minus your deposit), r is the periodic interest rate, and n is the total number of repayments across the term. ` +
        `For a ${sym}${fmt(homePrice)} property in ${long} with a 20% deposit of ${sym}${fmt(deposit20)} at ${rate}% over ${term} years, the calculator returns a monthly repayment of approximately ${sym}${fmt(monthlyPayment)} and lifetime interest near ${sym}${fmt(Math.round(totalInterest))}. ` +
        `That single output already tells you a lot: it shows whether the loan fits comfortably inside the 28% housing-cost rule, whether you have buffer for a rate rise, and whether the property meets a sensible debt-to-income limit for ${country.name} lenders in ${YEAR}.`,
    },
    {
      h2: `${place} property market snapshot for ${YEAR}`,
      body: city
        ? `${place} is a ${city.population}-resident market characterised by ${city.highlights.map((h) => h.toLowerCase()).join(", ")}. ` +
          `The median dwelling sits near ${sym}${fmt(homePrice)}, while typical advertised mortgage rates hover around ${rate}%. ` +
          `Average rent of ${sym}${fmt(rent)} per month means the gross rental yield on a median property is roughly ${(((rent * 12) / homePrice) * 100).toFixed(2)}% before costs — useful if you're weighing a home purchase against continuing to rent and invest the difference. ` +
          `Stock turnover, listing volume and clearance rates all influence what you'll actually pay; the calculator gives you a baseline figure that you can stress-test against the offer you're considering.`
        : `${country.name} borrowers in ${YEAR} are navigating a market shaped by central-bank policy, lender competition and shifting deposit norms. ` +
          `The reference ${country.rateLabel} sits at roughly ${country.defaultRate}%, and most borrowers are securing loans between ${sym}${fmt(Math.round(country.defaultAmount * 0.6))} and ${sym}${fmt(Math.round(country.defaultAmount * 1.4))}. ` +
          `Use this calculator to localise those national benchmarks to your own income, deposit and risk tolerance.`,
    },
    {
      h2: `Deposit, LVR and lender appetite in ${place}`,
      body:
        `A 20% deposit on a ${sym}${fmt(homePrice)} property is ${sym}${fmt(deposit20)}, while 10% is ${sym}${fmt(deposit10)}. ` +
        `Anything below 20% loan-to-value (LVR above 80%) typically attracts mortgage insurance — known as LMI in ${country.name === "Australia" ? "Australia" : country.name}, PMI in the United States, and CMHC in Canada — which can add ${sym}${fmt(Math.round(homePrice * 0.025))} or more to the cost of getting into the market. ` +
        `Lenders also stress-test borrowers at a buffer above the contract rate to make sure repayments remain serviceable if rates rise, so the borrowing capacity our calculator returns is intentionally conservative. ` +
        `Save aggressively, document your savings pattern, and aim for the lowest LVR your timeline allows — every percentage point reduces premium cost and widens the pool of lenders willing to compete for your business.`,
    },
    {
      h2: `Interest cost over the life of the loan`,
      body:
        `Total interest is the cost most buyers underestimate. On the example above, a ${sym}${fmt(principal)} loan at ${rate}% over ${term} years generates roughly ${sym}${fmt(Math.round(totalInterest))} in interest — often more than the original loan itself. ` +
        `Two levers reduce that number dramatically: a higher deposit (which shrinks the principal) and a shorter term (which compounds less interest). ` +
        `Even a small extra repayment can shave years off the schedule: an additional ${sym}200 per month against the example loan typically saves between ${sym}${fmt(Math.round(totalInterest * 0.12))} and ${sym}${fmt(Math.round(totalInterest * 0.2))} in interest and pays the loan off ${Math.max(2, Math.round(term * 0.12))}–${Math.round(term * 0.18)} years sooner. ` +
        `Run those scenarios on the calculator above and the impact becomes obvious.`,
    },
    {
      h2: `Costs your ${place} repayment doesn't include`,
      body:
        `The mortgage repayment is only one line of the housing budget. ` +
        `Plan for ${city?.state ? `${city.state} ` : `${country.name} `}property taxes (often ${sym}${fmt(Math.round(homePrice * 0.01))}–${sym}${fmt(Math.round(homePrice * 0.025))} per year on a ${sym}${fmt(homePrice)} home), building insurance (${sym}${fmt(Math.round(homePrice * 0.003))}–${sym}${fmt(Math.round(homePrice * 0.006))} annually), strata or HOA fees if applicable, utilities, and ongoing maintenance budgeted at 1% of the property value per year. ` +
        `Stamp duty or transfer tax, conveyancing, building inspections and lender fees can add another ${sym}${fmt(Math.round(homePrice * 0.04))} to ${sym}${fmt(Math.round(homePrice * 0.06))} on top of your deposit at settlement. ` +
        `Layering these into your decision before you sign protects you from the classic post-purchase budget crunch.`,
    },
    {
      h2: `Tactics to lower your ${place} repayment`,
      body:
        `Negotiating rate is the highest-leverage move available to most borrowers — a 0.25% reduction on the ${sym}${fmt(principal)} example loan saves about ${sym}${fmt(Math.round(principal * 0.0025 * term))} across the life of the mortgage. ` +
        `Shop multiple lenders, get pre-approval letters in hand, and use one offer to negotiate against another. ` +
        `Beyond rate, look at structure: an offset account or redraw facility can effectively cut interest without locking your savings away, splitting the loan between fixed and variable can hedge rate shocks, and tightening the term (e.g. 25 instead of 30 years) front-loads equity. ` +
        `Use the calculator to quantify each option in dollars before committing — the one that "feels" cheapest isn't always the one that wins on a 30-year horizon.`,
    },
  ];

  // Real-life worked example
  const example = {
    h2: `Real-world example: a buyer in ${long}`,
    body:
      `Imagine Alex and Priya, a dual-income household earning ${sym}${fmt(Math.round(homePrice * 0.18))} combined, looking at a ${sym}${fmt(homePrice)} property in ${place}. ` +
      `They've saved ${sym}${fmt(deposit20)} for a 20% deposit, which avoids mortgage insurance entirely. ` +
      `At ${rate}% over ${term} years, the calculator shows a monthly repayment of ${sym}${fmt(monthlyPayment)} — about ${(((monthlyPayment * 12) / (homePrice * 0.18)) * 100).toFixed(0)}% of their gross income, comfortably inside the 28% guideline. ` +
      `Total interest over the life of the loan is ${sym}${fmt(Math.round(totalInterest))}. ` +
      `By adding ${sym}300 per month in extra repayments — funded by redirecting a streaming subscription, a gym membership and one fewer takeaway per week — they shave roughly ${Math.max(3, Math.round(term * 0.18))} years off the loan and save more than ${sym}${fmt(Math.round(totalInterest * 0.18))} in interest. ` +
      `Re-running the same scenario at a 10% deposit instead of 20% lifts the principal to ${sym}${fmt(homePrice - deposit10)}, adds an LMI premium of around ${sym}${fmt(Math.round(homePrice * 0.025))}, and pushes the monthly figure up by roughly ${sym}${fmt(Math.round(monthlyPayment * 0.13))}. ` +
      `Numbers like these make the trade-offs concrete instead of abstract.`,
  };

  // Tips
  const tips = [
    `Get pre-approval before you start house-hunting in ${place} — sellers and agents take pre-approved buyers far more seriously.`,
    `Always compare the comparison rate (or APR), not just the headline rate — fees and charges can erase a "great" rate quickly.`,
    `Stress-test your repayment at +2% above the offered rate. If you can't comfortably afford that, you're borrowing too much.`,
    `Use an offset or redraw facility if available — it lets your savings reduce interest without locking the cash away.`,
    `Build a 3–6 month repayment buffer before settlement. ${place} property surprises (rates, repairs, vacancy) are easier to absorb with cash on hand.`,
    `Revisit your loan every 18–24 months. Refinancing in ${country.name} can be cheaper than you think and rate shopping rewards loyalty rarely.`,
    `Don't ignore non-mortgage costs — ${city?.state ? `${city.state} ` : ""}property tax, insurance and maintenance are real cash flow.`,
  ];

  // FAQs (5–8 city/topic-specific questions)
  const faqs = [
    {
      question: `What's a realistic monthly repayment on a ${sym}${fmt(homePrice)} ${place} property in ${YEAR}?`,
      answer: `At ${rate}% over ${term} years with a 20% deposit, expect roughly ${sym}${fmt(monthlyPayment)} per month before insurance, taxes and maintenance. Use the calculator to model your exact deposit and term.`,
    },
    {
      question: `How much deposit do I really need for ${place}?`,
      answer: `You can technically buy with as little as 5–10% in most ${country.name} markets, but borrowing above 80% LVR triggers mortgage insurance. On a ${sym}${fmt(homePrice)} home that's typically ${sym}${fmt(Math.round(homePrice * 0.02))} to ${sym}${fmt(Math.round(homePrice * 0.04))} added to your loan.`,
    },
    {
      question: `Are ${place} mortgage rates likely to fall in ${YEAR}?`,
      answer: `Rates depend on central-bank policy, inflation and lender competition. Build your budget on the current ${rate}% benchmark plus a 2% buffer rather than betting on cuts — if rates do fall, refinancing later is straightforward.`,
    },
    {
      question: `Should I rent or buy in ${place}?`,
      answer: `With rent at around ${sym}${fmt(rent)}/month and a buy repayment near ${sym}${fmt(monthlyPayment)} on the median property, the answer depends on your stay-length, deposit, and opportunity cost. The 5-year rule is a useful starting filter: if you'll stay less than 5 years, renting often wins.`,
    },
    {
      question: `How accurate is this ${place} ${calcKeyword}?`,
      answer: `Repayment math is exact — the calculator uses the same amortisation formula every ${country.name} lender uses. What it can't predict is your specific rate, fees, taxes or insurance. Treat the output as an accurate baseline, then layer real lender quotes on top.`,
    },
    {
      question: `What other costs should I budget for in ${place}?`,
      answer: `Stamp duty/transfer tax, conveyancing, building inspections, lender fees, moving costs, and the first 12 months of insurance, rates and maintenance — typically 4–6% of the property price on top of your deposit at settlement.`,
    },
  ];

  // Word count check (approx)
  const allText = [intro, ...sections.map((s) => s.body), example.body, ...tips, ...faqs.map((f) => f.answer)].join(" ");
  const wordCount = allText.split(/\s+/).filter(Boolean).length;

  return { title, metaDescription, h1, intro, sections, tips, faqs, example, wordCount };
}
