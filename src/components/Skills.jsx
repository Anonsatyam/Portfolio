import { motion } from "framer-motion";
import Reveal from "./Reveal";
import AnimatedHeading from "./AnimatedHeading";
import Icon from "../lib/icons";
import Marquee from "./Marquee";
import { skills, marqueeStack } from "../data/content";
import "./Skills.css";

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
              The languages, frameworks and tools I've built and shipped production software with.
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
                      key={skill}
                      className="skills__badge"
                      variants={item}
                      whileHover={{ scale: 1.06, y: -2 }}
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

      <div className="skills__marquee">
        <Marquee items={marqueeStack} speed={32} />
      </div>
    </section>
  );
}
