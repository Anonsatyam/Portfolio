import { useEffect } from "react";

// A single delegated listener feeds every .card on the site its pointer
// position, so the glow in global.css can track the cursor without each
// card component wiring up its own handlers.
export default function CardHover() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e) => {
      const card = e.target.closest?.(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
