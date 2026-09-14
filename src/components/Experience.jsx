import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import { experience } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import { scrollToId } from "../lib/smoothScroll";
import "./Experience.css";

export default function Experience() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const idx = Number(visible[0].target.dataset.index);
          setActive(idx);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" className="section section--alt experience">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow"><span className="eyebrow__num">02</span>Career Journey</span>
            <AnimatedHeading as="h2" className="section-title" text="Experience" />
          </div>
        </Reveal>

        <div className="experience__layout">
          <nav className="experience__sidebar" aria-label="Roles">
            {experience.map((job, i) => (
              <button
                key={i}
                type="button"
                className={`experience__sidebar-item ${active === i ? "is-active" : ""}`}
                onClick={() => scrollToId(`role-${i}`)}
              >
                <span className="experience__sidebar-dot" aria-hidden="true" />
                <span className="experience__sidebar-text">
                  <span className="experience__sidebar-role">{job.role}</span>
                  <span className="experience__sidebar-period">{job.period}</span>
                </span>
              </button>
            ))}
          </nav>

          <div className="experience__details">
            {experience.map((job, i) => (
              <Reveal key={i} direction="up">
                <div
                  id={`role-${i}`}
                  ref={(el) => (cardRefs.current[i] = el)}
                  data-index={i}
                  className="experience__item card"
                >
                  <div className="experience__top">
                    <img src={ICONS_3D.briefcase} alt="" width={40} height={40} loading="lazy" />
                    <div className="experience__meta">
                      <span><FiCalendar className="experience__meta-icon" size={14} /> {job.period}</span>
                      <span><FiMapPin className="experience__meta-icon" size={14} /> {job.location}</span>
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
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
