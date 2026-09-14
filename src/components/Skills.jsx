import { motion } from "framer-motion";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import { skills } from "../data/content";
import { ICONS_3D } from "../lib/icons3d";
import "./Skills.css";

const CATEGORY_ICONS = {
  "Languages & Libraries": ICONS_3D.books,
  "Testing & Automation": ICONS_3D.robot,
  "Development Tools": ICONS_3D.wrench,
};

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
            <AnimatedHeading as="h2" className="section-title" text="Skills & Tools" />
          </div>
        </Reveal>

        <div className="skills__groups">
          {skills.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.1}>
              <div className="skills__group card">
                <div className="skills__category-head">
                  <img src={CATEGORY_ICONS[group.category]} alt="" width={32} height={32} loading="lazy" />
                  <h3 className="skills__category">{group.category}</h3>
                </div>
                <motion.div
                  className="skills__badges"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false, amount: 0.2 }}
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
