// Central content store — sourced from Satyam's resume.
// Edit here to update copy across the whole site.

export const personal = {
  name: "Satyam Kumar",
  role: "Full Stack Developer — React.js & Java",
  location: "Noida, India",
  email: "satyamdeveloper98@gmail.com",
  linkedin: "https://in.linkedin.com/in/satyam-js",
  github: "https://github.com/Anonsatyam",
  resumeUrl: "/Satyam_Resume_React.pdf",
  tagline:
    "I build fast, reliable web applications — from pixel-perfect React UIs to robust Java APIs — and love turning complex problems into clean, maintainable software.",
};

export const stats = [
  { value: 95, suffix: "%", label: "Code Coverage Achieved" },
  { value: 30, suffix: "%", label: "Faster Feature Delivery" },
  { value: 25, suffix: "%", label: "Dashboard Perf. Boost" },
  { value: 40, suffix: "%", label: "API Efficiency Gain" },
];

export const about = {
  summary:
    "Software Engineer specializing in Angular, React.js, Java, and full-stack development. Currently working as a Full Stack React & Java Developer, building telecom-grade dashboards and APIs used to manage SIM provisioning and Over-The-Air (OTA) updates at scale.",
  highlights: [
    "Attained 95% code coverage with automated testing frameworks, enhancing software reliability.",
    "Directed a specialized team to accelerate feature delivery by 30% through CI/CD pipeline implementation.",
    "Boosted performance of the COTA dashboard by 25% after migrating to Angular 14 and 18.",
    "Developed a React.js-based UI for OTA-FLY, optimizing user interactions and telecom SIM management.",
  ],
};

export const experience = [
  {
    company: "Thales",
    role: "Software Engineer III",
    period: "Aug 2020 — Present",
    location: "Noida, India",
    points: [
      "Spearheaded the design and development of the COTA dashboard using Angular 10, leading migration to Angular 14 and 18 to enhance performance and maintainability.",
      "Created a React.js UI for OTA-FLY, enhancing user interactions and SIM management for telecom operators.",
      "Ensured 95% code coverage with Karma and Jasmine. Authored and standardized Global Goods Testing Standards (GGTS) using Selenium and Robot Framework, improving test consistency across teams.",
      "Streamlined UI testing processes through successful implementation of Playwright; achieved a reduction in manual efforts of over 60%.",
      "Developed a CI/CD pipeline doubling release frequency and cutting integration issues by 75%.",
      "Engineered and deployed robust Java-based APIs targeting SIM service functionalities, improving data retrieval efficiency by 40% while ensuring seamless integration with existing systems.",
      "Optimized NgRx for faster data retrieval, cutting load times by 30%.",
    ],
    tags: ["Angular", "React.js", "Java", "NgRx", "Playwright", "CI/CD"],
  },
];

export const skills = [
  {
    category: "Languages & Libraries",
    items: [
      "HTML", "CSS", "SCSS", "JavaScript", "TypeScript", "Java",
      "Angular", "React.js", "RxJS", "NgRx", "Bootstrap", "Material UI", "Tailwind CSS",
    ],
  },
  {
    category: "Testing & Automation",
    items: ["Karma", "Jasmine", "Playwright", "Selenium", "Robot Framework", "Cypress"],
  },
  {
    category: "Development Tools",
    items: ["Gulp", "Grunt", "WebPack", "Docker", "Kubernetes", "Git", "Mercurial", "Jenkins", "CI/CD"],
  },
];

export const projects = [
  {
    title: "COTA Dashboard",
    tech: ["Angular 10/14/18", "Java", "NgRx"],
    points: [
      "Engineered a responsive dashboard that streamlined Over The Air (OTA) update management, enhancing operational efficiency and reducing troubleshooting time by an average of 50 hours per month for the engineering team.",
      "Migrated the application framework to Angular 18, enhancing code maintainability by reducing technical debt and increasing performance with faster load times under high user traffic.",
    ],
  },
  {
    title: "AOTA (Advance Over The Air) Solution",
    tech: ["Angular", "Java", "Microservices"],
    points: [
      "Designed and implemented an advanced AOTA solution that enabled seamless SIM updates, improving efficiency in remote provisioning processes for over 10,000 devices with zero downtime during transitions.",
      "Optimized remote SIM provisioning processes, improving speed of device activation by 40% and enhancing overall security protocols to safeguard sensitive user data.",
    ],
  },
  {
    title: "OTA-FLY Platform",
    tech: ["React.js", "Java", "Docker", "CI/CD"],
    points: [
      "Built a React.js-based web solution for telecom operators to manage SIM updates.",
      "Developed a CI/CD pipeline for automated deployment.",
    ],
  },
];

export const education = {
  degree: "Bachelor of Technology in Computer Science",
  period: "Aug 2016 — May 2020",
  school: "Jaipur National University, Jaipur",
};

export const accomplishments = [
  {
    title: "TIIS Hackathon — First Prize",
    detail: "Showcased expertise in migration tools for the Trust Nest platform.",
  },
];

export const navLinks = [
  { label: "Home", to: "hero" },
  { label: "About", to: "about" },
  { label: "Experience", to: "experience" },
  { label: "Skills", to: "skills" },
  { label: "Projects", to: "projects" },
  { label: "Education", to: "education" },
  { label: "Contact", to: "contact" },
];
