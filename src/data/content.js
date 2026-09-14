// Central content store — sourced from Satyam's resume.
// Edit here to update copy across the whole site.

export const personal = {
  name: "Satyam Kumar",
  role: "Full Stack Developer — Angular, React.js & Java",
  location: "Noida, India",
  email: "satyamdeveloper98@gmail.com",
  linkedin: "https://in.linkedin.com/in/satyam-js",
  github: "https://github.com/Anonsatyam",
  instagram: "https://www.instagram.com/satyam.js",
  resumeUrl: "/Satyam_Resume_React.pdf",
  careerStart: "2020-08", // used to keep the years-of-experience stat current
  tagline:
    "I build the interfaces that manage SIM, eSIM and IoT connectivity at carrier scale — Angular and React on the front, Java underneath.",
};

export const availability = {
  open: true,
  label: "Open to Full Stack / Frontend roles",
};

export const about = {
  summary:
    "Full Stack Developer building fast, scalable interfaces in Angular and React.js, backed by Java APIs — currently shipping SIM, eSIM, and IoT device management software.",
  highlights: [
    "I care about clean, maintainable code as much as working features — the kind the next developer can actually read.",
    "I own problems end-to-end: UI, backend APIs, and the test automation that keeps it all honest.",
    "Right now I'm deep in IoT and eSIM connectivity, building on GSMA SGP.22/32 standards.",
  ],
};

export const whatIDo = [
  {
    icon: "layout",
    title: "Frontend Engineering",
    description: "Angular & React interfaces that are fast, accessible, and pixel-perfect.",
  },
  {
    icon: "server",
    title: "Backend & APIs",
    description: "Java services and REST APIs built for reliability at scale.",
  },
  {
    icon: "check",
    title: "Testing & Automation",
    description: "CI/CD pipelines and end-to-end suites that keep releases safe and fast.",
  },
  {
    icon: "wifi",
    title: "IoT & Connectivity",
    description: "eSIM lifecycle and device connectivity built on GSMA standards.",
  },
];

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
    role: "Software Engineer III — OTA Cloud",
    period: "Aug 2020 — Sep 2025",
    location: "Noida, India",
    // Shown as a metric row inside this role's card, so each figure is
    // read against the work that produced it.
    metrics: [
      { value: 75, suffix: "%", label: "fewer integration issues" },
      { value: 40, suffix: "%", label: "faster data retrieval" },
      { value: 30, suffix: "%", label: "faster load times" },
    ],
    // The figures live in `metrics` above — these describe the work
    // itself so the same numbers aren't stated twice in one card.
    points: [
      "Spearheaded the design and development of the COTA dashboard in Angular 10, then led its migration to Angular 14 and 18.",
      "Built the CI/CD pipeline that doubled release frequency.",
      "Engineered and deployed Java-based APIs for SIM service functionality, integrating cleanly with the existing systems.",
      "Optimised NgRx state management across the dashboard.",
    ],
    tags: ["Angular", "Java", "NgRx", "Robot Framework", "CI/CD"],
  },
];

export const skills = [
  {
    category: "Frontend",
    icon: "code",
    items: [
      "React.js",
      "Angular",
      "TypeScript",
      "JavaScript",
      "Next.js",
      "RxJS",
      "NgRx",
      "HTML",
      "CSS",
      "SCSS",
      "Tailwind CSS",
      "Material UI",
      "Bootstrap",
    ],
  },
  {
    category: "Backend & Testing",
    icon: "server",
    items: [
      "Java",
      "REST APIs",
      "Playwright",
      "Robot Framework",
      "Selenium",
      "Cypress",
      "Karma",
      "Jasmine",
    ],
  },
  {
    category: "Tooling & Delivery",
    icon: "tool",
    items: [
      "CI/CD",
      "Git",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "WebPack",
      "Gulp",
      "Grunt",
      "Mercurial",
    ],
  },
];

// Shown in the marquee under the skills grid.
export const marqueeStack = [
  "React.js",
  "Angular",
  "TypeScript",
  "Java",
  "Next.js",
  "Playwright",
  "NgRx",
  "CI/CD",
];

export const projects = [
  {
    title: "Sarkari Naukri",
    tech: ["Next.js", "React"],
    link: "https://naukari-lac.vercel.app/",
    previewLabel: "naukari-lac.vercel.app",
    summary: "A live job portal I designed, built and shipped end to end.",
    points: [
      "Independent portal for verified Indian government job listings, sourced from official notifications.",
      "Eligibility checker, smart filters, results and admit card access.",
      "Full English/Hindi multilingual support across the whole product.",
    ],
  },
  {
    title: "Random JSON Data Generator",
    tech: ["VS Code Extension API", "TypeScript"],
    link: "https://marketplace.visualstudio.com/items?itemName=SatyamSingh.randomjson",
    previewLabel: "marketplace.visualstudio.com",
    summary: "A developer tool published on the VS Code Marketplace.",
    points: [
      "Generates random JSON data into a temp file for quick testing and development.",
      "200+ installs with a 5-star rating on the Marketplace.",
      "Zero-config: run 'Json Data Generator' straight from the command palette.",
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
