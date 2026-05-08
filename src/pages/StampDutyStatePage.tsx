import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
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
      related={[
        { to: "/stamp-duty-calculator", label: "All states stamp duty calculator" },
        { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
        { to: "/lmi-calculator", label: "LMI Calculator" },
        { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
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
      ]}
    >
      <StampDuty lockedState={cfg.code} />
    </CalculatorPageShell>
  );
};

export default StampDutyStatePage;
export { STAMP_DUTY_STATE_CONTENT as STATE_CONFIGS };
