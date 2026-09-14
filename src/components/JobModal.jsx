import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiCalendar, FiMapPin } from "react-icons/fi";
import { ICONS_3D } from "../lib/icons3d";
import "./JobModal.css";

export default function JobModal({ job, onClose }) {
  useEffect(() => {
    if (!job) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [job, onClose]);

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          className="job-modal__overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="job-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="job-modal__close" onClick={onClose} aria-label="Close">
              <FiX size={22} />
            </button>

            <div className="job-modal__top">
              <img src={ICONS_3D.briefcase} alt="" width={44} height={44} loading="lazy" />
              <div className="job-modal__meta">
                <span><FiCalendar size={14} /> {job.period}</span>
                <span><FiMapPin size={14} /> {job.location}</span>
              </div>
            </div>

            <h3 id="job-modal-title" className="job-modal__role">{job.role}</h3>
            <p className="job-modal__company">{job.company}</p>

            <ul className="job-modal__points">
              {job.points.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>

            <div className="job-modal__tags">
              {job.tags.map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
