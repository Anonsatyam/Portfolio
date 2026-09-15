import { FiGithub, FiLinkedin, FiMail, FiArrowUpRight } from "react-icons/fi";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import StaggerGroup, { StaggerItem } from "./StaggerGroup";
import { personal } from "../data/content";
import { getEmail, getMailto } from "../lib/email";
import "./Contact.css";

const links = [
  {
    Icon: FiMail,
    label: "Email",
    value: getEmail(),
    href: getMailto(),
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
    // Monochrome mark: follows the theme's ink instead of fixed white,
    // which vanished against the light theme's white cards.
    brand: "var(--color-ink)",
    contrast: "var(--color-bg)",
  },
];

export default function Contact() {
  // Feeds the card's brand-coloured glow, so it tracks the cursor
  // instead of the whole border just switching colour on hover.
  const trackPointer = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section id="contact" className="section section--alt contact">
      <div className="container">
        <Reveal variant="heading">
          <div className="section-head">
            <span className="eyebrow"><span className="eyebrow__num">06</span>Get In Touch</span>
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
              onMouseMove={trackPointer}
              style={{ "--brand": link.brand, "--brand-contrast": link.contrast || "var(--color-on-accent)" }}
            >
              <span className="contact__glow" aria-hidden="true" />
              <span className="contact__arrow" aria-hidden="true">
                <FiArrowUpRight size={16} />
              </span>
              <div className="contact__icon">
                <link.Icon size={24} />
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
