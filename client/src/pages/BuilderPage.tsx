/* ==========================================================
   DESIGN: "Archival Intelligence" — Custom Experiment Builder
   Dark navy with gold accents, monospace code aesthetic.
   Users build jsPsych timelines visually, then run them live.
   ========================================================== */

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { buildCustomHTML } from "@/lib/experiments";

// ── Types ─────────────────────────────────────────────────────────────────
type PluginType =
  | "html-keyboard-response"
  | "html-button-response"
  | "instructions"
  | "survey-likert"
  | "survey-multi-choice";

interface BaseBlock {
  id: string;
  type: PluginType;
  label: string;
}
interface KeyboardBlock extends BaseBlock {
  type: "html-keyboard-response";
  stimulus: string;
  choices: string;
  trial_duration: number | "";
}
interface ButtonBlock extends BaseBlock {
  type: "html-button-response";
  stimulus: string;
  choices: string;
}
interface InstructionsBlock extends BaseBlock {
  type: "instructions";
  pages: string;
}
interface LikertBlock extends BaseBlock {
  type: "survey-likert";
  preamble: string;
  questions: string;
}
interface MultiChoiceBlock extends BaseBlock {
  type: "survey-multi-choice";
  preamble: string;
  questions: string;
}
type Block =
  | KeyboardBlock
  | ButtonBlock
  | InstructionsBlock
  | LikertBlock
  | MultiChoiceBlock;

// ── Block templates ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_TEMPLATES: Record<PluginType, any> = {
  "html-keyboard-response": {
    type: "html-keyboard-response",
    label: "Keyboard Response",
    stimulus: '<div style="text-align:center;margin-top:60px"><h2 style="color:#E8B84B">Your stimulus here</h2><p style="color:#ccc">Press any key to continue.</p></div>',
    choices: "ALL_KEYS",
    trial_duration: "",
  },
  "html-button-response": {
    type: "html-button-response",
    label: "Button Response",
    stimulus: '<div style="text-align:center;margin-top:60px"><h2 style="color:#E8B84B">Your stimulus here</h2></div>',
    choices: "Next",
  },
  instructions: {
    type: "instructions",
    label: "Instructions",
    pages: '["<div style=\\"text-align:center;max-width:500px;margin:0 auto\\"><h2 style=\\"color:#E8B84B\\">Welcome</h2><p style=\\"color:#ccc\\">Instructions go here.</p></div>"]',
  },
  "survey-likert": {
    type: "survey-likert",
    label: "Likert Scale",
    preamble: "Please rate your agreement:",
    questions:
      '[{"prompt":"Statement 1","labels":["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"],"required":true}]',
  },
  "survey-multi-choice": {
    type: "survey-multi-choice",
    label: "Multiple Choice",
    preamble: "Please answer the following:",
    questions:
      '[{"prompt":"Question 1","options":["Option A","Option B","Option C"],"required":true}]',
  },
};

const PLUGIN_ICONS: Record<PluginType, string> = {
  "html-keyboard-response": "⌨️",
  "html-button-response": "🖱️",
  instructions: "📖",
  "survey-likert": "📊",
  "survey-multi-choice": "☑️",
};

const PLUGIN_COLORS: Record<PluginType, string> = {
  "html-keyboard-response": "#4CAF50",
  "html-button-response": "#2196F3",
  instructions: "#9C27B0",
  "survey-likert": "#FF9800",
  "survey-multi-choice": "#E91E63",
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Convert blocks to timeline JSON ──────────────────────────────────────
function blocksToTimeline(blocks: Block[]): string {
  const defs = blocks.map((b) => {
    if (b.type === "html-keyboard-response") {
      const d: any = { type: b.type, stimulus: b.stimulus, choices: b.choices === "ALL_KEYS" ? "ALL_KEYS" : b.choices.split(",").map((s) => s.trim()) };
      if (b.trial_duration !== "") d.trial_duration = Number(b.trial_duration);
      return d;
    }
    if (b.type === "html-button-response") {
      return { type: b.type, stimulus: b.stimulus, choices: b.choices.split(",").map((s) => s.trim()) };
    }
    if (b.type === "instructions") {
      try { return { type: b.type, pages: JSON.parse(b.pages), show_clickable_nav: true }; }
      catch { return { type: b.type, pages: [b.pages], show_clickable_nav: true }; }
    }
    if (b.type === "survey-likert") {
      try { return { type: b.type, preamble: b.preamble, questions: JSON.parse(b.questions) }; }
      catch { return { type: b.type, preamble: b.preamble, questions: [] }; }
    }
    if (b.type === "survey-multi-choice") {
      try { return { type: b.type, preamble: b.preamble, questions: JSON.parse(b.questions) }; }
      catch { return { type: b.type, preamble: b.preamble, questions: [] }; }
    }
    return null;
  }).filter(Boolean);
  return JSON.stringify(defs, null, 2);
}

// ── Block editor fields ───────────────────────────────────────────────────
function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const inputClass = "w-full rounded px-3 py-2 text-sm text-white/90 outline-none focus:ring-1 resize-none";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "DM Sans, sans-serif" };
  const labelClass = "block text-xs text-white/50 mb-1 uppercase tracking-wide";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Block Label</label>
        <input className={inputClass} style={inputStyle} value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })} />
      </div>

      {(block.type === "html-keyboard-response" || block.type === "html-button-response") && (
        <>
          <div>
            <label className={labelClass}>Stimulus HTML</label>
            <textarea className={inputClass} style={{ ...inputStyle, fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}
              rows={5} value={(block as any).stimulus}
              onChange={(e) => onChange({ ...block, stimulus: e.target.value } as Block)} />
          </div>
          <div>
            <label className={labelClass}>
              {block.type === "html-keyboard-response" ? 'Choices (comma-sep, or "ALL_KEYS" / "NO_KEYS")' : "Button Labels (comma-separated)"}
            </label>
            <input className={inputClass} style={inputStyle} value={(block as any).choices}
              onChange={(e) => onChange({ ...block, choices: e.target.value } as Block)} />
          </div>
          {block.type === "html-keyboard-response" && (
            <div>
              <label className={labelClass}>Trial Duration (ms, blank = unlimited)</label>
              <input className={inputClass} style={inputStyle} type="number" placeholder="e.g. 3000"
                value={(block as KeyboardBlock).trial_duration}
                onChange={(e) => onChange({ ...block, trial_duration: e.target.value === "" ? "" : Number(e.target.value) } as Block)} />
            </div>
          )}
        </>
      )}

      {block.type === "instructions" && (
        <div>
          <label className={labelClass}>Pages (JSON array of HTML strings)</label>
          <textarea className={inputClass} style={{ ...inputStyle, fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}
            rows={6} value={(block as InstructionsBlock).pages}
            onChange={(e) => onChange({ ...block, pages: e.target.value } as Block)} />
        </div>
      )}

      {(block.type === "survey-likert" || block.type === "survey-multi-choice") && (
        <>
          <div>
            <label className={labelClass}>Preamble</label>
            <input className={inputClass} style={inputStyle} value={(block as any).preamble}
              onChange={(e) => onChange({ ...block, preamble: e.target.value } as Block)} />
          </div>
          <div>
            <label className={labelClass}>Questions (JSON array)</label>
            <textarea className={inputClass} style={{ ...inputStyle, fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
              rows={7} value={(block as any).questions}
              onChange={(e) => onChange({ ...block, questions: e.target.value } as Block)} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Builder Page ─────────────────────────────────────────────────────
const DEFAULT_BLOCKS: Block[] = [
  {
    id: uid(), type: "instructions", label: "Welcome",
    pages: '["<div style=\\"text-align:center;max-width:500px;margin:0 auto\\"><div style=\\"font-size:48px;margin-bottom:12px\\">🧪</div><h2 style=\\"font-family:Lora,serif;color:#E8B84B\\">My Experiment</h2><p style=\\"color:#ccc;line-height:1.7\\">Welcome! This is a custom jsPsych experiment.</p></div>"]',
  },
  {
    id: uid(), type: "html-keyboard-response", label: "Trial 1",
    stimulus: '<div style="text-align:center;margin-top:80px"><div style="font-size:80px;color:#E8B84B">★</div><p style="color:#ccc;margin-top:16px">Press SPACE to continue.</p></div>',
    choices: " ",
    trial_duration: "",
  },
  {
    id: uid(), type: "survey-likert", label: "Rating",
    preamble: '<p style="font-family:Lora,serif;color:#E8B84B;font-size:18px">Rate your experience</p>',
    questions: '[{"prompt":"How engaging was this experiment?","labels":["Not at all","Slightly","Moderately","Very","Extremely"],"required":true}]',
  },
];

type RunMode = "idle" | "running" | "done";

export default function BuilderPage() {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [runMode, setRunMode] = useState<RunMode>("idle");
  const [results, setResults] = useState<any[]>([]);
  const [showJSON, setShowJSON] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const timelineJSON = blocksToTimeline(blocks);

  // Listen for postMessage from iframe
  useEffect(() => {
    function handle(e: MessageEvent) {
      if (e.data?.type === "jspsych-done") {
        setResults(e.data.data || []);
        setRunMode("done");
      }
    }
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  function addBlock(type: PluginType) {
    const tmpl = BLOCK_TEMPLATES[type];
    const newBlock = { ...tmpl, id: uid() } as Block;
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }

  function updateBlock(updated: Block) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function runExperiment() {
    const html = buildCustomHTML(timelineJSON);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    if (iframeRef.current) iframeRef.current.src = url;
    setRunMode("running");
    setResults([]);
  }

  function resetRun() {
    if (iframeRef.current) iframeRef.current.src = "about:blank";
    setRunMode("idle");
    setResults([]);
  }

  // Drag-and-drop reorder
  function onDragStart(i: number) { setDragIdx(i); }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIdx(i); }
  function onDrop(i: number) {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return; }
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIdx(null); setDragOverIdx(null);
  }

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628", color: "#FDFAF5" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1B2A4A", borderBottom: "1px solid rgba(201,146,42,0.2)" }}>
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/experiment">
              <button className="text-sm text-white/60 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                ← Experiments
              </button>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-lg">🔧</span>
              <span className="font-semibold text-white text-sm" style={{ fontFamily: "Lora, serif" }}>
                Custom Experiment Builder
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJSON((v) => !v)}
              className="text-xs px-3 py-1.5 rounded border transition-all hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "#888", fontFamily: "JetBrains Mono, monospace" }}
            >
              {showJSON ? "Hide JSON" : "View JSON"}
            </button>
            {runMode === "idle" && (
              <button onClick={runExperiment} disabled={blocks.length === 0}
                className="text-sm px-4 py-1.5 rounded font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "#C9922A", color: "#1B2A4A", fontFamily: "DM Sans, sans-serif" }}>
                ▶ Run Experiment
              </button>
            )}
            {runMode !== "idle" && (
              <button onClick={resetRun}
                className="text-sm px-4 py-1.5 rounded font-semibold border transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(201,146,42,0.4)", color: "#E8B84B", fontFamily: "DM Sans, sans-serif" }}>
                ↺ Edit Mode
              </button>
            )}
          </div>
        </div>
      </header>

      {runMode !== "idle" ? (
        /* ── RUN MODE ── */
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,146,42,0.25)" }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "rgba(13,27,51,0.97)", borderBottom: "1px solid rgba(201,146,42,0.2)" }}>
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-white/40" style={{ fontFamily: "JetBrains Mono, monospace" }}>custom-experiment.html</span>
                  {runMode === "running" && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>live</span>
                    </div>
                  )}
                </div>
                {(runMode as string) === "idle" && (
                  <div className="flex items-center justify-center py-20" style={{ backgroundColor: "#0D1B33", minHeight: "460px" }}>
                    <p className="text-white/40 text-sm">Press Run to start</p>
                  </div>
                )}
                <iframe ref={iframeRef} title="Custom Experiment" sandbox="allow-scripts allow-same-origin"
                  style={{ width: "100%", minHeight: "460px", border: "none", display: (runMode as string) !== "idle" ? "block" : "none", backgroundColor: "#0D1B33" }} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg p-4" style={{ backgroundColor: "#1B2A4A", border: "1px solid rgba(201,146,42,0.2)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: runMode === "running" ? "#4CAF50" : "#C9922A", boxShadow: runMode === "running" ? "0 0 6px #4CAF50" : "none" }} />
                  <span className="text-xs font-medium text-white/70" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {runMode === "running" ? "RUNNING" : "COMPLETE"}
                  </span>
                </div>
                <p className="text-xs text-white/40" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {runMode === "running" ? `${blocks.length} trial block(s) in timeline` : `${results.length} trial(s) recorded`}
                </p>
              </div>
              {(runMode as string) === "done" && results.length > 0 && (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,146,42,0.2)" }}>
                  <div className="px-4 py-3" style={{ backgroundColor: "#1B2A4A" }}>
                    <span className="text-sm font-semibold text-white" style={{ fontFamily: "Lora, serif" }}>Collected Data</span>
                  </div>
                  <div className="overflow-x-auto" style={{ backgroundColor: "#0D1B33", maxHeight: "320px", overflowY: "auto" }}>
                    <table className="w-full text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          {["#", "type", "rt", "response"].map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-white/40 font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td className="px-3 py-2 text-white/30">{i + 1}</td>
                            <td className="px-3 py-2" style={{ color: "#C9922A" }}>{(r.trial_type || "").replace("jsPsych", "").replace("Plugin", "").slice(0, 20)}</td>
                            <td className="px-3 py-2" style={{ color: r.rt ? "#4CAF50" : "#888" }}>{r.rt ? Math.round(r.rt) : "—"}</td>
                            <td className="px-3 py-2 text-white/60 truncate max-w-[100px]">
                              {typeof r.response === "object" ? JSON.stringify(r.response).slice(0, 30) : String(r.response ?? "—")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── EDIT MODE ── */
        <div className="container py-6">
          <div className="grid grid-cols-12 gap-6" style={{ minHeight: "calc(100vh - 120px)" }}>

            {/* ── Col 1: Plugin palette ── */}
            <div className="col-span-12 md:col-span-3">
              <div className="rounded-lg p-4 sticky top-6" style={{ backgroundColor: "#1B2A4A", border: "1px solid rgba(201,146,42,0.2)" }}>
                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Add Block
                </h3>
                <div className="space-y-2">
                  {(Object.keys(BLOCK_TEMPLATES) as PluginType[]).map((type) => (
                    <button key={type} onClick={() => addBlock(type)}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all hover:bg-white/5"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-xl">{PLUGIN_ICONS[type]}</span>
                      <div>
                        <div className="text-sm font-medium text-white" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          {BLOCK_TEMPLATES[type].label}
                        </div>
                        <div className="text-xs" style={{ color: PLUGIN_COLORS[type], fontFamily: "JetBrains Mono, monospace" }}>
                          {type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Tips
                  </h3>
                  <ul className="space-y-2 text-xs text-white/40" style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>
                    <li>• Drag blocks to reorder the timeline</li>
                    <li>• Click a block to edit its properties</li>
                    <li>• Use HTML in stimulus fields</li>
                    <li>• Questions must be valid JSON arrays</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Col 2: Timeline ── */}
            <div className="col-span-12 md:col-span-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/50" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Timeline ({blocks.length} blocks)
                </h3>
              </div>

              {blocks.length === 0 && (
                <div className="rounded-lg p-8 text-center" style={{ border: "2px dashed rgba(255,255,255,0.1)" }}>
                  <p className="text-white/30 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Add blocks from the palette →
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {blocks.map((block, i) => (
                  <div key={block.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={() => onDrop(i)}
                    onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                    onClick={() => setSelectedId(block.id)}
                    className="rounded-lg px-4 py-3 cursor-pointer transition-all select-none"
                    style={{
                      backgroundColor: selectedId === block.id ? "rgba(201,146,42,0.12)" : dragOverIdx === i ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedId === block.id ? "#C9922A" : dragOverIdx === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                      transform: dragIdx === i ? "scale(0.98) opacity-50" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-0.5 text-white/20 text-xs select-none cursor-grab">
                        <span>⠿</span>
                      </div>
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: PLUGIN_COLORS[block.type] + "22", border: `1px solid ${PLUGIN_COLORS[block.type]}44` }}
                      >
                        {PLUGIN_ICONS[block.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          {block.label}
                        </div>
                        <div className="text-xs truncate" style={{ color: PLUGIN_COLORS[block.type], fontFamily: "JetBrains Mono, monospace" }}>
                          {block.type}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-white/30 font-mono">{i + 1}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* JSON view */}
              {showJSON && (
                <div className="mt-4 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,146,42,0.2)" }}>
                  <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: "#1B2A4A" }}>
                    <span className="text-xs text-white/50" style={{ fontFamily: "JetBrains Mono, monospace" }}>timeline.json</span>
                  </div>
                  <pre className="p-3 text-xs overflow-x-auto" style={{ backgroundColor: "#0D1B33", color: "#C9922A", fontFamily: "JetBrains Mono, monospace", maxHeight: "300px", overflowY: "auto", margin: 0 }}>
                    {timelineJSON}
                  </pre>
                </div>
              )}
            </div>

            {/* ── Col 3: Block editor ── */}
            <div className="col-span-12 md:col-span-5">
              {selectedBlock ? (
                <div className="rounded-lg p-5 sticky top-6" style={{ backgroundColor: "#1B2A4A", border: "1px solid rgba(201,146,42,0.2)" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: PLUGIN_COLORS[selectedBlock.type] + "22", border: `1px solid ${PLUGIN_COLORS[selectedBlock.type]}44` }}
                    >
                      {PLUGIN_ICONS[selectedBlock.type]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white" style={{ fontFamily: "Lora, serif" }}>
                        Edit Block
                      </div>
                      <div className="text-xs" style={{ color: PLUGIN_COLORS[selectedBlock.type], fontFamily: "JetBrains Mono, monospace" }}>
                        {selectedBlock.type}
                      </div>
                    </div>
                  </div>
                  <BlockEditor block={selectedBlock} onChange={updateBlock} />
                </div>
              ) : (
                <div className="rounded-lg p-8 text-center" style={{ border: "2px dashed rgba(255,255,255,0.08)" }}>
                  <p className="text-white/30 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Select a block to edit its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
