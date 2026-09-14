import "./ProjectMockup.css";

// A browser-chrome frame around a hand-built HTML/CSS mockup of the
// project's UI — there are no real screenshots to show, so this is an
// illustrative stand-in, not a claim of an actual capture.
export default function ProjectMockup({ url, children }) {
  return (
    <div className="project-mockup" aria-hidden="true">
      <div className="project-mockup__bar">
        <div className="project-mockup__dots">
          <span />
          <span />
          <span />
        </div>
        {url && <div className="project-mockup__url">{url}</div>}
      </div>
      <div className="project-mockup__body">{children}</div>
    </div>
  );
}
