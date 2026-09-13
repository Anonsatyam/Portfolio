import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiBriefcase, FiMapPin, FiCalendar } from "react-icons/fi";
import Reveal from "./Reveal";
import { experience } from "../data/content";
import "./Experience.css";

export default function Experience() {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.75", "end 0.35"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="section section--alt experience">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Career Journey</span>
            <h2 className="section-title">Experience</h2>
          </div>
        </Reveal>

        <div className="experience__timeline" ref={timelineRef}>
          <div className="experience__spine-track" aria-hidden="true">
            <motion.div
              className="experience__spine-fill"
              style={{ scaleY: spineScale }}
            />
          </div>

          {experience.map((job, i) => {
            const side = i % 2 === 0 ? "right" : "left";
            return (
              <div className={`experience__row experience__row--${side}`} key={i}>
                <div className="experience__spacer" aria-hidden="true" />

                <motion.div
                  className="experience__node"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <FiBriefcase size={18} />
                </motion.div>

                <Reveal
                  direction={side === "right" ? "left" : "right"}
                  className="experience__card-wrap"
                  delay={0.1}
                >
                  <div className="experience__item card">
                    <div className="experience__top">
                      <div>
                        <h3 className="experience__role">{job.role}</h3>
                        <p className="experience__company">{job.company}</p>
                      </div>
                      <div className="experience__meta">
                        <span><FiCalendar size={14} /> {job.period}</span>
                        <span><FiMapPin size={14} /> {job.location}</span>
                      </div>
                    </div>

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
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
