import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import "./ScrollProgress.css";

const SIZE = 44;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const dashOffset = useTransform(progress, (v) => CIRCUMFERENCE * (1 - v));
  // Stay hidden right at the top and fade in once the user actually
  // starts scrolling, instead of showing "0%" before they've moved.
  const visibility = useSpring(useTransform(scrollYProgress, [0, 0.03], [0, 1]), {
    stiffness: 200,
    damping: 30,
  });

  // Written straight to the DOM (no React state) so the number stays
  // in step with scroll without triggering a re-render on every tick.
  const percentRef = useRef(null);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (percentRef.current) {
      percentRef.current.textContent = `${Math.round(latest * 100)}`;
    }
  });

  return (
    <motion.div
      className="scroll-percent"
      aria-hidden="true"
      style={{ opacity: visibility, scale: visibility }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          className="scroll-percent__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
        />
        <motion.circle
          className="scroll-percent__bar"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset }}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <span className="scroll-percent__label">
        <span ref={percentRef}>0</span>%
      </span>
    </motion.div>
  );
}
