import { motion, useScroll, useSpring } from "framer-motion";
import "./ScrollProgress.css";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}
