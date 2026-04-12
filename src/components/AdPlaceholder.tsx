interface AdPlaceholderProps {
  zone: "top-banner" | "sidebar" | "in-content" | "post-calculator";
  className?: string;
}

const zoneLabels: Record<AdPlaceholderProps["zone"], string> = {
  "top-banner": "Ad — Top Banner (728×90)",
  sidebar: "Ad — Sidebar (300×250)",
  "in-content": "Ad — In-Content (728×90)",
  "post-calculator": "Ad — Post Calculator (728×90)",
};

const AdPlaceholder = ({ zone, className = "" }: AdPlaceholderProps) => (
  <div
    className={`flex items-center justify-center border-2 border-dashed border-border bg-muted/50 rounded-lg text-xs text-muted-foreground ${className}`}
    role="complementary"
    aria-label="Advertisement"
  >
    {zoneLabels[zone]}
  </div>
);

export default AdPlaceholder;
