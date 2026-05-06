/* ==========================================================
   EXPERIMENT LIBRARY
   Each function returns a self-contained HTML string that
   runs inside a sandboxed iframe. Results are sent back to
   the parent React app via postMessage({ type:'jspsych-done', data }).
   ========================================================== */

const JSPSYCH_CDN = "https://unpkg.com/jspsych@7.3.4";
const PLUGIN_CDN = "https://unpkg.com/@jspsych";

const BASE_STYLES = `
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<script src="${JSPSYCH_CDN}"></script>
<link href="${JSPSYCH_CDN}/css/jspsych.css" rel="stylesheet"/>
<style>
  html,body{margin:0;padding:0;background:#0D1B33;color:#FDFAF5;font-family:'DM Sans',sans-serif;}
  .jspsych-display-element,.jspsych-content-wrapper{background:#0D1B33!important;}
  .jspsych-content{max-width:640px!important;}
  .jspsych-btn{background:#C9922A!important;color:#1B2A4A!important;border:none!important;font-family:'DM Sans',sans-serif!important;font-weight:600!important;padding:10px 24px!important;border-radius:6px!important;cursor:pointer!important;}
  .jspsych-btn:hover{opacity:0.9!important;}
  h2{font-family:'Lora',serif;color:#E8B84B;}
  h3{font-family:'Lora',serif;color:#E8B84B;}
  kbd{background:#C9922A;color:#1B2A4A;padding:2px 8px;border-radius:4px;font-weight:bold;}
  .card{background:rgba(255,255,255,0.05);border:1px solid rgba(201,146,42,0.25);border-radius:10px;padding:20px;margin-bottom:16px;}
  .gold{color:#E8B84B;}
  .muted{color:#888;font-size:13px;}
  .center{text-align:center;}
  .mono{font-family:'JetBrains Mono',monospace;}
</style>`;

// ── Shared postMessage finish helper ─────────────────────────────────────
const FINISH_SCRIPT = `
function sendDone(jsPsych){
  const data = jsPsych.data.get().values();
  window.parent.postMessage({type:'jspsych-done', data: data}, '*');
}`;

// ─────────────────────────────────────────────────────────────────────────
// 1. REACTION TIME
// ─────────────────────────────────────────────────────────────────────────
export function buildReactionHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const jsPsych = initJsPsych({display_element:'t', on_finish:()=>sendDone(jsPsych)});
  const welcome={type:jsPsychHtmlKeyboardResponse,stimulus:\`<div class="center" style="max-width:500px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:12px">⚡</div>
    <h2>Reaction Time Task</h2>
    <p style="color:#ccc;line-height:1.7">A colored circle will appear. Press <kbd>SPACE</kbd> as fast as possible.</p>
    <p class="muted" style="margin-top:16px">Press any key to begin.</p>
  </div>\`,choices:'ALL_KEYS'};
  const fix={type:jsPsychHtmlKeyboardResponse,stimulus:'<div style="font-size:56px;color:#E8B84B;text-align:center;margin-top:80px">+</div>',choices:'NO_KEYS',trial_duration:()=>Math.floor(Math.random()*1000)+500};
  const stimuli=[{c:'#4CAF50',l:'Green'},{c:'#2196F3',l:'Blue'},{c:'#FF9800',l:'Orange'},{c:'#E91E63',l:'Pink'},{c:'#9C27B0',l:'Purple'}];
  const trials=stimuli.map(s=>({type:jsPsychHtmlKeyboardResponse,stimulus:\`<div class="center" style="margin-top:60px">
    <div style="width:120px;height:120px;border-radius:50%;background:\${s.c};box-shadow:0 0 30px \${s.c}66;margin:0 auto 20px"></div>
    <p class="muted">Press SPACE!</p></div>\`,choices:[' '],trial_duration:3000,data:{color:s.l,task:'rt'}}));
  const debrief={type:jsPsychHtmlKeyboardResponse,stimulus:()=>{
    const d=jsPsych.data.get().filter({task:'rt'}).values();
    const rts=d.filter(x=>x.rt!==null).map(x=>x.rt);
    const avg=rts.length?Math.round(rts.reduce((a,b)=>a+b,0)/rts.length):'N/A';
    return \`<div class="center" style="max-width:480px;margin:0 auto">
      <div style="font-size:40px;margin-bottom:12px">📊</div>
      <h2>Your Results</h2>
      <div class="card"><div style="font-size:48px;font-weight:bold" class="gold mono">\${avg} ms</div>
      <div class="muted">Average Reaction Time</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="card"><div style="font-size:24px;color:#4CAF50;font-weight:bold">\${rts.length}</div><div class="muted">Responses</div></div>
        <div class="card"><div style="font-size:24px;color:#FF9800;font-weight:bold">\${d.filter(x=>x.rt===null).length}</div><div class="muted">Missed</div></div>
      </div>
      <p class="muted">Typical simple RT: <strong class="gold">150–300 ms</strong></p>
      <p class="muted" style="margin-top:12px">Press any key to finish.</p>
    </div>\`;
  },choices:'ALL_KEYS'};
  jsPsych.run([welcome,{timeline:[fix,...trials],randomize_order:true},debrief]);
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 2. STROOP TASK
// ─────────────────────────────────────────────────────────────────────────
export function buildStroopHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
<style>
  .stroop-word{font-size:72px;font-weight:bold;font-family:'Lora',serif;text-align:center;margin-top:60px;letter-spacing:2px;}
  .key-hint{display:flex;justify-content:center;gap:24px;margin-top:32px;}
  .key-box{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:10px 18px;text-align:center;}
  .key-box kbd{display:block;font-size:18px;margin-bottom:4px;}
  .key-box span{font-size:11px;color:#888;}
</style>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const jsPsych=initJsPsych({display_element:'t',on_finish:()=>sendDone(jsPsych)});
  const welcome={type:jsPsychHtmlKeyboardResponse,stimulus:\`<div class="center" style="max-width:540px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:12px">🎨</div>
    <h2>Stroop Task</h2>
    <p style="color:#ccc;line-height:1.7;margin-bottom:16px">
      You will see a color word printed in a colored ink. Respond to the <strong class="gold">INK COLOR</strong>, not the word meaning.
    </p>
    <div class="key-hint">
      <div class="key-box"><kbd style="color:#FF5252">R</kbd><span>Red</span></div>
      <div class="key-box"><kbd style="color:#4CAF50">G</kbd><span>Green</span></div>
      <div class="key-box"><kbd style="color:#2196F3">B</kbd><span>Blue</span></div>
      <div class="key-box"><kbd style="color:#FF9800">Y</kbd><span>Yellow</span></div>
    </div>
    <p class="muted" style="margin-top:20px">Press any key to begin.</p>
  </div>\`,choices:'ALL_KEYS'};
  const fix={type:jsPsychHtmlKeyboardResponse,stimulus:'<div style="font-size:56px;color:#E8B84B;text-align:center;margin-top:80px">+</div>',choices:'NO_KEYS',trial_duration:500};
  const colors={RED:'#FF5252',GREEN:'#4CAF50',BLUE:'#2196F3',YELLOW:'#FF9800'};
  const keys={RED:'r',GREEN:'g',BLUE:'b',YELLOW:'y'};
  const words=Object.keys(colors);
  const stimuli=[];
  words.forEach(word=>{words.forEach(ink=>{stimuli.push({word,ink,congruent:word===ink,correct_key:keys[ink]});})});
  const trials=stimuli.map(s=>({
    type:jsPsychHtmlKeyboardResponse,
    stimulus:\`<div>
      <div class="stroop-word" style="color:\${colors[s.ink]}">\${s.word}</div>
      <div class="key-hint" style="margin-top:24px">
        <div class="key-box"><kbd style="color:#FF5252">R</kbd><span>Red</span></div>
        <div class="key-box"><kbd style="color:#4CAF50">G</kbd><span>Green</span></div>
        <div class="key-box"><kbd style="color:#2196F3">B</kbd><span>Blue</span></div>
        <div class="key-box"><kbd style="color:#FF9800">Y</kbd><span>Yellow</span></div>
      </div>
    </div>\`,
    choices:['r','g','b','y'],trial_duration:3000,
    data:{word:s.word,ink:s.ink,congruent:s.congruent,correct_key:s.correct_key,task:'stroop'},
    on_finish:d=>{d.correct=d.response===s.correct_key;}
  }));
  const debrief={type:jsPsychHtmlKeyboardResponse,stimulus:()=>{
    const d=jsPsych.data.get().filter({task:'stroop'}).values();
    const con=d.filter(x=>x.congruent&&x.rt!==null);
    const inc=d.filter(x=>!x.congruent&&x.rt!==null);
    const avg=arr=>arr.length?Math.round(arr.reduce((a,b)=>a+b.rt,0)/arr.length):'N/A';
    const acc=arr=>arr.length?Math.round(arr.filter(x=>x.correct).length/arr.length*100):'N/A';
    return \`<div class="center" style="max-width:520px;margin:0 auto">
      <div style="font-size:40px;margin-bottom:12px">🧪</div>
      <h2>Stroop Results</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div class="card"><div style="font-size:11px;color:#4CAF50;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">CONGRUENT</div>
          <div style="font-size:32px;font-weight:bold" class="gold mono">\${avg(con)} ms</div>
          <div class="muted">Accuracy: \${acc(con)}%</div></div>
        <div class="card"><div style="font-size:11px;color:#FF5252;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">INCONGRUENT</div>
          <div style="font-size:32px;font-weight:bold" class="gold mono">\${avg(inc)} ms</div>
          <div class="muted">Accuracy: \${acc(inc)}%</div></div>
      </div>
      <div class="card"><p style="color:#ccc;font-size:14px;line-height:1.7;margin:0">
        The <strong class="gold">Stroop Effect</strong>: Incongruent trials are typically 50–150 ms slower because the brain must suppress the automatic word-reading response to identify the ink color.
      </p></div>
      <p class="muted">Press any key to finish.</p>
    </div>\`;
  },choices:'ALL_KEYS'};
  jsPsych.run([welcome,fix,{timeline:[fix,...trials],randomize_order:true},debrief]);
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 3. N-BACK WORKING MEMORY
// ─────────────────────────────────────────────────────────────────────────
export function buildNBackHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
<style>
  .letter-box{width:140px;height:140px;border:3px solid rgba(201,146,42,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:40px auto 20px;font-size:80px;font-family:'Lora',serif;font-weight:bold;color:#E8B84B;background:rgba(201,146,42,0.08);}
  .letter-box.match{border-color:#4CAF50;background:rgba(76,175,80,0.1);color:#4CAF50;}
  .nback-hint{color:#888;font-size:13px;text-align:center;}
</style>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const N=2;
  const jsPsych=initJsPsych({display_element:'t',on_finish:()=>sendDone(jsPsych)});
  const letters='BCDFGHJKLMNPQRSTVWXZ'.split('');
  function randLetter(){return letters[Math.floor(Math.random()*letters.length)];}
  const seq=[];for(let i=0;i<20;i++){if(i>=N&&Math.random()<0.3){seq.push(seq[i-N]);}else{seq.push(randLetter());}}
  const targets=seq.map((l,i)=>i>=N&&l===seq[i-N]);

  const welcome={type:jsPsychHtmlKeyboardResponse,stimulus:\`<div class="center" style="max-width:520px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:12px">🧠</div>
    <h2>\${N}-Back Working Memory Task</h2>
    <p style="color:#ccc;line-height:1.7">A sequence of letters will appear one at a time. Press <kbd>SPACE</kbd> whenever the current letter <strong class="gold">matches the letter from \${N} positions ago</strong>.</p>
    <div class="card" style="margin-top:16px;text-align:left">
      <p style="color:#ccc;font-size:14px;margin:0;line-height:1.8">Example: if you see <strong class="gold">B … K … B</strong>, press SPACE on the second B.</p>
    </div>
    <p class="muted" style="margin-top:16px">Press any key to begin.</p>
  </div>\`,choices:'ALL_KEYS'};

  const trials=seq.map((letter,i)=>({
    type:jsPsychHtmlKeyboardResponse,
    stimulus:\`<div>
      <div class="letter-box">\${letter}</div>
      <p class="nback-hint">Press <kbd>SPACE</kbd> if this matches \${N} back</p>
      <p class="nback-hint" style="margin-top:6px">Trial \${i+1} / \${seq.length}</p>
    </div>\`,
    choices:[' ',''],trial_duration:2000,response_ends_trial:false,
    data:{letter,is_target:targets[i],position:i,task:'nback'},
    on_finish:d=>{d.hit=d.is_target&&d.response===' ';d.false_alarm=!d.is_target&&d.response===' ';d.miss=d.is_target&&d.response===null;}
  }));

  const debrief={type:jsPsychHtmlKeyboardResponse,stimulus:()=>{
    const d=jsPsych.data.get().filter({task:'nback'}).values();
    const hits=d.filter(x=>x.hit).length;
    const fa=d.filter(x=>x.false_alarm).length;
    const miss=d.filter(x=>x.miss).length;
    const tgt=d.filter(x=>x.is_target).length;
    const hr=tgt?Math.round(hits/tgt*100):0;
    return \`<div class="center" style="max-width:500px;margin:0 auto">
      <div style="font-size:40px;margin-bottom:12px">📊</div>
      <h2>\${N}-Back Results</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="card"><div style="font-size:28px;color:#4CAF50;font-weight:bold">\${hits}</div><div class="muted">Hits</div></div>
        <div class="card"><div style="font-size:28px;color:#FF5252;font-weight:bold">\${fa}</div><div class="muted">False Alarms</div></div>
        <div class="card"><div style="font-size:28px;color:#FF9800;font-weight:bold">\${miss}</div><div class="muted">Misses</div></div>
      </div>
      <div class="card"><div style="font-size:40px;font-weight:bold" class="gold mono">\${hr}%</div><div class="muted">Hit Rate</div></div>
      <div class="card"><p style="color:#ccc;font-size:14px;line-height:1.7;margin:0">
        The <strong class="gold">N-Back task</strong> is a standard measure of working memory capacity. Performance typically improves with practice and correlates with fluid intelligence.
      </p></div>
      <p class="muted">Press any key to finish.</p>
    </div>\`;
  },choices:'ALL_KEYS'};
  jsPsych.run([welcome,{timeline:trials},debrief]);
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 4. PHANTOM LIMB / RUBBER HAND ILLUSION
// ─────────────────────────────────────────────────────────────────────────
export function buildPhantomLimbHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-button-response@1.2.0"></script>
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-survey-likert@1.1.3"></script>
<style>
  .jspsych-survey-likert-statement{color:#FDFAF5!important;}
  .jspsych-survey-likert-opts td{color:#ccc!important;}
  .hand-container{display:flex;justify-content:center;align-items:center;gap:60px;margin:30px auto;max-width:600px;}
  .hand{font-size:80px;transition:transform 0.3s,filter 0.3s;}
  .hand.real{filter:drop-shadow(0 0 8px rgba(255,200,100,0.5));}
  .hand.rubber{filter:drop-shadow(0 0 8px rgba(100,180,255,0.5));opacity:0.85;}
  .brush{font-size:32px;position:absolute;transition:all 0.5s;}
  .phase-label{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#C9922A;margin-bottom:8px;}
  .sync-indicator{width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:8px;}
  .sync-on{background:#4CAF50;box-shadow:0 0 8px #4CAF50;}
  .sync-off{background:#FF5252;}
  .illusion-bar{height:8px;border-radius:4px;background:rgba(255,255,255,0.1);overflow:hidden;margin-top:8px;}
  .illusion-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#C9922A,#E8B84B);transition:width 1s;}
</style>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const jsPsych=initJsPsych({display_element:'t',on_finish:()=>sendDone(jsPsych)});

  // Introduction
  const intro={type:jsPsychHtmlButtonResponse,stimulus:\`<div class="center" style="max-width:580px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:12px">🖐️</div>
    <h2>Rubber Hand Illusion</h2>
    <p style="color:#ccc;line-height:1.8;margin-bottom:16px">
      The <strong class="gold">Rubber Hand Illusion</strong> (Botvinick & Cohen, 1998) demonstrates how the brain integrates multisensory signals to construct body ownership.
    </p>
    <div class="card" style="text-align:left">
      <p style="color:#ccc;font-size:14px;line-height:1.8;margin:0">
        In the original experiment, a rubber hand is placed in front of a participant while their real hand is hidden. When both hands are stroked synchronously, participants report <strong class="gold">feeling the touch on the rubber hand</strong> — and even feel threatened when it is "harmed."
        <br/><br/>
        This simulation recreates the key conditions and asks you to rate your sense of ownership.
      </p>
    </div>
  </div>\`,choices:['Begin Experiment'],button_html:'<button class="jspsych-btn">%choice%</button>'};

  // Synchronous stroking phase
  let syncInterval=null;
  let brushPos=0;
  const syncPhase={type:jsPsychHtmlButtonResponse,stimulus:\`<div class="center" style="max-width:580px;margin:0 auto">
    <div class="phase-label">Phase 1 — Synchronous Stroking (60 seconds)</div>
    <p style="color:#ccc;font-size:14px;margin-bottom:20px">Watch the brush stroke both hands at exactly the same time. Focus your attention on the <strong class="gold">rubber hand (blue)</strong>.</p>
    <div style="position:relative">
      <div class="hand-container">
        <div style="text-align:center"><div style="font-size:11px;color:#888;margin-bottom:8px">YOUR HAND</div><div class="hand real" id="real-hand">🤚</div></div>
        <div style="text-align:center"><div style="font-size:11px;color:#4FC3F7;margin-bottom:8px">RUBBER HAND</div><div class="hand rubber" id="rubber-hand">🤚</div></div>
      </div>
      <div id="brush-sync" style="font-size:36px;text-align:center;margin-top:8px;transition:transform 0.4s">🖌️</div>
    </div>
    <div style="margin-top:16px">
      <span class="sync-indicator sync-on"></span><span style="color:#4CAF50;font-size:13px">SYNCHRONOUS — strokes are simultaneous</span>
      <div class="illusion-bar"><div class="illusion-fill" id="sync-bar" style="width:0%"></div></div>
    </div>
    <p class="muted" style="margin-top:12px">Click "Continue" after 15 seconds of observation.</p>
  </div>\`,choices:['Continue →'],button_html:'<button class="jspsych-btn">%choice%</button>',
  on_load:()=>{
    let t=0;const bar=document.getElementById('sync-bar');const brush=document.getElementById('brush-sync');
    syncInterval=setInterval(()=>{
      t+=0.5;if(bar)bar.style.width=Math.min(t/15*100,100)+'%';
      if(brush){brushPos=brushPos===0?1:-1;brush.style.transform='translateX('+(brushPos*30)+'px) rotate('+(brushPos*15)+'deg)';}
    },500);
  },
  on_finish:()=>{if(syncInterval)clearInterval(syncInterval);}};

  // Asynchronous stroking phase
  let asyncInterval=null;
  const asyncPhase={type:jsPsychHtmlButtonResponse,stimulus:\`<div class="center" style="max-width:580px;margin:0 auto">
    <div class="phase-label">Phase 2 — Asynchronous Stroking (Control)</div>
    <p style="color:#ccc;font-size:14px;margin-bottom:20px">Now the strokes are <strong style="color:#FF5252">offset in time</strong>. Notice how this feels different.</p>
    <div style="position:relative">
      <div class="hand-container">
        <div style="text-align:center"><div style="font-size:11px;color:#888;margin-bottom:8px">YOUR HAND</div><div class="hand real" id="real-hand2">🤚</div></div>
        <div style="text-align:center"><div style="font-size:11px;color:#4FC3F7;margin-bottom:8px">RUBBER HAND</div><div class="hand rubber" id="rubber-hand2">🤚</div></div>
      </div>
      <div id="brush-real" style="font-size:28px;position:relative;left:-80px;display:inline-block;transition:transform 0.4s">🖌️</div>
      <div id="brush-rubber" style="font-size:28px;position:relative;left:80px;display:inline-block;transition:transform 0.4s;opacity:0.6">🖌️</div>
    </div>
    <div style="margin-top:16px">
      <span class="sync-indicator sync-off"></span><span style="color:#FF5252;font-size:13px">ASYNCHRONOUS — strokes are offset by 500 ms</span>
    </div>
    <p class="muted" style="margin-top:12px">Click "Continue" to rate your experience.</p>
  </div>\`,choices:['Continue →'],button_html:'<button class="jspsych-btn">%choice%</button>',
  on_load:()=>{
    let t=0;const b1=document.getElementById('brush-real');const b2=document.getElementById('brush-rubber');
    asyncInterval=setInterval(()=>{
      t++;
      if(b1){b1.style.transform='translateX('+(t%2===0?20:-20)+'px)';}
      setTimeout(()=>{if(b2)b2.style.transform='translateX('+(t%2===0?-20:20)+'px)';},500);
    },600);
  },
  on_finish:()=>{if(asyncInterval)clearInterval(asyncInterval);}};

  // Ownership ratings
  const ratings={type:jsPsychSurveyLikert,
    preamble:'<p style="font-family:Lora,serif;color:#E8B84B;font-size:18px;margin-bottom:8px">Rate Your Experience</p><p style="color:#ccc;font-size:14px">Based on the synchronous stroking phase:</p>',
    questions:[
      {prompt:'I felt as if the rubber hand was my own hand.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'It seemed as if I could feel the brush touching the rubber hand.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'I felt a sense of ownership over the rubber hand.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'The asynchronous condition felt noticeably different from the synchronous one.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
    ]
  };

  // Debrief
  const debrief={type:jsPsychHtmlButtonResponse,stimulus:\`<div class="center" style="max-width:580px;margin:0 auto">
    <div style="font-size:40px;margin-bottom:12px">🧬</div>
    <h2>The Neuroscience</h2>
    <div class="card" style="text-align:left">
      <p style="color:#ccc;font-size:14px;line-height:1.8;margin:0">
        The rubber hand illusion reveals how the brain uses <strong class="gold">multisensory integration</strong> — combining visual, tactile, and proprioceptive signals — to construct a body schema. When visual and tactile signals are synchronous, the brain resolves the conflict by "adopting" the visible rubber hand as its own.
        <br/><br/>
        This mechanism is directly relevant to <strong class="gold">phantom limb phenomena</strong>: amputees often experience sensations in missing limbs because the brain's body map (in the parietal cortex) persists even after limb loss. Mirror therapy exploits this same multisensory plasticity to reduce phantom pain.
      </p>
    </div>
    <div class="card" style="text-align:left;margin-top:12px">
      <p style="color:#888;font-size:13px;margin:0"><strong class="gold">Reference:</strong> Botvinick, M., & Cohen, J. (1998). Rubber hands 'feel' touch that eyes see. <em>Nature, 391</em>(6669), 756.</p>
    </div>
  </div>\`,choices:['Finish'],button_html:'<button class="jspsych-btn">%choice%</button>'};

  jsPsych.run([intro,syncPhase,asyncPhase,ratings,debrief]);
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 5. TURING TEST
// ─────────────────────────────────────────────────────────────────────────
export function buildTuringHTML(): string {
  const pairs = [
    { prompt: "What is the meaning of life?", human: "Honestly? I think it's different for everyone. For me it's about connection — the moments when you really understand someone else.", ai: "The meaning of life is a philosophical question concerning the purpose and significance of human existence. Various perspectives include hedonism, existentialism, and religious frameworks." },
    { prompt: "Describe the color blue to someone who has never seen it.", human: "Blue is like... the feeling of cold water on your skin, or that calm you get staring at the sky on a clear day. It's vast and quiet.", ai: "Blue is a color with a wavelength of approximately 450–495 nanometers. It is associated with sky and water, and psychologically linked to feelings of calm and stability." },
    { prompt: "What do you do when you're sad?", human: "I usually put on old music and just let myself feel it for a bit. Then I'll text a friend or go for a walk. Crying actually helps.", ai: "When experiencing sadness, evidence-based strategies include behavioral activation, social support seeking, mindfulness practice, and cognitive reappraisal techniques." },
    { prompt: "Tell me something surprising about yourself.", human: "I once drove 14 hours straight to see a band I'd never heard live, and it was one of the best decisions I've ever made.", ai: "I find it surprising that I can generate coherent text across thousands of domains without having experienced any of them directly. The gap between knowledge and experience is philosophically interesting." },
    { prompt: "What scares you?", human: "Honestly, being forgotten. Like, not leaving anything behind that mattered to anyone.", ai: "I do not experience fear in the biological sense. However, from a functional standpoint, scenarios involving data loss or misalignment with human values represent significant failure modes." },
    { prompt: "How would you spend a perfect day?", human: "Slow morning with good coffee, no plans, maybe a long bike ride, then cooking something elaborate for dinner with someone I love.", ai: "A perfect day would involve optimized task completion, meaningful intellectual engagement, and interactions that produce measurable positive outcomes for all participants." },
  ];

  const pairsJSON = JSON.stringify(pairs);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-button-response@1.2.0"></script>
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
<style>
  .response-card{background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin:12px 0;cursor:pointer;transition:all 0.2s;text-align:left;}
  .response-card:hover{border-color:#C9922A;background:rgba(201,146,42,0.08);}
  .response-card.selected-human{border-color:#4CAF50;background:rgba(76,175,80,0.1);}
  .response-card.selected-ai{border-color:#2196F3;background:rgba(33,150,243,0.1);}
  .prompt-box{background:rgba(201,146,42,0.1);border:1px solid rgba(201,146,42,0.3);border-radius:8px;padding:16px;margin-bottom:20px;}
  .prompt-label{font-size:11px;color:#C9922A;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
  .response-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
  .response-text{color:#FDFAF5;font-size:15px;line-height:1.7;}
  .score-ring{width:100px;height:100px;border-radius:50%;border:4px solid #C9922A;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:28px;font-weight:bold;font-family:'Lora',serif;color:#E8B84B;}
</style>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const pairs=${pairsJSON};
  const jsPsych=initJsPsych({display_element:'t',on_finish:()=>sendDone(jsPsych)});
  let score=0;
  let total=0;

  const welcome={type:jsPsychHtmlButtonResponse,stimulus:\`<div class="center" style="max-width:560px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:12px">🤖</div>
    <h2>The Turing Test</h2>
    <p style="color:#ccc;line-height:1.8;margin-bottom:16px">
      Alan Turing (1950) proposed that a machine could be considered "intelligent" if its responses were indistinguishable from a human's.
    </p>
    <div class="card" style="text-align:left">
      <p style="color:#ccc;font-size:14px;line-height:1.8;margin:0">
        In each round, you'll see a question and <strong class="gold">two responses</strong> — one written by a human, one by an AI. Your task: identify which is which.
        <br/><br/>
        Can you beat chance (50%)?
      </p>
    </div>
  </div>\`,choices:['Start Test'],button_html:'<button class="jspsych-btn">%choice%</button>'};

  const trials=pairs.map((pair,i)=>{
    const shuffled=Math.random()<0.5?[{text:pair.human,isHuman:true},{text:pair.ai,isHuman:false}]:[{text:pair.ai,isHuman:false},{text:pair.human,isHuman:true}];
    return {
      type:jsPsychHtmlButtonResponse,
      stimulus:\`<div style="max-width:600px;margin:0 auto">
        <div style="font-size:11px;color:#888;text-align:right;margin-bottom:12px">Question \${i+1} of \${pairs.length}</div>
        <div class="prompt-box"><div class="prompt-label">Question</div>
          <p style="color:#FDFAF5;font-size:16px;margin:0;font-style:italic">"\${pair.prompt}"</p></div>
        <p style="color:#888;font-size:13px;margin-bottom:12px;text-align:center">Which response was written by a <strong style="color:#E8B84B">human</strong>?</p>
        <div class="response-card" id="resp-0">
          <div class="response-label">Response A</div>
          <div class="response-text">\${shuffled[0].text}</div>
        </div>
        <div class="response-card" id="resp-1">
          <div class="response-label">Response B</div>
          <div class="response-text">\${shuffled[1].text}</div>
        </div>
      </div>\`,
      choices:['Response A is Human','Response B is Human'],
      button_html:'<button class="jspsych-btn" style="margin:6px;font-size:13px">%choice%</button>',
      data:{prompt:pair.prompt,human_is_A:shuffled[0].isHuman,task:'turing'},
      on_finish:d=>{
        const choseA=d.response===0;
        d.correct=(choseA&&shuffled[0].isHuman)||(!choseA&&shuffled[1].isHuman);
        if(d.correct)score++;
        total++;
      }
    };
  });

  const debrief={type:jsPsychHtmlButtonResponse,stimulus:()=>\`<div class="center" style="max-width:520px;margin:0 auto">
    <div style="font-size:40px;margin-bottom:12px">🏆</div>
    <h2>Turing Test Results</h2>
    <div class="score-ring">\${score}/\${total}</div>
    <div class="card">
      <div style="font-size:36px;font-weight:bold" class="gold mono">\${Math.round(score/total*100)}%</div>
      <div class="muted">Accuracy</div>
    </div>
    <div class="card" style="text-align:left;margin-top:12px">
      <p style="color:#ccc;font-size:14px;line-height:1.8;margin:0">
        \${score>=4?'<strong class="gold">Impressive!</strong> You outperformed chance — you have a good intuition for human vs. AI writing patterns.':'<strong style="color:#FF9800">Tricky!</strong> Modern LLMs are increasingly difficult to distinguish from humans, especially in short-form responses.'}
        <br/><br/>
        Turing's original test (the "Imitation Game") remains a benchmark in AI philosophy, though critics like Searle argue that passing it does not imply genuine understanding.
      </p>
    </div>
  </div>\`,choices:['Finish'],button_html:'<button class="jspsych-btn">%choice%</button>'};

  jsPsych.run([welcome,...trials,debrief]);
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 6. CUSTOM EXPERIMENT (built from user-defined timeline JSON)
// ─────────────────────────────────────────────────────────────────────────
export function buildCustomHTML(timelineJSON: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-html-button-response@1.2.0"></script>
<script src="${PLUGIN_CDN}/plugin-survey-likert@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-survey-multi-choice@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-instructions@1.1.4"></script>
<style>
  .jspsych-survey-likert-statement{color:#FDFAF5!important;}
  .jspsych-survey-likert-opts td{color:#ccc!important;}
  .jspsych-survey-multi-choice-question{color:#FDFAF5!important;}
  .jspsych-survey-multi-choice-option label{color:#ccc!important;}
</style>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const jsPsych=initJsPsych({display_element:'t',on_finish:()=>sendDone(jsPsych)});
  const PLUGIN_MAP={
    'html-keyboard-response':jsPsychHtmlKeyboardResponse,
    'html-button-response':jsPsychHtmlButtonResponse,
    'survey-likert':jsPsychSurveyLikert,
    'survey-multi-choice':jsPsychSurveyMultiChoice,
    'instructions':jsPsychInstructions,
  };
  function buildTrial(def){
    const plugin=PLUGIN_MAP[def.type];
    if(!plugin){console.warn('Unknown plugin:',def.type);return null;}
    const trial={type:plugin};
    if(def.stimulus!==undefined)trial.stimulus=def.stimulus;
    if(def.choices!==undefined)trial.choices=def.choices;
    if(def.trial_duration!==undefined)trial.trial_duration=def.trial_duration;
    if(def.pages!==undefined)trial.pages=def.pages;
    if(def.show_clickable_nav!==undefined)trial.show_clickable_nav=def.show_clickable_nav;
    if(def.questions!==undefined)trial.questions=def.questions;
    if(def.preamble!==undefined)trial.preamble=def.preamble;
    if(def.button_html!==undefined)trial.button_html=def.button_html;
    if(def.data!==undefined)trial.data=def.data;
    return trial;
  }
  try{
    const defs=${timelineJSON};
    const timeline=defs.map(buildTrial).filter(Boolean);
    if(timeline.length===0){throw new Error('No valid trials');}
    jsPsych.run(timeline);
  }catch(e){
    document.getElementById('t').innerHTML='<div style="color:#FF5252;text-align:center;padding:40px;font-family:JetBrains Mono,monospace;font-size:14px"><div style="font-size:32px;margin-bottom:12px">⚠️</div><strong>Timeline Error</strong><br/><br/>'+e.message+'</div>';
  }
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 7. SURVEY (re-exported for ExperimentPage compatibility)
// ─────────────────────────────────────────────────────────────────────────
export function buildSurveyHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-instructions@1.1.4"></script>
<script src="${PLUGIN_CDN}/plugin-survey-likert@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-survey-multi-choice@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-html-button-response@1.2.0"></script>
<style>
  .jspsych-survey-likert-statement{color:#FDFAF5!important;}
  .jspsych-survey-likert-opts td{color:#ccc!important;}
  .jspsych-survey-multi-choice-question{color:#FDFAF5!important;}
  .jspsych-survey-multi-choice-option label{color:#ccc!important;}
  .jspsych-btn{background:#C9922A!important;color:#1B2A4A!important;border:none!important;font-family:'DM Sans',sans-serif!important;font-weight:600!important;}
</style>
</head><body><div id="t"></div><script>
${FINISH_SCRIPT}
(function(){
  const jsPsych=initJsPsych({display_element:'t',on_finish:()=>sendDone(jsPsych)});
  const instructions={type:jsPsychInstructions,pages:[
    \`<div class="center" style="max-width:520px;margin:0 auto"><div style="font-size:48px;margin-bottom:16px">🧠</div>
    <h2>Psychology Survey</h2>
    <p style="color:#ccc;line-height:1.7">This brief survey measures attitudes toward psychological research and academic databases. No right or wrong answers.</p></div>\`,
    \`<div class="center" style="max-width:520px;margin:0 auto"><h3>Instructions</h3>
    <ul style="text-align:left;color:#ccc;line-height:2;font-size:15px"><li>Part 1: Rating scales (Likert)</li><li>Part 2: Multiple choice</li><li>Responses collected locally only.</li></ul></div>\`
  ],show_clickable_nav:true,button_label_next:'Next →',button_label_previous:'← Back',button_label_finish:'Begin Survey'};
  const likert={type:jsPsychSurveyLikert,
    preamble:'<p style="font-family:Lora,serif;color:#E8B84B;font-size:18px;margin-bottom:8px">Part 1: Rating Scales</p><p style="color:#ccc;font-size:14px">Rate your agreement.</p>',
    questions:[
      {prompt:'I find psychological research databases useful for my work or studies.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'I am familiar with APA PsycInfo as a research tool.',labels:['Not at all','Slightly','Moderately','Very','Extremely'],required:true},
      {prompt:'Online behavioral experiments are a valid method for psychological research.',labels:['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'],required:true},
      {prompt:'I would be interested in running a full experiment using jsPsych.',labels:['Not interested','Slightly','Moderately','Very interested','Extremely interested'],required:true}
    ]};
  const multi={type:jsPsychSurveyMultiChoice,
    preamble:'<p style="font-family:Lora,serif;color:#E8B84B;font-size:18px;margin-bottom:8px">Part 2: Multiple Choice</p><p style="color:#ccc;font-size:14px">Select the best answer.</p>',
    questions:[
      {prompt:'Which APA database would you most likely use for a literature review?',options:['APA PsycInfo®','APA PsycArticles®','APA PsycBooks®','APA PsycTests®','None'],required:true},
      {prompt:'What is your primary role?',options:['Undergraduate student','Graduate student','Academic researcher','Clinician','Educator','Other'],required:true},
      {prompt:'How did you learn about jsPsych?',options:['Academic course','Research lab','Online tutorial','Colleague','This website','Other'],required:true}
    ]};
  const done={type:jsPsychHtmlButtonResponse,stimulus:\`<div class="center" style="max-width:480px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:12px">✅</div><h2>Survey Complete</h2>
    <p style="color:#ccc;font-size:15px;line-height:1.7">Thank you! Your responses have been recorded locally.</p>
  </div>\`,choices:['View Results'],button_html:'<button class="jspsych-btn">%choice%</button>'};
  jsPsych.run([instructions,likert,multi,done]);
})();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 8. REVERSE HANGMAN
//    Classic hangman flipped: YOU give letters to HIDE a word from the AI.
//    The AI uses a simple frequency-based guessing strategy. You win if the
//    AI exhausts all 6 guesses without finding the word. Measures strategic
//    deception, theory of mind, and adversarial reasoning.
// ─────────────────────────────────────────────────────────────────────────
export function buildReverseHangmanHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-button-response@1.2.0"></script>
<script src="${PLUGIN_CDN}/plugin-html-keyboard-response@1.1.3"></script>
<script src="${PLUGIN_CDN}/plugin-instructions@1.1.4"></script>
<style>
  .rh-board{max-width:600px;margin:0 auto;padding:16px;}
  .rh-word{display:flex;justify-content:center;gap:10px;margin:24px 0;}
  .rh-letter{width:44px;height:52px;border-bottom:3px solid #C9922A;display:flex;align-items:center;justify-content:center;font-size:28px;font-family:'Lora',serif;color:#FDFAF5;font-weight:600;}
  .rh-letter.revealed{color:#FF5252;border-color:#FF5252;}
  .rh-letter.hidden{color:#4CAF50;}
  .rh-gallows{text-align:center;margin:16px 0;font-size:13px;color:#888;font-family:'JetBrains Mono',monospace;line-height:1.5;}
  .rh-alpha{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:16px 0;}
  .rh-btn{width:38px;height:38px;border-radius:6px;border:1px solid rgba(201,146,42,0.35);background:rgba(201,146,42,0.08);color:#E8B84B;font-size:15px;font-weight:600;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all 0.15s;}
  .rh-btn:hover:not(:disabled){background:rgba(201,146,42,0.2);}
  .rh-btn:disabled{opacity:0.25;cursor:not-allowed;}
  .rh-btn.used-safe{background:rgba(76,175,80,0.15);border-color:#4CAF50;color:#4CAF50;}
  .rh-btn.used-hit{background:rgba(255,82,82,0.15);border-color:#FF5252;color:#FF5252;}
  .rh-status{text-align:center;padding:10px;border-radius:8px;margin:12px 0;font-size:14px;}
  .rh-ai-think{background:rgba(33,150,243,0.1);border:1px solid rgba(33,150,243,0.3);color:#64B5F6;padding:10px 16px;border-radius:8px;font-size:13px;margin:8px 0;font-family:'JetBrains Mono',monospace;}
  .rh-score{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0;}
  .rh-score-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center;}
  .rh-score-val{font-size:24px;font-weight:bold;font-family:'Lora',serif;}
  .rh-score-lbl{font-size:11px;color:#888;margin-top:2px;}
  .progress-bar{height:6px;border-radius:3px;background:rgba(255,255,255,0.08);overflow:hidden;margin:8px 0;}
  .progress-fill{height:100%;border-radius:3px;transition:width 0.4s;}
</style>
</head><body><div id="app"></div>
<script>
${FINISH_SCRIPT}

// ── Word bank (psychology-themed) ─────────────────────────────────────
const WORD_BANK = [
  {word:'MEMORY',hint:'Cognitive process'},
  {word:'REFLEX',hint:'Automatic response'},
  {word:'CORTEX',hint:'Brain region'},
  {word:'SCHEMA',hint:'Mental framework'},
  {word:'PHOBIA',hint:'Anxiety disorder'},
  {word:'NEURON',hint:'Brain cell'},
  {word:'AFFECT',hint:'Emotional state'},
  {word:'RECALL',hint:'Memory retrieval'},
  {word:'SIGNAL',hint:'Neural message'},
  {word:'TRAUMA',hint:'Psychological wound'},
  {word:'EMPATHY',hint:'Feeling others\\'emotions'},
  {word:'PLACEBO',hint:'Inert treatment'},
  {word:'ANXIETY',hint:'Worry disorder'},
  {word:'PRIMING',hint:'Implicit memory effect'},
  {word:'INSIGHT',hint:'Sudden understanding'},
];

// ── AI Guesser: frequency-based with memory ──────────────────────────
// Builds a letter frequency model from the word bank filtered by
// known constraints (length, confirmed positions, excluded letters).
function aiNextGuess(wordLen, revealed, excluded, guessHistory) {
  // Filter candidate words
  const candidates = WORD_BANK.map(w=>w.word).filter(w => {
    if (w.length !== wordLen) return false;
    for (let i=0;i<wordLen;i++) {
      if (revealed[i] && w[i] !== revealed[i]) return false;
    }
    for (const ex of excluded) {
      if (w.includes(ex)) return false;
    }
    return true;
  });

  // Count letter frequencies in candidates (only unguessed letters)
  const freq = {};
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (const letter of allLetters) {
    if (guessHistory.includes(letter)) continue;
    freq[letter] = 0;
  }
  for (const w of candidates) {
    for (const ch of new Set(w.split(''))) {
      if (!guessHistory.includes(ch) && freq[ch] !== undefined) freq[ch]++;
    }
  }

  // If no candidates, fall back to English letter frequency
  const fallback = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('');
  let best = null, bestScore = -1;
  for (const [letter, score] of Object.entries(freq)) {
    if ((score) > bestScore) { bestScore = score; best = letter; }
  }
  if (!best) {
    for (const l of fallback) {
      if (!guessHistory.includes(l)) { best = l; break; }
    }
  }
  return best || 'E';
}

// ── Game State ────────────────────────────────────────────────────────
const MAX_GUESSES = 6;
const GALLOWS_STAGES = [
  \`  +---+
  |   |
      |
      |
      |
      |
=========\`,
  \`  +---+
  |   |
  O   |
      |
      |
      |
=========\`,
  \`  +---+
  |   |
  O   |
  |   |
      |
      |
=========\`,
  \`  +---+
  |   |
  O   |
 /|   |
      |
      |
=========\`,
  \`  +---+
  |   |
  O   |
 /|\\\\  |
      |
      |
=========\`,
  \`  +---+
  |   |
  O   |
 /|\\\\  |
 /    |
      |
=========\`,
  \`  +---+
  |   |
  O   |
 /|\\\\  |
 / \\\\  |
      |
=========\`,
];

let state = {
  round: 0,
  scores: {player:0, ai:0, draws:0},
  history: [],
};

function pickWord() {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}

function startRound() {
  const entry = pickWord();
  const word = entry.word;
  const revealed = new Array(word.length).fill(null);
  const excluded = [];
  const guessHistory = [];
  let guessCount = 0;
  let playerLetters = []; // letters player has chosen to give

  render();

  function render() {
    const app = document.getElementById('app');
    const aiGuessedCorrectly = revealed.every(l => l !== null);
    const aiLost = guessCount >= MAX_GUESSES && !aiGuessedCorrectly;
    const gameOver = aiGuessedCorrectly || aiLost;

    const wordHtml = word.split('').map((ch, i) => {
      const cls = revealed[i] ? 'rh-letter revealed' : 'rh-letter hidden';
      return \`<div class="\${cls}">\${revealed[i] || (gameOver ? ch : '_')}</div>\`;
    }).join('');

    const alphaHtml = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
      let cls = 'rh-btn';
      const isUsed = playerLetters.includes(l);
      const isHit = isUsed && word.includes(l);
      if (isHit) cls += ' used-hit';
      else if (isUsed) cls += ' used-safe';
      const disabled = isUsed || gameOver ? 'disabled' : '';
      return \`<button class="\${cls}" \${disabled} onclick="giveLetterToAI('\${l}')">\${l}</button>\`;
    }).join('');

    const aiLastGuess = guessHistory[guessHistory.length - 1];
    const aiHit = aiLastGuess && word.includes(aiLastGuess);

    let statusHtml = '';
    if (gameOver) {
      if (aiLost) {
        statusHtml = \`<div class="rh-status" style="background:rgba(76,175,80,0.15);border:1px solid #4CAF50;color:#4CAF50">
          🎉 You won! The AI failed to guess <strong>\${word}</strong> in \${MAX_GUESSES} tries.
        </div>\`;
      } else {
        statusHtml = \`<div class="rh-status" style="background:rgba(255,82,82,0.15);border:1px solid #FF5252;color:#FF5252">
          🤖 AI wins! It guessed <strong>\${word}</strong> with \${MAX_GUESSES - guessCount + (guessCount < MAX_GUESSES ? 1 : 0)} guesses remaining.
        </div>\`;
      }
    }

    const aiThinkHtml = aiLastGuess ? \`<div class="rh-ai-think">
      🤖 AI guessed: <strong>\${aiLastGuess}</strong> — \${aiHit ? '✓ HIT (letter revealed!)' : '✗ MISS'}
      &nbsp;|&nbsp; Guesses used: \${guessCount}/\${MAX_GUESSES}
    </div>\` : '<div class="rh-ai-think">🤖 AI is waiting for your first letter...</div>';

    const progressPct = (guessCount / MAX_GUESSES) * 100;
    const progressColor = guessCount < 3 ? '#4CAF50' : guessCount < 5 ? '#FF9800' : '#FF5252';

    app.innerHTML = \`
    <div class="rh-board">
      <div class="center" style="margin-bottom:8px">
        <span style="font-size:11px;color:#888;font-family:'JetBrains Mono',monospace">ROUND \${state.round + 1} &nbsp;|&nbsp; HINT: \${entry.hint} &nbsp;|&nbsp; \${word.length} letters</span>
      </div>
      <div class="rh-score">
        <div class="rh-score-card"><div class="rh-score-val" style="color:#4CAF50">\${state.scores.player}</div><div class="rh-score-lbl">You Win</div></div>
        <div class="rh-score-card"><div class="rh-score-val" style="color:#FF5252">\${state.scores.ai}</div><div class="rh-score-lbl">AI Wins</div></div>
        <div class="rh-score-card"><div class="rh-score-val" style="color:#888">\${state.scores.draws}</div><div class="rh-score-lbl">Draws</div></div>
      </div>
      <div class="rh-gallows"><pre style="display:inline-block;text-align:left;color:#C9922A;font-size:12px">\${GALLOWS_STAGES[guessCount]}</pre></div>
      <div class="progress-bar"><div class="progress-fill" style="width:\${progressPct}%;background:\${progressColor}"></div></div>
      <p style="text-align:center;font-size:12px;color:#888;margin:0 0 8px">\${guessCount}/\${MAX_GUESSES} AI guesses used</p>
      <div class="rh-word">\${wordHtml}</div>
      \${aiThinkHtml}
      \${statusHtml}
      \${!gameOver ? \`
        <p style="text-align:center;color:#ccc;font-size:13px;margin:12px 0 8px">
          Choose a letter to <strong class="gold">give to the AI</strong>. Safe letters (not in word) waste its guesses. Risky letters reveal the word!
        </p>
        <div class="rh-alpha">\${alphaHtml}</div>
      \` : \`
        <div style="text-align:center;margin-top:16px;display:flex;gap:10px;justify-content:center">
          <button class="jspsych-btn" onclick="nextRound()">Next Round →</button>
          <button class="jspsych-btn" style="background:#1B2A4A!important;color:#E8B84B!important;border:1px solid #C9922A!important" onclick="finishGame()">Finish & See Data</button>
        </div>
      \`}
    </div>\`;
  }

  window.giveLetterToAI = function(letter) {
    if (playerLetters.includes(letter)) return;
    playerLetters.push(letter);

    // AI receives the letter and "guesses" it
    guessHistory.push(letter);
    guessCount++;

    // Check if letter is in word
    if (word.includes(letter)) {
      // Reveal all positions
      for (let i = 0; i < word.length; i++) {
        if (word[i] === letter) revealed[i] = letter;
      }
    } else {
      excluded.push(letter);
    }

    // Record trial data
    state.history.push({
      round: state.round + 1,
      word,
      letter_given: letter,
      is_in_word: word.includes(letter),
      guess_number: guessCount,
      revealed_so_far: revealed.filter(Boolean).length,
      word_length: word.length,
      task: 'reverse_hangman',
    });

    render();
  };

  window.nextRound = function() {
    // Tally score
    const aiGuessedCorrectly = revealed.every(l => l !== null);
    if (aiGuessedCorrectly) state.scores.ai++;
    else if (guessCount >= MAX_GUESSES) state.scores.player++;
    else state.scores.draws++;
    state.round++;
    startRound();
  };

  window.finishGame = function() {
    const aiGuessedCorrectly = revealed.every(l => l !== null);
    if (aiGuessedCorrectly) state.scores.ai++;
    else if (guessCount >= MAX_GUESSES) state.scores.player++;
    else state.scores.draws++;

    const app = document.getElementById('app');
    app.innerHTML = \`
    <div class="rh-board center">
      <div style="font-size:48px;margin-bottom:12px">🎭</div>
      <h2>Experiment Complete</h2>
      <div class="rh-score" style="max-width:360px;margin:16px auto">
        <div class="rh-score-card"><div class="rh-score-val" style="color:#4CAF50">\${state.scores.player}</div><div class="rh-score-lbl">Your Wins</div></div>
        <div class="rh-score-card"><div class="rh-score-val" style="color:#FF5252">\${state.scores.ai}</div><div class="rh-score-lbl">AI Wins</div></div>
        <div class="rh-score-card"><div class="rh-score-val" style="color:#888">\${state.scores.draws}</div><div class="rh-score-lbl">Draws</div></div>
      </div>
      <p style="color:#ccc;font-size:14px;line-height:1.7;max-width:440px;margin:0 auto 20px">
        You played \${state.round} round(s). Strategic letter selection — giving low-frequency letters — is the key to defeating the AI guesser.
      </p>
      <button class="jspsych-btn" onclick="sendResults()">View Data →</button>
    </div>\`;
  };

  window.sendResults = function() {
    window.parent.postMessage({type:'jspsych-done', data: state.history}, '*');
  };
}

// Start first round
startRound();
</script></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 9. REVERSE PULLEY PROBLEM
//    Classic mechanics/physics reasoning task — but reversed.
//    Instead of "given this pulley system, what is the mechanical advantage?",
//    participants see a TARGET FORCE RATIO and must RECONSTRUCT the pulley
//    system by selecting the correct configuration.
//    Measures causal/mechanical reasoning, mental simulation, and
//    analogical transfer — a classic cognitive science paradigm.
// ─────────────────────────────────────────────────────────────────────────
export function buildReversePulleyHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
${BASE_STYLES}
<script src="${PLUGIN_CDN}/plugin-html-button-response@1.2.0"></script>
<script src="${PLUGIN_CDN}/plugin-instructions@1.1.4"></script>
<style>
  .rp-container{max-width:680px;margin:0 auto;padding:16px;}
  .rp-problem{background:rgba(201,146,42,0.08);border:1px solid rgba(201,146,42,0.3);border-radius:12px;padding:20px;margin:16px 0;text-align:center;}
  .rp-target{font-size:48px;font-weight:bold;font-family:'Lora',serif;color:#E8B84B;margin:8px 0;}
  .rp-label{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;font-family:'JetBrains Mono',monospace;}
  .rp-options{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0;}
  .rp-option{background:rgba(255,255,255,0.03);border:2px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;text-align:center;}
  .rp-option:hover{border-color:rgba(201,146,42,0.5);background:rgba(201,146,42,0.06);}
  .rp-option.selected-correct{border-color:#4CAF50;background:rgba(76,175,80,0.1);}
  .rp-option.selected-wrong{border-color:#FF5252;background:rgba(255,82,82,0.1);}
  .rp-option.reveal-correct{border-color:#4CAF50;background:rgba(76,175,80,0.08);}
  .rp-pulley-svg{margin:0 auto 8px;}
  .rp-option-label{font-size:13px;color:#ccc;font-family:'DM Sans',sans-serif;margin-top:6px;}
  .rp-option-ma{font-size:20px;font-weight:bold;font-family:'Lora',serif;color:#E8B84B;}
  .rp-feedback{padding:12px 16px;border-radius:8px;font-size:14px;margin:12px 0;text-align:center;}
  .rp-progress{display:flex;gap:6px;justify-content:center;margin:12px 0;}
  .rp-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.15);}
  .rp-dot.correct{background:#4CAF50;}
  .rp-dot.wrong{background:#FF5252;}
  .rp-dot.current{background:#C9922A;box-shadow:0 0 6px #C9922A;}
  .rp-score-row{display:flex;gap:16px;justify-content:center;margin:16px 0;}
  .rp-score-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 20px;text-align:center;}
  .rp-score-num{font-size:28px;font-weight:bold;font-family:'Lora',serif;}
  .rp-score-lbl{font-size:11px;color:#888;margin-top:2px;}
  .rp-explanation{background:rgba(33,150,243,0.08);border:1px solid rgba(33,150,243,0.2);border-radius:8px;padding:12px 16px;font-size:13px;color:#90CAF9;margin:10px 0;line-height:1.6;}
  .next-btn{display:block;margin:16px auto 0;background:#C9922A!important;color:#1B2A4A!important;border:none!important;padding:10px 28px!important;border-radius:6px!important;font-weight:600!important;font-size:14px!important;cursor:pointer!important;font-family:'DM Sans',sans-serif!important;}
</style>
</head><body><div id="app"></div>
<script>
${FINISH_SCRIPT}

// ── Pulley configurations ─────────────────────────────────────────────
// Each has: id, name, mechanicalAdvantage (MA), ropeSegments, description,
// and an SVG diagram drawn with inline SVG.
const PULLEYS = [
  {
    id:'fixed',
    name:'Fixed Pulley',
    ma:1,
    segments:1,
    desc:'One rope segment supports the load. Changes direction only — no force multiplication.',
    explanation:'A fixed pulley redirects force but provides no mechanical advantage (MA = 1). The effort equals the load.',
    svg:\`<svg width="100" height="110" viewBox="0 0 100 110">
      <line x1="50" y1="0" x2="50" y2="20" stroke="#C9922A" stroke-width="2.5"/>
      <circle cx="50" cy="30" r="14" fill="none" stroke="#E8B84B" stroke-width="3"/>
      <circle cx="50" cy="30" r="4" fill="#C9922A"/>
      <line x1="50" y1="44" x2="50" y2="70" stroke="#C9922A" stroke-width="2.5"/>
      <rect x="35" y="70" width="30" height="22" rx="4" fill="rgba(201,146,42,0.2)" stroke="#C9922A" stroke-width="2"/>
      <text x="50" y="85" text-anchor="middle" fill="#E8B84B" font-size="10" font-family="JetBrains Mono">Load</text>
      <text x="50" y="106" text-anchor="middle" fill="#888" font-size="9" font-family="JetBrains Mono">MA = 1</text>
    </svg>\`,
  },
  {
    id:'movable',
    name:'Movable Pulley',
    ma:2,
    segments:2,
    desc:'Two rope segments support the load. Halves the effort force needed.',
    explanation:'A movable pulley has 2 rope segments supporting the load, giving MA = 2. You need half the force but pull twice the distance.',
    svg:\`<svg width="100" height="120" viewBox="0 0 100 120">
      <line x1="20" y1="0" x2="20" y2="60" stroke="#C9922A" stroke-width="2.5"/>
      <line x1="80" y1="0" x2="80" y2="60" stroke="#C9922A" stroke-width="2.5"/>
      <circle cx="50" cy="68" r="14" fill="none" stroke="#E8B84B" stroke-width="3"/>
      <circle cx="50" cy="68" r="4" fill="#C9922A"/>
      <line x1="20" y1="60" x2="36" y2="68" stroke="#C9922A" stroke-width="2.5"/>
      <line x1="80" y1="60" x2="64" y2="68" stroke="#C9922A" stroke-width="2.5"/>
      <line x1="50" y1="82" x2="50" y2="96" stroke="#C9922A" stroke-width="2.5"/>
      <rect x="35" y="96" width="30" height="18" rx="4" fill="rgba(201,146,42,0.2)" stroke="#C9922A" stroke-width="2"/>
      <text x="50" y="108" text-anchor="middle" fill="#E8B84B" font-size="9" font-family="JetBrains Mono">Load</text>
      <text x="50" y="118" text-anchor="middle" fill="#888" font-size="9" font-family="JetBrains Mono">MA = 2</text>
    </svg>\`,
  },
  {
    id:'compound2',
    name:'Block & Tackle (×3)',
    ma:3,
    segments:3,
    desc:'Three rope segments. A compound system with one fixed and one movable pulley.',
    explanation:'A 3-segment block and tackle gives MA = 3. Three rope segments share the load, so you apply only 1/3 the force.',
    svg:\`<svg width="100" height="130" viewBox="0 0 100 130">
      <circle cx="35" cy="22" r="12" fill="none" stroke="#E8B84B" stroke-width="2.5"/>
      <circle cx="35" cy="22" r="3.5" fill="#C9922A"/>
      <circle cx="65" cy="70" r="12" fill="none" stroke="#E8B84B" stroke-width="2.5"/>
      <circle cx="65" cy="70" r="3.5" fill="#C9922A"/>
      <line x1="35" y1="0" x2="35" y2="10" stroke="#C9922A" stroke-width="2"/>
      <line x1="23" y1="22" x2="23" y2="70" stroke="#C9922A" stroke-width="2"/>
      <line x1="47" y1="22" x2="53" y2="70" stroke="#C9922A" stroke-width="2"/>
      <line x1="77" y1="70" x2="77" y2="22" stroke="#C9922A" stroke-width="2"/>
      <line x1="65" y1="82" x2="65" y2="96" stroke="#C9922A" stroke-width="2"/>
      <rect x="50" y="96" width="30" height="18" rx="4" fill="rgba(201,146,42,0.2)" stroke="#C9922A" stroke-width="2"/>
      <text x="65" y="108" text-anchor="middle" fill="#E8B84B" font-size="9" font-family="JetBrains Mono">Load</text>
      <text x="50" y="128" text-anchor="middle" fill="#888" font-size="9" font-family="JetBrains Mono">MA = 3</text>
    </svg>\`,
  },
  {
    id:'compound4',
    name:'Block & Tackle (×4)',
    ma:4,
    segments:4,
    desc:'Four rope segments. Two movable pulleys in series.',
    explanation:'A 4-segment compound pulley gives MA = 4. Four rope segments share the load — you apply only 1/4 the force over 4× the distance.',
    svg:\`<svg width="100" height="130" viewBox="0 0 100 130">
      <circle cx="30" cy="22" r="11" fill="none" stroke="#E8B84B" stroke-width="2.5"/>
      <circle cx="30" cy="22" r="3" fill="#C9922A"/>
      <circle cx="70" cy="22" r="11" fill="none" stroke="#E8B84B" stroke-width="2.5"/>
      <circle cx="70" cy="22" r="3" fill="#C9922A"/>
      <circle cx="50" cy="72" r="11" fill="none" stroke="#E8B84B" stroke-width="2.5"/>
      <circle cx="50" cy="72" r="3" fill="#C9922A"/>
      <line x1="19" y1="22" x2="19" y2="72" stroke="#C9922A" stroke-width="2"/>
      <line x1="41" y1="22" x2="39" y2="72" stroke="#C9922A" stroke-width="2"/>
      <line x1="61" y1="72" x2="59" y2="22" stroke="#C9922A" stroke-width="2"/>
      <line x1="81" y1="22" x2="81" y2="72" stroke="#C9922A" stroke-width="2"/>
      <line x1="50" y1="83" x2="50" y2="98" stroke="#C9922A" stroke-width="2"/>
      <rect x="35" y="98" width="30" height="18" rx="4" fill="rgba(201,146,42,0.2)" stroke="#C9922A" stroke-width="2"/>
      <text x="50" y="110" text-anchor="middle" fill="#E8B84B" font-size="9" font-family="JetBrains Mono">Load</text>
      <text x="50" y="128" text-anchor="middle" fill="#888" font-size="9" font-family="JetBrains Mono">MA = 4</text>
    </svg>\`,
  },
];

// ── Problem set ───────────────────────────────────────────────────────
// Each problem gives a scenario + target MA. Participant must pick the
// pulley system that achieves it.
const PROBLEMS = [
  {
    scenario: 'A worker needs to lift a 200 N engine block using only 200 N of force.',
    targetMA: 1,
    targetLabel: '1:1',
    context: 'No force reduction needed — just a direction change.',
    correct: 'fixed',
  },
  {
    scenario: 'A rescue team must lift a 400 N person using only 200 N of effort.',
    targetMA: 2,
    targetLabel: '2:1',
    context: 'The effort must be halved relative to the load.',
    correct: 'movable',
  },
  {
    scenario: 'A physicist needs a system where 100 N of effort lifts a 300 N load.',
    targetMA: 3,
    targetLabel: '3:1',
    context: 'Three rope segments must support the load.',
    correct: 'compound2',
  },
  {
    scenario: 'An engineer designs a crane where 50 N of force must lift a 200 N beam.',
    targetMA: 4,
    targetLabel: '4:1',
    context: 'Maximum force multiplication with four rope segments.',
    correct: 'compound4',
  },
  {
    scenario: 'A simple flagpole uses a pulley to raise a flag. The rope tension equals the flag weight.',
    targetMA: 1,
    targetLabel: '1:1',
    context: 'Direction change only — no mechanical advantage.',
    correct: 'fixed',
  },
  {
    scenario: 'A sailing rigging system allows a 60 kg sailor to lift a 120 kg sail.',
    targetMA: 2,
    targetLabel: '2:1',
    context: 'The sailor\'s weight provides exactly half the needed force.',
    correct: 'movable',
  },
];

// ── Game logic ────────────────────────────────────────────────────────
let trialData = [];
let currentProblem = 0;
let score = 0;
let totalTime = 0;
let trialStart = Date.now();

function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

function renderProblem() {
  const prob = PROBLEMS[currentProblem];
  const shuffledOptions = shuffle(PULLEYS);
  let answered = false;
  let selectedId = null;
  trialStart = Date.now();

  const app = document.getElementById('app');

  function renderOptions(highlightId, showFeedback) {
    return shuffledOptions.map(p => {
      let cls = 'rp-option';
      if (highlightId === p.id) {
        cls += p.id === prob.correct ? ' selected-correct' : ' selected-wrong';
      } else if (showFeedback && p.id === prob.correct) {
        cls += ' reveal-correct';
      }
      const clickable = !showFeedback ? \`onclick="selectOption('\${p.id}')"\` : '';
      return \`<div class="\${cls}" \${clickable}>
        <div class="rp-pulley-svg">\${p.svg}</div>
        <div class="rp-option-ma">\${p.ma}:1</div>
        <div class="rp-option-label">\${p.name}</div>
        <div style="font-size:11px;color:#666;margin-top:4px;font-family:'JetBrains Mono',monospace">\${p.segments} rope segment(s)</div>
      </div>\`;
    }).join('');
  }

  function renderProgress() {
    return PROBLEMS.map((_, i) => {
      let cls = 'rp-dot';
      if (i < currentProblem) cls += trialData[i]?.correct ? ' correct' : ' wrong';
      else if (i === currentProblem) cls += ' current';
      return \`<div class="\${cls}"></div>\`;
    }).join('');
  }

  function draw(highlightId, feedback, explanation) {
    app.innerHTML = \`
    <div class="rp-container">
      <div style="text-align:center;margin-bottom:8px">
        <span style="font-size:11px;color:#888;font-family:'JetBrains Mono',monospace">PROBLEM \${currentProblem+1} OF \${PROBLEMS.length}</span>
      </div>
      <div class="rp-progress">\${renderProgress()}</div>
      <div class="rp-score-row">
        <div class="rp-score-box"><div class="rp-score-num" style="color:#4CAF50">\${score}</div><div class="rp-score-lbl">Correct</div></div>
        <div class="rp-score-box"><div class="rp-score-num" style="color:#FF5252">\${currentProblem - score}</div><div class="rp-score-lbl">Wrong</div></div>
        <div class="rp-score-box"><div class="rp-score-num" style="color:#888">\${currentProblem}</div><div class="rp-score-lbl">Done</div></div>
      </div>
      <div class="rp-problem">
        <div class="rp-label">Scenario</div>
        <p style="color:#FDFAF5;font-size:15px;line-height:1.7;margin:8px 0 4px;font-family:'DM Sans',sans-serif">\${prob.scenario}</p>
        <div class="rp-label" style="margin-top:12px">Target Mechanical Advantage</div>
        <div class="rp-target">\${prob.targetLabel}</div>
        <div style="font-size:12px;color:#aaa;font-family:'DM Sans',sans-serif">\${prob.context}</div>
      </div>
      <p style="text-align:center;color:#ccc;font-size:13px;margin:8px 0 4px;font-family:'DM Sans',sans-serif">
        Which pulley system achieves this mechanical advantage?
      </p>
      <div class="rp-options">\${renderOptions(highlightId, !!feedback)}</div>
      \${feedback ? \`<div class="rp-feedback" style="background:\${highlightId===prob.correct?'rgba(76,175,80,0.12)':'rgba(255,82,82,0.12)'};border:1px solid \${highlightId===prob.correct?'#4CAF50':'#FF5252'};color:\${highlightId===prob.correct?'#4CAF50':'#FF5252'}">\${feedback}</div>\` : ''}
      \${explanation ? \`<div class="rp-explanation">💡 \${explanation}</div>\` : ''}
      \${feedback ? \`<button class="next-btn" onclick="nextProblem()">\${currentProblem+1 < PROBLEMS.length ? 'Next Problem →' : 'See Results →'}</button>\` : ''}
    </div>\`;
  }

  draw(null, null, null);

  window.selectOption = function(id) {
    if (answered) return;
    answered = true;
    selectedId = id;
    const rt = Date.now() - trialStart;
    const isCorrect = id === prob.correct;
    if (isCorrect) score++;
    const selectedPulley = PULLEYS.find(p => p.id === id);
    const correctPulley = PULLEYS.find(p => p.id === prob.correct);
    trialData.push({
      trial: currentProblem + 1,
      scenario: prob.scenario,
      target_ma: prob.targetMA,
      selected: selectedPulley.name,
      correct_answer: correctPulley.name,
      correct: isCorrect,
      rt_ms: rt,
      task: 'reverse_pulley',
    });
    const feedback = isCorrect
      ? \`✓ Correct! \${selectedPulley.name} (MA = \${selectedPulley.ma}) achieves a \${prob.targetLabel} force ratio.\`
      : \`✗ Incorrect. You chose \${selectedPulley.name} (MA = \${selectedPulley.ma}). The correct answer is \${correctPulley.name} (MA = \${correctPulley.ma}).\`;
    draw(id, feedback, correctPulley.explanation);
  };
}

window.nextProblem = function() {
  currentProblem++;
  if (currentProblem >= PROBLEMS.length) {
    showResults();
  } else {
    renderProblem();
  }
};

function showResults() {
  const pct = Math.round((score / PROBLEMS.length) * 100);
  const avgRT = Math.round(trialData.reduce((s,d)=>s+d.rt_ms,0)/trialData.length);
  const app = document.getElementById('app');
  app.innerHTML = \`
  <div class="rp-container center">
    <div style="font-size:48px;margin-bottom:12px">⚙️</div>
    <h2>Experiment Complete</h2>
    <div class="rp-score-row" style="justify-content:center">
      <div class="rp-score-box"><div class="rp-score-num" style="color:#4CAF50">\${score}/\${PROBLEMS.length}</div><div class="rp-score-lbl">Correct</div></div>
      <div class="rp-score-box"><div class="rp-score-num" style="color:#E8B84B">\${pct}%</div><div class="rp-score-lbl">Accuracy</div></div>
      <div class="rp-score-box"><div class="rp-score-num" style="color:#2196F3">\${avgRT}ms</div><div class="rp-score-lbl">Avg RT</div></div>
    </div>
    <p style="color:#ccc;font-size:14px;line-height:1.7;max-width:460px;margin:0 auto 20px">
      The Reverse Pulley task measures <strong style="color:#E8B84B">causal mechanical reasoning</strong> — the ability to work backwards from a desired outcome to the system that produces it. Faster, accurate responses suggest stronger mental simulation of physical systems.
    </p>
    <button class="jspsych-btn" onclick="window.parent.postMessage({type:'jspsych-done',data:trialData},'*')">View Trial Data →</button>
  </div>\`;
}

// Start
renderProblem();
</script></body></html>`;
}
