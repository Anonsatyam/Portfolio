import { FiCheckCircle, FiLayout, FiServer, FiCheckSquare, FiWifi } from "react-icons/fi";
import Reveal from "./Reveal";
import { about, whatIDo } from "../data/content";
import "./About.css";

const ICONS = {
  layout: FiLayout,
  server: FiServer,
  check: FiCheckSquare,
  wifi: FiWifi,
};

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">About Me</span>
            <h2 className="section-title">Who I Am</h2>
          </div>
        </Reveal>

        <div className="about__grid">
          <Reveal direction="right">
            <p className="about__summary">{about.summary}</p>
            <ul className="about__list">
              {about.highlights.map((point, i) => (
                <li key={i}>
                  <FiCheckCircle className="about__list-icon" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <div className="about__pillars">
              {whatIDo.map((item, i) => {
                const Icon = ICONS[item.icon];
                return (
                  <div className="about__pillar card" key={i}>
                    <div className="about__pillar-icon">
                      <Icon size={20} />
                    </div>
                    <h3 className="about__pillar-title">{item.title}</h3>
                    <p className="about__pillar-desc">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
