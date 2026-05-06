# APA Publications & jsPsych Explorer — Design Brainstorm

## Context
A website that:
1. Summarizes APA Publications & Databases (PsycInfo, PsycArticles, PsycBooks, etc.)
2. Embeds a live jsPsych v7 experiment simulation (reaction time + survey tasks)

---

<response>
<probability>0.07</probability>
<text>

## Idea A — "Scientific Manuscript" (Academic Brutalism)

**Design Movement:** Academic Brutalism meets Swiss International Typographic Style

**Core Principles:**
- Raw, undecorated structure — content IS the design
- Strict typographic hierarchy with no decorative chrome
- Monochrome base with a single bold accent (deep crimson)
- Dense information density balanced by disciplined whitespace

**Color Philosophy:**
- Background: off-white parchment (#F7F4EF) — evokes printed paper
- Foreground: near-black ink (#1A1A1A)
- Accent: APA crimson (#C1121F) — institutional authority
- Secondary: slate (#6B7280) for metadata and captions

**Layout Paradigm:**
- Asymmetric two-column editorial grid (60/40 split)
- Left column: navigation + metadata; Right column: main content
- Sections separated by thick horizontal rules, not cards
- No rounded corners anywhere — everything is sharp-edged

**Signature Elements:**
- Large oversized section numerals (01, 02, 03) as structural anchors
- Monospaced font for data/code blocks (experiment output)
- Thick left-border accent bars on blockquotes

**Interaction Philosophy:**
- Minimal hover states — only underlines and color shifts
- jsPsych experiment embedded in a "lab notebook" panel
- Keyboard-first navigation

**Animation:**
- Entrance: text lines slide in from left, staggered by 80ms
- Experiment transitions: crossfade only, no bounce
- No decorative animations — motion serves function

**Typography System:**
- Display: "Playfair Display" — authoritative serif for headings
- Body: "Source Serif 4" — readable academic prose
- Mono: "JetBrains Mono" — experiment output and code

</text>
</response>

<response>
<probability>0.06</probability>
<text>

## Idea B — "Neural Lab" (Dark Neuro-Scientific)

**Design Movement:** Dark Mode Scientific Dashboard + Biopunk

**Core Principles:**
- Deep dark backgrounds evoking neural imaging software
- Glowing accent lines suggesting EEG/fMRI visualizations
- Data-forward: every element feels like it came from a research instrument
- Controlled luminosity — only key elements glow

**Color Philosophy:**
- Background: near-black navy (#0D1117)
- Surface: dark slate (#161B22)
- Primary glow: electric teal (#00D4AA)
- Secondary: muted violet (#7C3AED)
- Text: cool white (#E6EDF3)

**Layout Paradigm:**
- Dashboard grid — 3-column with collapsible sidebar
- Database cards displayed as instrument panels
- jsPsych experiment in a "terminal window" aesthetic

**Signature Elements:**
- Animated waveform dividers between sections
- Glowing border on active/hover states
- Monospaced readouts for experiment data

**Interaction Philosophy:**
- Hover reveals data overlays
- Experiment feels like running a real neurological test
- Smooth dark transitions

**Animation:**
- Pulse glow on interactive elements
- Waveform animation in hero section
- Slide-up entrance for cards

**Typography System:**
- Display: "Space Grotesk" — modern scientific
- Body: "Inter" — clean readability
- Mono: "Fira Code" — terminal/data output

</text>
</response>

<response>
<probability>0.08</probability>
<text>

## Idea C — "Archival Intelligence" (Warm Institutional + Modern Clarity) ← SELECTED

**Design Movement:** Warm Institutional Modernism — think Smithsonian meets Figma

**Core Principles:**
- Warm cream and deep navy create institutional gravitas without coldness
- Clean asymmetric layout with generous breathing room
- jsPsych experiment panel feels like a real lab environment embedded in an archive
- Typography-driven hierarchy: size and weight do the heavy lifting

**Color Philosophy:**
- Background: warm cream (#FDFAF5) — archival warmth
- Deep navy: (#1B2A4A) — authority and depth
- Accent gold: (#C9922A) — academic prestige, APA-adjacent
- Muted sage: (#6B8F71) — psychological calm
- Text: dark charcoal (#2C2C2C)

**Layout Paradigm:**
- Full-width sticky header with left-aligned logo + right nav
- Hero: split layout — left text block, right decorative element
- Database section: horizontal scrolling card rail
- Experiment section: full-width "lab panel" with dark background inset

**Signature Elements:**
- Thin gold horizontal rules as section dividers
- Serif display headings with tight tracking
- Experiment panel styled as a dark "instrument console"

**Interaction Philosophy:**
- Cards lift with subtle shadow on hover
- Experiment steps have smooth fade transitions
- Progress indicators for multi-step experiment

**Animation:**
- Scroll-triggered fade-up for content sections
- Experiment: jsPsych native transitions + custom progress bar
- Header: subtle backdrop blur on scroll

**Typography System:**
- Display: "Lora" — warm authoritative serif
- Body: "DM Sans" — modern, clean, legible
- Mono: "JetBrains Mono" — experiment data output

</text>
</response>

---

## Selected Approach: **Idea C — "Archival Intelligence"**

Warm cream + deep navy palette with gold accents. Lora serif headings, DM Sans body. Asymmetric layout with a "lab panel" inset for the jsPsych experiment.
