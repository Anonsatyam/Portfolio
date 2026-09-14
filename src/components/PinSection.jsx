import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./PinSection.css";

/**
 * Wraps a section so it truly pins to the viewport while scrolling through
 * it, scaling/fading in on entry, holding at full size while readable, then
 * scaling/fading out as the next section takes over — the "sections come
 * forward and go back in place" effect.
 *
 * Falls back to a plain, unpinned static section under
 * prefers-reduced-motion (and skips the scroll-linked transform entirely,
 * not just via CSS, since Framer Motion writes inline styles directly).
 */
export default function PinSection({ id, altBg = false, trackVh = 160, children }) {
  const trackRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.88, 1, 1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0.3, 1, 1, 0.3]);

  if (reducedMotion === null) return null;

  if (reducedMotion) {
    return (
      <section id={id} className={`section ${altBg ? "section--alt" : ""}`}>
        <div className="container">{children}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="pin-track"
      ref={trackRef}
      style={{ height: `${trackVh}vh` }}
    >
      <div className={`pin-sticky ${altBg ? "section--alt" : ""}`}>
        <motion.div className="pin-content container" style={{ scale, opacity }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
