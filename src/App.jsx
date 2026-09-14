import { useEffect } from "react";
import Navbar from "./components/Navbar";
import ScrollProgress from "./components/ScrollProgress";
import Cursor from "./components/Cursor";
import Grain from "./components/Grain";
import Loader from "./components/Loader";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { initSmoothScroll } from "./lib/smoothScroll";

export default function App() {
  useEffect(() => {
    initSmoothScroll();
  }, []);

  return (
    <>
      <Loader />
      <Cursor />
      <Grain />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
