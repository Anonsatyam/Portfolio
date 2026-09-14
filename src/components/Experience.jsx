import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiMapPin, FiCalendar, FiArrowUpRight } from "react-icons/fi";
import { experience } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import JobModal from "./JobModal";
import "./Experience.css";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [activeJob, setActiveJob] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getDistance = () => track.scrollWidth - section.offsetWidth;

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(getDistance(), 1)}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => tween.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className={`experience-h section--alt ${reducedMotion ? "experience-h--static" : ""}`}
    >
      <div className="experience-h__head container">
        <span className="eyebrow">Career Journey</span>
        <h2 className="section-title">Experience</h2>
        {!reducedMotion && (
          <p className="section-subtitle">Scroll to move through the timeline — click a card for details.</p>
        )}
      </div>

      <div className="experience-h__viewport">
        <div className="experience-h__track" ref={trackRef}>
          {experience.map((job, i) => (
            <button
              key={i}
              type="button"
              className="experience-h__card card"
              onClick={() => setActiveJob(job)}
            >
              <div className="experience-h__card-top">
                <img src={ICONS_3D.briefcase} alt="" width={36} height={36} loading="lazy" />
                <FiArrowUpRight className="experience-h__expand" size={18} />
              </div>

              <h3 className="experience-h__role">{job.role}</h3>
              <p className="experience-h__company">{job.company}</p>

              <div className="experience-h__meta">
                <span><FiCalendar size={13} /> {job.period}</span>
                <span><FiMapPin size={13} /> {job.location}</span>
              </div>

              <span className="experience-h__hint">View details</span>
            </button>
          ))}
        </div>
      </div>

      <JobModal job={activeJob} onClose={() => setActiveJob(null)} />
    </section>
  );
}
