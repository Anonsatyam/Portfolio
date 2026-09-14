import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import Icon from "../lib/icons";
import MetricRow from "./MetricRow";
import { experience } from "../data/content";
import "./Experience.css";

export default function Experience() {
  const timelineRef = useRef(null);

  // Passive scroll read only (same pattern as the top progress bar) —
  // no pinning, no scroll-jacking, just a decorative fill that tracks
  // how far down the timeline the viewport has reached.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.6"],
  });
  const fillScale = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.5 });

  return (
    <section id="experience" className="section section--alt experience">
      <div className="container">
        <Reveal variant="heading">
          <div className="section-head">
            <span className="eyebrow"><span className="eyebrow__num">02</span>Career Journey</span>
            <AnimatedHeading as="h2" className="section-title" text="Experience" />
          </div>
        </Reveal>

        <div className="experience__timeline" ref={timelineRef}>
          <motion.div
            className="experience__timeline-fill"
            style={{ scaleY: fillScale }}
            aria-hidden="true"
          />

          {experience.map((job, i) => {
            const isCurrent = job.period.toLowerCase().includes("present");
            return (
              <Reveal key={i} direction="up">
                <div className={`experience__row ${isCurrent ? "is-current" : ""}`}>
                  <div className="experience__rail">
                    <span className="experience__dot" />
                  </div>

                  <div className="experience__item card">
                    {isCurrent && <span className="experience__current-badge">Current</span>}

                    <div className="experience__top">
                      <Icon name="briefcase" />
                      <div className="experience__meta">
                        <span><FiCalendar className="experience__meta-icon" size={14} /> {job.period}</span>
                        <span><FiMapPin className="experience__meta-icon" size={14} /> {job.location}</span>
                      </div>
                    </div>

                    <h3 className="experience__role">{job.role}</h3>
                    <p className="experience__company">{job.company}</p>

                    <MetricRow metrics={job.metrics} />

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
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
