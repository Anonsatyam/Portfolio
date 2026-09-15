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
// Measured from the hub, and wider than NEAR: once it is up in the web
// the cursor has to properly leave before it will come back down.
const LEAVE = 300;
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

// The whole thing needs a gutter beside the container to live in. Below
// this there isn't one: the spider would swing over the copy, and the
// web spans about two thirds of a 390px screen, laying silk across the
// badge, the eyebrow and the top of the name. So below this width none
// of it is rendered at all.
const RIG_QUERY = "(min-width: 1400px)";

export default function HeroSpider() {
  const hubRef = useRef(null);
  const bodyRef = useRef(null);
  const [span, setSpan] = useState(1200); // hub → footer, measured
  const spanRef = useRef(span);
  spanRef.current = span;

  // Whether any of this is in play. Hiding it in CSS was not enough:
  // every spring, timer and observer went on running, writing ~60 style
  // updates a second to an element nobody could see. Gating the mount
  // stops the work rather than just the paint.
  const [rigOn, setRigOn] = useState(
    () => typeof window !== "undefined" && window.matchMedia(RIG_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(RIG_QUERY);
    const sync = () => setRigOn(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // How far it has lowered itself, in px below the hub.
  const rawDrop = useMotionValue(REST_DROP);
  const drop = useSpring(rawDrop, { stiffness: 80, damping: 20, mass: 0.6 });

  // 0 = hanging where the scroll says, 1 = tucked in the middle of the web.
  const retreat = useMotionValue(1);
  const retreatSpring = useSpring(retreat, { stiffness: 170, damping: 19, mass: 0.7 });

  const { scrollYProgress } = useScroll();
  const applyScroll = (v) => {
    if (!rigOn) return;
    const target = REST_DROP + (spanRef.current - REST_DROP) * v;
    rawDrop.set(target + (HUB_DROP - target) * retreat.get());
  };
  useMotionValueEvent(scrollYProgress, "change", applyScroll);
  useMotionValueEvent(retreat, "change", () => applyScroll(scrollYProgress.get()));

  // Measure the run from the hub down to the footer so the spider can
  // descend the whole page and stop on top of it.
  useEffect(() => {
    if (!rigOn) return undefined;
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
  }, [rigOn]);

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
    if (!rigOn) return;
    // Above the slow breathing bob (~10px/s) but below a gentle scroll,
    // so it strides for the whole ride and not while hanging still.
    hauled.current = Math.hypot(offsetX.getVelocity(), offsetY.getVelocity()) > 15;
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
    if (!rigOn) return undefined;
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

    // An orb weaver sits at the hub and waits. It does not mill about.
    // So the default here is parked and still, interrupted now and then
    // by one deliberate errand: face a point on the web, walk straight
    // out along that radial, lay a strand, turn, walk straight back.
    //
    // The previous version picked a random neighbouring spoke every
    // second or so, which is a random walk and looked like one: no
    // destination, no rhythm, and — the real tell — it started moving
    // before it had finished turning, so it slid sideways. Nothing here
    // translates until its heading has arrived.
    let fidget;
    let alive = true;
    // Declared up here because the errand loop reads them; they are
    // written by the pointer handler and the unprompted-visit timer.
    let bolted = false;
    let visiting = false;
    let inNest = true;
    let spookedUntil = 0; // frozen for a beat after being driven off
    const wait = (ms) =>
      new Promise((resolve) => {
        fidget = setTimeout(resolve, ms);
      });
    // Waits out the animation by the clock rather than on a completion
    // callback, so an interruption can never strand the loop.
    const over = (ms) => wait(ms);

    const EASE_TURN = [0.33, 0, 0.2, 1];
    const EASE_WALK = [0.42, 0, 0.28, 1];
    const SPEED = 46; // px per second, unhurried

    const turnTo = (heading, ms) => {
      animate(idleSpin, heading, { duration: ms / 1000, ease: EASE_TURN });
      return over(ms);
    };

    const walkTo = async (tx, ty) => {
      const dist = Math.hypot(tx - idleX.get(), ty - idleY.get());
      if (dist < 1) return;
      const ms = Math.min(2200, Math.max(420, (dist / SPEED) * 1000));
      patrolling.current = true;
      applyGait();
      animate(idleX, tx, { duration: ms / 1000, ease: EASE_WALK });
      animate(idleY, ty, { duration: ms / 1000, ease: EASE_WALK });
      await over(ms);
      patrolling.current = false;
      applyGait();
    };

    // The body is drawn head-down, so its forward vector is +y, and CSS
    // rotate() runs clockwise — hence the negation.
    const headingTo = (tx, ty) =>
      (-Math.atan2(tx - idleX.get(), ty - idleY.get()) * 180) / Math.PI;

    const errand = async () => {
      while (alive) {
        // Sitting still is the default and most of the time. Short
        // enough, though, that a whole errand fits inside one visit to
        // the web rather than the spider arriving and doing nothing.
        await wait(2400 + Math.random() * 3600);
        if (!alive) return;
        // Not while it is hanging, not while the cursor is still on the
        // web, and not for a beat after a scare. A spider that has just
        // been driven off sits tight and watches; wandering out again
        // under the cursor is what made a hover look like random motion.
        // The nest behaviour still shows: it goes up on its own every
        // 13-23s, and the cursor is rarely parked in the corner.
        if (retreat.get() < 0.5 || bolted || Date.now() < spookedUntil) continue;

        const spoke = Math.floor(Math.random() * SPOKES);
        const r = NEST_R * (0.55 + Math.random() * 0.45);
        const [tx, ty] = point(ANGLES[spoke], r);

        // Turn first, then travel. Walking out from the hub in a
        // straight line is walking along a radial.
        await turnTo(headingTo(tx, ty), 340);
        if (!alive || bolted || Date.now() < spookedUntil) continue;
        await walkTo(tx, ty);
        if (!alive || bolted || Date.now() < spookedUntil) continue;

        // Then it works: a strand of capture spiral laid across the
        // sector it is standing in, generated from the web's own
        // geometry so it falls exactly where a thread would have been.
        const next = (spoke + 1) % SPOKES;
        const [ax, ay] = point(ANGLES[spoke], r);
        setMend({ id: mendId.current++, d: `M${fmt(ax)},${fmt(ay)}${strand(spoke, r, next, r, 1.055)}` });
        await wait(1300 + Math.random() * 800);
        if (!alive) return;

        // Turn about, walk home, and settle facing down again by the
        // shortest way round rather than unwinding the whole journey.
        await turnTo(headingTo(0, 0), 380);
        if (!alive) return;
        await walkTo(0, 0);
        if (!alive) return;
        await turnTo(Math.round(idleSpin.get() / 360) * 360, 420);
      }
    };
    errand();

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
      // Driven off the web, it runs for the hub — not for wherever it
      // happened to be standing when an errand was interrupted.
      if (want && bolted) {
        spookedUntil = Date.now() + 2600;
        animate(idleX, 0, { duration: 0.45, ease: EASE_WALK });
        animate(idleY, 0, { duration: 0.45, ease: EASE_WALK });
        animate(idleSpin, Math.round(idleSpin.get() / 360) * 360, {
          duration: 0.45,
          ease: EASE_TURN,
        });
      }
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
          // Long enough for a full errand — turn, walk out, work, turn,
          // walk back — and no longer. Hanging on the line is the look
          // the whole thing is for; the visits are punctuation, so they
          // want to be roughly a third of the time, not half.
        }, 10000 + Math.random() * 4000);
      }, 22000 + Math.random() * 13000);
    };
    scheduleVisit();

    const stop = () => {
      entrance.stop();
      breathe.stop();
      alive = false;
      clearTimeout(fidget);
      clearTimeout(hitchTimer);
      clearTimeout(visitTimer);
      clearTimeout(leaveTimer);
    };

    if (!window.matchMedia("(pointer: fine)").matches) return stop;

    // Hysteresis, and two different reference points, because otherwise
    // this is a feedback loop: bolting moves the spider, which moves it
    // out of its own trigger radius, which sends it back down into the
    // radius again — a hover made it flick up and down at random.
    //
    // Approaching is measured against the spider. Whether to stay up is
    // measured against the hub, which does not move, over a wider area.
    const onMove = (e) => {
      const el = bodyRef.current;
      const hubBox = hubRef.current?.getBoundingClientRect();
      if (!el || !hubBox) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      pointerX.set(Math.max(-320, Math.min(320, dx)));

      bolted = inNest
        ? Math.hypot(e.clientX - hubBox.left, e.clientY - hubBox.top) < LEAVE
        : Math.hypot(dx, dy) < NEAR;
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

  // After every hook, so the hook order never changes when the viewport
  // crosses the breakpoint.
  if (!rigOn) return null;

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
