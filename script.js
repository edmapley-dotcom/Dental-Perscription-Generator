/* =============================================
   CARDIFF MET — DENTAL LAB RX  script.js
   ============================================= */

// ── Embedded logo ──────────────────────────────
const CMET_LOGO = './CMET_landscape_logo-Navy_2.png';
document.getElementById('headerLogo').src = CMET_LOGO;

// ── Lab constants ──────────────────────────────
const LAB_NAME    = 'Cardiff Metropolitan University Dental Laboratory';
const LAB_ADDRESS = 'Western Avenue, Llandaff, Cardiff CF5 2YB';
const LAB_TEL     = 'Tel: +44 (0)29 2041 6070';
const MHRA_NUM    = 'MHRA Reg. No. 0086/1076 — Custom Medical Device';

// ══════════════════════════════════════════════
// FDI TOOTH LAYOUT
// Upper: 18→11 then 21→28  (patient's right to left, viewed from above)
// Lower: 48→41 then 31→38
// ══════════════════════════════════════════════
const UPPER_TEETH = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
const LOWER_TEETH = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

// ══════════════════════════════════════════════
// MANUFACTURING WORKFLOW
// Ordered sequence of stages as the case travels
// clinic → lab → clinic → lab …
// Each stage: { id, step, who, label, desc }
// who: 'clinic' | 'lab'
// ══════════════════════════════════════════════
const WORKFLOW_STAGES = [
  { id:'primary_imp',   step:'1',   who:'clinic', label:'Primary impressions',      desc:'Alginate impressions taken at clinic; study casts poured' },
  { id:'special_tray',  step:'1→L', who:'lab',    label:'Special tray constructed', desc:'Laboratory fabricates custom special tray from study cast' },
  { id:'final_imp',     step:'2',   who:'clinic', label:'Final impressions',        desc:'Special tray returned; definitive impressions taken (PVS/polyether)' },
  { id:'bite_reg',      step:'2b',  who:'clinic', label:'Bite registration',        desc:'Occlusal record / bite registration taken and enclosed' },
  { id:'facebow',       step:'2c',  who:'clinic', label:'Facebow record',           desc:'Facebow transfer taken and enclosed with impressions' },
  { id:'photos',        step:'2d',  who:'clinic', label:'Photographs / shade',      desc:'Clinical photographs and shade tab reference enclosed' },
  { id:'master_cast',   step:'3',   who:'lab',    label:'Master cast & design',     desc:'Laboratory pours master cast; designs and plans the appliance' },
  { id:'framework',     step:'3a',  who:'lab',    label:'Framework / wax pattern',  desc:'Metal framework or wax-up constructed on master cast' },
  { id:'framework_try', step:'4',   who:'clinic', label:'Framework trial (clinic)', desc:'Framework or wax try-in returned to clinic for assessment' },
  { id:'framework_ok',  step:'4a',  who:'lab',    label:'Modifications post-trial', desc:'Laboratory makes adjustments following clinic feedback' },
  { id:'tryin',         step:'5',   who:'clinic', label:'Try-in (clinic)',          desc:'Wax or bisque try-in assessed at clinic; aesthetics and fit confirmed' },
  { id:'tryin_ok',      step:'5a',  who:'lab',    label:'Final processing',         desc:'Laboratory processes to final material following approved try-in' },
  { id:'complete',      step:'6',   who:'lab',    label:'Completed appliance',      desc:'Finished appliance dispatched to clinic for fit appointment' },
  { id:'fit',           step:'7',   who:'clinic', label:'Fit appointment',          desc:'Appliance fitted; any adjustments recorded and returned if needed' },
];

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const state = {
  type: 'fixed',
  toothStates: {},
  history: [],
  lastData: null,
};
try { state.history = JSON.parse(localStorage.getItem('labRxHistory') || '[]'); } catch(e) {}

// ══════════════════════════════════════════════
// DOM REFS
// ══════════════════════════════════════════════
const typeTabs           = document.querySelectorAll('.type-tab');
const navBtns            = document.querySelectorAll('.nav-btn');
const tabGenerate        = document.getElementById('tab-generate');
const tabHistory         = document.getElementById('tab-history');
const generateBtn        = document.getElementById('generateBtn');
const clearBtn           = document.getElementById('clearBtn');
const pdfBtn           = document.getElementById('pdfBtn');
const previewActions     = document.getElementById('previewActions');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const rxOutput           = document.getElementById('rxOutput');
const historyList        = document.getElementById('historyList');
const toothModeSelect    = document.getElementById('toothMode');
const clearTeethBtn      = document.getElementById('clearTeethBtn');
const toothChartControl  = document.getElementById('toothChartControl');
const workflowGroup      = document.getElementById('workflowGroup');

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function g(id)        { const e=document.getElementById(id); return e?e.value.trim():''; }
function setVal(id,v) { const e=document.getElementById(id); if(e) e.value=v||''; }
function rand(arr)    { return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function escHtml(s)   { if(!s)return''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function todayStr()   { return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}); }
function todayISO()   { return new Date().toISOString().slice(0,10); }
function fmtDate(s)   { if(!s)return'—'; const d=new Date(s+'T00:00:00'); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
function genCaseRef() { return 'CMU-'+Date.now().toString(36).toUpperCase().slice(-6); }

function shadeToColor(shade) {
  const m={'A1':'#f5ead0','A2':'#f0e0b8','A3':'#e8d09e','A3.5':'#e0c48a','A4':'#d4b070',
           'B1':'#f5e8c8','B2':'#eedfc0','B3':'#e5d0a4','B4':'#d8c090',
           'C1':'#eedfb8','C2':'#e6d5a8','C3':'#dcc890','D2':'#e8d8a8','D3':'#dfd0a0'};
  return m[shade]||'#e8dcc8';
}

function getCheckedWorkflow() {
  return Array.from(workflowGroup.querySelectorAll('input:checked')).map(cb=>cb.value);
}

// ══════════════════════════════════════════════
// BUILD WORKFLOW CHECKLIST (control panel)
// ══════════════════════════════════════════════
function buildWorkflowChecklist(checkedIds=[]) {
  workflowGroup.innerHTML = WORKFLOW_STAGES.map(s => `
    <label class="wf-label">
      <input type="checkbox" value="${s.id}" ${checkedIds.includes(s.id)?'checked':''}>
      <div class="wf-label-inner">
        <div class="wf-badge">
          <span class="wf-step">${s.step}</span>
          <span class="wf-who ${s.who}">${s.who}</span>
          <span class="wf-step-text">${s.label}</span>
        </div>
        <div class="wf-step-desc">${s.desc}</div>
      </div>
    </label>
  `).join('');
}

// ══════════════════════════════════════════════
// TOOTH CHART — CONTROL SIDE
// Simple two-row flat layout in the panel;
// proper arch shape is in the prescription output only
// ══════════════════════════════════════════════

// Tooth width varies by tooth type for realism
function toothW(fdi) {
  const n = fdi % 10;
  if(n===0||n>=7) return 13; // 3rd molar / wisdom
  if(n===6)       return 13; // 1st & 2nd molar
  if(n===5||n===4)return 11; // premolars
  if(n===3)       return 10; // canine
  return 9;                  // incisors
}
function toothH(upper) { return upper ? 18 : 17; }

function makeSVGToothCtrl(fdi, upper) {
  const w = toothW(fdi), h = toothH(upper);
  const label = String(fdi);
  const fontSize = label.length > 2 ? 4.5 : 5.5;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:${w}px;height:${h}px">
    <rect x="0.7" y="0.7" width="${w-1.4}" height="${h-1.4}" rx="2" ry="2"/>
    <text x="${w/2}" y="${h/2}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="600">${label}</text>
  </svg>`;
}

function buildControlChart() {
  toothChartControl.innerHTML = `
    <div class="tcc-arch-wrap">
      <div class="tcc-row" id="ctrl-upper"></div>
      <div style="height:4px"></div>
      <div class="tcc-row" id="ctrl-lower"></div>
    </div>`;
  renderRow('ctrl-upper', UPPER_TEETH, true);
  renderRow('ctrl-lower', LOWER_TEETH, false);
}

function renderRow(id, teeth, upper) {
  const container = document.getElementById(id);
  if(!container) return;
  container.innerHTML = '';
  teeth.forEach((fdi, i) => {
    if(i===8) {
      const gap = document.createElement('div');
      gap.style.cssText = 'width:4px;flex-shrink:0;';
      container.appendChild(gap);
    }
    const el = document.createElement('div');
    el.className = 'tcc-tooth';
    el.dataset.fdi = fdi;
    if(state.toothStates[fdi]) el.classList.add('state-'+state.toothStates[fdi]);
    el.innerHTML = makeSVGToothCtrl(fdi, upper);
    el.addEventListener('click', ()=>cycleToothState(fdi, el));
    container.appendChild(el);
  });
}

function cycleToothState(fdi, el) {
  const mode = toothModeSelect.value;
  if(state.toothStates[fdi]===mode) {
    delete state.toothStates[fdi];
    el.classList.remove('state-abutment','state-pontic','state-missing');
  } else {
    state.toothStates[fdi] = mode;
    el.classList.remove('state-abutment','state-pontic','state-missing');
    el.classList.add('state-'+mode);
  }
}

// ══════════════════════════════════════════════
// ARCH SVG — PRESCRIPTION OUTPUT
//
// True horseshoe/U-shape. Each of the 32 teeth
// is placed along a parametric arch curve.
// The FDI number is drawn inside the tooth rect.
// Upper arch: open end faces DOWN (root upward)
// Lower arch: open end faces UP  (root downward)
// Both arches sit in a single 230×310 canvas.
// ══════════════════════════════════════════════

function buildArchSVG(toothStates) {
  // Canvas
  const W = 230, H = 310;

  // ── Upper arch ─────────────────────────────────────────────────────────────
  // Sweep from 200°→340° passes through 270° (bottom of ellipse).
  // This places teeth in a ∩ shape: arch opens downward, as the upper jaw
  // is viewed from below (occlusal view, as printed on a lab prescription).
  const UCX=115, UCY=108, URX=96, URY=70;
  const U_START=200, U_END=340;

  // ── Lower arch ─────────────────────────────────────────────────────────────
  // Sweep from 20°→160° passes through 90° (top of ellipse).
  // This places teeth in a ∪ shape: arch opens upward, matching the mandible
  // as viewed from above — correctly mirrored below the maxillary arch.
  const LCX=115, LCY=202, LRX=82, LRY=60;
  const L_START=20, L_END=160;

  function deg2rad(d) { return d*Math.PI/180; }

  function arcPoints(cx, cy, rx, ry, startDeg, endDeg, n) {
    return Array.from({length:n}, (_,i)=>{
      const t = deg2rad(startDeg + (endDeg-startDeg)*i/(n-1));
      return { x: cx+rx*Math.cos(t), y: cy+ry*Math.sin(t), t };
    });
  }

  const uPts = arcPoints(UCX,UCY,URX,URY,U_START,U_END,16);
  const lPts = arcPoints(LCX,LCY,LRX,LRY,L_START,L_END,16);

  function archToothDims(fdi) {
    const n=fdi%10;
    if(n===0||n>=7) return {w:13,h:14};
    if(n===6)       return {w:12,h:13};
    if(n===5||n===4)return {w:10,h:12};
    if(n===3)       return {w:9, h:13};
    return {w:8,h:11};
  }

  function toothStyle(fdi) {
    const s = toothStates[fdi];
    if(s==='abutment') return {fill:'#1a3a5c',stroke:'#0d2740',textFill:'#ffffff'};
    if(s==='pontic')   return {fill:'#fdf6e0',stroke:'#a07d10',textFill:'#a07d10',dasharray:'2.5 1.5'};
    if(s==='missing')  return {fill:'#f7eaec',stroke:'#8b1a2f',textFill:'#8b1a2f',dasharray:'2 1.5'};
    return {fill:'#f0ece5',stroke:'#a8a49c',textFill:'#6b6760'};
  }

  // Render one tooth at (px,py) rotated by toothAngleDeg.
  // The tooth rectangle rotates with the arch curve.
  // The text is ALWAYS kept upright: we counter-rotate it by -toothAngleDeg
  // so the FDI label is never upside-down regardless of arch position.
  function renderTooth(fdi, px, py, toothAngleDeg) {
    const {w,h} = archToothDims(fdi);
    const {fill,stroke,textFill,dasharray} = toothStyle(fdi);
    const da = dasharray ? `stroke-dasharray="${dasharray}"` : '';
    const label = String(fdi);
    const fs = label.length>2 ? 4 : 5;
    // Normalise the counter-rotation so text reads left-to-right always
    // (keep it in -180..180 range so SVG renders cleanly)
    const textRotate = -toothAngleDeg;
    return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) rotate(${toothAngleDeg.toFixed(1)})">
      <rect x="${(-w/2).toFixed(1)}" y="${(-h/2).toFixed(1)}" width="${w}" height="${h}"
        rx="2.5" ry="2" fill="${fill}" stroke="${stroke}" stroke-width="0.9" ${da}/>
      <text x="0" y="0.5" text-anchor="middle" dominant-baseline="central"
        font-size="${fs}" font-weight="700" fill="${textFill}"
        font-family="DM Mono,Courier New,monospace"
        transform="rotate(${textRotate.toFixed(1)})">${label}</text>
    </g>`;
  }

  let svg = '';

  // Quadrant labels
  svg += `
    <text x="16"  y="26"  font-size="7" font-weight="700" fill="#8b1a2f" font-family="DM Mono,monospace">UR</text>
    <text x="198" y="26"  font-size="7" font-weight="700" fill="#8b1a2f" font-family="DM Mono,monospace">UL</text>
    <text x="16"  y="300" font-size="7" font-weight="700" fill="#8b1a2f" font-family="DM Mono,monospace">LR</text>
    <text x="198" y="300" font-size="7" font-weight="700" fill="#8b1a2f" font-family="DM Mono,monospace">LL</text>
  `;

  // Midline
  svg += `<line x1="${W/2}" y1="22" x2="${W/2}" y2="285"
    stroke="#d4d0c8" stroke-width="0.5" stroke-dasharray="3 2"/>`;

  // Upper teeth — tangent angle + 90° orients the tooth perpendicular to the arch
  UPPER_TEETH.forEach((fdi,i)=>{
    const p = uPts[i];
    const tx = -URX*Math.sin(p.t), ty = URY*Math.cos(p.t);
    const tangentDeg = Math.atan2(ty,tx)*180/Math.PI;
    const angleDeg = tangentDeg + 90;
    svg += renderTooth(fdi, p.x, p.y, angleDeg);
  });

  // Lower teeth — same tangent calculation; lower arch now sweeps through
  // the top of the ellipse so roots point upward naturally
  LOWER_TEETH.forEach((fdi,i)=>{
    const p = lPts[i];
    const tx = -LRX*Math.sin(p.t), ty = LRY*Math.cos(p.t);
    const tangentDeg = Math.atan2(ty,tx)*180/Math.PI;
    const angleDeg = tangentDeg + 90;
    svg += renderTooth(fdi, p.x, p.y, angleDeg);
  });

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

// ══════════════════════════════════════════════
// PRESCRIPTION TYPE
// ══════════════════════════════════════════════
function setType(type) {
  state.type = type;
  typeTabs.forEach(t=>t.classList.toggle('active',t.dataset.type===type));
  document.querySelectorAll('.work-fields').forEach(f=>f.style.display='none');
  document.getElementById('fields-'+type).style.display='block';
}

// ══════════════════════════════════════════════
// WORK DETAIL HTML
// ══════════════════════════════════════════════
function buildWorkHtml(type) {
  if(type==='fixed') {
    const shade=g('shadeBody');
    const shadeHtml=shade?`
      <div class="rx-shade-row">
        <div class="rx-shade-swatch" style="background:${shadeToColor(shade)}"></div>
        <div>
          <div class="rx-shade-label">Body shade</div>
          <div class="rx-shade-code">${escHtml(shade)}${g('shadeGingival')?' / gingival '+escHtml(g('shadeGingival')):''}</div>
        </div>
      </div>`:'';
    return `
      <div class="rx-section-heading">Restoration Specification</div>
      <div class="rx-work-grid">
        <div class="rx-work-item"><div class="wlabel">Restoration</div><div class="wval">${escHtml(g('fixedType'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Material</div><div class="wval">${escHtml(g('fixedMaterial'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Occlusal Scheme</div><div class="wval">${escHtml(g('occlusalScheme'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Margin Type</div><div class="wval">${escHtml(g('marginType'))||'—'}</div></div>
        ${g('ponticDesign')?`<div class="rx-work-item" style="grid-column:1/-1"><div class="wlabel">Pontic Design</div><div class="wval">${escHtml(g('ponticDesign'))}</div></div>`:''}
      </div>
      ${shadeHtml}`;
  }
  if(type==='removable') {
    const shade=g('removableShade');
    const shadeHtml=shade?`
      <div class="rx-shade-row">
        <div class="rx-shade-swatch" style="background:${shadeToColor(shade)}"></div>
        <div>
          <div class="rx-shade-label">Tooth shade</div>
          <div class="rx-shade-code">${escHtml(shade)}${g('toothMould')?' — '+escHtml(g('toothMould')):''}</div>
        </div>
      </div>`:'';
    return `
      <div class="rx-section-heading">Appliance Specification</div>
      <div class="rx-work-grid">
        <div class="rx-work-item"><div class="wlabel">Appliance</div><div class="wval">${escHtml(g('removableType'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Gum Shade</div><div class="wval">${escHtml(g('gumShade'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Clasps / Retention</div><div class="wval">${escHtml(g('claspType'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Occlusion</div><div class="wval">${escHtml(g('removableOcclusion'))||'—'}</div></div>
      </div>
      ${shadeHtml}
      ${g('removableNotes')?`<div class="rx-clinical-notes"><strong>Design notes:</strong> ${escHtml(g('removableNotes'))}</div>`:''}
    `;
  }
  if(type==='ortho') {
    return `
      <div class="rx-section-heading">Appliance Specification</div>
      <div class="rx-work-grid">
        <div class="rx-work-item"><div class="wlabel">Appliance</div><div class="wval">${escHtml(g('orthoType'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Wire / Material</div><div class="wval">${escHtml(g('wireGauge'))||'—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Expansion Screw</div><div class="wval">${escHtml(g('expansionScrew'))||'None'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Acrylic Colour</div><div class="wval">${escHtml(g('acrylicColour'))||'—'}</div></div>
        ${g('springDetail')?`<div class="rx-work-item" style="grid-column:1/-1"><div class="wlabel">Spring / Component</div><div class="wval">${escHtml(g('springDetail'))}</div></div>`:''}
      </div>
      ${g('orthoNotes')?`<div class="rx-clinical-notes"><strong>Design notes:</strong> ${escHtml(g('orthoNotes'))}</div>`:''}
    `;
  }
  return '';
}

// ══════════════════════════════════════════════
// WORKFLOW STRIP (prescription output)
// Shows ALL stages in order; highlights done/current
// ══════════════════════════════════════════════
function buildWorkflowStrip(checkedIds) {
  const checkedSet = new Set(checkedIds);
  let lastCheckedIdx = -1;
  WORKFLOW_STAGES.forEach((s,i)=>{ if(checkedSet.has(s.id)) lastCheckedIdx=i; });

  const stepsHtml = WORKFLOW_STAGES.map((s,i)=>{
    let cls = 'wf-pending';
    if(checkedSet.has(s.id) && i===lastCheckedIdx) cls='wf-current';
    else if(checkedSet.has(s.id)) cls='wf-done';
    const arrow = i>0 ? '<span class="rx-wf-arrow">›</span>' : '';
    const whoBadge = `<span class="rx-wf-who ${s.who}">${s.who==='clinic'?'C':'L'}</span>`;
    return `${arrow}<div class="rx-wf-step ${cls}" title="${s.desc}">
      <span class="wf-num">${s.step}</span>
      ${whoBadge}
      <span>${s.label}</span>
    </div>`;
  }).join('');

  return `
    <div class="rx-workflow-strip">
      <div class="rx-workflow-title">
        Manufacturing Workflow &nbsp;·&nbsp;
        <span style="color:rgba(255,255,255,0.55)">C = Clinic &nbsp; L = Laboratory</span>
        &nbsp;·&nbsp; Gold = completed &nbsp;·&nbsp; Maroon = current stage
      </div>
      <div class="rx-workflow-steps">${stepsHtml}</div>
    </div>`;
}

// buildWorkflowDetail removed — workflow is fully represented in the strip above.

// ══════════════════════════════════════════════
// RENDER PRESCRIPTION
// ══════════════════════════════════════════════
function renderPrescription(data) {
  const typeLabel={fixed:'Fixed Prosthodontics',removable:'Removable Prosthodontics',ortho:'Orthodontics'};
  const badgeClass={fixed:'badge-fixed',removable:'badge-removable',ortho:'badge-ortho'};

  const clinicalNotesHtml = data.labNotes
    ? `<div class="rx-section-heading">Additional Clinical Notes</div>
       <div class="rx-clinical-notes">${escHtml(data.labNotes)}</div>`:'';

  rxOutput.innerHTML=`
  <div class="rx-doc">

    <div class="rx-doc-header">
      <div class="rx-logo-cell"><img src="${CMET_LOGO}" alt="Cardiff Metropolitan University"/></div>
      <div class="rx-title-cell">
        <div class="rx-doc-title">Dental Technology — Laboratory Prescription</div>
        <div class="rx-doc-sub">Custom Medical Device · For Authorised Laboratory Use Only</div>
      </div>
      <div class="rx-lab-cell">
        <strong>${escHtml(LAB_NAME)}</strong>
        ${escHtml(LAB_ADDRESS)}<br/>${escHtml(LAB_TEL)}
        <div class="rx-lab-mhra">${escHtml(MHRA_NUM)}</div>
      </div>
    </div>

    <div class="rx-type-strip ${badgeClass[data.type]||'badge-fixed'}">
      <span>◆ &nbsp;${typeLabel[data.type]||data.type}</span>
      <span class="rx-case-meta">Ref: ${escHtml(data.caseRef)} &nbsp;|&nbsp; ${escHtml(data.date)} &nbsp;|&nbsp; Due: ${escHtml(data.dueDate)}</span>
    </div>

    <div class="rx-info-strip">
      <div class="rx-info-cell">
        <div class="ic-label">Patient</div>
        <div class="ic-val">${escHtml(data.patientName)||'—'}</div>
        <div class="ic-sub">DOB: ${escHtml(data.patientDOB)} &nbsp;·&nbsp; ID: ${escHtml(data.patientID||'—')}</div>
      </div>
      <div class="rx-info-cell">
        <div class="ic-label">Prescribing Clinician</div>
        <div class="ic-val">${escHtml(data.clinicianName)||'—'}</div>
        <div class="ic-sub">${escHtml(data.practice||'—')}</div>
      </div>
    </div>

    ${buildWorkflowStrip(data.workflow||[])}

    <div class="rx-body">
      <div class="rx-notes-col">
        ${data.workHtml}
        ${clinicalNotesHtml}
      </div>
      <div class="rx-arch-col">
        <div class="rx-arch-title">Teeth Involved (FDI)</div>
        <div class="rx-arch-svg-wrap">
          ${buildArchSVG(data.toothStates||{})}
        </div>
        <div class="rx-arch-legend">
          <div class="rx-al-row"><span class="rx-al-dot abutment"></span> Abutment / Crown</div>
          <div class="rx-al-row"><span class="rx-al-dot pontic"></span> Pontic</div>
          <div class="rx-al-row"><span class="rx-al-dot missing"></span> Missing</div>
        </div>
      </div>
    </div>

    <div class="rx-doc-footer">
      <div class="rx-edu-notice">Generated for educational use within the Cardiff Metropolitan University Dental Technology programme. Not for clinical use.</div>
      <div class="rx-footer-mid"><div class="rx-mhra">${escHtml(MHRA_NUM)}</div></div>
      <div class="rx-sig-block">
        <div class="rx-sig-line"></div>
        <div class="rx-sig-name">Clinician Signature</div>
        <div style="font-size:9.5px;color:var(--muted)">${escHtml(data.clinicianName||'')}</div>
      </div>
    </div>

  </div>`;

  previewPlaceholder.style.display='none';
  rxOutput.style.display='block';
  previewActions.style.display='flex';
}

// ══════════════════════════════════════════════
// COLLECT DATA
// ══════════════════════════════════════════════
function collectData() {
  const caseRef = g('caseRef')||genCaseRef();
  setVal('caseRef',caseRef);
  return {
    type: state.type, caseRef,
    date: todayStr(),
    patientName:   g('patientName'), patientDOB: fmtDate(g('patientDOB')), patientID: g('patientID'),
    clinicianName: g('clinicianName'), practice: g('practice'),
    dueDate:       fmtDate(g('dueDate')),
    workflow:      getCheckedWorkflow(),
    labNotes:      g('labNotes'),
    toothStates:   {...state.toothStates},
    workHtml:      buildWorkHtml(state.type),
  };
}

// ══════════════════════════════════════════════
// NAMES & PRACTICES
// ══════════════════════════════════════════════
const FIRST_NAMES=['James','Sarah','Mohammed','Emily','Liam','Chloe','Oliver','Amara',
  'Thomas','Priya','Noah','Sophie','Ethan','Fatima','Lucas','Isabella','Rhys','Seren',
  'Owain','Cerys','Gareth','Nia','Dylan','Ffion','Aiden','Charlotte','Megan','Callum'];
const LAST_NAMES=['Smith','Patel','Johnson','Williams','Brown','Taylor','Davies','Wilson',
  'Evans','Ahmed','Thomas','Roberts','Khan','Walker','Jones','Morgan','Hughes','Price',
  'Griffiths','Lewis','Rees','Powell','Jenkins','Owen','Phillips'];
const PRACTICES=['Cardiff City Dental Centre','Pontcanna Dental Practice','Roath Dental Surgery',
  'Vale Dental','Penarth Dental Clinic','Whitchurch Road Dental','Bay Dental Cardiff',
  'Llandaff Dental Surgery','Fairwater Dental','Heath Dental Practice','Canton Dental Centre',
  'Splott Road Dental','Rumney Dental Surgery','Grangetown Dental Practice'];

function randomDOB(){
  const y=randInt(1945,2008),m=String(randInt(1,12)).padStart(2,'0'),d=String(randInt(1,28)).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function randomFuture(min=7,max=28){
  const d=new Date(); d.setDate(d.getDate()+randInt(min,max)); return d.toISOString().slice(0,10);
}

// ══════════════════════════════════════════════
// SCENARIOS
// workflow: array of stage IDs that are ticked —
//   represents the state of the prescription at
//   a specific point in the clinic↔lab journey.
//   The LAST id in the array is the "current" stage.
// ══════════════════════════════════════════════
const SCENARIOS = {
  fixed: [
    { fixedType:'Full coverage crown', fixedMaterial:'Full zirconia',
      shadeBody:'A2', shadeGingival:'', occlusalScheme:'Conformative (copy existing)',
      marginType:'Chamfer', ponticDesign:'',
      teeth:{36:'abutment'},
      // Prescription sent with final impressions and bite reg — lab to pour cast and begin
      workflow:['primary_imp','special_tray','final_imp','bite_reg','photos'],
      labNotes:'Please provide wax try-in before final firing. Gingival contour is critical — please call before processing.' },
    { fixedType:'Fixed-fixed bridge', fixedMaterial:'Layered zirconia (zirconia + porcelain)',
      shadeBody:'A3', shadeGingival:'A3.5', occlusalScheme:'Conformative (copy existing)',
      marginType:'Shoulder', ponticDesign:'Ovate',
      teeth:{14:'abutment',15:'pontic',16:'abutment'},
      // Prescription at framework try-in stage — framework returned from lab for clinic trial
      workflow:['primary_imp','special_tray','final_imp','bite_reg','facebow','photos','master_cast','framework','framework_try'],
      labNotes:'Ovate pontic — tissue contact surface must be polished. Please make adjustments following framework trial and proceed to wax try-in.' },
    { fixedType:'Veneer', fixedMaterial:'Lithium disilicate (e.max)',
      shadeBody:'B1', shadeGingival:'', occlusalScheme:'Conformative (copy existing)',
      marginType:'Feather edge', ponticDesign:'',
      teeth:{11:'abutment',12:'abutment',21:'abutment',22:'abutment'},
      // Post try-in — clinic approved, lab to complete final processing
      workflow:['primary_imp','final_imp','photos','master_cast','framework','tryin','tryin_ok'],
      labNotes:'High translucency incisal requested. Patient approved at try-in on 14/05/2025. No further changes required — proceed to final glaze.' },
    { fixedType:'Maryland bridge', fixedMaterial:'Lithium disilicate (e.max)',
      shadeBody:'A1', shadeGingival:'', occlusalScheme:'Group function',
      marginType:'', ponticDesign:'Modified ridge lap',
      teeth:{22:'missing',21:'abutment',23:'abutment'},
      // Complete appliance dispatched to clinic
      workflow:['primary_imp','final_imp','bite_reg','master_cast','framework','tryin','tryin_ok','complete'],
      labNotes:'Single-wing design — retainer on 23 only. Completed appliance enclosed for fit appointment.' },
    { fixedType:'Implant crown', fixedMaterial:'Full zirconia',
      shadeBody:'A3', shadeGingival:'', occlusalScheme:'Mutually protected / canine guidance',
      marginType:'Chamfer', ponticDesign:'',
      teeth:{46:'abutment'},
      // Prescription sent with digital scan — lab to design and mill
      workflow:['final_imp','bite_reg','photos','master_cast'],
      labNotes:'Screw-retained crown. Straumann BL RC 4.8mm. STL file sent via email. Include analogue in model. Emergence profile to match 47.' },
  ],
  removable: [
    { removableType:'Chrome cobalt partial denture', removableShade:'A2', toothMould:'SR Phonares II 6',
      gumShade:'Medium pink', claspType:'Circumferential (Akers) clasp', removableOcclusion:'Bilateral balanced occlusion',
      removableNotes:'Major connector: full palatal plate. Mesh retention on 14, 24. Rest seats on 17, 27. Indirect retainers on 13, 23.',
      teeth:{15:'missing',16:'missing',25:'missing',26:'missing'},
      workflow:['primary_imp','special_tray','final_imp','bite_reg','photos','master_cast','framework','framework_try'],
      labNotes:'Framework trial essential. Patient history of gagging — keep upper flange short. Please call before processing.' },
    { removableType:'Complete upper and lower dentures', removableShade:'A2', toothMould:'SR Vivodent S PE 22',
      gumShade:'Light pink', claspType:'', removableOcclusion:'Bilateral balanced occlusion',
      removableNotes:'Edentulous. Copy existing denture aesthetics. Post dam on upper. Shorten posterior flanges on lower.',
      teeth:{},
      workflow:['primary_imp','special_tray','final_imp','bite_reg','facebow','master_cast','framework','tryin'],
      labNotes:'Existing dentures enclosed. Patient has prominent mentalis — design lower flanges accordingly. Try-in mandatory before processing.' },
    { removableType:'Immediate partial denture', removableShade:'B1', toothMould:'SR Vivodent DCL 3',
      gumShade:'Stippled', claspType:'Ball clasp', removableOcclusion:'Copy existing occlusion',
      removableNotes:'Immediate denture — 44 to be extracted at fit. Score ridge on master cast before processing.',
      teeth:{44:'missing',45:'missing'},
      workflow:['primary_imp','final_imp','bite_reg','master_cast','tryin_ok','complete'],
      labNotes:'Immediate placement — fit appointment 14 days from lab receipt. Tooth 44 removed from cast; stipple gum for aesthetics.' },
    { removableType:'Record base and wax rim', removableShade:'', toothMould:'',
      gumShade:'', claspType:'', removableOcclusion:'',
      removableNotes:'Upper and lower record bases with occlusal rims required to register jaw relationships at next appointment.',
      teeth:{},
      workflow:['primary_imp','special_tray','final_imp','master_cast'],
      labNotes:'Please supply record bases and wax rims on articulated casts. Facebow and bite registration to follow at next clinic appointment.' },
    { removableType:'Implant-retained overdenture', removableShade:'A3', toothMould:'SR Phonares II 8',
      gumShade:'Medium pink', claspType:'Precision attachment', removableOcclusion:'Bilateral balanced occlusion',
      removableNotes:'Two-implant retained lower overdenture with Locator attachments. Process housings into denture base.',
      teeth:{36:'abutment',46:'abutment'},
      workflow:['primary_imp','special_tray','final_imp','bite_reg','facebow','master_cast','framework','tryin','tryin_ok'],
      labNotes:'Locator matrices to be processed in gold housing. Patient approved try-in — proceed to final processing and dispatch.' },
  ],
  ortho: [
    { orthoType:'Upper removable appliance (URA)', wireGauge:'0.7mm stainless steel',
      springDetail:'Z-spring on 12 (palatal root torque)', expansionScrew:'', acrylicColour:'Pink',
      orthoNotes:'Adams clasps 16, 26. Southend clasp 11, 21. Trim baseplate to allow labial eruption of 12.',
      teeth:{12:'abutment',16:'abutment',26:'abutment'},
      workflow:['primary_imp','master_cast','complete'],
      labNotes:'Patient is 11. All edges must be smooth. Pink acrylic (patient choice). Appliance to be dispatched to clinic for fit.' },
    { orthoType:'Twin block appliance', wireGauge:'0.7mm stainless steel',
      springDetail:'', expansionScrew:'Midline expansion screw', acrylicColour:'Clear / transparent',
      orthoNotes:'Class II div 1. OJ 9mm. Advance lower block to edge-to-edge. Anterior bite plane on upper to disocclude posteriors.',
      teeth:{},
      workflow:['primary_imp','bite_reg','master_cast','complete'],
      labNotes:'Activation instructions to be printed on patient insert. Ball clasps 55, 65, 75, 85. Dispatched for fit appointment.' },
    { orthoType:'Hawley retainer — upper', wireGauge:'0.7mm stainless steel labial bow',
      springDetail:'', expansionScrew:'', acrylicColour:'Blue',
      orthoNotes:'Post-fixed retention. Adams clasps 16, 26. Labial bow 13–23. No springs. Do not contact palatal gingival margin.',
      teeth:{13:'abutment',16:'abutment',26:'abutment'},
      workflow:['primary_imp','master_cast','complete'],
      labNotes:'Post-orthodontic retention. Patient to wear full-time for 6 months then nights only.' },
    { orthoType:'Vacuum-formed retainer (VFR) — upper', wireGauge:'1mm Essix / Zendura',
      springDetail:'', expansionScrew:'', acrylicColour:'Clear / transparent',
      orthoNotes:'Full arch to second molars. Trim to gingival margin buccally, 2mm subgingival palatally.',
      teeth:{},
      workflow:['primary_imp','master_cast','complete'],
      labNotes:'Post-aligner retention. Duplicate upper and lower VFRs requested. Nights only from month 7.' },
    { orthoType:'Transpalatal arch (TPA)', wireGauge:'0.9mm stainless steel',
      springDetail:'Palatal arch with Nance button', expansionScrew:'', acrylicColour:'',
      orthoNotes:'Bilateral molar anchorage reinforcement. Bands on 16, 26. Passive TPA with Nance acrylic button.',
      teeth:{16:'abutment',26:'abutment'},
      workflow:['primary_imp','master_cast','framework','complete'],
      labNotes:'Bands taken at clinic — enclosed. Weld arch to molar tubes. Nance button resting lightly on palate.' },
  ],
};

// ══════════════════════════════════════════════
// RANDOMISE — per type
// ══════════════════════════════════════════════
function randomiseType(type) {
  setType(type);
  const sc = rand(SCENARIOS[type]);

  // Patient & clinician
  setVal('patientName', `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`);
  setVal('patientDOB',  randomDOB());
  setVal('patientID',   'PT-'+String(randInt(10000,99999)));
  setVal('clinicianName', `Dr ${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`);
  setVal('practice',    rand(PRACTICES));
  setVal('rxDate',      todayISO());
  setVal('dueDate',     randomFuture());
  setVal('caseRef',     genCaseRef());

  // Work fields
  if(type==='fixed') {
    setVal('fixedType',sc.fixedType); setVal('fixedMaterial',sc.fixedMaterial);
    setVal('shadeBody',sc.shadeBody); setVal('shadeGingival',sc.shadeGingival||'');
    setVal('occlusalScheme',sc.occlusalScheme); setVal('marginType',sc.marginType);
    setVal('ponticDesign',sc.ponticDesign);
  } else if(type==='removable') {
    setVal('removableType',sc.removableType); setVal('removableShade',sc.removableShade);
    setVal('toothMould',sc.toothMould); setVal('gumShade',sc.gumShade);
    setVal('claspType',sc.claspType); setVal('removableOcclusion',sc.removableOcclusion);
    setVal('removableNotes',sc.removableNotes);
  } else if(type==='ortho') {
    setVal('orthoType',sc.orthoType); setVal('wireGauge',sc.wireGauge);
    setVal('springDetail',sc.springDetail); setVal('expansionScrew',sc.expansionScrew);
    setVal('acrylicColour',sc.acrylicColour); setVal('orthoNotes',sc.orthoNotes);
  }

  setVal('labNotes', sc.labNotes||'');

  // Workflow — rebuild checklist with correct IDs ticked
  buildWorkflowChecklist(sc.workflow||[]);

  // Teeth
  state.toothStates = {...(sc.teeth||{})};
  buildControlChart();

  generatePrescription();
}

// ══════════════════════════════════════════════
// GENERATE
// ══════════════════════════════════════════════
function generatePrescription() {
  const data = collectData();
  if(!data.patientName) { alert('Please enter a patient name (or use ⟳ Randomise).'); return; }
  state.lastData = data;
  renderPrescription(data);
}

// ══════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════
function saveToHistory(data) {
  state.history.unshift(data);
  if(state.history.length>60) state.history.pop();
  try { localStorage.setItem('labRxHistory',JSON.stringify(state.history)); } catch(e) {}
  renderHistory();
}
function renderHistory() {
  if(!state.history.length) { historyList.innerHTML='<p class="empty-state">No prescriptions saved yet.</p>'; return; }
  const tl={fixed:'Fixed',removable:'Removable',ortho:'Orthodontic'};
  historyList.innerHTML=state.history.map((item,i)=>`
    <div class="history-item" data-index="${i}">
      <div>
        <div class="hi-title">${escHtml(tl[item.type]||item.type)} — ${escHtml(item.patientName||'—')}</div>
        <div class="hi-patient">${escHtml(item.practice||'')} &nbsp;·&nbsp; Ref: ${escHtml(item.caseRef)}</div>
      </div>
      <div class="hi-date">${escHtml(item.date)}</div>
    </div>`).join('');
  historyList.querySelectorAll('.history-item').forEach(el=>{
    el.addEventListener('click',()=>{
      const item=state.history[parseInt(el.dataset.index,10)];
      state.toothStates={...(item.toothStates||{})};
      buildControlChart();
      buildWorkflowChecklist(item.workflow||[]);
      setType(item.type||'fixed');
      renderPrescription(item);
      switchTab('generate');
    });
  });
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════
function switchTab(tab) {
  navBtns.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  tabGenerate.style.display = tab==='generate' ? '' : 'none';
  tabHistory.style.display  = tab==='history'  ? 'block' : 'none';
}

// ══════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════
typeTabs.forEach(t=>t.addEventListener('click',()=>setType(t.dataset.type)));

// Per-type randomise buttons
document.querySelectorAll('.btn-rand-sm').forEach(btn=>{
  btn.addEventListener('click',()=>randomiseType(btn.dataset.randtype));
});

navBtns.forEach(b=>b.addEventListener('click',()=>{
  switchTab(b.dataset.tab);
  if(b.dataset.tab==='history') renderHistory();
}));

generateBtn.addEventListener('click',generatePrescription);

clearBtn.addEventListener('click',()=>{
  if(!confirm('Clear all fields?')) return;
  document.querySelectorAll('.panel-controls input:not([type=checkbox]),.panel-controls select,.panel-controls textarea').forEach(el=>{ el.value=''; });
  document.querySelectorAll('.panel-controls input[type=checkbox]').forEach(cb=>{ cb.checked=false; });
  state.toothStates={};
  buildControlChart();
  rxOutput.style.display='none';
  previewPlaceholder.style.display='flex';
  previewActions.style.display='none';
  state.lastData=null;
});

pdfBtn.addEventListener('click',()=>window.print());
clearTeethBtn.addEventListener('click',()=>{ state.toothStates={}; buildControlChart(); });

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
buildControlChart();
buildWorkflowChecklist([]);
setType('fixed');
renderHistory();
