import { FiGithub, FiLinkedin } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import { personal } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import "./Contact.css";

const links = [
  {
    img: ICONS_3D.envelope,
    label: "Email",
    value: personal.email,
    href: `mailto:${personal.email}`,
    brand: "#ea4335",
  },
  {
    Icon: FiLinkedin,
    label: "LinkedIn",
    value: "in/satyam-js",
    href: personal.linkedin,
    brand: "#0a66c2",
  },
  {
    Icon: FiGithub,
    label: "GitHub",
    value: "Anonsatyam",
    href: personal.github,
    brand: "#ffffff",
    contrast: "#000000",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="section section--alt contact">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Get In Touch</span>
            <AnimatedHeading as="h2" className="section-title" text="Let's Work Together" />
            <p className="section-subtitle">
              Have a project in mind or just want to connect? I'm always open to
              discussing new opportunities.
            </p>
          </div>
        </Reveal>

        <StaggerGroup className="contact__grid">
          {links.map((link) => (
            <StaggerItem
              as="a"
              key={link.label}
              className="contact__card card"
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <div
                className="contact__icon"
                style={{ "--brand": link.brand, "--brand-contrast": link.contrast || "#ffffff" }}
              >
                {link.img ? (
                  <img src={link.img} alt="" width={30} height={30} loading="lazy" />
                ) : (
                  <link.Icon size={24} />
                )}
              </div>
              <div className="contact__label">{link.label}</div>
              <div className="contact__value">{link.value}</div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
