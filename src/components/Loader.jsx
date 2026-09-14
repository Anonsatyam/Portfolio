import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion, EASE_PREMIUM } from "../lib/motion";
import "./Loader.css";

const VISIBLE_MS = 1100;

// Short and one-time only — a filling progress bar gives it real
// motion instead of just sitting there, then it fades out and is gone
// for the rest of the session. Its exit roughly lines up with the
// Hero content finishing its own entrance, so the two don't read as
// two separate reveals.
export default function Loader() {
  const [visible, setVisible] = useState(true);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setVisible(false), reduced ? 150 : VISIBLE_MS);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE_PREMIUM }}
        >
          <motion.span
            className="loader__mark"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
          >
            SK
          </motion.span>

          <div className="loader__track" aria-hidden="true">
            <motion.div
              className="loader__fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduced ? 0.15 : VISIBLE_MS / 1000, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
