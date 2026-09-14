import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { navLinks, personal } from "../data/content";
import useActiveSection from "../hooks/useActiveSection";
import { scrollToId } from "../lib/smoothScroll";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(navLinks.map((l) => l.to));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClick = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner container">
        <a
          href="#hero"
          className="navbar__logo"
          onClick={(e) => {
            e.preventDefault();
            handleClick("hero");
          }}
        >
          <span className="navbar__logo-mark">SK</span>
          <span className="navbar__logo-text">{personal.name}</span>
        </a>

        <nav className="navbar__links navbar__links--desktop">
          {navLinks.map((link) => (
            <button
              key={link.to}
              className={`navbar__link ${active === link.to ? "is-active" : ""}`}
              onClick={() => handleClick(link.to)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <a
          href={personal.resumeUrl}
          download
          className="btn btn-primary navbar__cta"
        >
          Resume
        </a>

        <button
          className="navbar__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <nav className="navbar__links navbar__links--mobile">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  className={`navbar__link ${active === link.to ? "is-active" : ""}`}
                  onClick={() => handleClick(link.to)}
                >
                  {link.label}
                </button>
              ))}
              <a href={personal.resumeUrl} download className="btn btn-primary">
                Download Resume
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
