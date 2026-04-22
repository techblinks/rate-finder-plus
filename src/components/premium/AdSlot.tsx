type AdZone =
  | "top-banner"      // 320×50 mobile banner (header strip)
  | "in-feed"         // 320×100 mobile in-feed
  | "rectangle"       // 300×250 medium rectangle
  | "rectangle-2"     // 300×250 second rectangle
  | "leaderboard"     // 728×90 desktop leaderboard
  | "skyscraper";     // 160×600 desktop sidebar

interface AdSlotProps {
  zone: AdZone;
  className?: string;
}

const sizes: Record<AdZone, { width: string; height: string; w: number; h: number }> = {
  "top-banner":  { width: "320px", height: "50px",  w: 320, h: 50 },
  "in-feed":     { width: "320px", height: "100px", w: 320, h: 100 },
  rectangle:     { width: "300px", height: "250px", w: 300, h: 250 },
  "rectangle-2": { width: "300px", height: "250px", w: 300, h: 250 },
  leaderboard:   { width: "728px", height: "90px",  w: 728, h: 90 },
  skyscraper:    { width: "160px", height: "600px", w: 160, h: 600 },
};

const AdSlot = ({ zone, className = "" }: AdSlotProps) => {
  const size = sizes[zone];
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={`ad-stripe rounded-[10px] border-[1.5px] border-dashed border-gray-300 flex flex-col items-center justify-center mx-auto text-center ${className}`}
      style={{ maxWidth: "100%", width: size.width, height: size.height }}
      data-ad-zone={zone}
    >
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 font-semibold">
        Advertisement
      </span>
      <span className="text-[9px] text-muted-foreground/40 mt-0.5">
        {size.w}×{size.h}
      </span>
    </div>
  );
};

export default AdSlot;
