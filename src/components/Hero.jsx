import { useEffect, useRef } from "react";
import { FiGithub, FiLinkedin, FiArrowDown, FiMail } from "react-icons/fi";
import { personal, experience } from "../data/content";
import { scrollToId } from "../lib/smoothScroll";
import { prefersReducedMotion } from "../lib/motion";
import BlurReveal from "./BlurReveal";
import MaskReveal from "./MaskReveal";
import HangingIDCard from "./HangingIDCard";
import MagneticButton from "./MagneticButton";
import "./Hero.css";

const [firstName, ...restName] = personal.name.split(" ");
const lastName = restName.join(" ");
const [designation, stackRaw] = personal.role.split("—").map((s) => s.trim());
const stackLine = stackRaw ? stackRaw.split(",").join(" •").replace("&", "•") : "";
const company = experience[0]?.company;

export default function Hero() {
  const scrollTo = (id) => scrollToId(id);
  const sectionRef = useRef(null);
  const spotlightRef = useRef(null);
  const nameRef = useRef(null);
  const nameLiquidRef = useRef(null);

  // Direct style writes, no React state — a background glow and a
  // masked red "liquid" reveal on the name, both tracking the cursor,
  // updated on the compositor without a re-render per mousemove.
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const el = sectionRef.current;
    const spotlight = spotlightRef.current;
    const name = nameRef.current;
    const liquid = nameLiquidRef.current;
    if (!el || !spotlight || !name || !liquid) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty("--mx", `${px}%`);
      spotlight.style.setProperty("--my", `${py}%`);
      spotlight.style.opacity = "1";

      const nameRect = name.getBoundingClientRect();
      liquid.style.setProperty("--nx", `${e.clientX - nameRect.left}px`);
      liquid.style.setProperty("--ny", `${e.clientY - nameRect.top}px`);
    };
    const onLeave = () => {
      spotlight.style.opacity = "0";
      liquid.style.setProperty("--nx", "-999px");
      liquid.style.setProperty("--ny", "-999px");
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__spotlight" ref={spotlightRef} />
      </div>

      <div className="container hero__inner">
        <div className="hero__columns">
          <div className="hero__content">
            <BlurReveal as="p" className="hero__eyebrow" delay={0}>
              Hello, I'm
            </BlurReveal>

            <h1 className="hero__name" ref={nameRef}>
              <span className="hero__name-white">
                <MaskReveal className="hero__name-line" delay={0.1}>
                  {firstName}
                </MaskReveal>
                <MaskReveal className="hero__name-line" delay={0.22}>
                  {lastName}
                </MaskReveal>
              </span>
              <span className="hero__name-liquid" aria-hidden="true" ref={nameLiquidRef}>
                <span className="hero__name-line">{firstName}</span>
                <span className="hero__name-line">{lastName}</span>
              </span>
            </h1>

            <BlurReveal as="h2" className="hero__role" delay={0.3}>
              {designation}
            </BlurReveal>

            {company && (
              <BlurReveal as="p" className="hero__company" delay={0.38}>
                {company}
              </BlurReveal>
            )}

            <BlurReveal as="p" className="hero__tagline" delay={0.46}>
              {stackLine}
            </BlurReveal>

            <BlurReveal as="div" className="hero__actions" delay={0.56}>
              <MagneticButton>
                <button className="btn btn-primary" onClick={() => scrollTo("projects")}>
                  View My Work
                </button>
              </MagneticButton>
              <MagneticButton>
                <button className="btn btn-outline" onClick={() => scrollTo("contact")}>
                  Get In Touch
                </button>
              </MagneticButton>
            </BlurReveal>

            <BlurReveal as="div" className="hero__socials" delay={0.64}>
              <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="is-github">
                <FiGithub size={20} />
              </a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="is-linkedin">
                <FiLinkedin size={20} />
              </a>
              <a href={`mailto:${personal.email}`} aria-label="Email" className="is-mail">
                <FiMail size={20} />
              </a>
            </BlurReveal>
          </div>

          <div className="hero__card-slot">
            <HangingIDCard />
          </div>
        </div>

        <button className="hero__scroll-hint" onClick={() => scrollTo("about")} aria-label="Scroll to About section">
          <FiArrowDown size={22} />
        </button>
      </div>
    </section>
  );
}
