import { ArrowLeft, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileCalcHeaderProps {
  title: string;
}

const MobileCalcHeader = ({ title }: MobileCalcHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const handleShare = async () => {
    const shareData = { title, url: window.location.href };
    try {
      if (navigator.vibrate) navigator.vibrate(15);
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      /* user cancelled — silent */
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/95 px-2 backdrop-blur">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-accent active:scale-95 transition-transform"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="text-[16px] font-semibold tracking-tight text-foreground truncate px-2">
        {title}
      </h1>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-accent active:scale-95 transition-transform"
      >
        <Share2 className="h-[18px] w-[18px]" />
      </button>
    </header>
  );
};

export default MobileCalcHeader;
