/* ==========================================================
   DESIGN: "Archival Intelligence" — Experiment Lab Panel
   Dark navy console with gold accents
   jsPsych v7 loaded via CDN in index.html
   ========================================================== */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

declare const initJsPsych: any;
declare const jsPsychHtmlKeyboardResponse: any;
declare const jsPsychHtmlButtonResponse: any;
declare const jsPsychSurveyLikert: any;
declare const jsPsychSurveyMultiChoice: any;
declare const jsPsychInstructions: any;

const EXPERIMENT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663332318761/U2i6nQpWEjUzrfyWBddmdj/experiment-panel-bg-C2uSUxG6MDfaofCKw6JF3G.webp";

type ExperimentResult = {
  trial_type: string;
  rt: number | null;
  response: string | null;
  stimulus?: string;
  correct?: boolean;
  time_elapsed: number;
};

type ExperimentMode = "idle" | "running" | "done";

export default function ExperimentPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ExperimentMode>("idle");
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<"reaction" | "survey">("reaction");
  const jsPsychRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jsPsychRef.current) {
        try { jsPsychRef.current.endExperiment(); } catch {}
      }
    };
  }, []);

  function runReactionTimeExperiment() {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    setMode("running");
    setResults([]);

    const jsPsych = initJsPsych({
      display_element: containerRef.current,
      on_finish: () => {
        const data: ExperimentResult[] = jsPsych.data.get().values();
        setResults(data);
        setMode("done");
      },
    });
    jsPsychRef.current = jsPsych;

    const welcome = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align:center; font-family:'DM Sans',sans-serif; color:#FDFAF5; max-width:500px; margin:0 auto;">
          <div style="font-size:48px; margin-bottom:16px;">⚡</div>
          <h2 style="font-family:'Lora',serif; font-size:28px; color:#E8B84B; margin-bottom:12px;">Reaction Time Task</h2>
          <p style="font-size:16px; color:#ccc; line-height:1.7; margin-bottom:24px;">
            A classic cognitive psychology paradigm measuring simple and choice reaction time.
            You will see a colored circle appear on screen — press <kbd style="background:#C9922A;color:#1B2A4A;padding:2px 8px;border-radius:4px;font-weight:bold;">SPACE</kbd> as fast as possible.
          </p>
          <p style="font-size:14px; color:#888;">Press any key to begin.</p>
        </div>`,
      choices: "ALL_KEYS",
    };

    const fixation = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="font-size:48px; color:#E8B84B; text-align:center; margin-top:80px;">+</div>`,
      choices: "NO_KEYS",
      trial_duration: () => Math.floor(Math.random() * 1000) + 500,
    };

    const stimuli = [
      { color: "#4CAF50", label: "Green" },
      { color: "#2196F3", label: "Blue" },
      { color: "#FF9800", label: "Orange" },
      { color: "#E91E63", label: "Pink" },
      { color: "#9C27B0", label: "Purple" },
    ];

    const trials = stimuli.map((s) => ({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="text-align:center; margin-top:60px;">
          <div style="
            width:120px; height:120px; border-radius:50%;
            background:${s.color};
            margin:0 auto 20px;
            box-shadow: 0 0 30px ${s.color}66;
          "></div>
          <p style="color:#888; font-family:'DM Sans',sans-serif; font-size:14px;">Press SPACE as fast as you can!</p>
        </div>`,
      choices: [" "],
      trial_duration: 3000,
      data: { color: s.label, task: "reaction_time" },
    }));

    const procedure = {
      timeline: [fixation, ...trials],
      randomize_order: true,
    };

    const debrief = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        const rtData = jsPsych.data.get().filter({ task: "reaction_time" }).values();
        const validRTs = rtData.filter((d: any) => d.rt !== null).map((d: any) => d.rt);
        const avgRT = validRTs.length > 0
          ? Math.round(validRTs.reduce((a: number, b: number) => a + b, 0) / validRTs.length)
          : "N/A";
        const missed = rtData.filter((d: any) => d.rt === null).length;
        return `
          <div style="text-align:center; font-family:'DM Sans',sans-serif; color:#FDFAF5; max-width:480px; margin:0 auto;">
            <div style="font-size:40px; margin-bottom:12px;">📊</div>
            <h2 style="font-family:'Lora',serif; color:#E8B84B; font-size:24px; margin-bottom:20px;">Your Results</h2>
            <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(201,146,42,0.3); border-radius:8px; padding:20px; margin-bottom:20px;">
              <div style="font-size:48px; font-weight:bold; color:#E8B84B; font-family:'Lora',serif;">${avgRT} ms</div>
              <div style="color:#888; font-size:14px; margin-top:4px;">Average Reaction Time</div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
              <div style="background:rgba(255,255,255,0.05); border-radius:6px; padding:12px;">
                <div style="font-size:24px; font-weight:bold; color:#4CAF50;">${validRTs.length}</div>
                <div style="color:#888; font-size:12px;">Responses</div>
              </div>
              <div style="background:rgba(255,255,255,0.05); border-radius:6px; padding:12px;">
                <div style="font-size:24px; font-weight:bold; color:#FF9800;">${missed}</div>
                <div style="color:#888; font-size:12px;">Missed</div>
              </div>
            </div>
            <p style="color:#aaa; font-size:13px; line-height:1.6; margin-bottom:16px;">
              Typical simple reaction time for adults is <strong style="color:#E8B84B;">150–300 ms</strong>.
              Choice reaction time (multiple stimuli) is generally 50–100 ms slower.
            </p>
            <p style="color:#666; font-size:13px;">Press any key to view full data.</p>
          </div>`;
      },
      choices: "ALL_KEYS",
    };

    jsPsych.run([welcome, procedure, debrief]);
  }

  function runSurveyExperiment() {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    setMode("running");
    setResults([]);

    const jsPsych = initJsPsych({
      display_element: containerRef.current,
      on_finish: () => {
        const data: ExperimentResult[] = jsPsych.data.get().values();
        setResults(data);
        setMode("done");
      },
    });
    jsPsychRef.current = jsPsych;

    const instructions = {
      type: jsPsychInstructions,
      pages: [
        `<div style="text-align:center; font-family:'DM Sans',sans-serif; color:#FDFAF5; max-width:520px; margin:0 auto;">
          <div style="font-size:48px; margin-bottom:16px;">🧠</div>
          <h2 style="font-family:'Lora',serif; font-size:28px; color:#E8B84B; margin-bottom:12px;">Psychology Survey</h2>
          <p style="font-size:16px; color:#ccc; line-height:1.7;">
            This brief survey measures attitudes toward psychological research and academic databases.
            There are no right or wrong answers — respond honestly based on your own perspective.
          </p>
        </div>`,
        `<div style="text-align:center; font-family:'DM Sans',sans-serif; color:#FDFAF5; max-width:520px; margin:0 auto;">
          <h3 style="font-family:'Lora',serif; color:#E8B84B; margin-bottom:16px;">Instructions</h3>
          <ul style="text-align:left; color:#ccc; line-height:2; font-size:15px;">
            <li>The survey has two parts: rating scales and multiple choice.</li>
            <li>Read each question carefully before responding.</li>
            <li>Your responses are collected locally — no data is transmitted.</li>
          </ul>
        </div>`,
      ],
      show_clickable_nav: true,
      button_label_next: "Next →",
      button_label_previous: "← Back",
      button_label_finish: "Begin Survey",
    };

    const likertSurvey = {
      type: jsPsychSurveyLikert,
      questions: [
        {
          prompt: "I find psychological research databases useful for my work or studies.",
          labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
          required: true,
        },
        {
          prompt: "I am familiar with APA PsycInfo as a research tool.",
          labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
          required: true,
        },
        {
          prompt: "Online behavioral experiments (like this one) are a valid method for psychological research.",
          labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
          required: true,
        },
        {
          prompt: "I would be interested in running a full psychology experiment using jsPsych.",
          labels: ["Not interested", "Slightly", "Moderately", "Very interested", "Extremely interested"],
          required: true,
        },
      ],
      preamble: `<p style="font-family:'Lora',serif; color:#E8B84B; font-size:18px; margin-bottom:8px;">Part 1: Rating Scales</p>
                 <p style="font-family:'DM Sans',sans-serif; color:#ccc; font-size:14px;">Rate your agreement with each statement.</p>`,
    };

    const multiChoiceSurvey = {
      type: jsPsychSurveyMultiChoice,
      questions: [
        {
          prompt: "Which APA database would you most likely use for a literature review?",
          options: ["APA PsycInfo®", "APA PsycArticles®", "APA PsycBooks®", "APA PsycTests®", "I have not used any APA databases"],
          required: true,
        },
        {
          prompt: "What is your primary role?",
          options: ["Undergraduate student", "Graduate student", "Academic researcher", "Clinician / Practitioner", "Educator", "Other"],
          required: true,
        },
        {
          prompt: "How did you learn about jsPsych?",
          options: ["Academic course", "Research lab", "Online tutorial", "Colleague recommendation", "This website", "Other"],
          required: true,
        },
      ],
      preamble: `<p style="font-family:'Lora',serif; color:#E8B84B; font-size:18px; margin-bottom:8px;">Part 2: Multiple Choice</p>
                 <p style="font-family:'DM Sans',sans-serif; color:#ccc; font-size:14px;">Select the best answer for each question.</p>`,
    };

    const thankYou = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div style="text-align:center; font-family:'DM Sans',sans-serif; color:#FDFAF5; max-width:480px; margin:0 auto;">
          <div style="font-size:48px; margin-bottom:12px;">✅</div>
          <h2 style="font-family:'Lora',serif; color:#E8B84B; font-size:26px; margin-bottom:12px;">Survey Complete</h2>
          <p style="color:#ccc; font-size:15px; line-height:1.7; margin-bottom:20px;">
            Thank you for completing the survey. Your responses have been recorded locally.
            This demonstrates how jsPsych collects structured survey data in a web experiment.
          </p>
          <p style="color:#888; font-size:13px;">Click below to view your response data.</p>
        </div>`,
      choices: ["View Results"],
      button_html: `<button style="background:#C9922A; color:#1B2A4A; border:none; padding:12px 28px; border-radius:6px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:15px; cursor:pointer;">%choice%</button>`,
    };

    jsPsych.run([instructions, likertSurvey, multiChoiceSurvey, thankYou]);
  }

  function resetExperiment() {
    if (containerRef.current) containerRef.current.innerHTML = "";
    setMode("idle");
    setResults([]);
    jsPsychRef.current = null;
  }

  const rtResults = results.filter((r) => r.rt !== null && (r as any).task === "reaction_time");
  const avgRT = rtResults.length > 0
    ? Math.round(rtResults.reduce((a, b) => a + (b.rt || 0), 0) / rtResults.length)
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B33", color: "#FDFAF5" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1B2A4A", borderBottom: "1px solid rgba(201,146,42,0.2)" }}>
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
              ← Back to Explorer
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "Lora, serif" }}
            >
              Ψ
            </div>
            <span className="font-semibold text-white text-sm" style={{ fontFamily: "Lora, serif" }}>
              jsPsych Lab
            </span>
          </div>
          <div
            className="text-xs px-2 py-1 rounded"
            style={{ backgroundColor: "rgba(201,146,42,0.15)", color: "#E8B84B", fontFamily: "JetBrains Mono, monospace" }}
          >
            v7.3.4
          </div>
        </div>
      </header>

      <div className="container py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ backgroundColor: "#C9922A" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "#C9922A", fontFamily: "DM Sans, sans-serif" }}>
              Interactive Experiment
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "Lora, serif" }}>
            jsPsych v7 Experiment Simulator
          </h1>
          <p className="text-white/60 max-w-2xl" style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>
            Choose an experiment type below and run it live in your browser. All data is collected
            locally using jsPsych's built-in data API — nothing is transmitted externally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Experiment selector */}
            <div
              className="rounded-lg p-5"
              style={{ backgroundColor: "#1B2A4A", border: "1px solid rgba(201,146,42,0.2)" }}
            >
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: "Lora, serif" }}>
                Select Experiment
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: "reaction" as const,
                    label: "Reaction Time Task",
                    icon: "⚡",
                    desc: "Measure simple RT to colored stimuli",
                    plugin: "html-keyboard-response",
                  },
                  {
                    id: "survey" as const,
                    label: "Psychology Survey",
                    icon: "📋",
                    desc: "Likert scales + multiple choice",
                    plugin: "survey-likert + survey-multi-choice",
                  },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => { if (mode !== "running") setSelectedExperiment(exp.id); }}
                    className="w-full text-left rounded-lg p-4 transition-all"
                    style={{
                      backgroundColor: selectedExperiment === exp.id ? "rgba(201,146,42,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedExperiment === exp.id ? "#C9922A" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{exp.icon}</span>
                      <span className="font-medium text-sm text-white" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        {exp.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{exp.desc}</p>
                    <code className="text-xs" style={{ color: "#C9922A", fontFamily: "JetBrains Mono, monospace" }}>
                      {exp.plugin}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* Run / Reset buttons */}
            <div className="space-y-3">
              {mode === "idle" && (
                <button
                  onClick={selectedExperiment === "reaction" ? runReactionTimeExperiment : runSurveyExperiment}
                  className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "DM Sans, sans-serif" }}
                >
                  🚀 Start Experiment
                </button>
              )}
              {mode === "running" && (
                <button
                  onClick={resetExperiment}
                  className="w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(255,100,100,0.4)", color: "#ff8888", fontFamily: "DM Sans, sans-serif" }}
                >
                  ✕ Stop & Reset
                </button>
              )}
              {mode === "done" && (
                <button
                  onClick={resetExperiment}
                  className="w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(201,146,42,0.4)", color: "#E8B84B", fontFamily: "DM Sans, sans-serif" }}
                >
                  ↺ Run Again
                </button>
              )}
            </div>

            {/* Status indicator */}
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: mode === "idle" ? "#888" : mode === "running" ? "#4CAF50" : "#C9922A",
                    boxShadow: mode === "running" ? "0 0 6px #4CAF50" : "none",
                  }}
                />
                <span className="text-xs font-medium text-white/70" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {mode === "idle" ? "READY" : mode === "running" ? "RUNNING" : "COMPLETE"}
                </span>
              </div>
              <p className="text-xs text-white/40" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {mode === "idle" && "Select an experiment and press Start."}
                {mode === "running" && "Experiment in progress — interact with the panel."}
                {mode === "done" && `${results.length} trial(s) recorded.`}
              </p>
            </div>

            {/* RT summary (reaction time only) */}
            {mode === "done" && selectedExperiment === "reaction" && avgRT !== null && (
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "rgba(201,146,42,0.1)", border: "1px solid rgba(201,146,42,0.3)" }}
              >
                <div className="text-xs uppercase tracking-wide text-white/50 mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Average RT
                </div>
                <div className="text-3xl font-bold" style={{ color: "#E8B84B", fontFamily: "Lora, serif" }}>
                  {avgRT} ms
                </div>
                <div className="text-xs text-white/40 mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Typical range: 150–300 ms
                </div>
              </div>
            )}
          </div>

          {/* Right: experiment display */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg overflow-hidden"
              style={{
                backgroundImage: `url(${EXPERIMENT_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid rgba(201,146,42,0.25)",
                minHeight: "520px",
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ backgroundColor: "rgba(13,27,51,0.95)", borderBottom: "1px solid rgba(201,146,42,0.2)" }}
              >
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-white/40 mono" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  jspsych-experiment.html
                </span>
                {mode === "running" && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>live</span>
                  </div>
                )}
              </div>

              {/* jsPsych mount point */}
              <div
                ref={containerRef}
                className="relative"
                style={{
                  minHeight: "460px",
                  backgroundColor: "rgba(13,27,51,0.92)",
                }}
              >
                {mode === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                    <div className="text-5xl mb-4">🔬</div>
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "Lora, serif" }}>
                      Experiment Console
                    </h3>
                    <p className="text-white/50 text-sm max-w-sm" style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>
                      Select an experiment type from the panel on the left, then click{" "}
                      <strong className="text-white">Start Experiment</strong> to launch the jsPsych simulation here.
                    </p>
                    <div
                      className="mt-6 px-4 py-2 rounded text-xs"
                      style={{
                        backgroundColor: "rgba(201,146,42,0.1)",
                        border: "1px solid rgba(201,146,42,0.2)",
                        color: "#C9922A",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      jsPsych v7.3.4 ready
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data output */}
            {mode === "done" && results.length > 0 && (
              <div
                className="mt-4 rounded-lg overflow-hidden"
                style={{ border: "1px solid rgba(201,146,42,0.2)" }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: "#1B2A4A" }}
                >
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "Lora, serif" }}>
                    Collected Data
                  </span>
                  <span className="text-xs text-white/50 mono" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {results.length} trial(s)
                  </span>
                </div>
                <div
                  className="overflow-x-auto"
                  style={{ backgroundColor: "#0D1B33" }}
                >
                  <table className="w-full text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <th className="text-left px-4 py-2 text-white/40">#</th>
                        <th className="text-left px-4 py-2 text-white/40">trial_type</th>
                        <th className="text-left px-4 py-2 text-white/40">rt (ms)</th>
                        <th className="text-left px-4 py-2 text-white/40">response</th>
                        <th className="text-left px-4 py-2 text-white/40">time_elapsed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 12).map((r, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <td className="px-4 py-2 text-white/30">{i + 1}</td>
                          <td className="px-4 py-2" style={{ color: "#C9922A" }}>
                            {r.trial_type?.replace("jsPsych", "").replace("Plugin", "") || "—"}
                          </td>
                          <td className="px-4 py-2" style={{ color: r.rt !== null ? "#4CAF50" : "#888" }}>
                            {r.rt !== null ? `${Math.round(r.rt)}` : "null"}
                          </td>
                          <td className="px-4 py-2 text-white/60 max-w-xs truncate">
                            {typeof r.response === "object"
                              ? JSON.stringify(r.response).slice(0, 60)
                              : r.response ?? "—"}
                          </td>
                          <td className="px-4 py-2 text-white/40">{r.time_elapsed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.length > 12 && (
                    <div className="px-4 py-2 text-xs text-white/30" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      … and {results.length - 12} more rows
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
