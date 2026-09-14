import { useEffect, useRef, useState } from "react";
import { animate, motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion, EASE_PREMIUM } from "../lib/motion";
import { personal } from "../data/content";
import "./Loader.css";

const COLUMNS = 6;
const RUN_MS = 1500;
const EXIT_AT = 1620;
const EXIT_EASE = [0.76, 0, 0.24, 1];
const NAME = personal.name.toUpperCase();
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%$&@/\\<>*";

export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const countRef = useRef(null);
  const nameRef = useRef(null);
  const fillRef = useRef(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (reduced) {
      const t = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(t);
    }

    // One animation drives everything: the counter, the red fill
    // sweeping across the name, and the scramble resolving letter by
    // letter — so the name literally *is* the progress bar.
    const run = animate(0, 100, {
      duration: RUN_MS / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const pct = Math.round(v);
        if (countRef.current) countRef.current.textContent = String(pct).padStart(2, "0");
        if (fillRef.current) fillRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;

        // Letters left of the playhead are settled; the rest churn.
        if (nameRef.current) {
          const settled = Math.floor((pct / 100) * NAME.length);
          let out = "";
          for (let i = 0; i < NAME.length; i += 1) {
            if (NAME[i] === " ") out += " ";
            else if (i < settled) out += NAME[i];
            else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          nameRef.current.textContent = out;
        }
      },
      onComplete: () => {
        if (nameRef.current) nameRef.current.textContent = NAME;
      },
    });

    const exit = setTimeout(() => setLeaving(true), EXIT_AT);
    const done = setTimeout(() => setVisible(false), EXIT_AT + 900);

    return () => {
      run.stop();
      clearTimeout(exit);
      clearTimeout(done);
    };
  }, [reduced]);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="loader" key="loader">
          <div className="loader__curtain" aria-hidden="true">
            {Array.from({ length: COLUMNS }).map((_, i) => (
              <motion.span
                key={i}
                className="loader__col"
                initial={{ y: "0%" }}
                animate={{ y: leaving ? "-101%" : "0%" }}
                transition={{
                  duration: reduced ? 0 : 0.75,
                  delay: leaving ? i * 0.055 : 0,
                  ease: EXIT_EASE,
                }}
              />
            ))}
          </div>

          <motion.div
            className="loader__content"
            animate={{ opacity: leaving ? 0 : 1, y: leaving ? -20 : 0 }}
            transition={{ duration: 0.4, ease: EASE_PREMIUM }}
          >
            <div className="loader__word" aria-label={personal.name}>
              {/* Dim base, with a red copy clipped to the progress on top. */}
              <span className="loader__word-base" ref={nameRef} aria-hidden="true">
                {NAME}
              </span>
              <span className="loader__word-fill" ref={fillRef} aria-hidden="true">
                {NAME}
              </span>
            </div>

            <p className="loader__count" aria-hidden="true">
              <span ref={countRef}>00</span>
              <span className="loader__percent">%</span>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
