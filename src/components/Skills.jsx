import { motion } from "framer-motion";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import Icon from "../lib/icons";
import Marquee from "./Marquee";
import { skills } from "../data/content";
import "./Skills.css";

// The core stack, called out again as a moving band under the grid.
const MARQUEE_ITEMS = skills.flatMap((g) => g.items.filter((i) => i.core).map((i) => i.name));

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <Reveal variant="heading">
          <div className="section-head">
            <span className="eyebrow"><span className="eyebrow__num">03</span>What I Know</span>
            <AnimatedHeading as="h2" className="section-title" text="The Stack I Build With" />
            <p className="section-subtitle">
              Highlighted below is what I work in day to day — the rest I've shipped with and can pick back up.
            </p>
          </div>
        </Reveal>

        <div className="skills__groups">
          {skills.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.1}>
              <div className="skills__group card">
                <div className="skills__category-head">
                  <Icon name={group.icon} size={18} className="icon-tile--sm" />
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
                      key={skill.name}
                      className={`skills__badge ${skill.core ? "is-core" : ""}`}
                      variants={item}
                      whileHover={{ scale: 1.06, y: -2 }}
                    >
                      {skill.name}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="skills__marquee">
        <Marquee items={MARQUEE_ITEMS} speed={32} />
      </div>
    </section>
  );
}
