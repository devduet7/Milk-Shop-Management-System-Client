// <== IMPORTS ==>
import { memo } from "react";
import { motion, type Variants } from "framer-motion";

// <== PAGE TRANSITION VARIANTS ==>
const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};
// <== PAGE TRANSITION PROPS INTERFACE ==>
interface PageTransitionProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
  // <== OPTIONAL CLASS NAME ==>
  className?: string;
}

// <== PAGE TRANSITION COMPONENT ==>
const PageTransition = memo(({ children, className }: PageTransitionProps) => (
  <motion.div
    variants={PAGE_VARIANTS}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
PageTransition.displayName = "PageTransition";
// <== EXPORT ==>
export { PageTransition };
