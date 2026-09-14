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

// Every figure here is pulled from the experience bullets below — no
// number appears on the site that isn't backed by real work.
export const stats = [
  { value: 75, suffix: "%", label: "Fewer integration issues", detail: "after building out CI/CD" },
  { value: 40, suffix: "%", label: "Faster data retrieval", detail: "across SIM service APIs" },
  { value: 30, suffix: "%", label: "Faster load times", detail: "from NgRx optimisation" },
  { value: 200, suffix: "+", label: "Extension installs", detail: "5-star rated on the Marketplace" },
];

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
    points: [
      "Spearheaded the design and development of the COTA dashboard using Angular 10, leading migration to Angular 14 and 18 to enhance performance and maintainability.",
      "Developed a CI/CD pipeline doubling release frequency and cutting integration issues by 75%.",
      "Engineered and deployed robust Java-based APIs targeting SIM service functionalities, improving data retrieval efficiency by 40% while ensuring seamless integration with existing systems.",
      "Optimized NgRx for faster data retrieval, cutting load times by 30%.",
    ],
    tags: ["Angular", "Java", "NgRx", "Robot Framework", "CI/CD"],
  },
];

// `core: true` marks the stack actually worked in day to day, so the
// UI can weight it instead of showing thirty identical chips.
export const skills = [
  {
    category: "Frontend",
    icon: "code",
    items: [
      { name: "React.js", core: true },
      { name: "Angular", core: true },
      { name: "TypeScript", core: true },
      { name: "JavaScript", core: true },
      { name: "Next.js" },
      { name: "RxJS" },
      { name: "NgRx" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "SCSS" },
      { name: "Tailwind CSS" },
      { name: "Material UI" },
      { name: "Bootstrap" },
    ],
  },
  {
    category: "Backend & Testing",
    icon: "server",
    items: [
      { name: "Java", core: true },
      { name: "REST APIs", core: true },
      { name: "Playwright", core: true },
      { name: "Robot Framework" },
      { name: "Selenium" },
      { name: "Cypress" },
      { name: "Karma" },
      { name: "Jasmine" },
    ],
  },
  {
    category: "Tooling & Delivery",
    icon: "tool",
    items: [
      { name: "CI/CD", core: true },
      { name: "Git", core: true },
      { name: "Docker" },
      { name: "Kubernetes" },
      { name: "Jenkins" },
      { name: "WebPack" },
      { name: "Gulp" },
      { name: "Grunt" },
      { name: "Mercurial" },
    ],
  },
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
