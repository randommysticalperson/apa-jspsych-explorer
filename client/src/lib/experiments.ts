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
