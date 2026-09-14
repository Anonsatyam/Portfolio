import { useEffect, useRef, useState } from "react";
import { animate, motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion, EASE_PREMIUM } from "../lib/motion";
import { personal } from "../data/content";
import "./Loader.css";

const COLUMNS = 6;
const COUNT_MS = 1150; // counter 0 -> 100
const EXIT_AT = 1250; // curtain starts lifting
const EXIT_EASE = [0.76, 0, 0.24, 1];
const LETTERS = personal.name.toUpperCase().split("");

export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const countRef = useRef(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (reduced) {
      const t = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(t);
    }

    const counter = animate(0, 100, {
      duration: COUNT_MS / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (countRef.current) countRef.current.textContent = String(Math.round(v));
      },
    });

    // Lift the curtain, then unmount once the last column has cleared.
    const exit = setTimeout(() => setLeaving(true), EXIT_AT);
    const done = setTimeout(() => setVisible(false), EXIT_AT + 900);

    return () => {
      counter.stop();
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
          {/* Curtain: columns lift in sequence to reveal the page. */}
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
            animate={{ opacity: leaving ? 0 : 1, y: leaving ? -18 : 0 }}
            transition={{ duration: 0.4, ease: EASE_PREMIUM }}
          >
            <p className="loader__name" aria-label={personal.name}>
              {LETTERS.map((ch, i) => (
                <span className="loader__letter-mask" key={i}>
                  <motion.span
                    className="loader__letter"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.65, delay: 0.05 + i * 0.035, ease: EASE_PREMIUM }}
                  >
                    {ch === " " ? " " : ch}
                  </motion.span>
                </span>
              ))}
            </p>

            <div className="loader__meter">
              <motion.span
                className="loader__meter-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: COUNT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <p className="loader__count">
              <span ref={countRef}>0</span>
              <span className="loader__percent">%</span>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
