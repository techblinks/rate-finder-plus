import { AmortizationRow } from "@/lib/calculators";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  schedule: AmortizationRow[];
  symbol: string;
}

const AmortizationTable = ({ schedule, symbol }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? schedule : schedule.slice(0, 24);
  const fmt = (n: number) => `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell className="text-right">{fmt(row.payment)}</TableCell>
                <TableCell className="text-right">{fmt(row.principal)}</TableCell>
                <TableCell className="text-right">{fmt(row.interest)}</TableCell>
                <TableCell className="text-right">{fmt(row.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {schedule.length > 24 && (
        <Button variant="ghost" className="mt-2" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Less" : `Show All ${schedule.length} Months`}
        </Button>
      )}
    </div>
  );
};

export default AmortizationTable;
