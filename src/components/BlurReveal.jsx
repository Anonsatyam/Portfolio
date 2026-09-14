import { motion } from "framer-motion";
import { EASE_PREMIUM } from "../lib/motion";

/**
 * opacity 0→1, translateY 40px→0, blur 10px→0 — the "premium heading
 * reveal" used for major headings across the site. `triggerOnView`
 * switches it from a mount-time entrance (Hero) to a scroll-triggered,
 * bidirectional one (everywhere else).
 */
export default function BlurReveal({
  children,
  delay = 0,
  duration = 0.8,
  as = "div",
  className,
  triggerOnView = false,
}) {
  const MotionTag = motion[as] || motion.div;
  const trigger = triggerOnView
    ? { whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: false, amount: 0.4 } }
    : { animate: { opacity: 1, y: 0, filter: "blur(0px)" } };

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      {...trigger}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
    >
      {children}
    </MotionTag>
  );
}
