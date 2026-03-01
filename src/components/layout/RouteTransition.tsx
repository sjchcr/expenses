import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useMobile } from "@/hooks/useMobile";

// Order determines forward/back direction
const ROUTE_ORDER: Record<string, number> = {
  "/aguinaldo": 0,
  "/salary": 1,
};

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0 }),
  center: { x: 0 },
  // Exiting page moves partially (iOS-like: outgoing page trails behind)
  exit: (dir: number) => ({ x: dir > 0 ? "-25%" : dir < 0 ? "100%" : 0 }),
};

const transition = {
  type: "tween" as const,
  duration: 0.25,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

export default function RouteTransition() {
  const location = useLocation();
  const isMobile = useMobile();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(0);

  const currPath = location.pathname;
  const prevPath = prevPathRef.current;

  if (currPath !== prevPath) {
    const prevOrder = ROUTE_ORDER[prevPath];
    const currOrder = ROUTE_ORDER[currPath];
    directionRef.current =
      isMobile && prevOrder !== undefined && currOrder !== undefined
        ? currOrder > prevOrder
          ? 1
          : -1
        : 0;
    prevPathRef.current = currPath;
  }

  const custom = directionRef.current;

  return (
    // overflow-clip clips the slide without creating a scroll container
    <div className="relative overflow-clip">
      <AnimatePresence mode="popLayout" custom={custom} initial={false}>
        <motion.div
          key={location.pathname}
          custom={custom}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
