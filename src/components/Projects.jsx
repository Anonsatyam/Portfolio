import { FiFolder, FiCheckCircle } from "react-icons/fi";
import Reveal from "./Reveal";
import { projects } from "../data/content";
import "./Projects.css";

export default function Projects() {
  return (
    <section id="projects" className="section section--alt projects">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">My Work</span>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-subtitle">
              Real-world telecom-scale products I've designed, built, and shipped.
            </p>
          </div>
        </Reveal>

        <div className="projects__grid">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.12} direction="up">
              <div className="projects__card card">
                <div className="projects__icon">
                  <FiFolder size={22} />
                </div>
                <h3 className="projects__title">{project.title}</h3>

                <div className="projects__tech">
                  {project.tech.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>

                <ul className="projects__points">
                  {project.points.map((p, idx) => (
                    <li key={idx}>
                      <FiCheckCircle className="projects__point-icon" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
