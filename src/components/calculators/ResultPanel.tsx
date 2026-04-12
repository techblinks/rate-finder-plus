import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ResultItem {
  label: string;
  value: number;
  highlight?: boolean;
}

interface ResultPanelProps {
  symbol: string;
  result: ResultItem[];
}

const fmt = (symbol: string, value: number) =>
  `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ResultPanel = ({ symbol, result }: ResultPanelProps) => (
  <Card className="bg-primary text-primary-foreground overflow-hidden">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Your Results
      </CardTitle>
    </CardHeader>
    <CardContent>
      {result.length === 0 ? (
        <p className="text-sm opacity-70">Enter your details and click calculate to see results.</p>
      ) : (
        <>
          <div className="space-y-4 mb-5">
            {result.map((item, i) => (
              <div key={i} className={i === 0 ? "pb-3 border-b border-primary-foreground/20" : ""}>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">{item.label}</p>
                <p className={`font-bold tabular-nums ${i === 0 ? "text-3xl" : "text-lg opacity-90"}`}>
                  {fmt(symbol, item.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Conversion CTA */}
          <div className="rounded-md bg-primary-foreground/10 p-3 text-center">
            <p className="text-xs opacity-80 mb-2">Want to lock in a better rate?</p>
            <button className="w-full py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
              Compare Live Rates →
            </button>
            <p className="text-[9px] opacity-40 mt-1.5">Sponsored</p>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

export default ResultPanel;
