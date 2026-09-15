import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { prefersReducedMotion } from "../lib/motion";
import "./HeroSpider.css";

const RAD = Math.PI / 180;

/* ------------------------------------------------------------------ *
 * The web
 *
 * Built the way an orb weaver actually builds one: an irregular frame,
 * radials converging on a hub, a tight mesh at the hub, a bare free
 * zone, then one continuous capture spiral whose segments sag outward
 * between radials. The sag is what stops it reading as straight lines.
 * ------------------------------------------------------------------ */
const SPOKES = 16;
const HUB_R = 10; // dense mesh the spider sits in
const FREE_R = 21; // bare ring between hub and capture spiral
// Sized to stop short of the hero copy: the rig paints above every
// section, so a wider web would lay silk across the text.
const WEB_R = 150; // mean frame radius
const SPIRAL_TURNS = 11;
const WEB_VIEW = Math.ceil(WEB_R * 1.18);

// Deterministic irregularity: no two sectors the same, but nothing
// reshuffles between renders.
const spokeAngle = (i) =>
  ((360 * i) / SPOKES + 5.5 * Math.sin(i * 1.7) + 2.6 * Math.cos(i * 2.9)) * RAD;
const frameRadius = (i) => WEB_R * (1 + 0.095 * Math.sin(i * 2.3) + 0.045 * Math.cos(i * 1.13));

const ANGLES = Array.from({ length: SPOKES }, (_, i) => spokeAngle(i));
const FRAME_R = Array.from({ length: SPOKES }, (_, i) => frameRadius(i));

const point = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
const fmt = (n) => n.toFixed(1);

/**
 * One strand of silk strung between two radials. Real silk is slack, so
 * it bows away from the hub; the control point is placed so the curve
 * passes outside the straight chord by `bulge`.
 */
function strand(i0, r0, i1, r1, bulge) {
  const a0 = ANGLES[i0];
  let a1 = ANGLES[i1];
  if (a1 <= a0) a1 += Math.PI * 2; // wrapping past the last spoke
  const [x1, y1] = point(a1, r1);
  const mid = (a0 + a1) / 2;
  const [cx, cy] = point(mid, ((r0 + r1) / 2) * bulge);
  return `Q${fmt(cx)},${fmt(cy)} ${fmt(x1)},${fmt(y1)}`;
}

/** The capture spiral: one unbroken thread, inner turns packed tighter. */
function spiralPath() {
  const steps = SPIRAL_TURNS * SPOKES;
  const radiusAt = (k) => {
    const i = k % SPOKES;
    const t = (k / steps) ** 1.32; // geometric-ish spread
    return FREE_R + (FRAME_R[i] * 0.94 - FREE_R) * t;
  };
  let d = "";
  for (let k = 0; k <= steps; k += 1) {
    const i = k % SPOKES;
    const r = radiusAt(k);
    if (k === 0) {
      const [x, y] = point(ANGLES[i], r);
      d += `M${fmt(x)},${fmt(y)}`;
      continue;
    }
    const prev = k - 1;
    d += strand(prev % SPOKES, radiusAt(prev), i, r, 1.055 + 0.022 * Math.sin(k * 1.9));
  }
  return d;
}

/** The hub mesh — three tight turns the spider rests on. */
function hubPath() {
  const steps = SPOKES * 3;
  const radiusAt = (k) => 3 + (HUB_R - 3) * (k / steps);
  let d = "";
  for (let k = 0; k <= steps; k += 1) {
    const i = k % SPOKES;
    const r = radiusAt(k);
    if (k === 0) {
      const [x, y] = point(ANGLES[i], r);
      d += `M${fmt(x)},${fmt(y)}`;
      continue;
    }
    d += strand((k - 1) % SPOKES, radiusAt(k - 1), i, r, 1.02);
  }
  return d;
}

/** The frame thread the radials are anchored to. */
function framePath() {
  let d = "";
  for (let i = 0; i <= SPOKES; i += 1) {
    const idx = i % SPOKES;
    if (i === 0) {
      const [x, y] = point(ANGLES[idx], FRAME_R[idx]);
      d = `M${fmt(x)},${fmt(y)}`;
      continue;
    }
    d += strand((i - 1) % SPOKES, FRAME_R[(i - 1) % SPOKES], idx, FRAME_R[idx], 1.035);
  }
  return `${d}Z`;
}

// Bridge lines mooring the web to the corner. Only the ones heading up
// or left are kept: those leave the page within a few dozen pixels, so
// they read as anchored off-screen. Anything pointing right would end
// in mid-air over the hero copy.
const ANCHORS = ANGLES.map((a, i) => ({ a, i })).filter(
  ({ a }) => Math.cos(a) < -0.3 || (Math.sin(a) < -0.45 && Math.cos(a) < 0.4)
);

const SPIRAL_D = spiralPath();
const HUB_D = hubPath();
const FRAME_D = framePath();

/* ------------------------------------------------------------------ *
 * The spider
 * ------------------------------------------------------------------ */
const HUB_DROP = 2; // sitting in the middle of the web
const REST_DROP = 150; // hanging, before any scrolling
const FOOTER_GAP = 64; // stops just short of the footer
const NEAR = 190; // how close the pointer gets before it bolts
const MAX_SWAY = 16; // px the spider drifts either side of the hub
// How far out into the web it will patrol. Capped well inside the
// frame so it never walks over the hero copy.
const NEST_R = 74;

/**
 * Drawn hanging the way a spider actually hangs: abdomen uppermost,
 * because the silk pays out of the spinnerets at its rear, with the
 * head pointing down and the back legs still gripping the line.
 * Each leg is one path with two bends — attachment, raised knee, tip —
 * which is what gives the arched, jointed silhouette.
 */
const LEFT_LEGS = [
  [42, 50, 32, 44, 25, 35, 21, 25, 19, 12],
  [40, 55, 28, 58, 17, 55, 10, 48, 7, 35],
  [40, 59, 27, 69, 16, 72, 8, 68, 3, 55],
  [41, 63, 30, 78, 21, 83, 13, 79, 7, 69],
];

const legPath = (p, flip) => {
  const X = (x) => (flip ? 100 - x : x);
  return `M${X(p[0])},${p[1]} Q${X(p[2])},${p[3]} ${X(p[4])},${p[5]} Q${X(p[6])},${p[7]} ${X(p[8])},${p[9]}`;
};

/**
 * Spiders walk an alternating tetrapod: L1/R2/L3/R4 swing forward while
 * R1/L2/R3/L4 are planted, then they trade. Swinging all eight together
 * — or odd/even, which pairs each leg with its own neighbour — reads as
 * a shiver rather than a walk.
 *
 * LEFT_LEGS runs back-to-front, so index 0 is leg 4 and index 3 is leg 1.
 * Each leg also pivots on its own joint where it meets the body.
 */
const LEGS = [false, true].flatMap((flip) =>
  LEFT_LEGS.map((p, i) => ({
    d: legPath(p, flip),
    // Attachment point, in viewBox units.
    ox: flip ? 100 - p[0] : p[0],
    oy: p[1],
    // Leg number 1-4 counting from the front.
    group: (4 - i + (flip ? 1 : 0)) % 2 === 0 ? "a" : "b",
  }))
);

export default function HeroSpider() {
  const hubRef = useRef(null);
  const bodyRef = useRef(null);
  const [span, setSpan] = useState(1200); // hub → footer, measured
  const spanRef = useRef(span);
  spanRef.current = span;

  // How far it has lowered itself, in px below the hub.
  const rawDrop = useMotionValue(REST_DROP);
  const drop = useSpring(rawDrop, { stiffness: 80, damping: 20, mass: 0.6 });

  // 0 = hanging where the scroll says, 1 = tucked in the middle of the web.
  const retreat = useMotionValue(1);
  const retreatSpring = useSpring(retreat, { stiffness: 170, damping: 19, mass: 0.7 });

  const { scrollYProgress } = useScroll();
  const applyScroll = (v) => {
    const target = REST_DROP + (spanRef.current - REST_DROP) * v;
    rawDrop.set(target + (HUB_DROP - target) * retreat.get());
  };
  useMotionValueEvent(scrollYProgress, "change", applyScroll);
  useMotionValueEvent(retreat, "change", () => applyScroll(scrollYProgress.get()));

  // Measure the run from the hub down to the footer so the spider can
  // descend the whole page and stop on top of it.
  useEffect(() => {
    const measure = () => {
      const hub = hubRef.current;
      const footer = document.querySelector("footer");
      if (!hub || !footer) return;
      const hubY = hub.getBoundingClientRect().top + window.scrollY;
      const footY = footer.getBoundingClientRect().top + window.scrollY;
      const next = Math.max(420, Math.round(footY - hubY - FOOTER_GAP));
      spanRef.current = next;
      setSpan(next);
      applyScroll(scrollYProgress.get());
    };
    measure();
    // Sections reveal on scroll and fonts land late; both change the height.
    const settle = setTimeout(measure, 1400);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One source of truth for the pendulum: the spider's offset from
  // directly below the hub. The dragline's length and angle are both
  // derived from it, so the thread always lands on the spider no matter
  // how long it has paid out. (An angular sway would look right at the
  // top of the page and fling the spider a thousand pixels sideways by
  // the bottom, where the thread is 6000px long.)
  const pointerX = useMotionValue(0);
  const swayRaw = useSpring(useTransform(pointerX, [-320, 320], [-MAX_SWAY, MAX_SWAY]), {
    stiffness: 90,
    damping: 18,
  });
  // Sway has to die out as the spider climbs home: a 16px offset on a
  // 2px-long thread is an 83° angle, which threw the dragline sideways
  // across the page the moment the pointer came near.

  // Idle fidgeting: crawling around the hub when tucked in, a slow bob
  // on the line when hanging.
  const idleX = useMotionValue(0);
  const idleY = useMotionValue(0);
  const idleSpin = useMotionValue(0);
  const bob = useMotionValue(0);
  // Kept separate from the bob so the two never cancel each other: this
  // is the occasional reel-up-and-drop while it is just hanging there.
  const hitch = useMotionValue(0);
  // A strand it is repairing, replayed by changing the key.
  const [mend, setMend] = useState(null);
  const mendId = useRef(0);

  // ---- the only two numbers that matter -------------------------------
  // Where the spider is, measured from the hub. The body is placed here
  // and the silk's length and angle are computed from the same pair, so
  // the line cannot end anywhere but on the spider. (It used to: the
  // idle crawl moved the body without moving the thread, which is the
  // gap visible after the spider climbs home.)
  const offsetX = useTransform(
    [swayRaw, idleX, retreatSpring],
    ([sway, ix, r]) => sway * (1 - r) + ix * r
  );
  const offsetY = useTransform(
    [drop, idleY, bob, hitch, retreatSpring],
    ([d, iy, b, h, r]) => d + iy * r + (b + h) * (1 - r)
  );

  const threadScale = useTransform(
    [offsetX, offsetY],
    ([x, y]) => Math.hypot(x, y) / Math.max(1, spanRef.current)
  );
  // Measured from straight down, which is where the unrotated element
  // already points. Negated because CSS rotate() runs clockwise, so a
  // positive angle swings the tip of a downward line to the left —
  // exactly opposite to where the spider went. Handles the spider
  // sitting above the hub too: the line simply points up at it.
  const threadAngle = useTransform(
    [offsetX, offsetY],
    ([x, y]) => (-Math.atan2(x, y) * 180) / Math.PI
  );
  // Hanging, it aligns with its line; in the nest it turns as it walks.
  const bodySpin = useTransform(
    [threadAngle, idleSpin, retreatSpring],
    ([a, sp, r]) => a * (1 - r) + sp * r
  );

  // It should be hauling itself along the silk whenever it is moving —
  // climbing on the way up, walking down on the way down — rather than
  // gliding. Two independent reasons to be moving its legs: the page is
  // dragging it along the thread, or it is walking the web under its
  // own steam. Velocity alone missed the second, because a patrol hop
  // is ~12px over half a second and eases out below any threshold worth
  // setting, so the nest walk states it outright instead.
  const walking = useRef(false);
  const climbing = useRef(false);
  const hauled = useRef(false);
  const patrolling = useRef(false);
  const applyGait = () => {
    const el = bodyRef.current;
    if (!el) return;
    // The nest walk runs continuously but is scaled to nothing while the
    // spider is hanging, so it only counts as movement once it is home.
    const moving = hauled.current || (patrolling.current && retreatSpring.get() > 0.3);
    if (moving !== walking.current) {
      walking.current = moving;
      el.classList.toggle("is-walking", moving);
    }
    const up = moving && offsetY.getVelocity() < -60;
    if (up !== climbing.current) {
      climbing.current = up;
      el.classList.toggle("is-climbing", up);
    }
  };

  const walkStop = useRef(null);
  const onPace = () => {
    hauled.current = Math.hypot(offsetX.getVelocity(), offsetY.getVelocity()) > 25;
    applyGait();
    // `change` stops firing once it settles, so this needs its own way out.
    clearTimeout(walkStop.current);
    walkStop.current = setTimeout(() => {
      hauled.current = false;
      applyGait();
    }, 140);
  };
  useMotionValueEvent(offsetX, "change", onPace);
  useMotionValueEvent(offsetY, "change", onPace);
  useEffect(() => () => clearTimeout(walkStop.current), []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      retreat.set(0);
      return undefined;
    }

    // Starts tucked in the web, then lowers itself out on a thread.
    const entrance = animate(retreat, 0, {
      type: "spring",
      stiffness: 60,
      damping: 14,
      mass: 1,
      delay: 2.4,
      onComplete: () => {
        inNest = false;
      },
    });

    // In the nest it patrols its own silk rather than drifting: out
    // along a radial, round to a neighbouring one, back in toward the
    // hub — the way a spider actually crosses a web — pausing between
    // legs of the journey and turning to face wherever it is headed.
    let fidget;
    let spoke = 0;
    let ringAt = 0.42; // fraction of the nest radius
    const wander = () => {
      const fromX = idleX.get();
      const fromY = idleY.get();
      if (Math.random() < 0.55) {
        spoke = (spoke + (Math.random() < 0.5 ? 1 : SPOKES - 1)) % SPOKES;
      } else {
        ringAt = Math.min(0.96, Math.max(0.1, ringAt + (Math.random() < 0.5 ? 0.22 : -0.22)));
      }
      const [tx, ty] = point(ANGLES[spoke], NEST_R * ringAt);
      const dist = Math.hypot(tx - fromX, ty - fromY);
      const duration = Math.min(1.9, Math.max(0.45, dist / 58));
      // Head first: the body is drawn head-down, so its forward vector
      // is +y, and CSS rotate() runs clockwise.
      const heading = (-Math.atan2(tx - fromX, ty - fromY) * 180) / Math.PI;

      const ease = [0.42, 0, 0.3, 1];
      patrolling.current = true;
      applyGait();
      animate(idleX, tx, { duration, ease });
      animate(idleY, ty, {
        duration,
        ease,
        onComplete: () => {
          patrolling.current = false;
          applyGait();
        },
      });
      animate(idleSpin, heading, { duration: duration * 0.6, ease });

      // Having arrived somewhere, it sometimes works: a strand of
      // capture spiral is laid across the sector it is standing in.
      // The strand is generated from the web's own geometry, so it
      // falls exactly on a line the web would have had anyway.
      let pause = 260 + Math.random() * 900;
      if (Math.random() < 0.45) {
        const r = NEST_R * ringAt;
        const next = (spoke + 1) % SPOKES;
        setMend({
          id: mendId.current++,
          d: `M${fmt(point(ANGLES[spoke], r)[0])},${fmt(point(ANGLES[spoke], r)[1])}${strand(
            spoke,
            r,
            next,
            r,
            1.055
          )}`,
        });
        pause += 900;
      }
      fidget = setTimeout(wander, duration * 1000 + pause);
    };
    fidget = setTimeout(wander, 700);

    // While it is simply hanging there, it does almost nothing — and
    // then every so often reels itself up a few inches and drops back.
    // The stillness is what makes that read.
    let hitchTimer;
    const reel = () => {
      hitchTimer = setTimeout(() => {
        if (!inNest) animate(hitch, [0, -34, 3, 0], { duration: 2.1, ease: "easeInOut" });
        reel();
      }, 9000 + Math.random() * 8000);
    };
    reel();

    const breathe = animate(bob, [0, -7, 0, 5, 0], {
      duration: 7.5,
      repeat: Infinity,
      ease: "easeInOut",
    });

    // What the pointer wants and what the spider does on its own are
    // two independent reasons to be in the nest; one flag each, and one
    // place that acts on them.
    let bolted = false;
    let visiting = false;
    let inNest = true;
    const settle = () => {
      const want = bolted || visiting;
      if (want === inNest) return;
      inNest = want;
      if (want) entrance.stop(); // don't let the delayed entrance undo it
      // Bolts home fast, creeps back down slowly.
      animate(retreat, want ? 1 : 0, {
        type: "spring",
        stiffness: bolted && want ? 260 : 60,
        damping: bolted && want ? 22 : 15,
        mass: bolted && want ? 0.6 : 1,
      });
    };

    // Goes up to potter about in the web now and then unprompted —
    // otherwise the nest behaviour only ever shows if you chase it
    // there with the cursor.
    let visitTimer;
    let leaveTimer;
    const scheduleVisit = () => {
      visitTimer = setTimeout(() => {
        visiting = true;
        settle();
        leaveTimer = setTimeout(() => {
          visiting = false;
          settle();
          scheduleVisit();
        }, 6000 + Math.random() * 4000);
      }, 12000 + Math.random() * 10000);
    };
    scheduleVisit();

    const stop = () => {
      entrance.stop();
      breathe.stop();
      clearTimeout(fidget);
      clearTimeout(hitchTimer);
      clearTimeout(visitTimer);
      clearTimeout(leaveTimer);
    };

    if (!window.matchMedia("(pointer: fine)").matches) return stop;

    const onMove = (e) => {
      const el = bodyRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      pointerX.set(Math.max(-320, Math.min(320, dx)));
      bolted = Math.hypot(dx, dy) < NEAR;
      settle();
    };

    const onLeave = () => {
      pointerX.set(0);
      bolted = false;
      settle();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      stop();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hero-spider" aria-hidden="true" ref={hubRef}>
      {/* The nest. Its hub is this element's origin, so the dragline
          below starts exactly where the radials converge. */}
      <svg
        className="hero-spider__web"
        viewBox={`${-WEB_VIEW} ${-WEB_VIEW} ${WEB_VIEW * 2} ${WEB_VIEW * 2}`}
        /* Box derived from the geometry so 1 unit stays 1px and the hub
           stays on this element's origin whatever WEB_R becomes. */
        style={{ width: WEB_VIEW * 2, height: WEB_VIEW * 2, margin: `${-WEB_VIEW}px 0 0 ${-WEB_VIEW}px` }}
      >
        {ANCHORS.map(({ a, i }) => {
          const [x1, y1] = point(a, FRAME_R[i]);
          const [x2, y2] = point(a, FRAME_R[i] * 2.4);
          return (
            <motion.line
              key={`anchor-${i}`}
              className="hero-spider__anchor"
              x1={fmt(x1)}
              y1={fmt(y1)}
              x2={fmt(x2)}
              y2={fmt(y2)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 1.3 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}

        <motion.path
          className="hero-spider__frame"
          d={FRAME_D}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {ANGLES.map((a, i) => {
          const [x, y] = point(a, FRAME_R[i]);
          return (
            <motion.line
              key={`spoke-${i}`}
              className="hero-spider__spoke"
              x1="0"
              y1="0"
              x2={fmt(x)}
              y2={fmt(y)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1.7 + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}

        <motion.path
          className="hero-spider__spiral"
          d={SPIRAL_D}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.6, delay: 2, ease: [0.33, 0, 0.2, 1] }}
        />

        {/* Silk being laid right now: drawn bright, then settling back
            into the rest of the web. */}
        {mend && (
          <motion.path
            key={mend.id}
            className="hero-spider__mend"
            d={mend.d}
            initial={{ pathLength: 0, opacity: 0.95 }}
            animate={{ pathLength: 1, opacity: 0 }}
            transition={{
              pathLength: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 1.6, delay: 0.7, ease: "easeOut" },
            }}
          />
        )}

        <motion.path
          className="hero-spider__hubmesh"
          d={HUB_D}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div className="hero-spider__rig">
        {/* One dragline, pivoting at the hub. */}
        <motion.span
          className="hero-spider__thread"
          /* No opacity fade: the silk is reeled in, not switched off, so
             its length alone takes it to nothing as the spider arrives. */
          style={{ height: span, scaleY: threadScale, rotate: threadAngle }}
          /* Order matters and Framer's default is scale-then-rotate,
             which rotates an already-squashed box and shears the line
             off sideways instead of swinging it. Rotate first. */
          transformTemplate={({ rotate, scaleY }) =>
            `rotate(${rotate || "0deg"}) scaleY(${scaleY ?? 1})`
          }
        />

        <motion.div
          className="hero-spider__body"
          ref={bodyRef}
          style={{ x: offsetX, y: offsetY, rotate: bodySpin }}
        >
          <svg viewBox="0 0 100 92" className="hero-spider__svg">
            <defs>
              {/* Off-centre light source, so body and legs all shade from
                  the same top-left highlight and read as round. */}
              <radialGradient id="sp-abdomen" cx="36%" cy="26%" r="82%">
                <stop offset="0%" stopColor="#b02330" />
                <stop offset="38%" stopColor="#7a121c" />
                <stop offset="78%" stopColor="#420810" />
                <stop offset="100%" stopColor="#1e0306" />
              </radialGradient>
              <radialGradient id="sp-thorax" cx="38%" cy="28%" r="84%">
                <stop offset="0%" stopColor="#a11f2a" />
                <stop offset="60%" stopColor="#5e0e16" />
                <stop offset="100%" stopColor="#24040a" />
              </radialGradient>
              {/* Soft-edged specular highlight — a flat white ellipse
                  read as a cut gem facet rather than a sheen. */}
              <radialGradient id="sp-gloss" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sp-leg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8d1823" />
                <stop offset="55%" stopColor="#4a0a11" />
                <stop offset="100%" stopColor="#1b0205" />
              </linearGradient>
            </defs>

            {/* Far-side legs sit behind the body in a darker tone — the
                cheapest honest depth cue there is. */}
            {["far", "main", "sheen"].map((layer) => (
              <g key={layer} className={`hero-spider__legs hero-spider__legs--${layer}`}>
                {LEGS.map((leg, i) => (
                  <path
                    key={`${layer}-${i}`}
                    d={leg.d}
                    className={`is-${leg.group}`}
                    /* Each leg swings on the joint where it meets the
                       body, not on the body's centre. */
                    style={{ transformOrigin: `${leg.ox}px ${leg.oy}px` }}
                  />
                ))}
              </g>
            ))}

            <ellipse className="hero-spider__abdomen" cx="50" cy="34" rx="16" ry="19" />
            <ellipse className="hero-spider__gloss" cx="43" cy="25" rx="6" ry="8.5" />
            <ellipse className="hero-spider__thorax" cx="50" cy="59" rx="11" ry="9.5" />
            <ellipse className="hero-spider__gloss" cx="45.5" cy="55" rx="3.6" ry="3" />
            <path className="hero-spider__mark" d="M50 26 L56 36 L50 45 L44 36 Z" />
            <circle className="hero-spider__eye" cx="46" cy="64" r="1.7" />
            <circle className="hero-spider__eye" cx="54" cy="64" r="1.7" />
            <circle className="hero-spider__eye is-small" cx="42.8" cy="61" r="1.1" />
            <circle className="hero-spider__eye is-small" cx="57.2" cy="61" r="1.1" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
