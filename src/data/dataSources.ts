/**
 * Per-page data attribution. AI systems (Perplexity, AI Overviews, Claude)
 * weight pages with explicit citations more highly. Rendered by
 * <DataSources/> at the bottom of each calculator page.
 */
export interface DataSource {
  label: string;
  url: string;
  updated: string;
}

const RBA: DataSource = {
  label: "RBA Cash Rate — Reserve Bank of Australia",
  url: "https://www.rba.gov.au/statistics/cash-rate/",
  updated: "May 2026",
};

const APRA: DataSource = {
  label: "APRA Serviceability Buffer — APG 223",
  url: "https://www.apra.gov.au/sites/default/files/apg_223_0.pdf",
  updated: "Oct 2021",
};

const ASIC: DataSource = {
  label: "ASIC MoneySmart — Mortgage Calculator Methodology",
  url: "https://moneysmart.gov.au/home-loans/mortgage-calculator",
  updated: "2026",
};

const STAMP_DUTY_SOURCES: DataSource[] = [
  { label: "Revenue NSW — Transfer Duty", url: "https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty", updated: "Jul 2025" },
  { label: "State Revenue Office Victoria", url: "https://www.sro.vic.gov.au/land-transfer-duty", updated: "Jul 2025" },
  { label: "Queensland Revenue Office", url: "https://www.qro.qld.gov.au/duties/transfer-duty/", updated: "Jul 2025" },
  { label: "WA Department of Finance — Transfer Duty", url: "https://www.wa.gov.au/organisation/department-of-finance/transfer-duty", updated: "Jul 2025" },
  { label: "RevenueSA", url: "https://www.revenuesa.sa.gov.au/taxes-and-duties/stamp-duties/real-property", updated: "Jul 2025" },
  { label: "State Revenue Office Tasmania", url: "https://www.sro.tas.gov.au/duties", updated: "Jul 2025" },
  { label: "ACT Revenue Office", url: "https://www.revenue.act.gov.au/duties/conveyance-duty", updated: "Jul 2025" },
  { label: "NT Territory Revenue Office", url: "https://treasury.nt.gov.au/dtf/territory-revenue-office", updated: "Jul 2025" },
];

const LMI_SOURCES: DataSource[] = [
  { label: "Helia (formerly Genworth) LMI rates", url: "https://www.helia.com.au/", updated: "Jan 2026" },
  { label: "QBE Lenders Mortgage Insurance", url: "https://www.qbe.com/au/lmi", updated: "Jan 2026" },
];

export const DATA_SOURCES: Record<string, DataSource[]> = {
  "/mortgage-calculator": [RBA, ASIC],
  "/stamp-duty-calculator": STAMP_DUTY_SOURCES,
  "/borrowing-power-calculator": [APRA, RBA],
  "/hecs-borrowing-power": [APRA, RBA, { label: "ATO — HELP repayment thresholds", url: "https://www.ato.gov.au/individuals/study-and-training-support-loans/", updated: "Jul 2025" }],
  "/lmi-calculator": LMI_SOURCES,
  "/refinance-calculator": [RBA, ASIC],
  "/extra-repayments-calculator": [RBA, ASIC],
  "/loan-comparison-calculator": [RBA, ASIC],
  "/rent-vs-buy-calculator": [RBA, { label: "CoreLogic Home Value Index", url: "https://www.corelogic.com.au/our-data/corelogic-indices", updated: "Apr 2026" }],
};

// State stamp duty pages all share the full 8-state source list.
for (const s of ["nsw", "vic", "qld", "wa", "sa", "tas", "act", "nt"]) {
  DATA_SOURCES[`/stamp-duty-calculator/${s}`] = STAMP_DUTY_SOURCES;
}
