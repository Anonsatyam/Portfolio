/**
 * Shared motion constants — keeps timing/easing consistent across every
 * new interactive component instead of each one picking its own numbers.
 * Mirrors the CSS tokens in variables.css (--ease-premium, --duration-*).
 */

// Premium ease-out curve for entrances/UI transitions.
export const EASE_PREMIUM = [0.16, 1, 0.3, 1];

export const DURATION = {
  micro: 0.2, // hover/tap feedback
  ui: 0.45, // normal UI transitions
  entrance: 0.8, // section/element entrances
  hero: 1.1, // hero-level entrances (upper bound)
};

// Spring presets for physics-driven components (the hanging ID card,
// magnetic buttons) — tuned for a "settles naturally" feel, not bouncy.
export const SPRING = {
  card: { type: "spring", stiffness: 120, damping: 14, mass: 1 },
  cardDrag: { type: "spring", stiffness: 200, damping: 20, mass: 0.8 },
  magnetic: { type: "spring", stiffness: 150, damping: 15, mass: 0.5 },
  gentle: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
};

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
