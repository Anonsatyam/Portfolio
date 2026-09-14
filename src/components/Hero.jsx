import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiGithub, FiLinkedin, FiArrowDown, FiMail } from "react-icons/fi";
import { personal } from "../data/content";
import "./Hero.css";

function HeroContent({ scrollTo }) {
  return (
    <>
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
      </div>

      <div className="container hero__inner">
        <motion.p
          className="hero__eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          👋 Hi, I'm
        </motion.p>

        <motion.h1
          className="hero__name"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {personal.name}
        </motion.h1>

        <motion.div
          className="hero__avatar"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          SK
        </motion.div>

        <motion.h2
          className="hero__role"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {personal.role}
        </motion.h2>

        <motion.p
          className="hero__tagline"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {personal.tagline}
        </motion.p>

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <button className="btn btn-primary" onClick={() => scrollTo("projects")}>
            View My Work
          </button>
          <button className="btn btn-outline" onClick={() => scrollTo("contact")}>
            Get In Touch
          </button>
        </motion.div>

        <motion.div
          className="hero__socials"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="is-github">
            <FiGithub size={20} />
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="is-linkedin">
            <FiLinkedin size={20} />
          </a>
          <a href={`mailto:${personal.email}`} aria-label="Email" className="is-mail">
            <FiMail size={20} />
          </a>
        </motion.div>

        <motion.button
          className="hero__scroll-hint"
          onClick={() => scrollTo("about")}
          aria-label="Scroll to About section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.6 },
            y: { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
          }}
        >
          <FiArrowDown size={22} />
        </motion.button>
      </div>
    </>
  );
}

export default function Hero() {
  const trackRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  // Hero is already visible at load (no "enter" phase needed) — just
  // holds at full size, then scales/fades back as the user scrolls past it.
  const scale = useTransform(scrollYProgress, [0, 0.82, 1], [1, 1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 1, 0.3]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (reducedMotion === null) return null;

  if (reducedMotion) {
    return (
      <section id="hero" className="hero">
        <HeroContent scrollTo={scrollTo} />
      </section>
    );
  }

  return (
    <section id="hero" className="pin-track" ref={trackRef} style={{ height: "160vh" }}>
      <motion.div className="hero pin-sticky" style={{ scale, opacity }}>
        <HeroContent scrollTo={scrollTo} />
      </motion.div>
    </section>
  );
}
