import { useEffect, useState } from "react";
import { FiArrowUp, FiGithub, FiLinkedin, FiMail, FiDownload } from "react-icons/fi";
import { personal } from "../data/content";
import { getMailto } from "../lib/email";
import { scrollToTop } from "../lib/smoothScroll";
import "./Footer.css";

// The visitor's own local time, read from their browser rather than
// pinned to a timezone.
function useLocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const clock = new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now);
      const zone =
        new Intl.DateTimeFormat([], { timeZoneName: "short" })
          .formatToParts(now)
          .find((p) => p.type === "timeZoneName")?.value ?? "";
      setTime(`${clock} ${zone}`.trim());
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Footer() {
  const time = useLocalTime();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__mark">SK</span>
          <div>
            <p className="footer__name">{personal.name}</p>
            <p className="footer__role">
              {personal.location}
              {time && <span className="footer__time"> · {time}</span>}
            </p>
          </div>
        </div>

        <div className="footer__links">
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="is-github"
          >
            <FiGithub size={18} />
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="is-linkedin"
          >
            <FiLinkedin size={18} />
          </a>
          <a href={getMailto()} aria-label="Email" className="is-mail">
            <FiMail size={18} />
          </a>
          <a href={personal.resumeUrl} download className="footer__resume">
            <FiDownload size={15} /> Resume
          </a>
        </div>

        <div className="footer__end">
          <p className="footer__text">
            © {new Date().getFullYear()} {personal.name}. Built with{" "}
            {/* Inline rather than pulling the whole Font Awesome set in for one glyph. */}
            <svg className="footer__heart" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-label="love" role="img">
              <path d="M12 21s-6.7-4.35-9.3-8.2C.9 10 1.6 6.3 4.6 4.9c2.2-1 4.6-.2 5.9 1.6l1.5 2 1.5-2c1.3-1.8 3.7-2.6 5.9-1.6 3 1.4 3.7 5.1 1.9 7.9C18.7 16.65 12 21 12 21z" />
            </svg>
          </p>
          <button className="footer__top" onClick={() => scrollToTop()} aria-label="Back to top">
            <FiArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
