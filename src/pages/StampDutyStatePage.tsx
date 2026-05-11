import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
import NextStepsLinks from "@/components/NextStepsLinks";
import { STAMP_DUTY_STATE_CONTENT } from "@/data/stampDutyStateContent";

const StampDutyStatePage = ({ slug }: { slug: keyof typeof STAMP_DUTY_STATE_CONTENT }) => {
  const cfg = STAMP_DUTY_STATE_CONTENT[slug];

  return (
    <CalculatorPageShell
      title={cfg.h1}
      metaTitle={cfg.metaTitle}
      metaDescription={cfg.metaDescription}
      canonical={`/stamp-duty-calculator/${cfg.slug}`}
      subheading={cfg.subheading}
      faqs={cfg.faqs}
      seoFaqs={cfg.faqs}
      interleaveAdsEvery={2}
      related={[
        { to: `/first-home-buyer-grant-${cfg.slug}`, label: `${cfg.code} First Home Owner Grant 2026` },
        { to: "/stamp-duty-calculator", label: "Compare stamp duty across all states" },
        { to: "/mortgage-calculator", label: "Mortgage repayment calculator" },
        { to: "/borrowing-power-calculator", label: "How much can I borrow?" },
        { to: "/lmi-calculator", label: "LMI calculator (deposit < 20%)" },
        { to: "/best-home-loans-australia", label: "Best Australian home loans 2026" },
      ]}
      sections={[
        ...cfg.sections.map((s) => ({
          heading: s.heading,
          body: <p>{s.body}</p>,
        })),
        {
          heading: `${cfg.code} at a glance`,
          body: (
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>First home buyer threshold:</strong> {cfg.fhbThreshold}
              </li>
              <li>
                <strong>First Home Owner Grant:</strong> {cfg.fhog}
              </li>
              <li>
                <strong>Revenue authority:</strong>{" "}
                {cfg.code === "NSW"
                  ? "Revenue NSW"
                  : cfg.code === "VIC"
                  ? "State Revenue Office Victoria"
                  : cfg.code === "QLD"
                  ? "Queensland Revenue Office"
                  : cfg.code === "WA"
                  ? "RevenueWA"
                  : cfg.code === "SA"
                  ? "RevenueSA"
                  : cfg.code === "TAS"
                  ? "State Revenue Office of Tasmania"
                  : cfg.code === "ACT"
                  ? "ACT Revenue Office"
                  : "Territory Revenue Office"}
              </li>
            </ul>
          ),
        },
        {
          heading: `Plan your full ${cfg.code} purchase`,
          body: (
            <>
              <p className="mb-4">
                Stamp duty is one of several upfront costs. Use these tools alongside your{" "}
                {cfg.code} stamp duty figure to size your loan and budget the rest of the deal.
              </p>
              <NextStepsLinks
                items={[
                  {
                    to: "/mortgage-calculator",
                    title: "Mortgage repayment calculator",
                    description: `Estimate monthly repayments on the home loan you'll need after paying ${cfg.code} stamp duty and your deposit.`,
                  },
                  {
                    to: "/borrowing-power-calculator",
                    title: "Borrowing power calculator",
                    description: `See how much a lender may approve based on your income and commitments before adding ${cfg.code} upfront costs.`,
                  },
                  {
                    to: "/lmi-calculator",
                    title: "LMI calculator",
                    description:
                      "Estimate Lenders Mortgage Insurance if your deposit is under 20% — often capitalised on top of your loan.",
                  },
                  {
                    to: "/stamp-duty-calculator",
                    title: "Compare all states",
                    description: `See how ${cfg.code} stamp duty compares to every other Australian state and territory for the same property value.`,
                  },
                ]}
              />
            </>
          ),
        },
      ]}
    >
      <StampDuty lockedState={cfg.code} />
    </CalculatorPageShell>
  );
};

export default StampDutyStatePage;
export { STAMP_DUTY_STATE_CONTENT as STATE_CONFIGS };
