import { FiMail, FiGithub, FiLinkedin } from "react-icons/fi";
import Reveal from "./Reveal";
import { personal } from "../data/content";
import "./Contact.css";

const links = [
  {
    icon: FiMail,
    label: "Email",
    value: personal.email,
    href: `mailto:${personal.email}`,
  },
  {
    icon: FiLinkedin,
    label: "LinkedIn",
    value: "in/satyam-js",
    href: personal.linkedin,
  },
  {
    icon: FiGithub,
    label: "GitHub",
    value: "Anonsatyam",
    href: personal.github,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="section section--alt contact">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Get In Touch</span>
            <h2 className="section-title">Let's Work Together</h2>
            <p className="section-subtitle">
              Have a project in mind or just want to connect? I'm always open to
              discussing new opportunities.
            </p>
          </div>
        </Reveal>

        <div className="contact__grid">
          {links.map((link, i) => (
            <Reveal key={link.label} delay={i * 0.1}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="contact__card card"
              >
                <div className="contact__icon">
                  <link.icon size={24} />
                </div>
                <div className="contact__label">{link.label}</div>
                <div className="contact__value">{link.value}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
