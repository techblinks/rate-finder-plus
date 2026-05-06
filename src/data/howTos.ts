/**
 * HowTo step content per calculator route. Keyed by canonical path so both the
 * runtime React shell and the build-time prerenderer can emit identical
 * schema.org/HowTo JSON-LD without duplicating copy.
 */
export interface HowToStep {
  name: string;
  text: string;
}

export interface HowToContent {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g. "PT2M"
  steps: HowToStep[];
}

export const HOW_TOS: Record<string, HowToContent> = {
  "/mortgage-calculator": {
    name: "How to calculate your Australian mortgage repayments",
    description:
      "Estimate your monthly, fortnightly and weekly home loan repayments and see the full amortisation schedule.",
    totalTime: "PT2M",
    steps: [
      { name: "Enter your loan amount", text: "Type the amount you plan to borrow in Australian dollars." },
      { name: "Enter the interest rate", text: "Add your lender's advertised annual interest rate as a percentage." },
      { name: "Choose the loan term", text: "Select the loan term in years (typically 25 or 30 years in Australia)." },
      { name: "Pick a repayment frequency", text: "Switch between monthly, fortnightly or weekly to compare repayments." },
      { name: "Review the schedule", text: "Check the amortisation table to see principal vs. interest over time." },
    ],
  },
  "/stamp-duty-calculator": {
    name: "How to calculate Australian stamp duty",
    description: "Work out the transfer duty payable on a property purchase in any Australian state or territory.",
    totalTime: "PT1M",
    steps: [
      { name: "Select your state", text: "Choose the state or territory where the property is located." },
      { name: "Enter the purchase price", text: "Type the agreed property price in Australian dollars." },
      { name: "Pick your buyer type", text: "Choose owner-occupier, first home buyer or investor for the right concessions." },
      { name: "Review your duty", text: "See the calculated stamp duty plus any first-home-buyer concession applied." },
    ],
  },
  "/borrowing-power-calculator": {
    name: "How to estimate your home loan borrowing power",
    description: "See how much an Australian lender may let you borrow based on income, expenses and the APRA buffer.",
    totalTime: "PT2M",
    steps: [
      { name: "Enter your income", text: "Add gross annual income for you and any joint applicant." },
      { name: "Enter monthly expenses", text: "Include living costs, existing repayments and credit card limits." },
      { name: "Set the interest rate and term", text: "Use your lender's advertised rate and intended loan term." },
      { name: "Review your borrowing power", text: "See the maximum loan size after the APRA 3% serviceability buffer." },
    ],
  },
  "/extra-repayments-calculator": {
    name: "How to see the impact of extra mortgage repayments",
    description: "Find out how much faster your home loan is paid off when you add extra repayments each month.",
    totalTime: "PT1M",
    steps: [
      { name: "Enter your loan details", text: "Add the loan amount, interest rate and remaining term." },
      { name: "Add your extra repayment", text: "Type how much extra you'd contribute each month on top of the minimum." },
      { name: "Compare the outcomes", text: "See years saved and total interest avoided versus the baseline schedule." },
    ],
  },
  "/lmi-calculator": {
    name: "How to estimate Lender's Mortgage Insurance (LMI)",
    description: "Estimate the LMI premium added to your loan when your deposit is below 20% of the property value.",
    totalTime: "PT1M",
    steps: [
      { name: "Enter the property value", text: "Type the purchase price or valuation in Australian dollars." },
      { name: "Enter your deposit", text: "Add the deposit amount you've saved." },
      { name: "Review your LVR", text: "See your loan-to-value ratio and whether LMI is required." },
      { name: "See the LMI estimate", text: "Check the indicative premium and capitalised loan repayment." },
    ],
  },
  "/loan-comparison-calculator": {
    name: "How to compare two Australian home loans",
    description: "Compare two mortgage scenarios side-by-side to find the cheaper option over the full loan term.",
    totalTime: "PT2M",
    steps: [
      { name: "Enter loan A details", text: "Add the loan amount, interest rate, term and any upfront fees." },
      { name: "Enter loan B details", text: "Add the same details for the second scenario you're comparing." },
      { name: "Review repayments", text: "See monthly repayments and total interest for both loans." },
      { name: "Pick the winner", text: "Compare 'true cost' (total repaid plus fees) to find the cheaper loan." },
    ],
  },
};

/**
 * Stamp-duty state pages reuse the same HowTo as the main hub, with the
 * intro tailored to the state for richer per-page schema.
 */
const STATE_NAMES: Record<string, string> = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  wa: "Western Australia",
  sa: "South Australia",
  tas: "Tasmania",
  act: "Australian Capital Territory",
  nt: "Northern Territory",
};

for (const [slug, name] of Object.entries(STATE_NAMES)) {
  const base = HOW_TOS["/stamp-duty-calculator"];
  HOW_TOS[`/stamp-duty-calculator/${slug}`] = {
    ...base,
    name: `How to calculate ${name} stamp duty`,
    description: `Work out the transfer duty payable on a property purchase in ${name}.`,
  };
}
