import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiMapPin } from "react-icons/fi";
import { personal } from "../data/content";
import { prefersReducedMotion } from "../lib/motion";
import "./HangingIDCard.css";

const CARD_SPRING = { stiffness: 140, damping: 16, mass: 1 };
const DRAG_SPRING = { stiffness: 220, damping: 18, mass: 0.8 };
// Shared by the lanyard coil and the card's hover bounce so they move
// as one attached spring system instead of two independent animations.
const HOVER_SPRING = { type: "spring", stiffness: 260, damping: 7, mass: 0.7 };
// Stacked ellipses read as a coiled spring viewed side-on (like a real
// compression spring), instead of a flat zigzag line. The terminal
// loop is left open and curls into a hook — the spring's own last
// wind forms the hook, not a separate shape tacked on after it — so
// it's the same stroke, same element, same transform as the coil.
const COIL_LOOPS = Array.from({ length: 7 }, (_, i) => 3 + i * 5);
const HOOK_PATH = "M3 38 A7 3 0 1 1 17 38 A5 5 0 0 1 9 46";

export default function HangingIDCard() {
  const wrapRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    setIsCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Raw pointer offset from the card's own center, in px, clamped.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Spring-damped so the card eases toward the pointer instead of
  // snapping — this is the whole "physical" feel, no physics engine.
  const springX = useSpring(px, CARD_SPRING);
  const springY = useSpring(py, CARD_SPRING);

  const rotateY = useTransform(springX, [-60, 60], [-12, 12]);
  const rotateX = useTransform(springY, [-60, 60], [10, -10]);
  const lanyardSkew = useTransform(springX, [-60, 60], [-6, 6]);
  // Same spring the lanyard skews with, so the card actually swings
  // sideways with it instead of just tilting in place while the coil
  // leans on its own.
  const swayX = useTransform(springX, [-60, 60], [-16, 16]);
  const swayY = useTransform(springY, [-60, 60], [-8, 8]);
  const dragX = useSpring(0, DRAG_SPRING);
  const dragY = useSpring(0, DRAG_SPRING);

  // Tracked only while the pointer is actually over the card, so it
  // snaps back to neutral the moment the mouse leaves — not just when
  // it leaves the browser window entirely.
  const onCardMove = (e) => {
    if (reduced || isCoarse) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    px.set(Math.max(-60, Math.min(60, e.clientX - cx)));
    py.set(Math.max(-60, Math.min(60, e.clientY - cy)));
  };

  const onCardLeave = () => {
    setHovered(false);
    px.set(0);
    py.set(0);
  };

  // Touch devices never fire hover, so a tap triggers the same bounce
  // for a moment instead — the spring settling back down IS the
  // feedback, same as a hover-leave would give on desktop.
  const tapTimeout = useRef(null);
  useEffect(() => () => clearTimeout(tapTimeout.current), []);
  const onTap = () => {
    if (reduced || !isCoarse) return;
    setHovered(true);
    clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setHovered(false), 900);
  };

  return (
    <div
      className={`id-card__wrap ${reduced ? "id-card__wrap--static" : ""}`}
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onCardMove}
      onMouseLeave={onCardLeave}
      onClick={onTap}
    >
      <div className="id-card__mount" aria-hidden="true" />
      <motion.svg
        className="id-card__lanyard-coil"
        viewBox="0 0 20 50"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ skewX: reduced ? 0 : lanyardSkew, transformOrigin: "top center" }}
        animate={{ scaleY: hovered && !reduced ? 1.3 : 1 }}
        transition={HOVER_SPRING}
      >
        {COIL_LOOPS.map((cy, i) => (
          <ellipse key={i} cx="10" cy={cy} rx="7" ry="3" />
        ))}
        <path d={HOOK_PATH} fill="none" />
      </motion.svg>

      {/* Entrance only — kept separate so the hover bounce below can
          re-target y/rotate without fighting the one-time drop-in. */}
      <motion.div
        initial={{ y: -120, rotate: -8, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Hover bounce — the card's end of the same spring as the
            coil, so stretching the lanyard visibly tugs the card down
            and lets it spring back, instead of the two moving separately. */}
        <motion.div
          animate={{ y: hovered && !reduced ? 16 : 0, rotate: hovered && !reduced ? 3 : 0 }}
          transition={HOVER_SPRING}
        >
          {/* Sway — the card's lateral position tied to the same
              spring as the lanyard's skew, so it swings with the coil
              on mouse move instead of only rotating in place. */}
          <motion.div style={{ x: reduced ? 0 : swayX, y: reduced ? 0 : swayY }}>
            <motion.div
              className="id-card__stage"
              style={{
                x: reduced ? 0 : dragX,
                y: reduced ? 0 : dragY,
                rotateX: reduced ? 0 : rotateX,
                rotateY: reduced ? 0 : rotateY,
              }}
              drag={!reduced && !isCoarse}
              dragConstraints={{ top: -30, bottom: 30, left: -40, right: 40 }}
              dragElastic={0.4}
              onDrag={(_, info) => {
                dragX.set(info.offset.x);
                dragY.set(info.offset.y);
              }}
              onDragEnd={() => {
                dragX.set(0);
                dragY.set(0);
              }}
            >
              <div className="id-card__card">
                <div className="id-card__face">
                  <div className="id-card__clip" />
                  <span className="id-card__badge-label">Access Badge</span>
                  <div className="id-card__avatar">
                    <img src="/avatar.jpg" alt="" />
                  </div>
                  <h3 className="id-card__name">{personal.name}</h3>
                  {personal.location && (
                    <p className="id-card__location">
                      <FiMapPin size={11} className="id-card__location-icon" /> {personal.location}
                    </p>
                  )}
                  {personal.tagline && (
                    <p className="id-card__quote">
                      <span className="id-card__quote-mark" aria-hidden="true">“</span>
                      {personal.tagline}
                    </p>
                  )}
                  {personal.instagram && (
                    <a
                      className="id-card__social"
                      href={personal.instagram}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Custom outline so the gradient colors the icon
                          itself (via stroke), not a background chip. */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <defs>
                          <linearGradient id="id-card-ig-gradient" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#fdf497" />
                            <stop offset="0.35" stopColor="#fd5949" />
                            <stop offset="0.65" stopColor="#d6249f" />
                            <stop offset="1" stopColor="#285aeb" />
                          </linearGradient>
                        </defs>
                        <g stroke="url(#id-card-ig-gradient)">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </g>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
