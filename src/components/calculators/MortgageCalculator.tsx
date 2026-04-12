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

const MortgageCalculator = ({ country }: Props) => {
  const [amount, setAmount] = useState(country.defaultAmount);
  const [downPayment, setDownPayment] = useState(Math.round(country.defaultAmount * 0.2));
  const [rate, setRate] = useState(country.defaultRate);
  const [term, setTerm] = useState(country.defaultTerm);
  const [extraPayment, setExtraPayment] = useState(0);
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const calculate = () => {
    const principal = amount - downPayment;
    if (principal <= 0) return;
    setResult(calculateMortgage(principal, rate, term, extraPayment));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Enter Your Mortgage Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Property Price ({country.currencySymbol})</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="down">Down Payment ({country.currencySymbol})</Label>
              <Input id="down" type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interest Rate: {rate}%</Label>
            <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={0.5} max={15} step={0.05} />
          </div>

          <div className="space-y-2">
            <Label>Loan Term: {term} years</Label>
            <Slider value={[term]} onValueChange={(v) => setTerm(v[0])} min={1} max={40} step={1} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra">Extra Monthly Payment ({country.currencySymbol})</Label>
            <Input id="extra" type="number" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} />
          </div>

          <Button onClick={calculate} className="w-full" size="lg">
            Calculate Mortgage
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
            { label: "Loan Amount", value: amount - downPayment },
          ] : []}
        />
      </div>

      {result && (
        <div className="lg:col-span-3">
          <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)} className="mb-4">
            {showSchedule ? "Hide" : "Show"} Amortization Schedule
          </Button>
          {showSchedule && <AmortizationTable schedule={result.schedule} symbol={country.currencySymbol} />}
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;
