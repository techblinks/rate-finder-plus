import { Card, CardContent } from "@/components/ui/card";

interface ContentBlocksProps {
  howItWorks: string;
  whyUse: string;
  tips: string[];
  keyTerms: { term: string; definition: string }[];
}

const ContentBlocks = ({ howItWorks, whyUse, tips, keyTerms }: ContentBlocksProps) => (
  <div className="mt-12 space-y-10">
    <section aria-labelledby="how-it-works">
      <h2 id="how-it-works" className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
      <p className="text-muted-foreground leading-relaxed">{howItWorks}</p>
    </section>

    <section aria-labelledby="why-use">
      <h2 id="why-use" className="text-2xl font-bold text-foreground mb-4">Why Use This Calculator?</h2>
      <p className="text-muted-foreground leading-relaxed">{whyUse}</p>
    </section>

    <section aria-labelledby="tips">
      <h2 id="tips" className="text-2xl font-bold text-foreground mb-4">Pro Tips</h2>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2 text-muted-foreground">
            <span className="text-accent font-bold">✓</span>
            {tip}
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="key-terms">
      <h2 id="key-terms" className="text-2xl font-bold text-foreground mb-4">Key Terms</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {keyTerms.map((item) => (
          <Card key={item.term}>
            <CardContent className="pt-4">
              <dt className="font-semibold text-foreground">{item.term}</dt>
              <dd className="text-sm text-muted-foreground mt-1">{item.definition}</dd>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  </div>
);

export default ContentBlocks;
