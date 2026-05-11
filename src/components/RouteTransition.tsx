import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useNavDirection } from "@/hooks/useNavDirection";

interface Props {
  children: ReactNode;
}

/**
 * Mobile-only iOS-style slide transition. Only activates after first hydration
 * so the prerendered HTML paints instantly. Desktop and reduced-motion users
 * see no transition.
 */
const RouteTransition = ({ children }: Props) => {
  const { pathname } = useLocation();
  const dir = useNavDirection();
  const reduce = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!hydrated || !mobile) return <>{children}</>;

  const variants = reduce
    ? {
        initial: { opacity: 0.6 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : dir === "back"
      ? {
          initial: { x: "-100%", opacity: 0.8 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "30%", opacity: 0 },
        }
      : {
          initial: { x: "100%", opacity: 0.8 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "-30%", opacity: 0 },
        };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default RouteTransition;
