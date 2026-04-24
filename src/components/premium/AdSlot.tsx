type AdZone = "top-banner" | "in-feed" | "rectangle" | "rectangle-2" | "leaderboard" | "skyscraper";

interface AdSlotProps { zone: AdZone; className?: string; }

const sizes: Record<AdZone, { width: string; height: string; w: number; h: number }> = {
  "top-banner": { width: "320px", height: "50px", w: 320, h: 50 },
  "in-feed": { width: "320px", height: "100px", w: 320, h: 100 },
  rectangle: { width: "300px", height: "250px", w: 300, h: 250 },
  "rectangle-2": { width: "300px", height: "250px", w: 300, h: 250 },
  leaderboard: { width: "728px", height: "90px", w: 728, h: 90 },
  skyscraper: { width: "160px", height: "600px", w: 160, h: 600 },
};

const AdSlot = ({ zone, className = "" }: AdSlotProps) => {
  const size = sizes[zone];
  return (
    <div role="complementary" aria-label="Advertisement" className={`ad-stripe text-center ${className}`} style={{ maxWidth: "100%", width: size.width, height: size.height }} data-ad-zone={zone}>
      <span className="relative z-10 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Advertisement</span>
      <span className="relative z-10 mt-1 text-[9px] text-muted-foreground/50">{size.w}×{size.h}</span>
    </div>
  );
};

export default AdSlot;
