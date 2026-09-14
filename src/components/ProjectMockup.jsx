import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { prefersReducedMotion } from "../lib/motion";
import "./ProjectMockup.css";

const PARALLAX_SPRING = { stiffness: 150, damping: 20, mass: 0.5 };
const PARALLAX_RANGE = 8; // px, each axis

// A browser-chrome frame around the project preview (a real screenshot
// where one exists, a hand-built stand-in otherwise). The preview
// drifts a few px opposite the cursor on desktop for a subtle
// parallax depth — off on touch devices and prefers-reduced-motion.
export default function ProjectMockup({ url, children }) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, PARALLAX_SPRING);
  const springY = useSpring(y, PARALLAX_SPRING);

  useEffect(() => {
    setEnabled(!prefersReducedMotion() && window.matchMedia("(pointer: fine)").matches);
  }, []);

  const handleMove = (e) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(relX * PARALLAX_RANGE * 2);
    y.set(relY * PARALLAX_RANGE);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="project-mockup"
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-hidden="true"
    >
      <div className="project-mockup__bar">
        <div className="project-mockup__dots">
          <span />
          <span />
          <span />
        </div>
        {url && <div className="project-mockup__url">{url}</div>}
      </div>
      <div className="project-mockup__body">
        <motion.div className="project-mockup__parallax" style={{ x: springX, y: springY }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
