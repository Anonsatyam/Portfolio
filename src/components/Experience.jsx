import { FiBriefcase, FiMapPin, FiCalendar } from "react-icons/fi";
import Reveal from "./Reveal";
import { experience } from "../data/content";
import "./Experience.css";

export default function Experience() {
  return (
    <section id="experience" className="section section--alt experience">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Career Journey</span>
            <h2 className="section-title">Experience</h2>
          </div>
        </Reveal>

        <div className="experience__timeline">
          {experience.map((job, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="experience__item card">
                <div className="experience__icon">
                  <FiBriefcase size={22} />
                </div>
                <div className="experience__content">
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
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
