import { motionValue } from "framer-motion";

/**
 * The line between the spider and the ID card.
 *
 * The spider pulls: `x`/`y` are added straight into the card's position
 * and `spin` (degrees) into its rotation, so a tug moves the card through
 * its own spring physics — the coil stretches, the card swings — exactly
 * as a mouse drag does. Spin is there because a card pulled by one
 * corner turns about its hook rather than sliding.
 *
 * The web itself is rendered inside the card (into .id-card__web-slot),
 * so it inherits every transform the card has and cannot come loose.
 *
 * Motion values at module level, so both components can use them at
 * render time regardless of which mounts first.
 */
export const cardTug = {
  x: motionValue(0),
  y: motionValue(0),
  spin: motionValue(0),
  // Set by the card while someone has hold of it; the spider leaves it alone.
  dragging: false,
};
