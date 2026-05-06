/* ==========================================================
   DESIGN: "Archival Intelligence" — Experiment Lab Panel
   Dark navy console with gold accents.

   FIX: jsPsych directly mutates the DOM and conflicts with
   React's virtual DOM reconciliation (removeChild errors).
   Solution: jsPsych runs inside a sandboxed <iframe> that
   React never touches. Communication is via postMessage.
   ========================================================== */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const EXPERIMENT_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663332318761/U2i6nQpWEjUzrfyWBddmdj/experiment-panel-bg-C2uSUxG6MDfaofCKw6JF3G.webp";

type ExperimentMode = "idle" | "running" | "done";
type ExperimentType = "reaction" | "survey";

type TrialRow = {
  index: number;
  trial_type: string;
  rt: number | null;
  response: string;
  time_elapsed: number;
};

// ── Inline HTML for the reaction-time experiment (runs inside iframe) ──────
function buildReactionHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/jspsych@7.3.4"></script>
<link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet"/>
<script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script>
<style>
  html,body{margin:0;padding:0;background:#0D1B33;color:#FDFAF5;font-family:'DM Sans',sans-serif;}
  .jspsych-display-element{background:#0D1B33 !important;}
  .jspsych-content-wrapper{background:#0D1B33 !important;}
  .jspsych-content{max-width:600px !important;}
  kbd{background:#C9922A;color:#1B2A4A;padding:2px 8px;border-radius:4px;font-weight:bold;}
  .fixation{font-size:48px;color:#E8B84B;text-align:center;margin-top:80px;}
  .circle-wrap{text-align:center;margin-top:60px;}
  .circle{width:120px;height:120px;border-radius:50%;margin:0 auto 20px;}
  .hint{color:#888;font-size:14px;}
  .results-box{background:rgba(255,255,255,0.05);border:1px solid rgba(201,146,42,0.3);border-radius:8px;padding:20px;margin-bottom:20px;}
  .avg-rt{font-size:48px;font-weight:bold;color:#E8B84B;font-family:'Lora',serif;}
  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
  .stat-cell{background:rgba(255,255,255,0.05);border-radius:6px;padding:12px;text-align:center;}
  .stat-val{font-size:24px;font-weight:bold;}
  .stat-lbl{color:#888;font-size:12px;}
  .note{color:#aaa;font-size:13px;line-height:1.6;margin-bottom:16px;}
  .press-hint{color:#666;font-size:13px;}
</style>
</head>
<body>
<div id="jspsych-target"></div>
<script>
(function(){
  const jsPsych = initJsPsych({
    display_element: document.getElementById('jspsych-target'),
    on_finish: function(){
      const data = jsPsych.data.get().values();
      window.parent.postMessage({type:'jspsych-done', data: data}, '*');
    }
  });

  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: \`<div style="text-align:center;max-width:500px;margin:0 auto;">
      <div style="font-size:48px;margin-bottom:16px;">⚡</div>
      <h2 style="font-family:'Lora',serif;font-size:28px;color:#E8B84B;margin-bottom:12px;">Reaction Time Task</h2>
      <p style="font-size:16px;color:#ccc;line-height:1.7;margin-bottom:24px;">
        A classic cognitive psychology paradigm measuring simple reaction time.
        When a colored circle appears — press <kbd>SPACE</kbd> as fast as possible.
      </p>
      <p style="font-size:14px;color:#888;">Press any key to begin.</p>
    </div>\`,
    choices: 'ALL_KEYS'
  };

  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="fixation">+</div>',
    choices: 'NO_KEYS',
    trial_duration: function(){ return Math.floor(Math.random()*1000)+500; }
  };

  const stimuli = [
    {color:'#4CAF50',label:'Green'},
    {color:'#2196F3',label:'Blue'},
    {color:'#FF9800',label:'Orange'},
    {color:'#E91E63',label:'Pink'},
    {color:'#9C27B0',label:'Purple'}
  ];

  const trials = stimuli.map(function(s){
    return {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: \`<div class="circle-wrap">
        <div class="circle" style="background:\${s.color};box-shadow:0 0 30px \${s.color}66;"></div>
        <p class="hint">Press SPACE as fast as you can!</p>
      </div>\`,
      choices: [' '],
      trial_duration: 3000,
      data: {color: s.label, task: 'reaction_time'}
    };
  });

  const procedure = {timeline: [fixation, ...trials], randomize_order: true};

  const debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
      const rtData = jsPsych.data.get().filter({task:'reaction_time'}).values();
      const validRTs = rtData.filter(function(d){return d.rt!==null;}).map(function(d){return d.rt;});
      const avgRT = validRTs.length>0 ? Math.round(validRTs.reduce(function(a,b){return a+b;},0)/validRTs.length) : 'N/A';
      const missed = rtData.filter(function(d){return d.rt===null;}).length;
      return \`<div style="text-align:center;max-width:480px;margin:0 auto;">
        <div style="font-size:40px;margin-bottom:12px;">📊</div>
        <h2 style="font-family:'Lora',serif;color:#E8B84B;font-size:24px;margin-bottom:20px;">Your Results</h2>
        <div class="results-box">
          <div class="avg-rt">\${avgRT} ms</div>
          <div style="color:#888;font-size:14px;margin-top:4px;">Average Reaction Time</div>
        </div>
        <div class="stat-grid">
          <div class="stat-cell"><div class="stat-val" style="color:#4CAF50;">\${validRTs.length}</div><div class="stat-lbl">Responses</div></div>
          <div class="stat-cell"><div class="stat-val" style="color:#FF9800;">\${missed}</div><div class="stat-lbl">Missed</div></div>
        </div>
        <p class="note">Typical simple reaction time for adults is <strong style="color:#E8B84B;">150–300 ms</strong>.</p>
        <p class="press-hint">Press any key to finish.</p>
      </div>\`;
    },
    choices: 'ALL_KEYS'
  };

  jsPsych.run([welcome, procedure, debrief]);
})();
</script>
</body>
</html>`;
}

// ── Inline HTML for the survey experiment ─────────────────────────────────
function buildSurveyHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/jspsych@7.3.4"></script>
<link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet"/>
<script src="https://unpkg.com/@jspsych/plugin-instructions@1.1.4"></script>
<script src="https://unpkg.com/@jspsych/plugin-survey-likert@1.1.3"></script>
<script src="https://unpkg.com/@jspsych/plugin-survey-multi-choice@1.1.3"></script>
<script src="https://unpkg.com/@jspsych/plugin-html-button-response@1.2.0"></script>
<style>
  html,body{margin:0;padding:0;background:#0D1B33;color:#FDFAF5;font-family:'DM Sans',sans-serif;}
  .jspsych-display-element{background:#0D1B33 !important;}
  .jspsych-content-wrapper{background:#0D1B33 !important;}
  .jspsych-content{max-width:640px !important;}
  .jspsych-survey-likert-statement{color:#FDFAF5 !important;}
  .jspsych-survey-likert-opts td{color:#ccc !important;}
  .jspsych-survey-multi-choice-question{color:#FDFAF5 !important;}
  .jspsych-survey-multi-choice-option label{color:#ccc !important;}
  .jspsych-btn{background:#C9922A !important;color:#1B2A4A !important;border:none !important;font-family:'DM Sans',sans-serif !important;font-weight:600 !important;}
  .jspsych-instructions-nav{margin-top:20px;}
  .preamble-title{font-family:'Lora',serif;color:#E8B84B;font-size:18px;margin-bottom:8px;}
  .preamble-sub{color:#ccc;font-size:14px;}
</style>
</head>
<body>
<div id="jspsych-target"></div>
<script>
(function(){
  const jsPsych = initJsPsych({
    display_element: document.getElementById('jspsych-target'),
    on_finish: function(){
      const data = jsPsych.data.get().values();
      window.parent.postMessage({type:'jspsych-done', data: data}, '*');
    }
  });

  const instructions = {
    type: jsPsychInstructions,
    pages: [
      \`<div style="text-align:center;max-width:520px;margin:0 auto;">
        <div style="font-size:48px;margin-bottom:16px;">🧠</div>
        <h2 style="font-family:'Lora',serif;font-size:28px;color:#E8B84B;margin-bottom:12px;">Psychology Survey</h2>
        <p style="font-size:16px;color:#ccc;line-height:1.7;">
          This brief survey measures attitudes toward psychological research and academic databases.
          There are no right or wrong answers.
        </p>
      </div>\`,
      \`<div style="text-align:center;max-width:520px;margin:0 auto;">
        <h3 style="font-family:'Lora',serif;color:#E8B84B;margin-bottom:16px;">Instructions</h3>
        <ul style="text-align:left;color:#ccc;line-height:2;font-size:15px;">
          <li>Part 1: Rating scales (Likert)</li>
          <li>Part 2: Multiple choice questions</li>
          <li>Your responses are collected locally only.</li>
        </ul>
      </div>\`
    ],
    show_clickable_nav: true,
    button_label_next: 'Next →',
    button_label_previous: '← Back',
    button_label_finish: 'Begin Survey'
  };

  const likertSurvey = {
    type: jsPsychSurveyLikert,
    questions: [
      {prompt:'I find psychological research databases useful for my work or studies.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'I am familiar with APA PsycInfo as a research tool.',labels:['Not at all','Slightly','Moderately','Very','Extremely'],required:true},
      {prompt:'Online behavioral experiments are a valid method for psychological research.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'I would be interested in running a full experiment using jsPsych.',labels:['Not interested','Slightly','Moderately','Very interested','Extremely interested'],required:true}
    ],
    preamble: '<p class="preamble-title">Part 1: Rating Scales</p><p class="preamble-sub">Rate your agreement with each statement.</p>'
  };

  const multiChoiceSurvey = {
    type: jsPsychSurveyMultiChoice,
    questions: [
      {prompt:'Which APA database would you most likely use for a literature review?',options:['APA PsycInfo®','APA PsycArticles®','APA PsycBooks®','APA PsycTests®','I have not used any APA databases'],required:true},
      {prompt:'What is your primary role?',options:['Undergraduate student','Graduate student','Academic researcher','Clinician / Practitioner','Educator','Other'],required:true},
      {prompt:'How did you learn about jsPsych?',options:['Academic course','Research lab','Online tutorial','Colleague recommendation','This website','Other'],required:true}
    ],
    preamble: '<p class="preamble-title">Part 2: Multiple Choice</p><p class="preamble-sub">Select the best answer for each question.</p>'
  };

  const thankYou = {
    type: jsPsychHtmlButtonResponse,
    stimulus: \`<div style="text-align:center;max-width:480px;margin:0 auto;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h2 style="font-family:'Lora',serif;color:#E8B84B;font-size:26px;margin-bottom:12px;">Survey Complete</h2>
      <p style="color:#ccc;font-size:15px;line-height:1.7;margin-bottom:20px;">
        Thank you! Your responses have been recorded locally. This demonstrates how jsPsych collects structured survey data.
      </p>
    </div>\`,
    choices: ['View Results'],
    button_html: '<button style="background:#C9922A;color:#1B2A4A;border:none;padding:12px 28px;border-radius:6px;font-family:DM Sans,sans-serif;font-weight:600;font-size:15px;cursor:pointer;">%choice%</button>'
  };

  jsPsych.run([instructions, likertSurvey, multiChoiceSurvey, thankYou]);
})();
</script>
</body>
</html>`;
}

export default function ExperimentPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<ExperimentMode>("idle");
  const [results, setResults] = useState<TrialRow[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentType>("reaction");
  const [avgRT, setAvgRT] = useState<number | null>(null);

  // Listen for postMessage from iframe when experiment finishes
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "jspsych-done") {
        const raw: any[] = event.data.data || [];
        const rows: TrialRow[] = raw.map((r, i) => ({
          index: i + 1,
          trial_type: (r.trial_type || "")
            .replace("jsPsychPlugin", "")
            .replace("jsPsych", "")
            .replace("Plugin", ""),
          rt: r.rt !== undefined ? r.rt : null,
          response:
            typeof r.response === "object" && r.response !== null
              ? JSON.stringify(r.response).slice(0, 80)
              : String(r.response ?? "—"),
          time_elapsed: r.time_elapsed ?? 0,
        }));
        setResults(rows);

        // Compute avg RT for reaction task
        const rtRows = raw.filter((r) => r.task === "reaction_time" && r.rt !== null);
        if (rtRows.length > 0) {
          const avg = Math.round(
            rtRows.reduce((s: number, r: any) => s + r.rt, 0) / rtRows.length
          );
          setAvgRT(avg);
        } else {
          setAvgRT(null);
        }

        setMode("done");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function startExperiment() {
    const html =
      selectedExperiment === "reaction" ? buildReactionHTML() : buildSurveyHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    setMode("running");
    setResults([]);
    setAvgRT(null);
  }

  function resetExperiment() {
    if (iframeRef.current) {
      iframeRef.current.src = "about:blank";
    }
    setMode("idle");
    setResults([]);
    setAvgRT(null);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1B33", color: "#FDFAF5" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#1B2A4A",
          borderBottom: "1px solid rgba(201,146,42,0.2)",
        }}
      >
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <button
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
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
            <span
              className="font-semibold text-white text-sm"
              style={{ fontFamily: "Lora, serif" }}
            >
              jsPsych Lab
            </span>
          </div>
          <div
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "rgba(201,146,42,0.15)",
              color: "#E8B84B",
              fontFamily: "JetBrains Mono, monospace",
            }}
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
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#C9922A", fontFamily: "DM Sans, sans-serif" }}
            >
              Interactive Experiment
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "Lora, serif" }}
          >
            jsPsych v7 Experiment Simulator
          </h1>
          <p
            className="text-white/60 max-w-2xl"
            style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}
          >
            Choose an experiment type and run it live in your browser. jsPsych runs in an isolated
            sandbox — all data is collected locally via the jsPsych data API.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: controls ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Experiment selector */}
            <div
              className="rounded-lg p-5"
              style={{
                backgroundColor: "#1B2A4A",
                border: "1px solid rgba(201,146,42,0.2)",
              }}
            >
              <h3
                className="font-semibold text-white mb-4 text-sm uppercase tracking-wide"
                style={{ fontFamily: "Lora, serif" }}
              >
                Select Experiment
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: "reaction" as ExperimentType,
                    label: "Reaction Time Task",
                    icon: "⚡",
                    desc: "Measure simple RT to colored stimuli",
                    plugin: "html-keyboard-response",
                  },
                  {
                    id: "survey" as ExperimentType,
                    label: "Psychology Survey",
                    icon: "📋",
                    desc: "Likert scales + multiple choice",
                    plugin: "survey-likert + survey-multi-choice",
                  },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => {
                      if (mode !== "running") setSelectedExperiment(exp.id);
                    }}
                    className="w-full text-left rounded-lg p-4 transition-all"
                    style={{
                      backgroundColor:
                        selectedExperiment === exp.id
                          ? "rgba(201,146,42,0.15)"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        selectedExperiment === exp.id
                          ? "#C9922A"
                          : "rgba(255,255,255,0.08)"
                      }`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{exp.icon}</span>
                      <span
                        className="font-medium text-sm text-white"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      >
                        {exp.label}
                      </span>
                    </div>
                    <p
                      className="text-xs text-white/50 mb-2"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
                      {exp.desc}
                    </p>
                    <code
                      className="text-xs"
                      style={{ color: "#C9922A", fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {exp.plugin}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {mode === "idle" && (
                <button
                  onClick={startExperiment}
                  className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "#C9922A",
                    color: "#1B2A4A",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  🚀 Start Experiment
                </button>
              )}
              {mode === "running" && (
                <button
                  onClick={resetExperiment}
                  className="w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-white/5"
                  style={{
                    borderColor: "rgba(255,100,100,0.4)",
                    color: "#ff8888",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  ✕ Stop & Reset
                </button>
              )}
              {mode === "done" && (
                <button
                  onClick={resetExperiment}
                  className="w-full py-3 rounded-lg font-semibold text-sm border transition-all hover:bg-white/5"
                  style={{
                    borderColor: "rgba(201,146,42,0.4)",
                    color: "#E8B84B",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  ↺ Run Again
                </button>
              )}
            </div>

            {/* Status */}
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      mode === "idle" ? "#888" : mode === "running" ? "#4CAF50" : "#C9922A",
                    boxShadow: mode === "running" ? "0 0 6px #4CAF50" : "none",
                  }}
                />
                <span
                  className="text-xs font-medium text-white/70"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {mode === "idle" ? "READY" : mode === "running" ? "RUNNING" : "COMPLETE"}
                </span>
              </div>
              <p
                className="text-xs text-white/40"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                {mode === "idle" && "Select an experiment and press Start."}
                {mode === "running" && "Experiment in progress — interact with the panel →"}
                {mode === "done" && `${results.length} trial(s) recorded.`}
              </p>
            </div>

            {/* RT summary card */}
            {mode === "done" && selectedExperiment === "reaction" && avgRT !== null && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(201,146,42,0.1)",
                  border: "1px solid rgba(201,146,42,0.3)",
                }}
              >
                <div
                  className="text-xs uppercase tracking-wide text-white/50 mb-2"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Average RT
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: "#E8B84B", fontFamily: "Lora, serif" }}
                >
                  {avgRT} ms
                </div>
                <div
                  className="text-xs text-white/40 mt-1"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Typical range: 150–300 ms
                </div>
              </div>
            )}
          </div>

          {/* ── Right: iframe experiment display ── */}
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
                style={{
                  backgroundColor: "rgba(13,27,51,0.97)",
                  borderBottom: "1px solid rgba(201,146,42,0.2)",
                }}
              >
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span
                  className="ml-2 text-xs text-white/40"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  jspsych-experiment.html
                </span>
                {mode === "running" && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span
                      className="text-xs text-green-400"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      live
                    </span>
                  </div>
                )}
              </div>

              {/* Idle placeholder */}
              {mode === "idle" && (
                <div
                  className="flex flex-col items-center justify-center py-20 text-center px-8"
                  style={{ backgroundColor: "rgba(13,27,51,0.92)", minHeight: "460px" }}
                >
                  <div className="text-5xl mb-4">🔬</div>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "Lora, serif" }}
                  >
                    Experiment Console
                  </h3>
                  <p
                    className="text-white/50 text-sm max-w-sm"
                    style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}
                  >
                    Select an experiment from the left panel, then click{" "}
                    <strong className="text-white">Start Experiment</strong> to launch the jsPsych
                    simulation here.
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

              {/* jsPsych iframe — always mounted, hidden when idle */}
              <iframe
                ref={iframeRef}
                title="jsPsych Experiment"
                sandbox="allow-scripts allow-same-origin"
                style={{
                  width: "100%",
                  minHeight: "460px",
                  border: "none",
                  display: mode !== "idle" ? "block" : "none",
                  backgroundColor: "#0D1B33",
                }}
              />
            </div>

            {/* Data output table */}
            {mode === "done" && results.length > 0 && (
              <div
                className="mt-4 rounded-lg overflow-hidden"
                style={{ border: "1px solid rgba(201,146,42,0.2)" }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: "#1B2A4A" }}
                >
                  <span
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "Lora, serif" }}
                  >
                    Collected Data
                  </span>
                  <span
                    className="text-xs text-white/50"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {results.length} trial(s)
                  </span>
                </div>
                <div className="overflow-x-auto" style={{ backgroundColor: "#0D1B33" }}>
                  <table
                    className="w-full text-xs"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    <thead>
                      <tr
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {["#", "trial_type", "rt (ms)", "response", "time_elapsed"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-2 text-white/40 font-normal"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 12).map((r) => (
                        <tr
                          key={r.index}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <td className="px-4 py-2 text-white/30">{r.index}</td>
                          <td className="px-4 py-2" style={{ color: "#C9922A" }}>
                            {r.trial_type || "—"}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{ color: r.rt !== null ? "#4CAF50" : "#888" }}
                          >
                            {r.rt !== null ? Math.round(r.rt) : "null"}
                          </td>
                          <td className="px-4 py-2 text-white/60 max-w-xs truncate">
                            {r.response}
                          </td>
                          <td className="px-4 py-2 text-white/40">{r.time_elapsed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.length > 12 && (
                    <div
                      className="px-4 py-2 text-xs text-white/30"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
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
