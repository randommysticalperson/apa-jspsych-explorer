/* ==========================================================
   DESIGN: "Archival Intelligence" — Warm Institutional Modernism
   Palette: Cream #FDFAF5, Navy #1B2A4A, Gold #C9922A, Sage #6B8F71
   Fonts: Lora (headings), DM Sans (body), JetBrains Mono (code)
   ========================================================== */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663332318761/U2i6nQpWEjUzrfyWBddmdj/hero-banner-awQmsQPXCwzdEuJZK6UT76.webp";
const EXPERIMENT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663332318761/U2i6nQpWEjUzrfyWBddmdj/experiment-panel-bg-C2uSUxG6MDfaofCKw6JF3G.webp";

const databases = [
  {
    id: "psycinfo",
    name: "APA PsycInfo®",
    badge: "Search & Discovery",
    badgeColor: "#1B2A4A",
    description:
      "The world's most comprehensive database of psychological science, containing over 5.4 million records spanning peer-reviewed journals, books, dissertations, and technical reports from 1806 to the present.",
    stats: "5.4M+ records",
    link: "https://www.apa.org/pubs/databases/psycinfo",
    icon: "🔍",
  },
  {
    id: "psycextra",
    name: "APA PsycExtra®",
    badge: "Grey Literature",
    badgeColor: "#6B8F71",
    description:
      "A companion database to PsycInfo covering grey literature including reports, policy briefs, conference papers, newsletters, and consumer-oriented materials not found in traditional academic databases.",
    stats: "900K+ documents",
    link: "https://www.apa.org/pubs/databases/psycextra",
    icon: "📋",
  },
  {
    id: "psycnet",
    name: "APA PsycNet®",
    badge: "Platform",
    badgeColor: "#C9922A",
    description:
      "The premier search and discovery platform designed exclusively to deliver APA content, integrating PsycInfo, PsycArticles, PsycBooks, and more into a unified, researcher-optimized interface.",
    stats: "Unified access",
    link: "https://psycnet.apa.org",
    icon: "🌐",
  },
  {
    id: "psycarticles",
    name: "APA PsycArticles®",
    badge: "Full-Text Journals",
    badgeColor: "#1B2A4A",
    description:
      "Full-text access to over 90 APA and allied organization journals, including flagship titles such as Psychological Review, Journal of Experimental Psychology, and American Psychologist.",
    stats: "90+ APA journals",
    link: "https://www.apa.org/pubs/databases/psycarticles",
    icon: "📄",
  },
  {
    id: "psycbooks",
    name: "APA PsycBooks®",
    badge: "Full-Text Books",
    badgeColor: "#6B8F71",
    description:
      "Access to more than 400 APA-published book titles in full text, including the APA Handbooks in Psychology series, classic monographs, and contemporary reference works.",
    stats: "400+ book titles",
    link: "https://www.apa.org/pubs/databases/psycbooks",
    icon: "📚",
  },
  {
    id: "psyctherapy",
    name: "APA PsycTherapy®",
    badge: "Video",
    badgeColor: "#C9922A",
    description:
      "A streaming video database of psychotherapy demonstrations featuring leading clinicians. Includes over 300 sessions illustrating evidence-based therapeutic techniques across major modalities.",
    stats: "300+ video sessions",
    link: "https://www.apa.org/pubs/databases/psyctherapy",
    icon: "🎬",
  },
  {
    id: "psyctests",
    name: "APA PsycTests®",
    badge: "Tests & Measures",
    badgeColor: "#1B2A4A",
    description:
      "A database of psychological tests, measures, scales, surveys, and other assessment instruments. Provides test records with reliability, validity, and normative data where available.",
    stats: "20K+ test records",
    link: "https://www.apa.org/pubs/databases/psyctests",
    icon: "📊",
  },
  {
    id: "academicwriter",
    name: "Academic Writer®",
    badge: "Writing Tool",
    badgeColor: "#6B8F71",
    description:
      "An APA Style writing and formatting tool that guides researchers and students through the process of creating APA-compliant manuscripts, citations, and reference lists with real-time guidance.",
    stats: "APA 7th Edition",
    link: "https://www.apa.org/pubs/databases/academic-writer",
    icon: "✍️",
  },
];

const jspsychPlugins = [
  { name: "html-keyboard-response", use: "Display HTML and record key presses with precise timing" },
  { name: "html-button-response", use: "Display HTML stimuli with clickable button responses" },
  { name: "survey-likert", use: "Present Likert-scale rating questions" },
  { name: "survey-multi-choice", use: "Multiple choice questions with single answer" },
  { name: "instructions", use: "Multi-page instruction screens with navigation" },
  { name: "image-keyboard-response", use: "Display images and record key press responses" },
  { name: "audio-keyboard-response", use: "Play audio and record key press responses" },
  { name: "free-sort", use: "Drag-and-drop card sorting tasks" },
  { name: "visual-search-circle", use: "Target detection in circular stimulus arrays" },
  { name: "serial-reaction-time", use: "Classic SRT task with colored box cues" },
];

function useIntersectionObserver(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFAF5", color: "#2C2C2C" }}>
      {/* ── HEADER ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-md backdrop-blur-md" : ""
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(27,42,74,0.97)" : "#1B2A4A",
        }}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "Lora, serif" }}
            >
              Ψ
            </div>
            <span className="font-semibold text-white tracking-wide" style={{ fontFamily: "Lora, serif" }}>
              APA <span style={{ color: "#C9922A" }}>×</span> jsPsych
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#databases" className="hover:text-yellow-300 transition-colors">Databases</a>
            <a href="#about-jspsych" className="hover:text-yellow-300 transition-colors">jsPsych</a>
            <a href="#experiment" className="hover:text-yellow-300 transition-colors">Experiment</a>
            <Link href="/experiment">
              <button
                className="px-4 py-1.5 rounded text-sm font-medium transition-all"
                style={{ backgroundColor: "#C9922A", color: "#1B2A4A" }}
              >
                Launch Lab →
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(27,42,74,0.88) 0%, rgba(27,42,74,0.55) 60%, rgba(27,42,74,0.2) 100%)" }} />

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-10" style={{ backgroundColor: "#C9922A" }} />
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "#C9922A", fontFamily: "DM Sans, sans-serif" }}>
                Psychology Research & Experimentation
              </span>
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white fade-up"
              style={{ fontFamily: "Lora, serif" }}
            >
              APA Publications
              <br />
              <span style={{ color: "#E8B84B" }}>& jsPsych</span>
              <br />
              Explorer
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed fade-up fade-up-delay-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Explore the world's most comprehensive psychology databases — then step into the lab
              and run a live behavioral experiment powered by <strong className="text-white">jsPsych v7</strong>.
            </p>
            <div className="flex flex-wrap gap-4 fade-up fade-up-delay-2">
              <a href="#databases">
                <button
                  className="px-6 py-3 rounded font-medium text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "DM Sans, sans-serif" }}
                >
                  Explore Databases
                </button>
              </a>
              <Link href="/experiment">
                <button
                  className="px-6 py-3 rounded font-medium text-sm border transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.5)", color: "white", fontFamily: "DM Sans, sans-serif" }}
                >
                  Run Experiment →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs">
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>Scroll to explore</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ backgroundColor: "#1B2A4A" }}>
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "5.4M+", label: "PsycInfo Records" },
              { value: "90+", label: "Full-Text Journals" },
              { value: "400+", label: "eBook Titles" },
              { value: "300+", label: "Therapy Videos" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold mb-1" style={{ color: "#E8B84B", fontFamily: "Lora, serif" }}>
                  {stat.value}
                </div>
                <div className="text-sm text-white/60" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATABASES SECTION ── */}
      <section id="databases" className="py-20" style={{ backgroundColor: "#FDFAF5" }}>
        <div className="container">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1" style={{ backgroundColor: "#C9922A", maxWidth: "40px" }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: "#C9922A", fontFamily: "DM Sans, sans-serif" }}>
                01 — Publications & Databases
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#1B2A4A", fontFamily: "Lora, serif" }}>
              APA Databases &<br />Electronic Resources
            </h2>
            <p className="text-base max-w-2xl mb-12" style={{ color: "#555", fontFamily: "DM Sans, sans-serif", lineHeight: 1.8 }}>
              The American Psychological Association produces a suite of world-renowned databases and
              electronic resources designed to support researcher, clinician, and student success across
              the full breadth of psychological science and related disciplines.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {databases.map((db, i) => (
              <AnimatedSection key={db.id}>
                <a
                  href={db.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full rounded-lg border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    backgroundColor: "#fff",
                    borderColor: "#E8E0D0",
                    boxShadow: "0 2px 8px rgba(27,42,74,0.06)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{db.icon}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${db.badgeColor}18`,
                        color: db.badgeColor,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {db.badge}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-base mb-2 group-hover:underline"
                    style={{ color: "#1B2A4A", fontFamily: "Lora, serif" }}
                  >
                    {db.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "#666", fontFamily: "DM Sans, sans-serif" }}>
                    {db.description}
                  </p>
                  <div
                    className="text-xs font-medium mono"
                    style={{ color: "#C9922A", fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {db.stats}
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT JSPSYCH ── */}
      <section id="about-jspsych" className="py-20" style={{ backgroundColor: "#F0EAD6" }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px" style={{ backgroundColor: "#C9922A", width: "40px" }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: "#C9922A", fontFamily: "DM Sans, sans-serif" }}>
                  02 — The Framework
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: "#1B2A4A", fontFamily: "Lora, serif" }}>
                What is jsPsych?
              </h2>
              <p className="text-base leading-relaxed mb-5" style={{ color: "#444", fontFamily: "DM Sans, sans-serif" }}>
                <strong>jsPsych</strong> is an open-source JavaScript framework for creating behavioral experiments
                that run entirely in a web browser. Developed by Josh de Leeuw and maintained by a global
                community of researchers, it has become one of the most widely adopted tools for online
                psychological experimentation.
              </p>
              <p className="text-base leading-relaxed mb-5" style={{ color: "#444", fontFamily: "DM Sans, sans-serif" }}>
                Experiments are constructed by assembling <em>plugins</em> — modular units that each define a
                distinct trial type, such as displaying an image, playing audio, or presenting a survey.
                These plugins are arranged into a <strong>timeline</strong>, which jsPsych executes sequentially,
                collecting response data at each step.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#444", fontFamily: "DM Sans, sans-serif" }}>
                Version 7 introduced a fully modular architecture, allowing researchers to import only the
                plugins they need via npm or CDN, dramatically reducing bundle size and improving
                experiment loading performance.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#D4C9B0" }}>
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ backgroundColor: "#1B2A4A" }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-white/50 mono" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    experiment.js
                  </span>
                </div>
                <pre
                  className="p-5 text-xs overflow-x-auto leading-relaxed"
                  style={{
                    backgroundColor: "#0D1B33",
                    color: "#E8B84B",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >{`const jsPsych = initJsPsych();

const welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Welcome!</p>",
  choices: "ALL_KEYS",
};

const fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div class="fixation">+</div>',
  choices: "NO_KEYS",
  trial_duration: 500,
};

const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Press F or J</p>",
  choices: ["f", "j"],
};

jsPsych.run([welcome, fixation, trial]);`}</pre>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Plugin-based", desc: "Modular trial types" },
                  { label: "Timeline-driven", desc: "Sequential execution" },
                  { label: "Browser-native", desc: "No server required" },
                  { label: "Data export", desc: "JSON / CSV output" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="rounded p-3 border"
                    style={{ backgroundColor: "#fff", borderColor: "#D4C9B0" }}
                  >
                    <div className="font-semibold text-sm mb-0.5" style={{ color: "#1B2A4A", fontFamily: "Lora, serif" }}>
                      {f.label}
                    </div>
                    <div className="text-xs" style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}>
                      {f.desc}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Plugin table */}
          <AnimatedSection className="mt-16">
            <h3 className="text-2xl font-bold mb-6" style={{ color: "#1B2A4A", fontFamily: "Lora, serif" }}>
              Key Plugins in jsPsych v7
            </h3>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "#D4C9B0" }}>
              <table className="w-full text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1B2A4A", color: "#FDFAF5" }}>
                    <th className="text-left px-4 py-3 font-semibold">Plugin Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Primary Use</th>
                  </tr>
                </thead>
                <tbody>
                  {jspsychPlugins.map((p, i) => (
                    <tr
                      key={p.name}
                      style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#F7F2EA" }}
                    >
                      <td className="px-4 py-3 font-medium mono" style={{ color: "#C9922A", fontFamily: "JetBrains Mono, monospace" }}>
                        {p.name}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#444" }}>{p.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── EXPERIMENT CTA ── */}
      <section
        id="experiment"
        className="relative py-24 overflow-hidden"
        style={{
          backgroundImage: `url(${EXPERIMENT_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(13,27,51,0.88)" }} />
        <div className="container relative z-10 text-center">
          <AnimatedSection>
            <div className="inline-block mb-4 px-3 py-1 rounded-full text-xs uppercase tracking-widest border"
              style={{ borderColor: "rgba(201,146,42,0.5)", color: "#E8B84B", fontFamily: "DM Sans, sans-serif" }}>
              03 — Live Experiment
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Lora, serif" }}>
              Step into the Lab
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10" style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.8 }}>
              Experience a real jsPsych v7 experiment in your browser. The simulation includes a
              <strong className="text-white"> Reaction Time task</strong> and a{" "}
              <strong className="text-white">Psychology Survey</strong> — both fully interactive
              with live data collection and results display.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/experiment">
                <button
                  className="px-8 py-4 rounded font-semibold text-base transition-all hover:opacity-90 hover:scale-105"
                  style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "DM Sans, sans-serif" }}
                >
                  🧪 Launch Experiment
                </button>
              </Link>
              <a href="https://www.jspsych.org/v7/" target="_blank" rel="noopener noreferrer">
                <button
                  className="px-8 py-4 rounded font-semibold text-base border transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", fontFamily: "DM Sans, sans-serif" }}
                >
                  jsPsych Docs ↗
                </button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: "#1B2A4A" }}>
        <div className="container py-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "Lora, serif" }}
                >
                  Ψ
                </div>
                <span className="font-semibold text-white" style={{ fontFamily: "Lora, serif" }}>
                  APA × jsPsych Explorer
                </span>
              </div>
              <p className="text-sm text-white/50 max-w-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                An educational resource summarizing APA Publications & Databases with live jsPsych v7 experiment simulations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="font-semibold text-white mb-3" style={{ fontFamily: "Lora, serif" }}>APA Resources</div>
                <ul className="space-y-2 text-white/50" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  <li><a href="https://www.apa.org" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">APA.org</a></li>
                  <li><a href="https://psycnet.apa.org" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">PsycNet</a></li>
                  <li><a href="https://www.apa.org/pubs/databases" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">All Databases</a></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-white mb-3" style={{ fontFamily: "Lora, serif" }}>jsPsych</div>
                <ul className="space-y-2 text-white/50" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  <li><a href="https://www.jspsych.org/v7/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">Documentation</a></li>
                  <li><a href="https://github.com/jspsych/jsPsych" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">GitHub</a></li>
                  <li><Link href="/experiment" className="hover:text-yellow-300">Live Demo</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/30 text-center" style={{ fontFamily: "DM Sans, sans-serif" }}>
            This is an educational demonstration. APA® and PsycInfo® are registered trademarks of the American Psychological Association.
            jsPsych is open-source software licensed under MIT.
          </div>
        </div>
      </footer>
    </div>
  );
}
