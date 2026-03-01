import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IndicatorPosition {
  left: number;
  width: number;
}

interface MobileNavigationProps {
  currentPath: string;
  items: NavItem[];
}

export const MobileNavigation = ({
  currentPath,
  items,
}: MobileNavigationProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<IndicatorPosition>({
    left: 0,
    width: 0,
  });

  const activeIndex = items.findIndex((item) => item.path === currentPath);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeItem = itemRefs.current[activeIndex];
      const container = containerRef.current;

      if (activeItem && container) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        setIndicator({
          left: itemRect.left - containerRect.left,
          width: itemRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex]);

  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      if (path !== currentPath) return;
      event.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    [currentPath],
  );

  return (
    <nav
      ref={containerRef}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/20 backdrop-blur-lg border border-border shadow-lg rounded-full px-2 py-2"
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-2 bottom-2 bg-accent-foreground/10 rounded-full transition-all duration-300 ease-out"
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
      />

      {/* Nav items */}
      <div className="relative flex items-center">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            (item.path === "/aguinaldo" && currentPath === "/salary") ||
            item.path === currentPath;

          return (
            <Link
              key={item.path}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              to={item.path}
              onClick={(event) => handleNavClick(event, item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0 px-4 py-2 rounded-full transition-colors relative z-10",
                isActive && "text-primary font-bold",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
