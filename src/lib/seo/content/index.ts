import { CalculatorType, CountryConfig } from "@/data/countries";
import { usMortgageContent } from "./us-mortgage";
import { auMortgageContent } from "./au-mortgage";
import { caMortgageContent } from "./ca-mortgage";
import { usLoanContent } from "./us-loan";
import { auLoanContent } from "./au-loan";
import { caLoanContent } from "./ca-loan";
import { usInterestContent } from "./us-interest";
import { auInterestContent } from "./au-interest";
import { caInterestContent } from "./ca-interest";

export interface PageContent {
  h1: string;
  intro: string;
  howItWorks: string;
  localInsights: string;
  tips: string[];
  keyTerms: { term: string; definition: string }[];
}

const contentMap: Record<string, PageContent> = {
  "us-mortgage-calculator": usMortgageContent,
  "au-mortgage-calculator": auMortgageContent,
  "ca-mortgage-calculator": caMortgageContent,
  "us-loan-calculator": usLoanContent,
  "au-loan-calculator": auLoanContent,
  "ca-loan-calculator": caLoanContent,
  "us-interest-calculator": usInterestContent,
  "au-interest-calculator": auInterestContent,
  "ca-interest-calculator": caInterestContent,
};

export const getEnhancedContent = (calcType: CalculatorType, country: CountryConfig): PageContent => {
  const key = `${country.code}-${calcType}`;
  if (contentMap[key]) return contentMap[key];

  // Fallback: synthesize generic localized content for unsupported combos
  // (e.g. UK market, or new calculators like borrowing-power, stamp-duty, etc.)
  const calcLabel = calcType
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    h1: `${country.name} ${calcLabel}`,
    intro: `Use our free ${country.name} ${calcLabel.toLowerCase()} to plan your finances with confidence. Built for ${country.name} borrowers and savers, this tool gives you instant, accurate results in ${country.currency} so you can make informed money decisions.`,
    howItWorks: `Our ${calcLabel.toLowerCase()} applies industry-standard formulas tailored to ${country.name} financial conventions. Adjust the inputs to match your situation and see results update instantly. All figures are estimates based on the values you enter — always confirm specifics with a licensed ${country.name} financial professional before committing.`,
    localInsights: `Rates and conditions in ${country.name} shift with central bank policy and lender competition. Use this calculator alongside up-to-date ${country.name} market data to benchmark offers from local banks, credit unions, and online lenders.`,
    tips: [
      `Compare offers from at least three ${country.name} lenders before deciding.`,
      "Small rate differences compound into significant savings over time.",
      "Factor in fees, insurance, and taxes — not just the headline rate.",
      "Improve your credit profile to unlock better pricing.",
      "Revisit your numbers annually as your circumstances change.",
    ],
    keyTerms: [
      { term: "Principal", definition: "The original amount borrowed or invested, before interest." },
      { term: "Interest Rate", definition: "The annual cost of borrowing or return on savings, expressed as a percentage." },
      { term: "Term", definition: "The length of time over which the loan is repaid or the investment is held." },
      { term: "APR / APY", definition: "The annualised cost (APR) or yield (APY) including compounding and fees." },
    ],
  };
};
