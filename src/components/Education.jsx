import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import { education, accomplishments } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import "./Education.css";

export default function Education() {
  return (
    <section id="education" className="section education">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Background</span>
            <AnimatedHeading as="h2" className="section-title" text="Education & Accomplishments" />
          </div>
        </Reveal>

        <StaggerGroup className="education__grid">
          <StaggerItem as="div" className="education__card card">
            <img className="education__icon" src={ICONS_3D.sparkles} alt="" width={40} height={40} loading="lazy" />
            <div>
              <h3 className="education__title">{education.degree}</h3>
              <p className="education__school">{education.school}</p>
              <p className="education__period">{education.period}</p>
            </div>
          </StaggerItem>

          {accomplishments.map((acc) => (
            <StaggerItem as="div" className="education__card card" key={acc.title}>
              <img className="education__icon" src={ICONS_3D.trophy} alt="" width={40} height={40} loading="lazy" />
              <div>
                <h3 className="education__title">{acc.title}</h3>
                <p className="education__school">{acc.detail}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
