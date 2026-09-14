import { motion } from "framer-motion";
import { EASE_PREMIUM } from "../lib/motion";

// A masked text reveal: the outer box clips, the inner text slides up
// into view. Visually reads as the text being "wiped" into place, but
// only ever animates transform (translateY) — never clip-path itself,
// which the browser can't run on the compositor as cheaply.
export default function MaskReveal({ children, delay = 0, duration = 0.9, className }) {
  return (
    <span className={className} style={{ display: "block", overflow: "hidden" }}>
      <motion.span
        style={{ display: "block" }}
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration, delay, ease: EASE_PREMIUM }}
      >
        {children}
      </motion.span>
    </span>
  );
}
