/* ==========================================================
   DESIGN: "Archival Intelligence" — Experiment Lab
   All experiments run in sandboxed iframes via Blob URLs.
   Results returned via postMessage.
   ========================================================== */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  buildReactionHTML,
  buildStroopHTML,
  buildNBackHTML,
  buildPhantomLimbHTML,
  buildTuringHTML,
  buildSurveyHTML,
  buildReverseHangmanHTML,
  buildReverseTrolleyHTML,
} from "@/lib/experiments";

const EXPERIMENT_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663332318761/U2i6nQpWEjUzrfyWBddmdj/experiment-panel-bg-C2uSUxG6MDfaofCKw6JF3G.webp";

type ExperimentId =
  | "reaction"
  | "stroop"
  | "nback"
  | "phantom"
  | "turing"
  | "survey"
  | "reverse-hangman"
  | "reverse-trolley";

type RunMode = "idle" | "running" | "done";

interface ExperimentMeta {
  id: ExperimentId;
  label: string;
  icon: string;
  desc: string;
  plugin: string;
  color: string;
  category: string;
}

const EXPERIMENTS: ExperimentMeta[] = [
  { id: "reaction", label: "Reaction Time", icon: "⚡", desc: "Simple RT to colored stimuli", plugin: "html-keyboard-response", color: "#4CAF50", category: "Cognitive" },
  { id: "stroop", label: "Stroop Task", icon: "🎨", desc: "Color-word interference effect", plugin: "html-keyboard-response", color: "#FF9800", category: "Cognitive" },
  { id: "nback", label: "2-Back Memory", icon: "🧠", desc: "Working memory capacity", plugin: "html-keyboard-response", color: "#9C27B0", category: "Cognitive" },
  { id: "phantom", label: "Phantom Limb / RHI", icon: "🖐️", desc: "Rubber Hand Illusion & body ownership", plugin: "survey-likert + button-response", color: "#E91E63", category: "Perception" },
  { id: "turing", label: "Turing Test", icon: "🤖", desc: "Human vs. AI response discrimination", plugin: "html-button-response", color: "#2196F3", category: "AI & Cognition" },
  { id: "reverse-hangman", label: "Reverse Hangman", icon: "🎭", desc: "Give letters to confuse the AI guesser", plugin: "custom DOM + strategy", color: "#FF5722", category: "AI & Cognition" },
  { id: "survey", label: "Psychology Survey", icon: "📋", desc: "Likert scales + multiple choice", plugin: "survey-likert + survey-multi-choice", color: "#C9922A", category: "Survey" },
  { id: "reverse-trolley", label: "Reverse Trolley", icon: "🚃", desc: "Design a moral dilemma, then face it yourself", plugin: "custom DOM + moral reasoning", color: "#7C4DFF", category: "Reasoning" },
];

function buildHTML(id: ExperimentId): string {
  switch (id) {
    case "reaction": return buildReactionHTML();
    case "stroop": return buildStroopHTML();
    case "nback": return buildNBackHTML();
    case "phantom": return buildPhantomLimbHTML();
    case "turing": return buildTuringHTML();
    case "survey": return buildSurveyHTML();
    case "reverse-hangman": return buildReverseHangmanHTML();
    case "reverse-trolley": return buildReverseTrolleyHTML();
  }
}

type TrialRow = { index: number; trial_type: string; rt: number | null; response: string; time_elapsed: number };

export default function ExperimentPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<RunMode>("idle");
  const [results, setResults] = useState<TrialRow[]>([]);
  const [selected, setSelected] = useState<ExperimentId>("reaction");
  const [avgRT, setAvgRT] = useState<number | null>(null);

  useEffect(() => {
    function handle(e: MessageEvent) {
      if (e.data?.type === "jspsych-done") {
        const raw: any[] = e.data.data || [];
        const rows: TrialRow[] = raw.map((r, i) => ({
          index: i + 1,
          trial_type: (r.trial_type || "").replace("jsPsychPlugin", "").replace("jsPsych", "").replace("Plugin", ""),
          rt: r.rt !== undefined ? r.rt : null,
          response: typeof r.response === "object" && r.response !== null ? JSON.stringify(r.response).slice(0, 80) : String(r.response ?? "—"),
          time_elapsed: r.time_elapsed ?? 0,
        }));
        setResults(rows);
        const rtRows = raw.filter((r) => r.task === "rt" && r.rt !== null);
        if (rtRows.length > 0) setAvgRT(Math.round(rtRows.reduce((s: number, r: any) => s + r.rt, 0) / rtRows.length));
        else setAvgRT(null);
        setMode("done");
      }
    }
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  function start() {
    const html = buildHTML(selected);
    const blob = new Blob([html], { type: "text/html" });
    if (iframeRef.current) iframeRef.current.src = URL.createObjectURL(blob);
    setMode("running");
    setResults([]);
    setAvgRT(null);
  }

  function reset() {
    if (iframeRef.current) iframeRef.current.src = "about:blank";
    setMode("idle");
    setResults([]);
    setAvgRT(null);
  }

  const meta = EXPERIMENTS.find((e) => e.id === selected)!;
  const categories = Array.from(new Set(EXPERIMENTS.map((e) => e.category)));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B33", color: "#FDFAF5" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1B2A4A", borderBottom: "1px solid rgba(201,146,42,0.2)" }}>
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <button className="text-sm text-white/60 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
              ← Back to Explorer
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "Lora, serif" }}>Ψ</div>
            <span className="font-semibold text-white text-sm" style={{ fontFamily: "Lora, serif" }}>jsPsych Lab</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/builder">
              <button className="text-xs px-3 py-1.5 rounded border transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(201,146,42,0.35)", color: "#E8B84B", fontFamily: "DM Sans, sans-serif" }}>
                🔧 Custom Builder
              </button>
            </Link>
            <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(201,146,42,0.15)", color: "#E8B84B", fontFamily: "JetBrains Mono, monospace" }}>v7.3.4</div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8" style={{ backgroundColor: "#C9922A" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "#C9922A", fontFamily: "DM Sans, sans-serif" }}>Interactive Experiments</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Lora, serif" }}>jsPsych v7 Experiment Simulator</h1>
          <p className="text-white/50 max-w-2xl text-sm" style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>
            Six classic psychology paradigms — all running live in your browser via jsPsych v7. Data is collected locally. Want to build your own? Try the <Link href="/builder"><span className="text-yellow-400 underline cursor-pointer">Custom Builder →</span></Link>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: selector + controls */}
          <div className="lg:col-span-1 space-y-4">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="text-xs uppercase tracking-widest text-white/30 mb-2 px-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{cat}</div>
                <div className="space-y-2">
                  {EXPERIMENTS.filter((e) => e.category === cat).map((exp) => (
                    <button key={exp.id}
                      onClick={() => { if (mode !== "running") { setSelected(exp.id); reset(); } }}
                      className="w-full text-left rounded-lg px-4 py-3 transition-all"
                      style={{
                        backgroundColor: selected === exp.id ? `${exp.color}18` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected === exp.id ? exp.color : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span>{exp.icon}</span>
                        <span className="font-medium text-sm text-white" style={{ fontFamily: "DM Sans, sans-serif" }}>{exp.label}</span>
                      </div>
                      <p className="text-xs text-white/40 mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{exp.desc}</p>
                      <code className="text-xs" style={{ color: exp.color + "cc", fontFamily: "JetBrains Mono, monospace" }}>{exp.plugin}</code>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Action button */}
            <div className="pt-2 space-y-2">
              {mode === "idle" && (
                <button onClick={start}
                  className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: meta.color, color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
                  ▶ Start {meta.label}
                </button>
              )}
              {mode === "running" && (
                <button onClick={reset}
                  className="w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(255,100,100,0.4)", color: "#ff8888", fontFamily: "DM Sans, sans-serif" }}>
                  ✕ Stop & Reset
                </button>
              )}
              {mode === "done" && (
                <button onClick={reset}
                  className="w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(201,146,42,0.4)", color: "#E8B84B", fontFamily: "DM Sans, sans-serif" }}>
                  ↺ Run Again
                </button>
              )}
            </div>

            {/* Status */}
            <div className="rounded-lg p-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: mode === "idle" ? "#555" : mode === "running" ? "#4CAF50" : "#C9922A", boxShadow: mode === "running" ? "0 0 6px #4CAF50" : "none" }} />
                <span className="text-xs font-medium text-white/60" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {mode === "idle" ? "READY" : mode === "running" ? "RUNNING" : "COMPLETE"}
                </span>
              </div>
              <p className="text-xs text-white/30" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {mode === "idle" && "Select an experiment and press Start."}
                {mode === "running" && "Experiment in progress →"}
                {mode === "done" && `${results.length} trial(s) recorded.`}
              </p>
            </div>

            {/* RT card */}
            {mode === "done" && selected === "reaction" && avgRT !== null && (
              <div className="rounded-lg p-4" style={{ backgroundColor: "rgba(201,146,42,0.1)", border: "1px solid rgba(201,146,42,0.3)" }}>
                <div className="text-xs uppercase tracking-wide text-white/40 mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Avg Reaction Time</div>
                <div className="text-3xl font-bold" style={{ color: "#E8B84B", fontFamily: "Lora, serif" }}>{avgRT} ms</div>
                <div className="text-xs text-white/30 mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Typical: 150–300 ms</div>
              </div>
            )}
          </div>

          {/* Right: iframe */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden"
              style={{ backgroundImage: `url(${EXPERIMENT_BG})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(201,146,42,0.25)", minHeight: "520px" }}>
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ backgroundColor: "rgba(13,27,51,0.97)", borderBottom: "1px solid rgba(201,146,42,0.2)" }}>
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-white/40" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {selected}-experiment.html
                </span>
                {mode === "running" && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>live</span>
                  </div>
                )}
              </div>

              {/* Idle placeholder */}
              {mode === "idle" && (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8"
                  style={{ backgroundColor: "rgba(13,27,51,0.92)", minHeight: "460px" }}>
                  <div className="text-5xl mb-4">{meta.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Lora, serif" }}>{meta.label}</h3>
                  <p className="text-white/40 text-sm max-w-sm mb-4" style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>{meta.desc}</p>
                  <div className="px-4 py-2 rounded text-xs" style={{ backgroundColor: `${meta.color}18`, border: `1px solid ${meta.color}44`, color: meta.color, fontFamily: "JetBrains Mono, monospace" }}>
                    {meta.plugin}
                  </div>
                </div>
              )}

              {/* jsPsych iframe */}
              <iframe ref={iframeRef} title="jsPsych Experiment" sandbox="allow-scripts allow-same-origin"
                style={{ width: "100%", minHeight: "460px", border: "none", display: mode !== "idle" ? "block" : "none", backgroundColor: "#0D1B33" }} />
            </div>

            {/* Data table */}
            {mode === "done" && results.length > 0 && (
              <div className="mt-4 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,146,42,0.2)" }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#1B2A4A" }}>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "Lora, serif" }}>Collected Data</span>
                  <span className="text-xs text-white/40" style={{ fontFamily: "JetBrains Mono, monospace" }}>{results.length} trial(s)</span>
                </div>
                <div className="overflow-x-auto" style={{ backgroundColor: "#0D1B33" }}>
                  <table className="w-full text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {["#", "trial_type", "rt (ms)", "response", "time_elapsed"].map((h) => (
                          <th key={h} className="text-left px-4 py-2 text-white/40 font-normal">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 12).map((r) => (
                        <tr key={r.index} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-2 text-white/30">{r.index}</td>
                          <td className="px-4 py-2" style={{ color: "#C9922A" }}>{r.trial_type || "—"}</td>
                          <td className="px-4 py-2" style={{ color: r.rt !== null ? "#4CAF50" : "#888" }}>{r.rt !== null ? Math.round(r.rt) : "null"}</td>
                          <td className="px-4 py-2 text-white/60 max-w-xs truncate">{r.response}</td>
                          <td className="px-4 py-2 text-white/40">{r.time_elapsed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.length > 12 && (
                    <div className="px-4 py-2 text-xs text-white/30" style={{ fontFamily: "DM Sans, sans-serif" }}>… and {results.length - 12} more rows</div>
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
