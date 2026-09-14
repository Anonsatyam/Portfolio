import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { prefersReducedMotion } from "../lib/motion";
import "./MetricRow.css";

// Counts up once in view. The figure is rendered up front and only
// animates from zero when motion is allowed, so it's never stuck at 0.
function Metric({ value, suffix, label, index }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!inView || !numRef.current || prefersReducedMotion()) return;
    const controls = animate(0, value, {
      duration: 1.2,
      delay: index * 0.08,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (numRef.current) numRef.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value, index]);

  return (
    <div className="metric" ref={ref}>
      <p className="metric__value">
        <span ref={numRef}>{value}</span>
        <span className="metric__suffix">{suffix}</span>
      </p>
      <p className="metric__label">{label}</p>
    </div>
  );
}

export default function MetricRow({ metrics }) {
  if (!metrics?.length) return null;
  return (
    <div className="metric-row">
      {metrics.map((m, i) => (
        <Metric key={m.label} {...m} index={i} />
      ))}
    </div>
  );
}
