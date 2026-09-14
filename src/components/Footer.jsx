import { FiArrowUp, FiGithub, FiLinkedin, FiMail, FiDownload } from "react-icons/fi";
import { personal } from "../data/content";
import { scrollToTop } from "../lib/smoothScroll";
import "./Footer.css";

export default function Footer() {
  const scrollTop = () => scrollToTop();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__mark">SK</span>
          <div>
            <p className="footer__name">{personal.name}</p>
            <p className="footer__role">{personal.location}</p>
          </div>
        </div>

        <div className="footer__links">
          <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <FiGithub size={18} />
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FiLinkedin size={18} />
          </a>
          <a href={`mailto:${personal.email}`} aria-label="Email">
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
          <button className="footer__top" onClick={scrollTop} aria-label="Back to top">
            <FiArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
