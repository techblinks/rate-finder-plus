export type DownloadableToolFormat = "spreadsheet" | "pdf" | "checklist" | "planner";
export type DownloadableToolStatus = "coming_soon" | "draft" | "available";
export type DownloadableToolSeoStatus = "draft_noindex" | "approved_indexable";

export interface DownloadableToolLink {
  to: string;
  label: string;
}

export interface DownloadableToolConfig {
  id: string;
  title: string;
  shortDescription: string;
  audience: string;
  useCase: string;
  format: DownloadableToolFormat;
  status: DownloadableToolStatus;
  downloadUrl?: string;
  requiresEmail: boolean;
  relatedCalculatorLinks: DownloadableToolLink[];
  seoStatus: DownloadableToolSeoStatus;
  updatedDate: string;
  reviewedDate: string;
}

export const DOWNLOADABLE_TOOLS: DownloadableToolConfig[] = [
  {
    id: "mortgage-repayment-spreadsheet",
    title: "Mortgage Repayment Spreadsheet",
    shortDescription: "Compare repayment frequencies, loan terms, and rate changes in one planning workbook.",
    audience: "Buyers comparing loan sizes, repayment frequencies, and rate scenarios.",
    useCase: "Save a mortgage repayment plan outside the calculator and review scenarios with a partner, broker, or lender.",
    format: "spreadsheet",
    status: "available",
    downloadUrl: "/downloads/calcy-mortgage-repayment-spreadsheet.csv",
    requiresEmail: false,
    relatedCalculatorLinks: [
      { to: "/mortgage-calculator", label: "Mortgage calculator" },
      { to: "/loan-comparison-calculator", label: "Loan comparison calculator" },
    ],
    seoStatus: "draft_noindex",
    updatedDate: "2026-05-24",
    reviewedDate: "2026-05-24",
  },
  {
    id: "first-home-buyer-budget-template",
    title: "First Home Buyer Budget Template",
    shortDescription: "Plan deposit, stamp duty awareness, LMI, inspections, moving costs, and settlement cash.",
    audience: "First home buyers preparing a realistic purchase budget.",
    useCase: "Keep upfront costs in one place before deciding how much to borrow.",
    format: "spreadsheet",
    status: "draft",
    requiresEmail: false,
    relatedCalculatorLinks: [
      { to: "/mortgage-calculator/first-home-buyer", label: "First home buyer scenario" },
      { to: "/stamp-duty-calculator", label: "Stamp duty calculator" },
      { to: "/lmi-calculator", label: "LMI calculator" },
    ],
    seoStatus: "draft_noindex",
    updatedDate: "2026-05-24",
    reviewedDate: "2026-05-24",
  },
  {
    id: "extra-repayment-planner",
    title: "Extra Repayment Planner",
    shortDescription: "Compare weekly, fortnightly, or monthly extra repayments and their planning impact.",
    audience: "Borrowers who want to test extra repayments without changing their main loan estimate.",
    useCase: "Review how additional repayments may reduce interest and shorten the loan term.",
    format: "planner",
    status: "coming_soon",
    requiresEmail: false,
    relatedCalculatorLinks: [
      { to: "/mortgage-calculator/extra-repayments", label: "Extra repayments scenario" },
      { to: "/extra-repayments-calculator", label: "Extra repayment calculator" },
    ],
    seoStatus: "draft_noindex",
    updatedDate: "2026-05-24",
    reviewedDate: "2026-05-24",
  },
  {
    id: "refinance-comparison-spreadsheet",
    title: "Refinance Comparison Spreadsheet",
    shortDescription: "Compare a current loan with a refinance option, including repayment and fee trade-offs.",
    audience: "Existing borrowers reviewing refinance options.",
    useCase: "Review repayments, fees, break-even timing, and estimated interest differences.",
    format: "spreadsheet",
    status: "draft",
    requiresEmail: false,
    relatedCalculatorLinks: [
      { to: "/refinance-calculator", label: "Refinance calculator" },
      { to: "/loan-comparison-calculator", label: "Loan comparison calculator" },
    ],
    seoStatus: "draft_noindex",
    updatedDate: "2026-05-24",
    reviewedDate: "2026-05-24",
  },
  {
    id: "home-buying-checklist-pdf",
    title: "Home Buying Checklist PDF",
    shortDescription: "Track key steps from repayment planning to settlement preparation.",
    audience: "Buyers who want a simple checklist for the home-buying process.",
    useCase: "Track documents, inspections, finance steps, settlement tasks, and review points.",
    format: "pdf",
    status: "coming_soon",
    requiresEmail: false,
    relatedCalculatorLinks: [
      { to: "/mortgage-calculator", label: "Mortgage calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing power calculator" },
      { to: "/stamp-duty-calculator", label: "Stamp duty calculator" },
    ],
    seoStatus: "draft_noindex",
    updatedDate: "2026-05-24",
    reviewedDate: "2026-05-24",
  },
];

export function isDownloadAvailable(tool: DownloadableToolConfig) {
  return tool.status === "available" && Boolean(tool.downloadUrl);
}

export function getDownloadableToolCta(tool: DownloadableToolConfig) {
  if (isDownloadAvailable(tool)) return "Download";
  if (tool.status === "coming_soon") return "Coming soon";
  return "Draft - file not ready";
}
