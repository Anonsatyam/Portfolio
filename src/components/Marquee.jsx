import "./Marquee.css";

// Pure CSS, duplicated track — no JS ticking a transform every frame.
// Pauses on hover and stops entirely under prefers-reduced-motion.
export default function Marquee({ items, speed = 40 }) {
  const track = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track" style={{ "--marquee-speed": `${speed}s` }}>
        {track.map((label, i) => (
          <span className="marquee__item" key={`${label}-${i}`}>
            {label}
            <span className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
