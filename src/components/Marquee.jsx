import "./Marquee.css";

// The track has to be at least twice the viewport width for a -50%
// translate to loop seamlessly. One pass of a short list isn't wide
// enough on a big screen, which left a gap trailing the last item, so
// the list is repeated before being doubled — and the duration scales
// with it so the perceived speed stays the same.
const REPEAT = 3;

export default function Marquee({ items, speed = 40 }) {
  const half = Array.from({ length: REPEAT }, () => items).flat();
  const track = [...half, ...half];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track" style={{ "--marquee-speed": `${speed * REPEAT}s` }}>
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
