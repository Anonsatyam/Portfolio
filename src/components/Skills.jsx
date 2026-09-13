import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { skills } from "../data/content";
import "./Skills.css";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">What I Know</span>
            <h2 className="section-title">Skills &amp; Tools</h2>
          </div>
        </Reveal>

        <div className="skills__groups">
          {skills.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.1}>
              <div className="skills__group card">
                <h3 className="skills__category">{group.category}</h3>
                <motion.div
                  className="skills__badges"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {group.items.map((skill) => (
                    <motion.span
                      key={skill}
                      className="tag skills__badge"
                      variants={item}
                      whileHover={{ scale: 1.08, y: -2 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
