import { FiCheckCircle } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedCounter from "./AnimatedCounter";
import { about, stats } from "../data/content";
import "./About.css";

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
            <div className="about__stats">
              {stats.map((s, i) => (
                <div className="about__stat card" key={i}>
                  <div className="about__stat-value">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="about__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
