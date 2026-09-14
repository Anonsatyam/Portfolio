import { FiMapPin, FiCalendar } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import { experience } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import "./Experience.css";

export default function Experience() {
  return (
    <section id="experience" className="section section--alt experience">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Career Journey</span>
            <AnimatedHeading as="h2" className="section-title" text="Experience" />
          </div>
        </Reveal>

        <StaggerGroup className="experience__stack" amount={0.15}>
          {experience.map((job, i) => (
            <StaggerItem as="div" key={i} className="experience__feature">
              <span className="experience__feature-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="experience__feature-glow" aria-hidden="true" />

              <div className="experience__feature-top">
                <img src={ICONS_3D.briefcase} alt="" width={44} height={44} loading="lazy" />
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
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
