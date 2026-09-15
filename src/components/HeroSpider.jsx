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
const FOOTER_GAP = 64; // stops just short of the footer
const NEAR = 190; // how close the pointer gets before it bolts
// Measured from the hub, and wider than NEAR: once it is up in the web
// the cursor has to properly leave before it will come back down.
const LEAVE = 300;
// How far out into the web it will patrol, in web units. Capped well
// inside the frame so it never walks over the hero copy.
const NEST_R = 74;
// Tap targets are fingers, not a cursor tip, and the spider is small.
const TOUCH_NEAR = 80;
// A fixed-height silk element stretched by scaleY. Sizing it to the
// whole page (6000-9000px) made a single texture taller than many
// mobile GPUs will allocate in one piece.
const THREAD_PX = 1024;

/**
 * Two layouts, switched at one breakpoint.
 *
 * Wide screens have a gutter left of the container, so the web sits in
 * the top-left corner at full size. Below that there is no gutter on
 * the left — the copy starts at the edge — but the top-right corner is
 * clear on every layout down to a phone, so the web moves there,
 * mirrored so its mooring lines still run off the nearest edges, and
 * shrinks to fit the margin.
 */
const WIDE_QUERY = "(min-width: 1400px)";
const LAYOUTS = {
  // `size` is the spider's rendered width, matching --spider-size.
  wide: { scale: 1, mirror: 1, rest: 150, sway: 16, flee: 120, size: 52 },
  compact: { scale: 0.45, mirror: -1, rest: 112, sway: 9, flee: 90, size: 30 },
};

/* ------------------------------------------------------------------ *
 * The web throw
 *
 * Every ten seconds, while it is hanging in view of the name, it turns
 * toward the S, takes aim, and throws. The strand bursts open into a web
 * draped over the whole letter, holds, lets go, and the web peels off
 * and drifts down the way web actually does.
 * ------------------------------------------------------------------ */
const THROW_EVERY = 10000;
const THROW_RETRY = 2000; // when the moment isn't right, look again soon
const THROW_MAX = 900; // px; further than this and it isn't a throw
// Where the spider's eyes are, measured from the body's rotation pivot,
// as a fraction of its width: 64/92 of the drawing's height.
const HEAD_FROM_PIVOT = (64 / 92) * (92 / 100);
const LIFT = 0.135; // the pivot sits this far above the dragline's end
const AIM_MAX = 38; // degrees: it turns toward the letter, not all the way
const SPREAD_MS = 480; // the web bursting open over the letter

/*
 * How it comes off. Real web is almost weightless: drag dominates, so it
 * reaches a slow terminal speed within a fraction of a second and then
 * drifts rather than drops. It does not come away as one flat piece
 * either — the top lets go first and folds down over the part still
 * stuck, strands stretch between what's loose and what isn't, and as it
 * falls the whole thing collapses into a sagging, swaying clump.
 *
 * So the web is a set of particles, each with its own moment of letting
 * go (by height) and its own fall, drawn fresh every frame.
 */
const FALL_S = 3.1; // seconds from letting go to gone
const PEEL_S = 0.62; // top lets go first; the bottom this much later
const TERMINAL = 100; // px/s
const DRAG_TC = 0.3; // s to approach terminal speed

/** Distance fallen u seconds after letting go, with air drag. */
const dragFall = (u) => (u <= 0 ? 0 : TERMINAL * (u - DRAG_TC * (1 - Math.exp(-u / DRAG_TC))));

/** Overshoots and settles: a thrown web stretches past its rest, then holds. */
const easeOutBack = (t) => {
  const c = 1.4;
  const x = Math.min(1, Math.max(0, t)) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/**
 * The first letter's actual ink, in client coordinates.
 *
 * A text range gives the character's box, which runs the full height of
 * the font from ascender to descender — well above and below the S that
 * is actually painted. The font's own metrics say where the glyph sits
 * on the baseline, so the web can be sized to the letter, not its box.
 */
function firstGlyphBox(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const node = walker.nextNode();
  if (!node) return null;
  const i = node.textContent.search(/\S/);
  const range = document.createRange();
  range.setStart(node, i);
  range.setEnd(node, i + 1);
  const r = range.getBoundingClientRect();
  if (!r.width) return null;

  const cs = getComputedStyle(node.parentElement);
  firstGlyphBox.ctx ||= document.createElement("canvas").getContext("2d");
  const ctx = firstGlyphBox.ctx;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(node.textContent[i]);
  if (!m.actualBoundingBoxAscent || !m.fontBoundingBoxDescent) {
    // No glyph metrics: trim the font box to roughly cap height instead.
    return { left: r.left, right: r.right, top: r.top + r.height * 0.2, bottom: r.bottom - r.height * 0.22 };
  }
  const baseline = r.bottom - m.fontBoundingBoxDescent;
  return {
    left: r.left - m.actualBoundingBoxLeft,
    right: r.left + m.actualBoundingBoxRight,
    top: baseline - m.actualBoundingBoxAscent,
    bottom: baseline + m.actualBoundingBoxDescent,
  };
}

/**
 * The thrown line: a quadratic from the spider to the target, bowed by
 * `arc` px perpendicular to the chord. Positive bows it up — the arc of
 * something thrown — zero is taut, negative sags like slack silk.
 */
function shotCurve(ox, oy, tx, ty, arc) {
  const dx = tx - ox;
  const dy = ty - oy;
  const len = Math.hypot(dx, dy) || 1;
  // Unit normal on the upper side of the chord, whichever way it runs.
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  // The control point sits at twice the bow, so the curve's midpoint is
  // exactly `arc` px off the chord.
  const cx = (ox + tx) / 2 + nx * arc * 2;
  const cy = (oy + ty) / 2 + ny * arc * 2;
  return { cx, cy };
}

/** A point on the thrown line, t in 0-1. */
function shotPoint(ox, oy, cx, cy, tx, ty, t) {
  const u = 1 - t;
  return [u * u * ox + 2 * u * t * cx + t * t * tx, u * u * oy + 2 * u * t * cy + t * t * ty];
}

/**
 * A thrown web sized to a w x h letter, centred on (0,0).
 *
 * Anchors ring the letter just past its edges, so the web drapes over
 * all of it; radials run from the impact point to each anchor; three
 * rounds of cross-threads lace them; and a few long strands cut across,
 * which is the untidiness of a web that was thrown rather than woven.
 * Fresh randomness every throw.
 */
function makeWeb(w, h) {
  const pts = [];
  const add = (x, y) => pts.push({ x, y }) - 1;
  const hub = add((Math.random() - 0.5) * w * 0.12, (Math.random() - 0.5) * h * 0.1);
  const n = 9 + Math.floor(Math.random() * 3);
  const rx = w * 0.66;
  const ry = h * 0.6;
  const ROUNDS = [0.3, 0.56, 0.8];
  const anchors = [];
  const rings = ROUNDS.map(() => []);
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / n);
    const j = 0.88 + Math.random() * 0.26;
    const ax = Math.cos(a) * rx * j;
    const ay = Math.sin(a) * ry * j;
    anchors.push(add(ax, ay));
    ROUNDS.forEach((f, k) => {
      const fj = f * (0.9 + Math.random() * 0.2);
      rings[k].push(add(pts[hub].x + (ax - pts[hub].x) * fj, pts[hub].y + (ay - pts[hub].y) * fj));
    });
  }
  const chords = Array.from({ length: 3 }, () => {
    const i = Math.floor(Math.random() * n);
    return [anchors[i], anchors[(i + 3 + Math.floor(Math.random() * 3)) % n]];
  });

  // Letting-go order by height: 0 at the top, 1 at the bottom.
  const ys = pts.map((p) => p.y);
  const top = Math.min(...ys);
  const span = Math.max(...ys) - top || 1;
  pts.forEach((p) => {
    p.peel = (p.y - top) / span;
    p.phase = Math.random() * Math.PI * 2;
  });
  return { pts, hub, anchors, rings, chords };
}

/**
 * The web's shape at a moment: `spread` 0-1 as it bursts open, `s`
 * seconds since it started letting go (negative while it still holds).
 * Returns path data for the heavier strands, the finer cross-threads,
 * and the beads of silk where it is stuck.
 */
function webFrame(web, spread, s) {
  const { pts, hub, anchors, rings, chords } = web;
  const hx = pts[hub].x;
  const hy = pts[hub].y;
  const open = easeOutBack(spread);

  // Each particle: burst out from the impact point, then fall on its own
  // schedule — the top first — with a flutter once it is loose.
  const Q = pts.map((p) => {
    const bx = hx + (p.x - hx) * open;
    const by = hy + (p.y - hy) * open;
    const u = s - p.peel * PEEL_S;
    const loose = u > 0 ? 1 - Math.exp(-u / 0.5) : 0;
    return [bx + Math.sin(s * 3.2 + p.phase) * 3.2 * loose, by + dragFall(u)];
  });

  if (s > 0) {
    // Collapsing into a clump about its own centre as it falls, and
    // swaying there. Only once the bottom has let go: before that,
    // pulling inward would tear the still-stuck anchors off the letter.
    let mx = 0;
    let my = 0;
    Q.forEach((q) => {
      mx += q[0];
      my += q[1];
    });
    mx /= Q.length;
    my /= Q.length;
    const c = Math.max(0, s - PEEL_S * 0.85);
    const crumple = 0.58 * (1 - Math.exp(-c / 0.8));
    const sway = 1 - Math.exp(-c / 0.6);
    const angle = (Math.sin(s * 2.6 + 0.6) * 11 * sway * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const drift = Math.sin(s * 3.1) * 14 * sway;
    Q.forEach((q) => {
      const dx = (q[0] - mx) * (1 - crumple);
      const dy = (q[1] - my) * (1 - crumple * 0.8);
      q[0] = mx + dx * cos - dy * sin + drift;
      q[1] = my + dx * sin + dy * cos;
    });
  }

  // Loose silk sags; taut silk doesn't.
  const slack = Math.min(1, Math.max(0, s / 0.5));
  const hubQ = Q[hub];
  const strand = (a, b, pull, sag) => {
    const [x0, y0] = Q[a];
    const [x1, y1] = Q[b];
    const cx = (x0 + x1) / 2 + (hubQ[0] - (x0 + x1) / 2) * pull;
    const cy = (y0 + y1) / 2 + (hubQ[1] - (y0 + y1) / 2) * pull + sag * slack;
    return `M${fmt(x0)},${fmt(y0)}Q${fmt(cx)},${fmt(cy)} ${fmt(x1)},${fmt(y1)}`;
  };
  const around = (ring, pull, sag) => ring.map((idx, i) => strand(idx, ring[(i + 1) % ring.length], pull, sag)).join("");

  const main =
    anchors.map((a) => strand(hub, a, 0, 7)).join("") +
    around(anchors, 0.07, 5) +
    chords.map(([a, b]) => strand(a, b, 0.04, 9)).join("");
  const fine = rings.map((ring) => around(ring, 0.12, 3)).join("");
  const bead = (idx, r) => {
    const [x, y] = Q[idx];
    return `M${fmt(x - r)},${fmt(y)}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0`;
  };
  const beads = anchors.map((a) => bead(a, 1.5)).join("") + bead(hub, 3);
  return { main, fine, beads, hub: hubQ };
}

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
  const spanRef = useRef(1200); // hub → footer, measured

  // Which layout is in play. Rendered from state, but read through a ref
  // inside the long-lived effects so a resize doesn't restart the whole
  // behaviour loop.
  const [layoutName, setLayoutName] = useState(() =>
    window.matchMedia(WIDE_QUERY).matches ? "wide" : "compact"
  );
  const layout = LAYOUTS[layoutName];
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const sync = () => setLayoutName(mq.matches ? "wide" : "compact");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Touch devices get the same spider with the always-on idle motion
  // turned down, to spare battery on the devices least able to afford it.
  const [touch] = useState(() => !window.matchMedia("(pointer: fine)").matches);

  // How far it has lowered itself, in px below the hub.
  const rawDrop = useMotionValue(layout.rest);
  const drop = useSpring(rawDrop, { stiffness: 80, damping: 20, mass: 0.6 });

  // 0 = hanging where the scroll says, 1 = tucked in the middle of the web.
  const retreat = useMotionValue(1);
  const retreatSpring = useSpring(retreat, { stiffness: 170, damping: 19, mass: 0.7 });

  const { scrollYProgress } = useScroll();
  const applyScroll = (v) => {
    const rest = layoutRef.current.rest;
    const target = rest + (spanRef.current - rest) * v;
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
      spanRef.current = Math.max(420, Math.round(footY - hubY - FOOTER_GAP));
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
  const swayRaw = useSpring(
    useTransform(pointerX, (v) => (Math.max(-320, Math.min(320, v)) / 320) * layoutRef.current.sway),
    { stiffness: 90, damping: 18 }
  );
  // Sway has to die out as the spider climbs home: a 16px offset on a
  // 2px-long thread is an 83° angle, which threw the dragline sideways
  // across the page the moment the pointer came near.

  // Idle fidgeting: crawling around the hub when tucked in, a slow bob
  // on the line when hanging.
  const idleX = useMotionValue(0);
  const idleY = useMotionValue(0);
  const bob = useMotionValue(0);
  // Kept separate from the bob so the two never cancel each other: this
  // is the occasional reel-up-and-drop while it is just hanging there.
  const hitch = useMotionValue(0);
  // Climbing a short way up its own line out of reach, used instead of
  // going home when the nest is far off-screen. Also separate, so none
  // of these three ever cancel another.
  const flee = useMotionValue(0);
  // Recoil from throwing, kicked away from the throw direction.
  const kickX = useMotionValue(0);
  const kickY = useMotionValue(0);
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
    [swayRaw, idleX, kickX, retreatSpring],
    ([sway, ix, k, r]) => (sway + k) * (1 - r) + ix * r
  );
  const offsetY = useTransform(
    [drop, idleY, bob, hitch, flee, kickY, retreatSpring],
    ([d, iy, b, h, f, k, r]) => d + iy * r + (b + h + f + k) * (1 - r)
  );

  // ---- the throw: state ------------------------------------------------
  const stageRef = useRef(null);
  const shotRef = useRef(null); // geometry fixed at the moment of the throw
  const [shot, setShot] = useState(null);
  const shotLen = useMotionValue(0); // visible fraction, from the spider out
  const shotArc = useMotionValue(0); // bow of the strand; see shotCurve
  const tipShow = useMotionValue(0); // the glob leading the strand in flight
  const spreadT = useMotionValue(0); // the web bursting open over the letter
  const fallS = useMotionValue(-1); // seconds since it began letting go; <0 holds
  // Turning toward the letter before throwing, on top of hanging straight.
  const aimSpin = useMotionValue(0);

  const threadScale = useTransform([offsetX, offsetY], ([x, y]) => Math.hypot(x, y) / THREAD_PX);
  // Measured from straight down, which is where the unrotated element
  // already points. Negated because CSS rotate() runs clockwise, so a
  // positive angle swings the tip of a downward line to the left —
  // exactly opposite to where the spider went. Handles the spider
  // sitting above the hub too: the line simply points up at it.
  const threadAngle = useTransform(
    [offsetX, offsetY],
    ([x, y]) => (-Math.atan2(x, y) * 180) / Math.PI
  );
  // Hanging, it aligns with its line; in the nest it faces wherever it
  // is actually travelling. `facing` is fed from the velocity of the
  // walk itself rather than animated alongside it — a heading derived
  // from the motion cannot disagree with the motion, and blending
  // through a spring means it turns *into* a move instead of pivoting
  // on the spot first and then gliding off, which is what made it look
  // mechanical.
  const facingTo = useMotionValue(0);
  // Soft on purpose: a stiffer spring swung it through 180 degrees in
  // about 300ms, which read as flipping rather than turning.
  const facing = useSpring(facingTo, { stiffness: 100, damping: 20, mass: 0.75 });
  const bodySpin = useTransform([threadAngle, facing, retreatSpring, aimSpin], ([a, f, r, aim]) => {
    // `facing` accumulates whole turns as the spider walks, so that it
    // always takes the short way round. Blending that raw number
    // against the thread angle made the body spin through every turn it
    // had banked — a 360 at full speed on the way up and another on the
    // way down. Only its direction matters here, so fold it back to
    // (-180, 180]. The fold is invisible: -180 and +180 render the same
    // rotation, and this is a derived value, not an animated one.
    const rel = f - Math.round(f / 360) * 360;
    return (a + aim) * (1 - r) + rel * r;
  });

  // ---- the throw: geometry ---------------------------------------------
  // The strand's spider end is not fixed. It is read live from the same
  // numbers that place and turn the body, so it leaves from the head
  // wherever the head is pointing — through the turn, the recoil and any
  // sway — just as the dragline always lands on the spinnerets.
  const shotGeom = (x, y, spin, arc) => {
    const g = shotRef.current;
    if (!g) return null;
    // The body rotates about a pivot a little above the dragline's end;
    // the eyes are HEAD_FROM_PIVOT down its axis from there. CSS rotate()
    // runs clockwise, so the head direction is (-sin, cos).
    const rad = (spin * Math.PI) / 180;
    const d = g.size * HEAD_FROM_PIVOT;
    const ox = g.hubX + x - Math.sin(rad) * d;
    const oy = g.hubY + y - g.size * LIFT + Math.cos(rad) * d;
    return { ox, oy, ...shotCurve(ox, oy, g.tx, g.ty, arc) };
  };
  const shotD = useTransform([offsetX, offsetY, bodySpin, shotArc], ([x, y, spin, arc]) => {
    const c = shotGeom(x, y, spin, arc);
    const g = shotRef.current;
    return c ? `M${fmt(c.ox)},${fmt(c.oy)}Q${fmt(c.cx)},${fmt(c.cy)} ${fmt(g.tx)},${fmt(g.ty)}` : "M0,0";
  });
  const tipPos = useTransform([offsetX, offsetY, bodySpin, shotArc, shotLen], ([x, y, spin, arc, len]) => {
    const c = shotGeom(x, y, spin, arc);
    const g = shotRef.current;
    return c ? shotPoint(c.ox, c.oy, c.cx, c.cy, g.tx, g.ty, len) : [0, 0];
  });
  // Hidden outright at zero length. A zero-length dash with round caps
  // still paints a dot at each end of the path, which left a stray pixel
  // on the spider and another on the name after the strand was reeled in.
  const shotShow = useTransform(shotLen, (v) => (v > 0.003 ? 1 : 0));
  const tipX = useTransform(tipPos, (p) => p[0]);
  const tipY = useTransform(tipPos, (p) => p[1]);

  // The web, drawn fresh from its particles each frame it is moving.
  const webNow = useTransform([spreadT, fallS], ([sp, s]) => {
    const web = shotRef.current?.web;
    return web ? webFrame(web, sp, s) : null;
  });
  const webMain = useTransform(webNow, (f) => f?.main ?? "M0,0");
  const webFine = useTransform(webNow, (f) => f?.fine ?? "M0,0");
  const webBeads = useTransform(webNow, (f) => f?.beads ?? "M0,0");
  // Invisible until the strand arrives — collapsed to a point before
  // impact, its beads still painted a dot on the S during the aim — and
  // fading only once it has well and truly let go and is drifting away.
  const webFade = useTransform([spreadT, fallS], ([sp, s]) => {
    if (sp < 0.01) return 0;
    return s < 1.9 ? 1 : Math.max(0, 1 - (s - 1.9) / (FALL_S - 1.9));
  });

  // It should be hauling itself along the silk whenever it is moving —
  // climbing on the way up, walking down on the way down — rather than
  // gliding. Two independent reasons to be moving its legs: the page is
  // dragging it along the thread, or it is walking the web under its
  // own steam. Velocity alone missed the second, because a patrol hop
  // is ~12px over half a second and eases out below any threshold worth
  // setting, so the nest walk states it outright instead.
  const walking = useRef(false);
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
  };

  const walkStop = useRef(null);
  const stride = useRef(0);
  const onPace = () => {
    const vx = offsetX.getVelocity();
    const vy = offsetY.getVelocity();
    const speed = Math.hypot(vx, vy);
    // Above the slow breathing bob (~10px/s) but below a gentle scroll,
    // so it strides for the whole ride and not while hanging still.
    hauled.current = speed > 15;

    // Point the body along its own velocity, accumulating the angle so
    // it takes the short way round instead of unwinding 358 degrees
    // every time atan2 wraps past ±180.
    //
    // Only while it is walking the web under its own steam. Steering on
    // any movement meant that hauling itself up the dragline counted:
    // velocity straight up reads as a heading of 180, so it turned to
    // face up on the way home and back down again on the way out.
    // Travel along the thread is the thread's business, not the legs'.
    if (patrolling.current && speed > 18 && retreatSpring.get() > 0.6) {
      const want = (-Math.atan2(vx, vy) * 180) / Math.PI;
      const cur = facingTo.get();
      facingTo.set(cur + ((((want - cur + 180) % 360) + 360) % 360) - 180);
    }

    // Step length is fixed, so the leg cycle has to scale with speed —
    // otherwise the feet travel at a different rate from the ground and
    // the legs read as decoration bolted to a sliding body.
    const el = bodyRef.current;
    if (el) {
      const period = Math.min(0.46, Math.max(0.13, 15 / Math.max(1, speed)));
      if (Math.abs(period - stride.current) > 0.02) {
        stride.current = period;
        el.style.setProperty("--stride", `${period.toFixed(3)}s`);
      }
    }
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
    let throwing = false; // a web throw is in progress
    const wait = (ms) =>
      new Promise((resolve) => {
        fidget = setTimeout(resolve, ms);
      });
    // Waits out the animation by the clock rather than on a completion
    // callback, so an interruption can never strand the loop.
    const over = (ms) => wait(ms);

    const EASE_TURN = [0.33, 0, 0.2, 1];

    // Whether the hub is still on screen. Everything that sends the
    // spider home is gated on this: once the reader has scrolled past
    // the hero, the spider stays on its line beside them rather than
    // hauling itself thousands of pixels back up the page out of sight.
    const nestInView = (margin = -40) => {
      const hub = hubRef.current;
      return !!hub && hub.getBoundingClientRect().top > margin;
    };

    /**
     * Crosses to a point in short darts rather than one long glide.
     * A spider does not travel at a constant eased speed: it goes in
     * bursts with a beat of stillness between them, and that cadence is
     * most of what separates a creature from a tweened sprite.
     *
     * The destination is fixed, so this varies the rhythm of the
     * journey, never its direction — the opposite of the random walk
     * this replaced.
     */
    const walkTo = async (tx, ty) => {
      const sx = idleX.get();
      const sy = idleY.get();
      const dist = Math.hypot(tx - sx, ty - sy);
      if (dist < 1) return;
      const darts = Math.max(2, Math.min(4, Math.round(dist / 24)));
      // Unhurried, and relative to its own size: a small spider covering
      // ground at a big spider's speed looks like it is being dragged.
      const SPEED = 52 * Math.max(0.6, layoutRef.current.scale);

      // Start the turn a beat before the feet, so it sets off already
      // swinging round toward the destination rather than walking
      // sideways until the velocity catches it up. Shortest way round.
      const want = (-Math.atan2(tx - sx, ty - sy) * 180) / Math.PI;
      const cur = facingTo.get();
      facingTo.set(cur + ((((want - cur + 180) % 360) + 360) % 360) - 180);
      await over(260);
      if (!alive) return;

      patrolling.current = true;
      applyGait();

      for (let i = 1; i <= darts && alive; i += 1) {
        const f = i / darts;
        // Setting off is slow — that beat is when the body swings round
        // to face the way it is going — and arriving eases out.
        const ease =
          i === 1 ? [0.62, 0, 0.3, 1] : i === darts ? [0.3, 0, 0.25, 1] : [0.35, 0, 0.3, 1];
        const ms = Math.max(170, (dist / darts / SPEED) * 1000);
        animate(idleX, sx + (tx - sx) * f, { duration: ms / 1000, ease });
        animate(idleY, sy + (ty - sy) * f, { duration: ms / 1000, ease });
        await over(ms);
        if (i < darts) await over(60 + Math.random() * 120);
      }

      patrolling.current = false;
      applyGait();
    };

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
        const [wx, wy] = point(ANGLES[spoke], r);
        // Web units to screen pixels: scaled with the web, and mirrored
        // along with it on compact layouts, so it still lands on a thread.
        const L = layoutRef.current;

        // No turn phase: the body swings round during the slow first
        // dart, because its heading follows its velocity. Walking out
        // from the hub in a straight line is walking along a radial.
        await walkTo(wx * L.scale * L.mirror, wy * L.scale);
        if (!alive || bolted || Date.now() < spookedUntil) continue;

        // Then it works: a strand of capture spiral laid across the
        // sector it is standing in, generated from the web's own
        // geometry so it falls exactly where a thread would have been.
        const next = (spoke + 1) % SPOKES;
        const [ax, ay] = point(ANGLES[spoke], r);
        setMend({ id: mendId.current++, d: `M${fmt(ax)},${fmt(ay)}${strand(spoke, r, next, r, 1.055)}` });
        await wait(1300 + Math.random() * 800);
        if (!alive) return;

        // Walk home, then settle facing down again by the shortest way
        // round rather than unwinding the whole journey's rotation.
        await walkTo(0, 0);
        if (!alive) return;
        animate(facingTo, Math.round(facingTo.get() / 360) * 360, {
          duration: 0.5,
          ease: EASE_TURN,
        });
      }
    };
    errand();

    // While it is simply hanging there, it does almost nothing — and
    // then every so often reels itself up a few inches and drops back.
    // The stillness is what makes that read.
    let hitchTimer;
    const reel = () => {
      hitchTimer = setTimeout(() => {
        // Not mid-throw: reeling up would drag the strand off its aim.
        if (!inNest && !throwing) animate(hitch, [0, -34, 3, 0], { duration: 2.1, ease: "easeInOut" });
        reel();
      }, 9000 + Math.random() * 8000);
    };
    reel();

    // The only animation that never stops, so it is the one touch devices
    // go without: it kept the whole transform pipeline running at 60fps
    // for a 7px movement. Everything else there runs only when it moves.
    const breathe = touch
      ? { stop() {} }
      : animate(bob, [0, -7, 0, 5, 0], { duration: 7.5, repeat: Infinity, ease: "easeInOut" });

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
        // Scurrying home is fast, so its heading follows on its own;
        // only the parked orientation needs stating.
        animate(idleX, 0, { duration: 0.42, ease: [0.3, 0, 0.2, 1] });
        animate(idleY, 0, { duration: 0.42, ease: [0.3, 0, 0.2, 1] });
        animate(facingTo, Math.round(facingTo.get() / 360) * 360, {
          duration: 0.62,
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
        // Only while the reader can actually see the nest. Further down
        // the page it stays with them on its line.
        if (!nestInView(60) || throwing) {
          scheduleVisit();
          return;
        }
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

    // ---- off-screen nest: stay with the reader -------------------------
    let fleeing = false;
    const setFleeing = (want) => {
      if (want === fleeing) return;
      fleeing = want;
      // Up fast, back down slowly, like everything else it does.
      animate(
        flee,
        want ? -layoutRef.current.flee : 0,
        want
          ? { type: "spring", stiffness: 240, damping: 22, mass: 0.6 }
          : { type: "spring", stiffness: 50, damping: 14, mass: 1 }
      );
    };

    // Scrolled away from the hero while it was up in the web: come back
    // down the line to where the page says it should be hanging, rather
    // than being left in a nest that has scrolled out of view.
    const onScroll = () => {
      if (inNest && !nestInView()) {
        visiting = false;
        bolted = false;
        settle();
      }
    };

    // Where the spider would be without the flee offset. Measuring from
    // the displaced position is the hover feedback loop all over again:
    // climbing away would carry it out of its own trigger radius.
    const restCentre = () => {
      const r = bodyRef.current.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2 - flee.get()];
    };

    // Taps. Passive, and a plain pointerdown that never prevents
    // anything, so it cannot interfere with scrolling or any gesture —
    // it only notices a finger landing near the spider.
    let tapTimer;
    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" || !bodyRef.current || inNest) return;
      const [cx, cy] = restCentre();
      if (Math.hypot(e.clientX - cx, e.clientY - cy) > TOUCH_NEAR) return;
      clearTimeout(tapTimer);
      if (nestInView()) {
        bolted = true;
        settle();
        tapTimer = setTimeout(() => {
          bolted = false;
          settle();
        }, 2400);
      } else {
        setFleeing(true);
        tapTimer = setTimeout(() => setFleeing(false), 1800);
      }
    };

    // ---- the web throw ----------------------------------------------------
    // Its own timers, so cleanup can cancel every one of them; the errand
    // loop's `wait` only ever keeps hold of its latest handle.
    const pending = new Set();
    const later = (ms) =>
      new Promise((resolve) => {
        const id = setTimeout(() => {
          pending.delete(id);
          resolve();
        }, ms);
        pending.add(id);
      });
    // Anything that takes the spider off its line ends a throw early.
    const interrupted = () => !alive || inNest || fleeing;
    let throwTimer;
    let throwId = 0;

    /** Where to throw, or null when this isn't the moment. */
    const aim = () => {
      const stage = stageRef.current;
      const hub = hubRef.current;
      const line =
        document.querySelector(".hero__name-white .hero__name-line") ||
        document.querySelector(".hero__name");
      if (!stage || !hub || !line) return null;
      // The S itself — its painted ink, not its text box.
      const glyph = firstGlyphBox(line);
      if (!glyph) return null;
      // The letter has to be properly on screen to be worth aiming at.
      if (glyph.bottom < 90 || glyph.top > window.innerHeight - 60) return null;

      const sr = stage.getBoundingClientRect();
      const hr = hub.getBoundingClientRect();
      const { size } = layoutRef.current;
      const hubX = hr.left - sr.left;
      const hubY = hr.top - sr.top;
      const w = glyph.right - glyph.left;
      const h = glyph.bottom - glyph.top;
      const web = makeWeb(w, h);
      // Centre of the S, in stage coordinates; the strand strikes the
      // web's hub, which sits near it.
      const gx = (glyph.left + glyph.right) / 2 - sr.left;
      const gy = (glyph.top + glyph.bottom) / 2 - sr.top;
      const tx = gx + web.pts[web.hub].x;
      const ty = gy + web.pts[web.hub].y;
      // Measured from the head as it hangs now, before it turns.
      const ox = hubX + offsetX.get();
      const oy = hubY + offsetY.get() + size * (HEAD_FROM_PIVOT - LIFT);
      const dist = Math.hypot(tx - ox, ty - oy);
      if (dist < 60 || dist > THROW_MAX) return null;

      // Never through the ID card. On two-column layouts below the wide
      // breakpoint it sits squarely between the spider and the name, and
      // silk flying through it looks like a bug, not a throw. Both the
      // arcing flight path and the taut strand after are checked.
      const card = document.querySelector(".id-card__card")?.getBoundingClientRect();
      if (card && card.width) {
        const pad = 14;
        const box = [card.left - sr.left - pad, card.right - sr.left + pad, card.top - sr.top - pad, card.bottom - sr.top + pad];
        const { cx, cy } = shotCurve(ox, oy, tx, ty, dist * 0.14);
        for (let i = 1; i < 24; i += 1) {
          const t = i / 24;
          for (const [x, y] of [shotPoint(ox, oy, cx, cy, tx, ty, t), [ox + (tx - ox) * t, oy + (ty - oy) * t]]) {
            if (x > box[0] && x < box[1] && y > box[2] && y < box[3]) return null;
          }
        }
      }
      // How far to turn: pointing the head at the letter exactly would
      // mean rolling most of the way onto its side, so it turns toward it
      // and lets the strand's arc do the rest.
      const toward = (-Math.atan2(tx - ox, ty - oy) * 180) / Math.PI;
      const turn = Math.max(-AIM_MAX, Math.min(AIM_MAX, toward));
      return { hubX, hubY, tx, ty, gx, gy, ox, oy, dist, size, web, turn };
    };

    // The name takes the hit: a 2-3px knock in the direction of the throw.
    const knockName = (ux, uy) => {
      document.querySelector(".hero__name")?.animate?.(
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${(ux * 2.5).toFixed(2)}px, ${(uy * 2.5).toFixed(2)}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration: 300, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
      );
    };

    const settleKick = () => {
      animate(kickX, 0, { type: "spring", stiffness: 140, damping: 14 });
      animate(kickY, 0, { type: "spring", stiffness: 140, damping: 14 });
    };

    const unTurn = () => animate(aimSpin, 0, { type: "spring", stiffness: 70, damping: 13, mass: 0.9 });

    const finish = () => {
      settleKick();
      unTurn();
      shotLen.set(0);
      tipShow.set(0);
      spreadT.set(0);
      fallS.set(-1);
      shotRef.current = null;
      if (alive) setShot(null);
      throwing = false;
    };

    /** Resolves true if a throw happened. */
    const throwWeb = async () => {
      if (throwing || interrupted() || document.hidden) return false;
      // Hanging still, not mid-climb or being hauled along by a scroll.
      if (retreat.get() > 0.02 || Math.abs(offsetY.getVelocity()) > 40) return false;
      const g = aim();
      if (!g) return false;

      throwing = true;
      shotRef.current = g;
      shotLen.set(0);
      tipShow.set(0);
      spreadT.set(0);
      fallS.set(-1);
      setShot({ id: (throwId += 1), gx: g.gx, gy: g.gy });

      // 1. Turns toward the S, swinging its head round on its thread, and
      // takes a beat to aim. Everything after is judged from where it
      // actually ended up facing.
      animate(aimSpin, g.turn, { duration: 0.46, ease: [0.45, 0, 0.25, 1] });
      await later(620);
      if (interrupted()) {
        finish();
        return true;
      }
      // Re-read the throw line from the turned head.
      const head = shotGeom(offsetX.get(), offsetY.get(), bodySpin.get(), 0);
      const dist = Math.hypot(g.tx - head.ox, g.ty - head.oy) || 1;
      const ux = (g.tx - head.ox) / dist;
      const uy = (g.ty - head.oy) / dist;
      shotArc.set(dist * 0.14);

      // 2. Wind-up: draws back, away from the letter.
      animate(kickX, -ux * 7, { duration: 0.2, ease: [0.3, 0, 0.2, 1] });
      animate(kickY, -uy * 7 - 3, { duration: 0.2, ease: [0.3, 0, 0.2, 1] });
      animate(aimSpin, g.turn * 0.85, { duration: 0.2, ease: [0.3, 0, 0.2, 1] });
      await later(210);
      if (interrupted()) {
        finish();
        return true;
      }

      // 3. Throw. The glob leads with the strand paying out behind it —
      // fastest off the spider and slowing as it flies — while the arc it
      // was thrown on flattens as the strand pulls itself straight. The
      // spider lunges into the throw and swings back on its thread.
      const flight = Math.min(0.42, Math.max(0.2, dist / 1500));
      tipShow.set(1);
      animate(kickX, ux * 6, { type: "spring", stiffness: 520, damping: 20 });
      animate(kickY, uy * 6, { type: "spring", stiffness: 520, damping: 20 });
      animate(aimSpin, g.turn * 1.08, { type: "spring", stiffness: 420, damping: 18 });
      animate(shotLen, 1, { duration: flight, ease: [0.15, 0.7, 0.35, 1] });
      animate(shotArc, dist * 0.02, { duration: flight, ease: [0.5, 0, 0.9, 0.6] });
      await later(flight * 1000);
      if (!alive) return true;

      // 4. Impact: the web bursts open from where it hit, stretching past
      // the letter's edges and settling back over the whole S. The strand
      // snaps taut and the name takes the knock.
      tipShow.set(0);
      animate(shotArc, 0, { duration: 0.12, ease: "easeOut" });
      animate(spreadT, 1, { duration: SPREAD_MS / 1000, ease: [0.2, 0.8, 0.3, 1] });
      knockName(ux, uy);
      settleKick();

      // 5. Holds, taut — unless something takes the spider off its line.
      for (let i = 0; i < 9 && !interrupted(); i += 1) await later(100);
      if (!alive) return true;

      // 6. Lets go: the strand goes slack, sagging, and is reeled in while
      // the spider turns back to hang straight.
      animate(shotArc, -dist * 0.09, { duration: 0.4, ease: [0.2, 0.6, 0.4, 1] });
      animate(shotLen, 0, { duration: 0.46, ease: [0.55, 0, 0.8, 0.3] });
      unTurn();
      await later(180);
      if (!alive) return true;

      // 7. The web comes off: top first, folding down over the rest,
      // then drifting down as a collapsing, swaying clump. Time is fed in
      // linearly; the physics is in webFrame.
      fallS.set(0); // from "holding" (-1) straight to the moment it lets go
      animate(fallS, FALL_S, { duration: FALL_S, ease: "linear" });
      await later(FALL_S * 1000 + 40);
      if (!alive) return true;

      finish();
      return true;
    };

    // Start to start, every THROW_EVERY; if the moment isn't right (in the
    // nest, scrolled away, name off screen) it looks again shortly rather
    // than waiting out a whole cycle.
    const scheduleThrow = (ms) => {
      throwTimer = setTimeout(async () => {
        const started = Date.now();
        const went = await throwWeb();
        if (!alive) return;
        scheduleThrow(went ? Math.max(1000, THROW_EVERY - (Date.now() - started)) : THROW_RETRY);
      }, ms);
    };
    // After the entrance has lowered it out of the web and it has settled.
    scheduleThrow(5600);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    const stop = () => {
      entrance.stop();
      breathe.stop();
      alive = false;
      clearTimeout(fidget);
      clearTimeout(hitchTimer);
      clearTimeout(visitTimer);
      clearTimeout(leaveTimer);
      clearTimeout(tapTimer);
      clearTimeout(throwTimer);
      pending.forEach(clearTimeout);
      pending.clear();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onPointerDown);
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
      const hubBox = hubRef.current?.getBoundingClientRect();
      if (!bodyRef.current || !hubBox) return;
      const [cx, cy] = restCentre();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      pointerX.set(Math.max(-320, Math.min(320, dx)));

      if (!inNest && !nestInView()) {
        // Deep in the page the nest is thousands of pixels away, and
        // bolting all the way home abandoned the reader. Instead it
        // climbs out of reach up its own line and drops back once the
        // cursor has properly gone — hysteresis again, so it can't flicker.
        setFleeing(fleeing ? dist < NEAR + 90 : dist < NEAR);
        return;
      }
      setFleeing(false);
      bolted = inNest
        ? Math.hypot(e.clientX - hubBox.left, e.clientY - hubBox.top) < LEAVE
        : dist < NEAR;
      settle();
    };

    const onLeave = () => {
      pointerX.set(0);
      bolted = false;
      setFleeing(false);
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

  const webPx = WEB_VIEW * layout.scale;

  return (
    // A page-sized clipping stage. On compact layouts the web and its
    // mooring lines run off the right edge, and overflow on that side
    // widens the document: on phones it pushed the navbar's toggle and
    // menu button off-screen. body's overflow-x: hidden doesn't stop it
    // (iOS Safari ignores it outright), so the rig clips itself.
    <div className="hero-spider-stage" aria-hidden="true" ref={stageRef}>
    {shot && (
      <>
        {/* The thrown strand. A 1px SVG that paints outside its box, drawn
            straight in stage coordinates — no page-sized canvas. The halo
            underneath keeps it legible over the name's letters, whichever
            theme is on. */}
        <svg className="hero-spider__shot" width="1" height="1">
          <motion.path className="hero-spider__shot-halo" d={shotD} style={{ pathLength: shotLen, opacity: shotShow }} />
          <motion.path className="hero-spider__shot-line" d={shotD} style={{ pathLength: shotLen, opacity: shotShow }} />
          <motion.circle className="hero-spider__shot-tip" cx={tipX} cy={tipY} r="2.4" style={{ opacity: tipShow }} />
        </svg>

        {/* The web over the S. Another 1px, overflow-visible SVG, placed on
            the letter's centre; every strand is redrawn from the web's
            particles, so it can peel, stretch, fold and crumple rather
            than moving as one flat piece. */}
        <motion.svg
          key={shot.id}
          className="hero-spider__web-throw"
          width="1"
          height="1"
          style={{ left: shot.gx, top: shot.gy, opacity: webFade }}
        >
          <motion.path className="hero-spider__net-halo" d={webMain} />
          <motion.path className="hero-spider__net-halo is-fine" d={webFine} />
          <motion.path className="hero-spider__net-silk" d={webMain} />
          <motion.path className="hero-spider__net-silk is-ring" d={webFine} />
          <motion.path className="hero-spider__net-bead" d={webBeads} />
        </motion.svg>
      </>
    )}
    <div
      className={`hero-spider hero-spider--${layoutName}${touch ? " hero-spider--touch" : ""}`}
      ref={hubRef}
    >
      {/* The nest. Its hub is this element's origin, so the dragline
          below starts exactly where the radials converge. */}
      <svg
        className="hero-spider__web"
        viewBox={`${-WEB_VIEW} ${-WEB_VIEW} ${WEB_VIEW * 2} ${WEB_VIEW * 2}`}
        /* Box derived from the geometry and the layout's scale, centred on
           this element's origin, so the hub stays put at any size. The
           mirror flips it about that same centre, and the patrol mirrors
           its targets to match, so it still walks on real threads. */
        style={{
          width: webPx * 2,
          height: webPx * 2,
          margin: `${-webPx}px 0 0 ${-webPx}px`,
          transform: layout.mirror < 0 ? "scaleX(-1)" : undefined,
        }}
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
          style={{ height: THREAD_PX, scaleY: threadScale, rotate: threadAngle }}
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
              {/* Stop colours come from theme tokens as CSS, not
                  attributes, so the spider re-lights with the theme. */}
              <radialGradient id="sp-abdomen" cx="36%" cy="26%" r="82%">
                <stop offset="0%" style={{ stopColor: "var(--spider-abdomen-hi)" }} />
                <stop offset="38%" style={{ stopColor: "var(--spider-abdomen-mid)" }} />
                <stop offset="78%" style={{ stopColor: "var(--spider-abdomen-lo)" }} />
                <stop offset="100%" style={{ stopColor: "var(--spider-abdomen-edge)" }} />
              </radialGradient>
              <radialGradient id="sp-thorax" cx="38%" cy="28%" r="84%">
                <stop offset="0%" style={{ stopColor: "var(--spider-thorax-hi)" }} />
                <stop offset="60%" style={{ stopColor: "var(--spider-thorax-mid)" }} />
                <stop offset="100%" style={{ stopColor: "var(--spider-thorax-lo)" }} />
              </radialGradient>
              {/* Soft-edged specular highlight — a flat white ellipse
                  read as a cut gem facet rather than a sheen. */}
              <radialGradient id="sp-gloss" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sp-leg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--spider-leg-hi)" }} />
                <stop offset="55%" style={{ stopColor: "var(--spider-leg-mid)" }} />
                <stop offset="100%" style={{ stopColor: "var(--spider-leg-lo)" }} />
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
    </div>
  );
}
