import { prefersReducedMotion } from "./motion";

const KEY = "theme";
const CHROME = { dark: "#000000", light: "#ffffff" };

/** The theme currently on the page — set before first paint by index.html. */
export function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function apply(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", CHROME[theme]);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still works for this visit.
  }
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

/**
 * Switches theme with a circular reveal spreading from the toggle.
 *
 * The View Transitions API snapshots the old page and animates the new
 * one in over it, so every colour on the page changes in one composited
 * wipe. Without it, each element's own CSS transition would fire at its
 * own speed and the page would change colour in visible, uneven waves.
 * Where the API is missing, or motion is reduced, it simply switches.
 */
export function setTheme(theme, origin) {
  if (theme === getTheme()) return;

  if (!document.startViewTransition || prefersReducedMotion()) {
    apply(theme);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  // Far enough to cover the furthest corner from the origin.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(() => apply(theme));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {});
}
