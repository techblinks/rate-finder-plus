import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultItem {
  label: string;
  value: number;
}

interface ResultPanelProps {
  symbol: string;
  result: ResultItem[];
}

const ResultPanel = ({ symbol, result }: ResultPanelProps) => (
  <Card className="bg-primary text-primary-foreground">
    <CardHeader>
      <CardTitle className="text-lg">Your Results</CardTitle>
    </CardHeader>
    <CardContent>
      {result.length === 0 ? (
        <p className="text-sm opacity-80">Enter your details and click calculate to see results.</p>
      ) : (
        <div className="space-y-4">
          {result.map((item, i) => (
            <div key={i}>
              <p className="text-xs uppercase tracking-wider opacity-70">{item.label}</p>
              <p className={`font-bold ${i === 0 ? "text-3xl" : "text-xl"}`}>
                {symbol}{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default ResultPanel;
