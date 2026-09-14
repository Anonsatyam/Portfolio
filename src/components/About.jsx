import { FiCheckCircle } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import Icon from "../lib/icons";
import StatStrip from "./StatStrip";
import { about, whatIDo } from "../data/content";
import "./About.css";

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <StatStrip />

        <Reveal variant="heading">
          <div className="section-head">
            <span className="eyebrow"><span className="eyebrow__num">01</span>About Me</span>
            <AnimatedHeading as="h2" className="section-title" text="Who I Am" />
          </div>
        </Reveal>

        <div className="about__grid">
          <Reveal direction="right">
            <p className="about__summary">{about.summary}</p>
            <StaggerGroup className="about__list">
              {about.highlights.map((point, i) => (
                <StaggerItem as="li" key={i}>
                  <FiCheckCircle className="about__list-icon" />
                  <span>{point}</span>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Reveal>

          <StaggerGroup className="about__pillars">
            {whatIDo.map((item, i) => (
              <StaggerItem as="div" className="about__pillar card" key={i}>
                <Icon name={item.icon} className="about__pillar-icon" />
                <h3 className="about__pillar-title">{item.title}</h3>
                <p className="about__pillar-desc">{item.description}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
