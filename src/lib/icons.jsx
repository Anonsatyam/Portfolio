import {
  FiLayout,
  FiServer,
  FiCheckCircle,
  FiWifi,
  FiCode,
  FiTool,
  FiBriefcase,
  FiAward,
  FiBookOpen,
  FiMail,
} from "react-icons/fi";
import "./icons.css";

// Replaces the 3D emoji PNGs that were pulled from a CDN (~290KB across
// ten files, and visually clip-arty next to everything else). These are
// line icons from the set already bundled, drawn in the accent colour,
// so the whole site shares one icon language and ships nothing extra.
const REGISTRY = {
  layout: FiLayout,
  server: FiServer,
  check: FiCheckCircle,
  wifi: FiWifi,
  code: FiCode,
  tool: FiTool,
  briefcase: FiBriefcase,
  award: FiAward,
  book: FiBookOpen,
  mail: FiMail,
};

export default function Icon({ name, size = 22, className = "" }) {
  const Glyph = REGISTRY[name];
  if (!Glyph) return null;
  return (
    <span className={`icon-tile ${className}`} aria-hidden="true">
      <Glyph size={size} />
    </span>
  );
}
