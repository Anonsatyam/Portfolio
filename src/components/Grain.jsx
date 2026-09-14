import "./Grain.css";

// A static film-grain texture over the whole page — subtle enough to
// avoid banding on the flat dark surfaces without ever animating (no
// GPU cost beyond one composited layer).
export default function Grain() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
