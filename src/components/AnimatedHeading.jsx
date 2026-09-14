import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045 },
  },
};

const word = {
  hidden: { opacity: 0, y: "0.6em" },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Splits heading text into words and reveals them one after another as
 * the heading scrolls into view — a one-time entrance, not tied to
 * continuous scroll position, so it's safe/cheap and never fights layout.
 */
export default function AnimatedHeading({ text, as = "h2", className }) {
  const words = text.split(" ");
  const MotionTag = motion[as] || motion.h2;

  return (
    <MotionTag
      className={className}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.6 }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.1em" }}>
          <motion.span style={{ display: "inline-block" }} variants={word}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
