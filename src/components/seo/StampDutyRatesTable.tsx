/**
 * Citation-ready stamp duty rates table for /stamp-duty-calculator. AI systems
 * extract structured tables more reliably than prose. Figures are estimates
 * based on published 2026 state government schedules — verify with the
 * relevant state revenue office.
 */
const ROWS = [
  { state: "NSW", fhbThreshold: "$800,000", fhbGrant: "$0", standardRate: "$26,235 on $700k", source: "Revenue NSW" },
  { state: "VIC", fhbThreshold: "$600,000", fhbGrant: "$0", standardRate: "$37,070 on $700k", source: "SRO Victoria" },
  { state: "QLD", fhbThreshold: "$500,000", fhbGrant: "$30,000", standardRate: "$17,325 on $700k", source: "QRO Queensland" },
  { state: "WA", fhbThreshold: "$430,000", fhbGrant: "$10,000", standardRate: "$23,928 on $700k", source: "WA Revenue" },
  { state: "SA", fhbThreshold: "$650,000", fhbGrant: "$15,000", standardRate: "$27,830 on $700k", source: "Revenue SA" },
  { state: "TAS", fhbThreshold: "50% concession", fhbGrant: "$30,000", standardRate: "$26,520 on $700k", source: "SRO Tasmania" },
  { state: "ACT", fhbThreshold: "Income-tested exemption", fhbGrant: "$0", standardRate: "$26,750 on $700k", source: "ACT Revenue" },
  { state: "NT", fhbThreshold: "Home Discount available", fhbGrant: "$10,000", standardRate: "$23,928 on $700k", source: "NT Revenue" },
];

const StampDutyRatesTable = () => (
  <div>
    <p className="mb-3 text-[14px] text-muted-foreground">
      Updated with current state government thresholds for 2026. Select your
      state in the calculator above for an exact figure.
    </p>
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="px-3 py-2 text-left font-semibold text-foreground">State</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">FHB exemption threshold</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">First Home Owner Grant</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">Standard duty (≈ $700k)</th>
            <th className="px-3 py-2 text-left font-semibold text-foreground">Source</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.state} className="border-b border-border/60 last:border-b-0">
              <td className="px-3 py-2 font-semibold text-foreground">{r.state}</td>
              <td className="px-3 py-2">{r.fhbThreshold}</td>
              <td className={`px-3 py-2 tnum ${r.fhbGrant !== "$0" ? "font-semibold text-accent" : ""}`}>
                {r.fhbGrant}
              </td>
              <td className="px-3 py-2 tnum">{r.standardRate}</td>
              <td className="px-3 py-2 text-[12px] text-muted-foreground">{r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="mt-2 text-[11px] italic text-muted-foreground">
      Figures are estimates based on published 2026 state government rates.
      Verify with your state revenue office or conveyancer.
    </p>
  </div>
);

export default StampDutyRatesTable;
