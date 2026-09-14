import { motion } from "framer-motion";

/**
 * Fade + slide reveal wrapper for scroll-triggered animation.
 * direction: "up" | "down" | "left" | "right" | "none"
 *
 * `variant="heading"` gives section headings a longer, weightier entrance
 * than body content, so the page has some rhythm instead of every single
 * element arriving with the identical 28px slide.
 */
const VARIANTS = {
  default: { distance: 28, duration: 0.6, scale: 1 },
  heading: { distance: 44, duration: 0.85, scale: 0.985 },
  subtle: { distance: 14, duration: 0.5, scale: 1 },
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  variant = "default",
  duration,
  distance,
  once = false,
  amount = 0.2,
  className,
}) {
  const preset = VARIANTS[variant] ?? VARIANTS.default;
  const travel = distance ?? preset.distance;
  const time = duration ?? preset.duration;

  const offsets = {
    up: { y: travel, x: 0 },
    down: { y: -travel, x: 0 },
    left: { y: 0, x: travel },
    right: { y: 0, x: -travel },
    none: { y: 0, x: 0 },
  };
  const { x, y } = offsets[direction] ?? offsets.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, scale: preset.scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration: time, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
