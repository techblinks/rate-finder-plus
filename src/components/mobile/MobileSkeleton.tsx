import type { CSSProperties, ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  /** Optional rounded variants */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const ROUND: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

/**
 * Lightweight shimmer skeleton block, mobile-tuned (uses muted token so it
 * adapts to dark mode). Animates with a CSS gradient sweep — no JS frame work.
 */
export const MobileSkeleton = ({ className = "", style, rounded = "md" }: SkeletonProps) => (
  <div
    aria-hidden
    className={`relative overflow-hidden bg-muted ${ROUND[rounded]} ${className}`}
    style={style}
  >
    <span className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
  </div>
);

interface OverlayProps {
  pending: boolean;
  children: ReactNode;
  /** Skeleton to show while pending. Defaults to a single block. */
  skeleton?: ReactNode;
  /** Keep children mounted (and dimmed) while pending — preserves layout. */
  keepMounted?: boolean;
  className?: string;
}

/**
 * Wraps a result/chart area. While `pending`, fades the children to ~40%
 * opacity (preserving layout/scroll) so changes feel instant without
 * remounting heavy subtrees. Pass `keepMounted={false}` to swap to a
 * skeleton placeholder instead.
 */
export const MobilePendingOverlay = ({
  pending,
  children,
  skeleton,
  keepMounted = true,
  className = "",
}: OverlayProps) => {
  if (!pending) return <div className={className}>{children}</div>;
  if (!keepMounted && skeleton) return <div className={className}>{skeleton}</div>;
  return (
    <div className={`relative ${className}`} aria-busy="true" aria-live="polite">
      <div className="opacity-40 transition-opacity duration-150 [&_*]:!animate-none">{children}</div>
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.1s_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
      </span>
    </div>
  );
};

export default MobileSkeleton;
