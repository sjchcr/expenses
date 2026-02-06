import { useRef, useState, useCallback, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
  maxPull?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  maxPull = 120,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      // Only start pull if at the top of the scroll container
      if (container.scrollTop <= 0) {
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
      }
    },
    [isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      // Only allow pull if at the top
      if (container.scrollTop > 0) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        // Apply resistance to make it feel more natural
        const resistance = 0.5;
        const distance = Math.min(diff * resistance, maxPull);
        setPullDistance(distance);

        // Prevent default scrolling when pulling down
        if (distance > 0) {
          e.preventDefault();
        }
      }
    },
    [isPulling, isRefreshing, startY, maxPull],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
        style={{
          height: pullDistance,
          opacity: progress,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-muted",
            shouldTrigger && "bg-primary/10",
          )}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 text-muted-foreground transition-all duration-200",
              shouldTrigger && "text-primary",
              isRefreshing && "animate-spin",
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${progress * 180}deg)`,
            }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
