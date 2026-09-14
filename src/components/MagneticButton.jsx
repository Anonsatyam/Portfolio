import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { SPRING, prefersReducedMotion } from "../lib/motion";

const STRENGTH = 0.35;

// Wraps a button/link and nudges it toward the cursor within its own
// bounds, snapping back on leave. Desktop-only (fine pointer) and off
// entirely under prefers-reduced-motion.
export default function MagneticButton({ children, className }) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.magnetic);
  const springY = useSpring(y, SPRING.magnetic);

  useEffect(() => {
    setEnabled(!prefersReducedMotion() && window.matchMedia("(pointer: fine)").matches);
  }, []);

  const handleMove = (e) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * STRENGTH);
    y.set((e.clientY - (rect.top + rect.height / 2)) * STRENGTH);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-block", x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.span>
  );
}
