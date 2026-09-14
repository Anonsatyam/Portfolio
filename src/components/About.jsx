import { FiCheckCircle } from "react-icons/fi";
import PinSection from "./PinSection";
import Reveal from "./Reveal";
import { about, whatIDo } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import "./About.css";

const ICONS = {
  layout: ICONS_3D.laptop,
  server: ICONS_3D.gear,
  check: ICONS_3D.microscope,
  wifi: ICONS_3D.link,
};

export default function About() {
  return (
    <PinSection id="about">
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
            {whatIDo.map((item, i) => (
              <div className="about__pillar card" key={i}>
                <img className="about__pillar-icon" src={ICONS[item.icon]} alt="" width={40} height={40} loading="lazy" />
                <h3 className="about__pillar-title">{item.title}</h3>
                <p className="about__pillar-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </PinSection>
  );
}
