import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import Reveal from "./Reveal";
import { experience } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import "./Experience.css";

const SLIDE_COUNT = experience.length;

function ExperienceCard({ job }) {
  return (
    <div className="experience__item card">
      <div className="experience__top">
        <img
          className="experience__icon"
          src={ICONS_3D.briefcase}
          alt=""
          width={40}
          height={40}
          loading="lazy"
        />
        <div className="experience__meta">
          <span><FiCalendar size={14} /> {job.period}</span>
          <span><FiMapPin size={14} /> {job.location}</span>
        </div>
      </div>

      <h3 className="experience__role">{job.role}</h3>
      <p className="experience__company">{job.company}</p>

      <ul className="experience__points">
        {job.points.map((p, idx) => (
          <li key={idx}>{p}</li>
        ))}
      </ul>

      <div className="experience__tags">
        {job.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

// Builds a smooth horizontal S-curve/wave path through N evenly-spaced
// points, alternating high/low — the "journey curve" connecting each role.
const CURVE_W = 400;
const CURVE_H = 60;
const CURVE_TOP = CURVE_H * 0.25;
const CURVE_BOTTOM = CURVE_H * 0.75;

function buildCurve(n) {
  const points = Array.from({ length: n }, (_, i) => ({
    x: n === 1 ? CURVE_W / 2 : (i / (n - 1)) * CURVE_W,
    y: i % 2 === 0 ? CURVE_TOP : CURVE_BOTTOM,
  }));
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return { d, points };
}

function CurveDot({ point, index, total, progress }) {
  const start = index / Math.max(total - 1, 1);
  const fill = useTransform(progress, [Math.max(0, start - 0.1), start], ["#C1C7D0", "#0052CC"]);
  return <motion.circle cx={point.x} cy={point.y} r={7} stroke="#fff" strokeWidth={3} style={{ fill }} />;
}

function HorizontalExperience() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `${-(SLIDE_COUNT - 1) * 100}vw`]);
  const railFill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const { d: curveD, points: curvePoints } = buildCurve(SLIDE_COUNT);

  return (
    <section
      id="experience"
      className="experience-scroll"
      ref={trackRef}
      style={{ height: `${100 + (SLIDE_COUNT - 1) * 70}vh` }}
    >
      <div className="experience-sticky section--alt">
        <div className="container experience__head">
          <span className="eyebrow">Career Journey</span>
          <h2 className="section-title">Experience</h2>
          <p className="section-subtitle">Keep scrolling — the timeline moves with you.</p>
        </div>

        <div className="experience__rail container" aria-hidden="true">
          <svg
            className="experience__curve"
            viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
            preserveAspectRatio="none"
          >
            <path d={curveD} className="experience__curve-bg" fill="none" />
            <motion.path
              d={curveD}
              className="experience__curve-fill"
              fill="none"
              style={{ pathLength: railFill }}
            />
            {curvePoints.map((pt, i) => (
              <CurveDot key={i} point={pt} index={i} total={SLIDE_COUNT} progress={scrollYProgress} />
            ))}
          </svg>
        </div>

        <motion.div className="experience__row" style={{ x }}>
          {experience.map((job, i) => (
            <div className="experience__slide" key={i}>
              <ExperienceCard job={job} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StaticExperience() {
  return (
    <section id="experience" className="section section--alt experience-static">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Career Journey</span>
            <h2 className="section-title">Experience</h2>
          </div>
        </Reveal>
        <div className="experience-static__list">
          {experience.map((job, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <ExperienceCard job={job} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Experience() {
  const [reducedMotion, setReducedMotion] = useState(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Avoid rendering either variant until we know the user's motion
  // preference, to prevent a layout flash/mismatch on first paint.
  if (reducedMotion === null) return null;

  return reducedMotion ? <StaticExperience /> : <HorizontalExperience />;
}
