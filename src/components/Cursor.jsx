import { useEffect, useRef, useState } from "react";
import "./Cursor.css";

const HOVER_SELECTOR = "a, button, .card, [data-cursor-hover]";
// Elements that say what they do when you reach them, rather than
// showing the same generic ring everywhere.
const LABEL_SELECTOR = "[data-cursor-label]";

/**
 * A custom designer cursor: a small dot that tracks the mouse instantly,
 * and a larger ring that trails behind with easing. The ring grows and
 * fills in when hovering interactive elements. Desktop/mouse only —
 * skipped entirely on touch devices, where a custom cursor makes no sense.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(isFinePointer && !prefersReduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const tick = () => {
      // Ease the ring toward the pointer for a soft trailing feel.
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) setHovering(true);
      const labelled = e.target.closest?.(LABEL_SELECTOR);
      if (labelled) setLabel(labelled.getAttribute("data-cursor-label") || "");
    };
    const onOut = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) setHovering(false);
      if (e.target.closest?.(LABEL_SELECTOR)) setLabel("");
    };
    const onLeaveWindow = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnterWindow = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);
    raf = requestAnimationFrame(tick);
    document.body.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? "cursor-ring--hover" : ""} ${label ? "cursor-ring--labelled" : ""}`}
        aria-hidden="true"
      >
        <span className="cursor-ring__label">{label}</span>
      </div>
    </>
  );
}
