import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import NextStepsLinks from "@/components/NextStepsLinks";
import { FHB_GRANT_CONTENT } from "@/data/fhbGrantContent";

const FhbGrantPage = ({ slug }: { slug: keyof typeof FHB_GRANT_CONTENT }) => {
  const cfg = FHB_GRANT_CONTENT[slug];

  return (
    <CalculatorPageShell
      title={cfg.h1}
      metaTitle={cfg.metaTitle}
      metaDescription={cfg.metaDescription}
      canonical={`/first-home-buyer-grant-${cfg.slug}`}
      subheading={cfg.subheading}
      faqs={cfg.faqs}
      seoFaqs={cfg.faqs}
      interleaveAdsEvery={2}
      related={[
        { to: `/stamp-duty-calculator/${cfg.slug}`, label: `${cfg.code} stamp duty calculator` },
        { to: "/borrowing-power-calculator", label: "How much can I borrow?" },
        { to: "/lmi-calculator", label: "LMI calculator (deposit < 20%)" },
        { to: "/mortgage-calculator", label: "Mortgage repayment calculator" },
        { to: "/best-home-loans-australia", label: "Best Australian home loans 2026" },
        { to: "/refinance-calculator", label: "Should I refinance later?" },
      ]}
      sections={[
        ...cfg.sections.map((s) => ({
          heading: s.heading,
          body: <p>{s.body}</p>,
        })),
        {
          heading: `${cfg.code} grant at a glance`,
          body: (
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Headline benefit:</strong> {cfg.highlight}
              </li>
              <li>
                <strong>Grant amount:</strong> {cfg.grantAmount}
              </li>
              <li>
                <strong>Property cap:</strong> {cfg.propertyCap}
              </li>
              <li>
                <strong>Revenue authority:</strong> {cfg.revenueAuthority}
              </li>
            </ul>
          ),
        },
        {
          heading: `Plan your full ${cfg.code} first home purchase`,
          body: (
            <>
              <p className="mb-4">
                Pair this grant with the right loan and budget. Use these tools to
                build a complete settlement plan that captures the full {cfg.code}{" "}
                first home buyer benefit.
              </p>
              <NextStepsLinks
                items={[
                  {
                    to: `/stamp-duty-calculator/${cfg.slug}`,
                    title: `${cfg.code} stamp duty calculator`,
                    description: `Calculate exact stamp duty in ${cfg.name} including any first home buyer exemption or concession.`,
                  },
                  {
                    to: "/borrowing-power-calculator",
                    title: "Borrowing power calculator",
                    description: `Find out how much a lender may approve based on your income before you factor in your ${cfg.code} grant.`,
                  },
                  {
                    to: "/lmi-calculator",
                    title: "LMI calculator",
                    description:
                      "Estimate Lenders Mortgage Insurance if your deposit is under 20% — important even when grants reduce your cash outlay.",
                  },
                  {
                    to: "/mortgage-calculator",
                    title: "Mortgage repayment calculator",
                    description: `Model monthly repayments after applying your ${cfg.code} grant and stamp duty savings to your purchase.`,
                  },
                ]}
              />
              <FinancialDisclaimer className="mt-6" />
            </>
          ),
        },
      ]}
    >
      <StampDuty lockedState={cfg.code} />
    </CalculatorPageShell>
  );
};

export default FhbGrantPage;
