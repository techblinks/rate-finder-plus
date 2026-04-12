import { useState } from "react";
import { CountryConfig } from "@/data/countries";
import { calculateMortgage, MortgageResult } from "@/lib/calculators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ResultPanel from "./ResultPanel";
import AmortizationTable from "./AmortizationTable";

interface Props {
  country: CountryConfig;
}

const LoanCalculator = ({ country }: Props) => {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(8);
  const [term, setTerm] = useState(5);
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const calculate = () => {
    if (amount <= 0) return;
    setResult(calculateMortgage(amount, rate, term));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Enter Your Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Loan Amount ({country.currencySymbol})</Label>
            <Input id="loan-amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label>Interest Rate ({country.rateLabel}): {rate}%</Label>
            <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={0.5} max={36} step={0.1} />
          </div>

          <div className="space-y-2">
            <Label>Loan Term: {term} years</Label>
            <Slider value={[term]} onValueChange={(v) => setTerm(v[0])} min={1} max={30} step={1} />
          </div>

          <Button onClick={calculate} className="w-full" size="lg">
            Calculate Loan Payment
          </Button>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <ResultPanel
          symbol={country.currencySymbol}
          result={result ? [
            { label: "Monthly Payment", value: result.monthlyPayment },
            { label: "Total Interest", value: result.totalInterest },
            { label: "Total Cost", value: result.totalPayment },
          ] : []}
        />
      </div>

      {result && (
        <div className="lg:col-span-3">
          <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)} className="mb-4">
            {showSchedule ? "Hide" : "Show"} Payment Schedule
          </Button>
          {showSchedule && <AmortizationTable schedule={result.schedule} symbol={country.currencySymbol} />}
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;
