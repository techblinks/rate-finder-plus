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
  return contentMap[key];
};
