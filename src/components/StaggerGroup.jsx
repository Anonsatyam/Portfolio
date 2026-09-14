import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.94, rotate: -2 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Wraps a list of children (cards, bullets, badges) so they animate in
 * one after another as the group scrolls into view, and back out again
 * if scrolled past in either direction — re-triggers every time, not
 * just once. Continuous per-scroll toggling, not scroll-linked, so it's
 * cheap and safe. Use <StaggerGroup.Item> for each child.
 */
export default function StaggerGroup({ children, className, amount = 0.2 }) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, as = "div", ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag className={className} variants={item} {...rest}>
      {children}
    </MotionTag>
  );
}
