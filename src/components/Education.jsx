import { FiAward, FiBookOpen } from "react-icons/fi";
import Reveal from "./Reveal";
import { education, accomplishments } from "../data/content";
import "./Education.css";

export default function Education() {
  return (
    <section id="education" className="section education">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Background</span>
            <h2 className="section-title">Education &amp; Accomplishments</h2>
          </div>
        </Reveal>

        <div className="education__grid">
          <Reveal direction="right">
            <div className="education__card card">
              <div className="education__icon"><FiBookOpen size={22} /></div>
              <div>
                <h3 className="education__title">{education.degree}</h3>
                <p className="education__school">{education.school}</p>
                <p className="education__period">{education.period}</p>
              </div>
            </div>
          </Reveal>

          {accomplishments.map((acc, i) => (
            <Reveal direction="left" delay={i * 0.1} key={acc.title}>
              <div className="education__card card">
                <div className="education__icon education__icon--gold"><FiAward size={22} /></div>
                <div>
                  <h3 className="education__title">{acc.title}</h3>
                  <p className="education__school">{acc.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
