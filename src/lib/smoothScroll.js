import Lenis from "lenis";

let lenis = null;

/**
 * Initializes Lenis smooth-scroll once, site-wide. Respects
 * prefers-reduced-motion by simply not starting it — the page then
 * behaves exactly as it did before (native scroll), no fallback code
 * needed elsewhere.
 */
export function initSmoothScroll() {
  if (lenis) return lenis;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return null;

  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

/** Smoothly scrolls to a section by id, via Lenis when active. */
export function scrollToId(id, options = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -20, ...options });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/** Smoothly scrolls to the very top of the page, via Lenis when active. */
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
