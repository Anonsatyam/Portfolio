import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { stats } from "../data/content";
import { prefersReducedMotion } from "../lib/motion";
import "./StatStrip.css";

// Counts up once when it scrolls into view. The number is written
// straight to the node so a 60fps count doesn't re-render React.
function Stat({ value, suffix, label, detail, index }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView || !numRef.current) return;
    if (prefersReducedMotion()) {
      numRef.current.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.3,
      delay: index * 0.08,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (numRef.current) numRef.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value, index]);

  return (
    <div className="stat" ref={ref}>
      <p className="stat__value">
        <span ref={numRef}>0</span>
        <span className="stat__suffix">{suffix}</span>
      </p>
      <p className="stat__label">{label}</p>
      <p className="stat__detail">{detail}</p>
    </div>
  );
}

export default function StatStrip() {
  return (
    <div className="stat-strip">
      {stats.map((s, i) => (
        <Stat key={s.label} {...s} index={i} />
      ))}
    </div>
  );
}
