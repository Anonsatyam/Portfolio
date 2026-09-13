// Central content store — sourced from Satyam's resume.
// Edit here to update copy across the whole site.

export const personal = {
  name: "Satyam Kumar",
  role: "Full Stack Developer — Angular, React.js & Java",
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
    role: "Software Engineer III — Thales Adaptive Connect (TAC)",
    period: "Oct 2025 — Present",
    location: "Noida, India",
    points: [
      "Working on Thales Adaptive Connect (TAC), a cloud-based connectivity management solution that automates and optimizes local network connections for IoT devices at first power-on.",
      "Managing the lifecycle of eSIM profiles across IoT and mobile devices, built on the GSMA SGP.22 and SGP.32 specifications.",
      "Contributing full-stack across the project: React.js UI, Java backend services, and end-to-end test automation with Playwright.",
    ],
    tags: ["React.js", "Java", "Playwright", "IoT", "eSIM", "GSMA SGP.22/32"],
  },
  {
    company: "Thales",
    role: "Software Engineer III",
    period: "Aug 2020 — Sep 2025",
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
      "Angular", "React.js", "Next.js", "RxJS", "NgRx", "Bootstrap", "Material UI", "Tailwind CSS",
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
    title: "OTA Cloud",
    tech: ["Angular 10/14/18", "Java", "NgRx"],
    link: null,
    points: [
      "Engineered a responsive dashboard that streamlined Over The Air (OTA) update management, enhancing operational efficiency and reducing troubleshooting time by an average of 50 hours per month for the engineering team.",
      "Migrated the application framework to Angular 18, enhancing code maintainability by reducing technical debt and increasing performance with faster load times under high user traffic.",
    ],
  },
  {
    title: "Sarkari Naukri",
    tech: ["Next.js", "React"],
    link: "https://naukari-lac.vercel.app/",
    points: [
      "Built an independent portal aggregating verified Indian government job listings, sourced directly from official notifications.",
      "Shipped an eligibility checker, smart job filters, results & admit card access, and full English/Hindi multilingual support.",
    ],
  },
  {
    title: "Random JSON Data Generator",
    tech: ["VS Code Extension API", "TypeScript"],
    link: "https://marketplace.visualstudio.com/items?itemName=SatyamSingh.randomjson",
    points: [
      "Published a VS Code extension that generates random JSON data into a temporary file for quick testing and development — 200+ installs with a 5-star rating on the Marketplace.",
      "Designed for zero-config use: install and run 'Json Data Generator' straight from the command palette.",
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
