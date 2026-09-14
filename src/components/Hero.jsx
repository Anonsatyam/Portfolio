import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiArrowDown, FiMail } from "react-icons/fi";
import { personal } from "../data/content";
import "./Hero.css";

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="hero">
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
          <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <FiGithub size={20} />
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FiLinkedin size={20} />
          </a>
          <a href={`mailto:${personal.email}`} aria-label="Email">
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
    </section>
  );
}
