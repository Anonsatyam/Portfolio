# Satyam Kumar — Portfolio

A modern, fully responsive personal portfolio built with React + Vite, styled in an Atlassian-inspired white / black / grey / blue palette, with scroll-triggered animations powered by Framer Motion.

## Sections
Hero · About · Experience · Skills · Projects · Education & Accomplishments · Contact

## Getting Started

```bash
npm install
npm run dev       # starts dev server at http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Editing Content
All resume-driven copy (name, role, experience, projects, skills, links) lives in one place:

```
src/data/content.js
```

Edit that file to update text without touching any component.

## Replacing the Resume File
Swap `public/Satyam_Resume_React.pdf` with an updated PDF (keep the same filename), or update `personal.resumeUrl` in `src/data/content.js` if you rename it.

## Tech Stack
- React 18 + Vite
- Framer Motion (scroll animations, counters, mobile menu transitions)
- React Icons
- Plain CSS with design tokens (`src/styles/variables.css`) — mobile-first, fluid type via `clamp()`

## Deploying
The project builds to a static `dist/` folder — deploy it to Vercel, Netlify, GitHub Pages, or any static host.
