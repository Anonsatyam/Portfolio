import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { FiMapPin } from "react-icons/fi";
import { personal } from "../data/content";
import { prefersReducedMotion } from "../lib/motion";
import "./HangingIDCard.css";

/**
 * Geometry, in px, all measured from the mount point (the anchor dot):
 *
 *   y = 0            anchor / mount dot
 *   y = springLength hook centre  == the card's slot centre
 *   card top edge    = hook centre - SLOT_INSET
 *
 * Everything below derives the spring's length and angle from the SAME
 * motion values that move the card, so the two can't drift apart: the
 * card's position IS the spring's end point, by construction.
 */
const REST_LENGTH = 56; // anchor -> slot centre when hanging at rest
const SLOT_INSET = 11; // slot centre, below the card's top edge
const MIN_LENGTH = 18; // coil never compresses past this
// Capped so the coil can't be pulled out into a flat wave — past a
// certain pitch a helix stops reading as a spring at all.
const MAX_DRAG_X = 80;
const MAX_DRAG_UP = 34;
const MAX_DRAG_DOWN = 85;

const COIL_TURNS = 9;
const COIL_RX = 7.5; // coil radius
const COIL_RY = 3; // how much each turn is squashed by perspective
const COIL_TOP_PAD = 2; // wire starts just under the anchor dot
const COIL_BOTTOM_PAD = 15; // wire ends exactly where the hook shaft begins
const COIL_CX = COIL_RX + 2.5;
const COIL_STEPS = COIL_TURNS * 18;

const ENTRANCE_SPRING = { type: "spring", stiffness: 170, damping: 12, mass: 1 };
const RELEASE_SPRING = { type: "spring", stiffness: 240, damping: 11, mass: 0.9 };
const BOUNCE_SPRING = { type: "spring", stiffness: 260, damping: 9, mass: 0.7 };
const SWAY_SPRING = { stiffness: 140, damping: 16, mass: 1 };

const DEG = 180 / Math.PI;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * One continuous wire, not a stack of separate rings — a real spring is
 * a single helix, so stretching it must spread the turns apart while
 * they stay joined. This is the 2D projection of that helix:
 *   x = cx + rx·sin(t)
 *   y = pitch·t + ry·cos(t)
 * The cos term on y is what tilts each turn into a ring instead of
 * leaving a flat zigzag.
 */
function coilPath(length) {
  const span = Math.max(length - COIL_TOP_PAD - COIL_BOTTOM_PAD, 4);
  let d = "";
  for (let i = 0; i <= COIL_STEPS; i += 1) {
    const t = (i / COIL_STEPS) * COIL_TURNS * Math.PI * 2;
    const x = COIL_CX + COIL_RX * Math.sin(t);
    const y = COIL_TOP_PAD + (span * i) / COIL_STEPS + COIL_RY * Math.cos(t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

export default function HangingIDCard() {
  const wrapRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  // --- where the card is: one source of truth ---
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const bounceY = useMotionValue(0);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const swayX = useSpring(useTransform(pointerX, [-60, 60], [-14, 14]), SWAY_SPRING);
  const swayY = useSpring(useTransform(pointerY, [-60, 60], [-6, 6]), SWAY_SPRING);

  const totalX = useTransform([dragX, swayX], ([d, s]) => d + s);
  const totalY = useTransform([dragY, swayY, bounceY], ([d, s, b]) => d + s + b);

  // --- the spring, derived from exactly those numbers ---
  const springLength = useTransform([totalX, totalY], ([x, y]) =>
    Math.max(MIN_LENGTH, Math.hypot(x, Math.max(MIN_LENGTH, REST_LENGTH + y)))
  );
  const springAngle = useTransform([totalX, totalY], ([x, y]) =>
    -Math.atan2(x, Math.max(MIN_LENGTH, REST_LENGTH + y)) * DEG
  );
  // A hanging object swings to follow its tether, but lags a little.
  const cardTilt = useTransform(springAngle, (a) => a * 0.55);

  // 3D tilt from pointer proximity, kept separate from the swing.
  const tiltY = useTransform(swayX, [-14, 14], [-10, 10]);
  const tiltX = useTransform(swayY, [-6, 6], [8, -8]);

  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const releaseX = useRef(null);
  const releaseY = useRef(null);

  // Redraw the wire whenever the spring's length changes. Writing the
  // attribute directly keeps it off React's render path entirely.
  const coilRef = useRef(null);
  useMotionValueEvent(springLength, "change", (L) => {
    coilRef.current?.setAttribute("d", coilPath(L));
  });
  useEffect(() => {
    coilRef.current?.setAttribute("d", coilPath(springLength.get()));
  }, [springLength]);

  useEffect(() => {
    const r = prefersReducedMotion();
    const coarse = !window.matchMedia("(pointer: fine)").matches;
    setReduced(r);
    setIsCoarse(coarse);
    if (r) return;

    // Entrance: the card starts high (spring compressed) and drops onto
    // the spring, which stretches and recoils — same physics path as a
    // drag release, so it can't look like a separate canned animation.
    dragY.set(-(REST_LENGTH - MIN_LENGTH));
    const controls = animate(dragY, 0, { ...ENTRANCE_SPRING, delay: 0.15 });
    return () => controls.stop();
  }, [dragY]);

  const startDrag = (e) => {
    if (reduced || isCoarse || e.target.closest("a")) return;
    releaseX.current?.stop();
    releaseY.current?.stop();
    dragging.current = true;
    origin.current = { x: e.clientX - dragX.get(), y: e.clientY - dragY.get() };
    // Belt and braces with user-select in the CSS: some engines still
    // extend a selection from a press that started on text. Only reached
    // for a real drag — links and touch returned above — so taps, clicks
    // and page scrolling behave exactly as before.
    e.preventDefault();
    window.getSelection?.()?.removeAllRanges();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const moveDrag = (e) => {
    if (!dragging.current) return;
    dragX.set(clamp(e.clientX - origin.current.x, -MAX_DRAG_X, MAX_DRAG_X));
    dragY.set(clamp(e.clientY - origin.current.y, -MAX_DRAG_UP, MAX_DRAG_DOWN));
  };

  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    releaseX.current = animate(dragX, 0, RELEASE_SPRING);
    releaseY.current = animate(dragY, 0, RELEASE_SPRING);
  };

  const onWrapMove = (e) => {
    if (reduced || isCoarse || dragging.current) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pointerX.set(clamp(e.clientX - (r.left + r.width / 2), -60, 60));
    pointerY.set(clamp(e.clientY - (r.top + r.height / 2), -60, 60));
  };

  const onWrapEnter = () => {
    if (reduced || isCoarse) return;
    animate(bounceY, 14, BOUNCE_SPRING);
  };

  const onWrapLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    if (!reduced && !isCoarse) animate(bounceY, 0, BOUNCE_SPRING);
  };

  // Touch has no hover, so a tap tugs the card down and lets the spring
  // pull it back — the same stretch/recoil, just triggered differently.
  const onTap = () => {
    if (reduced || !isCoarse) return;
    animate(bounceY, [0, 26, 0], {
      duration: 1,
      times: [0, 0.32, 1],
      ease: [0.16, 1, 0.3, 1],
    });
  };

  return (
    <div
      className={`id-card__wrap ${reduced ? "id-card__wrap--static" : ""}`}
      ref={wrapRef}
      onMouseMove={onWrapMove}
      onMouseEnter={onWrapEnter}
      onMouseLeave={onWrapLeave}
      onClick={onTap}
    >
      <motion.div
        className="id-card__rig"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="id-card__mount" aria-hidden="true" />

        <motion.div
          className="id-card__hang"
          style={{ x: totalX, y: totalY, rotate: reduced ? 0 : cardTilt }}
        >
          <motion.div
            className="id-card__stage"
            data-cursor-label={isCoarse ? undefined : "drag me"}
            style={{ rotateX: reduced ? 0 : tiltX, rotateY: reduced ? 0 : tiltY }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="id-card__card">
              <div className="id-card__face">
                <div className="id-card__slot" aria-hidden="true" />
                <span className="id-card__badge-label">Access Badge</span>
                <div className="id-card__avatar">
                  <img src="/avatar.jpg" alt="" draggable={false} />
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
                  >
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

        {/* Drawn after the card so the hook ring sits in front of the
            slot — you see the slot through the ring, which is what
            makes it read as hooked through rather than resting on. */}
        <motion.div
          className="id-card__spring"
          style={{ rotate: reduced ? 0 : springAngle }}
          aria-hidden="true"
        >
          <svg className="id-card__coil" width={COIL_CX * 2} height={280} overflow="visible">
            <path ref={coilRef} d={coilPath(REST_LENGTH)} />
          </svg>

          <motion.div className="id-card__hook" style={{ y: springLength }}>
            <svg width="26" height="30" viewBox="0 0 26 30" overflow="visible">
              <path d="M13 0 L13 7" />
              <circle cx="13" cy="15" r="7.5" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
