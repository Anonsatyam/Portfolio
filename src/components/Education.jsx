import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import Icon from "../lib/icons";
import { education, accomplishments } from "../data/content";
import "./Education.css";

export default function Education() {
  return (
    <section id="education" className="section education">
      <div className="container">
        <Reveal variant="heading">
          <div className="section-head">
            <span className="eyebrow"><span className="eyebrow__num">05</span>Background</span>
            <AnimatedHeading as="h2" className="section-title" text="Where I Started" />
          </div>
        </Reveal>

        <StaggerGroup className="education__grid">
          <StaggerItem as="div" className="education__card card">
            <div className="education__head">
              <Icon name="book" className="education__icon" />
              <span className="education__kind">Education</span>
            </div>
            <h3 className="education__title">{education.degree}</h3>
            <p className="education__school">{education.school}</p>
            <p className="education__period">{education.period}</p>
          </StaggerItem>

          {accomplishments.map((acc) => (
            <StaggerItem as="div" className="education__card card" key={acc.title}>
              <div className="education__head">
                <Icon name="award" className="education__icon" />
                <span className="education__kind">Recognition</span>
              </div>
              <h3 className="education__title">{acc.title}</h3>
              <p className="education__school">{acc.detail}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
