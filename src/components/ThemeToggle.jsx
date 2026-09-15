import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";
import { getTheme, setTheme } from "../lib/theme";
import "./ThemeToggle.css";

export default function ThemeToggle({ className = "" }) {
  const [theme, setLocal] = useState(getTheme);

  // Several toggles can be mounted at once (desktop bar, mobile menu), so
  // each listens for the change rather than owning the state.
  useEffect(() => {
    const sync = () => setLocal(getTheme());
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const next = theme === "dark" ? "light" : "dark";

  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    // The reveal spreads out from the button itself.
    setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={onClick}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="theme-toggle__icon"
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shows where you would go, which is the convention people
              read fastest: a moon offers the dark theme. */}
          {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
