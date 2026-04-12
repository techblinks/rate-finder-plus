import { useState } from "react";
import { CountryConfig } from "@/data/countries";
import { calculateCompoundInterest, InterestResult } from "@/lib/calculators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultPanel from "./ResultPanel";

interface Props {
  country: CountryConfig;
}

const InterestCalculator = ({ country }: Props) => {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const [compounding, setCompounding] = useState(12);
  const [contribution, setContribution] = useState(200);
  const [result, setResult] = useState<InterestResult | null>(null);

  const calculate = () => {
    setResult(calculateCompoundInterest(principal, rate, years, compounding, contribution));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Enter Your Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Initial Amount ({country.currencySymbol})</Label>
              <Input id="principal" type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contribution">Monthly Contribution ({country.currencySymbol})</Label>
              <Input id="contribution" type="number" value={contribution} onChange={(e) => setContribution(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Annual Interest Rate: {rate}%</Label>
            <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={0.1} max={20} step={0.1} />
          </div>

          <div className="space-y-2">
            <Label>Investment Period: {years} years</Label>
            <Slider value={[years]} onValueChange={(v) => setYears(v[0])} min={1} max={50} step={1} />
          </div>

          <div className="space-y-2">
            <Label>Compounding Frequency</Label>
            <Select value={String(compounding)} onValueChange={(v) => setCompounding(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Annually</SelectItem>
                <SelectItem value="2">Semi-Annually</SelectItem>
                <SelectItem value="4">Quarterly</SelectItem>
                <SelectItem value="12">Monthly</SelectItem>
                <SelectItem value="365">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculate} className="w-full" size="lg">
            Calculate Interest
          </Button>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <ResultPanel
          symbol={country.currencySymbol}
          result={result ? [
            { label: "Future Value", value: result.futureValue },
            { label: "Total Contributions", value: result.totalContributions },
            { label: "Interest Earned", value: result.totalInterest },
          ] : []}
        />
      </div>
    </div>
  );
};

export default InterestCalculator;
