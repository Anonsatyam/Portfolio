import { FiCheckCircle, FiExternalLink } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import ProjectMockup from "./ProjectMockup";
import { projects } from "../data/content";
import "./Projects.css";

// A real screenshot exists for Sarkari Naukri (captured from the live
// deployed site), so it's used as-is instead of a mockup.
function SarkariNaukriPreview() {
  return (
    <img
      className="project-mockup__screenshot"
      src="/projects/sarkari-naukri.jpg"
      alt="Sarkari Naukri homepage, showing the job search bar and hot listings"
      loading="lazy"
    />
  );
}

// A real screenshot exists for this one too (captured from its live
// VS Code Marketplace listing), so it's used as-is instead of a mockup.
function JsonGeneratorPreview() {
  return (
    <img
      className="project-mockup__screenshot"
      src="/projects/json-generator.jpg"
      alt="Random JSON Data Generator listing on the VS Code Marketplace, showing install count and rating"
      loading="lazy"
    />
  );
}

const PREVIEWS = {
  "Sarkari Naukri": SarkariNaukriPreview,
  "Random JSON Data Generator": JsonGeneratorPreview,
};

export default function Projects() {
  return (
    <section id="projects" className="section section--alt projects">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">My Work</span>
            <AnimatedHeading as="h2" className="section-title" text="Featured Projects" />
            <p className="section-subtitle">
              A mix of enterprise dashboards, side projects, and tools I've designed, built, and shipped.
            </p>
          </div>
        </Reveal>

        <StaggerGroup className="projects__grid">
          {projects.map((project) => {
            const Preview = PREVIEWS[project.title];
            return (
            <StaggerItem as="div" key={project.title} className="projects__card-wrap">
              <div className="projects__card card">
                {Preview && (
                  <ProjectMockup url={project.previewLabel}>
                    <Preview />
                  </ProjectMockup>
                )}

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

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="projects__cta"
                  >
                    View Project <FiExternalLink size={14} />
                  </a>
                )}
              </div>
            </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
