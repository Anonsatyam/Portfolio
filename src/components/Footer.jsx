import { FiArrowUp } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { personal } from "../data/content";
import { scrollToTop } from "../lib/smoothScroll";
import "./Footer.css";

export default function Footer() {
  const scrollTop = () => scrollToTop();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__text">
          © {new Date().getFullYear()} {personal.name}. Built with{" "}
          <FaHeart className="footer__heart" aria-label="love" />
        </p>
        <button className="footer__top" onClick={scrollTop} aria-label="Back to top">
          <FiArrowUp size={18} />
        </button>
      </div>
    </footer>
  );
}
