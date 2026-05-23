/* =============================================
   DENTAL LAB RX — script.js
   ============================================= */

// ══════════════════════════════════════════════
// TOOTH DATA  (FDI two-digit notation)
// Upper right → upper left, then lower left → lower right
// ══════════════════════════════════════════════
const UPPER_TEETH = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
const LOWER_TEETH = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

// Simple tooth SVG path (stylised)
function toothPath(upper) {
  // upper teeth taper toward root upward, lower downward
  return upper
    ? "M5 22 C3 18 2 14 2 10 C2 5 4 2 9 2 C11 2 13 3 14 3 C15 3 17 2 19 2 C24 2 26 5 26 10 C26 14 25 18 23 22 Z"
    : "M5 2 C3 6 2 10 2 14 C2 19 4 22 9 22 C11 22 13 21 14 21 C15 21 17 22 19 22 C24 22 26 19 26 14 C26 10 25 6 23 2 Z";
}

function makeSVGTooth(upper) {
  return `<svg viewBox="0 0 28 24" xmlns="http://www.w3.org/2000/svg"><path d="${toothPath(upper)}"/></svg>`;
}

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const state = {
  type: 'fixed',
  toothStates: {},  // FDI number → 'abutment' | 'pontic' | 'missing'
  history: JSON.parse(localStorage.getItem('labRxHistory') || '[]'),
  lastData: null,
};

// ══════════════════════════════════════════════
// DOM REFS
// ══════════════════════════════════════════════
const typeTabs      = document.querySelectorAll('.type-tab');
const navBtns       = document.querySelectorAll('.nav-btn');
const tabGenerate   = document.getElementById('tab-generate');
const tabHistory    = document.getElementById('tab-history');
const randomBtn     = document.getElementById('randomBtn');
const generateBtn   = document.getElementById('generateBtn');
const clearBtn      = document.getElementById('clearBtn');
const printBtn      = document.getElementById('printBtn');
const saveBtn       = document.getElementById('saveBtn');
const previewActions= document.getElementById('previewActions');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const rxOutput      = document.getElementById('rxOutput');
const historyList   = document.getElementById('historyList');
const toothModeSelect = document.getElementById('toothMode');
const clearTeethBtn = document.getElementById('clearTeethBtn');
const toothChartControl = document.getElementById('toothChartControl');

// ══════════════════════════════════════════════
// TOOTH CHART — CONTROLS SIDE
// ══════════════════════════════════════════════
function buildControlChart() {
  toothChartControl.innerHTML = `
    <div class="tcc-arch" id="ctrl-upper"></div>
    <div style="height:8px"></div>
    <div class="tcc-arch" id="ctrl-lower"></div>
  `;
  renderControlArch('ctrl-upper', UPPER_TEETH, true);
  renderControlArch('ctrl-lower', LOWER_TEETH, false);
}

function renderControlArch(containerId, teeth, upper) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  teeth.forEach((fdi, i) => {
    // midline divider after index 7
    if (i === 8) {
      const div = document.createElement('div');
      div.className = 'tcc-divider';
      container.appendChild(div);
    }
    const el = document.createElement('div');
    el.className = 'tcc-tooth';
    el.dataset.fdi = fdi;
    const stateClass = state.toothStates[fdi] ? `state-${state.toothStates[fdi]}` : '';
    if (stateClass) el.classList.add(stateClass);
    el.innerHTML = `${makeSVGTooth(upper)}<span class="tnum">${fdi}</span>`;
    el.addEventListener('click', () => cycleToothState(fdi, el));
    container.appendChild(el);
  });
}

function cycleToothState(fdi, el) {
  const mode = toothModeSelect.value;
  if (state.toothStates[fdi] === mode) {
    delete state.toothStates[fdi];
    el.classList.remove('state-abutment','state-pontic','state-missing');
  } else {
    state.toothStates[fdi] = mode;
    el.classList.remove('state-abutment','state-pontic','state-missing');
    el.classList.add(`state-${mode}`);
  }
}

// ══════════════════════════════════════════════
// PRESCRIPTION TYPE SWITCHING
// ══════════════════════════════════════════════
function setType(type) {
  state.type = type;
  typeTabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
  document.querySelectorAll('.work-fields').forEach(f => f.style.display = 'none');
  document.getElementById(`fields-${type}`).style.display = 'block';
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function g(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function escHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function todayStr() {
  return new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
}

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function genCaseRef() {
  return 'LAB-' + Date.now().toString(36).toUpperCase().slice(-6);
}

function shadeToColor(shade) {
  const map = {
    'A1':'#f5ead0','A2':'#f0e0b8','A3':'#e8d09e','A3.5':'#e0c48a','A4':'#d4b070',
    'B1':'#f5e8c8','B2':'#eedfc0','B3':'#e5d0a4','B4':'#d8c090',
    'C1':'#eedfb8','C2':'#e6d5a8','C3':'#dcc890','C4':'#cfc080',
    'D2':'#e8d8a8','D3':'#dfd0a0','D4':'#d0c08a',
  };
  return map[shade] || '#e8dcc8';
}

function getEnclosures() {
  return Array.from(document.querySelectorAll('#enclosureGroup input:checked'))
    .map(cb => cb.value);
}

// ══════════════════════════════════════════════
// TOOTH CHART SVG for OUTPUT
// ══════════════════════════════════════════════
function buildOutputToothChart() {
  function archHtml(teeth, upper) {
    return teeth.map((fdi, i) => {
      const st = state.toothStates[fdi] || '';
      const stClass = st ? `st-${st}` : '';
      const sep = (i === 7) ? '<div style="width:6px;flex-shrink:0;"></div>' : '';
      return `${sep}<div class="rx-tooth ${stClass}">
        <svg viewBox="0 0 28 24" xmlns="http://www.w3.org/2000/svg"><path d="${toothPath(upper)}"/></svg>
        <span class="tnum">${fdi}</span>
      </div>`;
    }).join('');
  }
  return `
    <div class="rx-tooth-section">
      <div class="rx-tooth-title">Teeth Involved (FDI notation)</div>
      <div class="rx-arch-wrap">
        <div class="rx-arch upper-arch">${archHtml(UPPER_TEETH, true)}</div>
        <div class="rx-arch-divider"></div>
        <div class="rx-arch lower-arch">${archHtml(LOWER_TEETH, false)}</div>
      </div>
      <div class="tooth-legend" style="margin-top:5px;">
        <span class="legend-dot legend-abutment"></span> Abutment / Crown &nbsp;
        <span class="legend-dot legend-pontic"></span> Pontic &nbsp;
        <span class="legend-dot legend-missing"></span> Missing
      </div>
    </div>`;
}

// ══════════════════════════════════════════════
// BUILD WORK DETAILS HTML per type
// ══════════════════════════════════════════════
function buildWorkHtml(type) {
  if (type === 'fixed') {
    const shade = g('shadeBody');
    const shadeColor = shade ? shadeToColor(shade) : null;
    const shadeHtml = shade ? `
      <div class="rx-shade-block">
        <span class="shade-label">Shade</span>
        <div class="rx-shade-swatch" style="background:${shadeColor};"></div>
        <span class="rx-shade-code">${escHtml(shade)}</span>
        ${g('shadeGingival') ? `<span style="font-size:11px;color:var(--muted);">gingival: ${escHtml(g('shadeGingival'))}</span>` : ''}
      </div>` : '';
    return `
      <div class="rx-work-grid">
        <div class="rx-work-item"><div class="wlabel">Restoration</div><div class="wval">${escHtml(g('fixedType')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Material</div><div class="wval">${escHtml(g('fixedMaterial')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Occlusal Scheme</div><div class="wval">${escHtml(g('occlusalScheme')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Margin Type</div><div class="wval">${escHtml(g('marginType')) || '—'}</div></div>
        ${g('ponticDesign') ? `<div class="rx-work-item"><div class="wlabel">Pontic Design</div><div class="wval">${escHtml(g('ponticDesign'))}</div></div>` : ''}
      </div>
      ${shadeHtml}`;
  }
  if (type === 'removable') {
    const shade = g('removableShade');
    const shadeColor = shade ? shadeToColor(shade) : null;
    const shadeHtml = shade ? `
      <div class="rx-shade-block">
        <span class="shade-label">Tooth Shade</span>
        <div class="rx-shade-swatch" style="background:${shadeColor};"></div>
        <span class="rx-shade-code">${escHtml(shade)}</span>
        ${g('toothMould') ? `<span style="font-size:11px;color:var(--muted);">mould: ${escHtml(g('toothMould'))}</span>` : ''}
      </div>` : '';
    return `
      <div class="rx-work-grid">
        <div class="rx-work-item"><div class="wlabel">Appliance</div><div class="wval">${escHtml(g('removableType')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Gum Shade</div><div class="wval">${escHtml(g('gumShade')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Clasps / Retention</div><div class="wval">${escHtml(g('claspType')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Occlusion</div><div class="wval">${escHtml(g('removableOcclusion')) || '—'}</div></div>
      </div>
      ${shadeHtml}
      ${g('removableNotes') ? `<div class="rx-notes-block"><div class="notes-label">Design Notes</div>${escHtml(g('removableNotes'))}</div>` : ''}`;
  }
  if (type === 'ortho') {
    return `
      <div class="rx-work-grid">
        <div class="rx-work-item"><div class="wlabel">Appliance</div><div class="wval">${escHtml(g('orthoType')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Wire / Gauge</div><div class="wval">${escHtml(g('wireGauge')) || '—'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Screw</div><div class="wval">${escHtml(g('expansionScrew')) || 'None'}</div></div>
        <div class="rx-work-item"><div class="wlabel">Acrylic Colour</div><div class="wval">${escHtml(g('acrylicColour')) || '—'}</div></div>
        ${g('springDetail') ? `<div class="rx-work-item"><div class="wlabel">Spring / Component</div><div class="wval">${escHtml(g('springDetail'))}</div></div>` : ''}
      </div>
      ${g('orthoNotes') ? `<div class="rx-notes-block"><div class="notes-label">Design Notes</div>${escHtml(g('orthoNotes'))}</div>` : ''}`;
  }
  return '';
}

// ══════════════════════════════════════════════
// RENDER PRESCRIPTION
// ══════════════════════════════════════════════
function renderPrescription(data) {
  const typeLabelMap = { fixed: 'Fixed Prosthodontics', removable: 'Removable Prosthodontics', ortho: 'Orthodontics' };
  const badgeClass   = { fixed: 'badge-fixed', removable: 'badge-removable', ortho: 'badge-ortho' };

  const enclosuresHtml = data.enclosures && data.enclosures.length
    ? `<div class="rx-notes-block" style="border-left-color:var(--green); background:var(--green-lt); color:var(--green);">
         <div class="notes-label" style="opacity:0.65;">Enclosures</div>
         <div class="rx-enclosures">${data.enclosures.map(e => `<span class="rx-enclosure-tag">${escHtml(e)}</span>`).join('')}</div>
       </div>`
    : '';

  const labNotesHtml = data.labNotes
    ? `<div class="rx-notes-block"><div class="notes-label">Additional Notes for Laboratory</div>${escHtml(data.labNotes)}</div>`
    : '';

  rxOutput.innerHTML = `
    <div class="rx-doc">
      <div class="rx-doc-header">
        <div>
          <div class="practice">${escHtml(data.practice || 'Dental Practice')}</div>
          <div class="clinician">${escHtml(data.clinicianName || '—')}${data.gdcNumber ? ' &nbsp;·&nbsp; GDC ' + escHtml(data.gdcNumber) : ''}</div>
        </div>
        <div class="meta">
          <div>${escHtml(data.date)}</div>
          <div>${escHtml(data.caseRef)}</div>
          <div>Due: ${escHtml(data.dueDate || '—')}</div>
        </div>
      </div>

      <div class="rx-type-badge ${badgeClass[data.type] || 'badge-fixed'}">
        ◆ &nbsp;${typeLabelMap[data.type] || data.type}
      </div>

      <div class="rx-parties">
        <div class="rx-party">
          <div class="party-label">Patient</div>
          <div class="party-name">${escHtml(data.patientName || '—')}</div>
          <div class="party-sub">DOB: ${escHtml(data.patientDOB)}&nbsp;&nbsp;|&nbsp;&nbsp;ID: ${escHtml(data.patientID || '—')}</div>
        </div>
        <div class="rx-party">
          <div class="party-label">Laboratory</div>
          <div class="party-name">${escHtml(data.labName || '—')}</div>
          <div class="party-sub">Due: ${escHtml(data.dueDate || '—')}</div>
        </div>
      </div>

      <div class="rx-doc-body">
        ${buildOutputToothChart()}
        ${data.workHtml}
        ${labNotesHtml}
        ${enclosuresHtml}
      </div>

      <div class="rx-doc-footer">
        <div class="rx-edu-notice">Educational prescription — generated for dental technology student practice only. Not for clinical use.</div>
        <div class="rx-sig-block">
          <div class="rx-sig-line"></div>
          <div style="font-size:11px;">Clinician Signature</div>
          <div style="font-size:10px;opacity:0.6;">${escHtml(data.clinicianName || '')}</div>
        </div>
      </div>
    </div>`;

  previewPlaceholder.style.display = 'none';
  rxOutput.style.display = 'block';
  previewActions.style.display = 'flex';
}

// ══════════════════════════════════════════════
// COLLECT FORM DATA
// ══════════════════════════════════════════════
function collectData() {
  const caseRef = g('caseRef') || genCaseRef();
  document.getElementById('caseRef').value = caseRef;
  return {
    type:          state.type,
    caseRef,
    date:          todayStr(),
    patientName:   g('patientName'),
    patientDOB:    fmtDate(g('patientDOB')),
    patientID:     g('patientID'),
    clinicianName: g('clinicianName'),
    gdcNumber:     g('gdcNumber'),
    practice:      g('practice'),
    labName:       g('labName'),
    dueDate:       fmtDate(g('dueDate')),
    labNotes:      g('labNotes'),
    enclosures:    getEnclosures(),
    toothStates:   { ...state.toothStates },
    workHtml:      buildWorkHtml(state.type),
    // raw values for re-loading (best-effort)
    _raw: {
      fixedType: g('fixedType'), fixedMaterial: g('fixedMaterial'),
      shadeBody: g('shadeBody'), shadeGingival: g('shadeGingival'),
      occlusalScheme: g('occlusalScheme'), marginType: g('marginType'), ponticDesign: g('ponticDesign'),
      removableType: g('removableType'), removableShade: g('removableShade'),
      toothMould: g('toothMould'), gumShade: g('gumShade'),
      claspType: g('claspType'), removableOcclusion: g('removableOcclusion'), removableNotes: g('removableNotes'),
      orthoType: g('orthoType'), wireGauge: g('wireGauge'), springDetail: g('springDetail'),
      expansionScrew: g('expansionScrew'), acrylicColour: g('acrylicColour'), orthoNotes: g('orthoNotes'),
    }
  };
}

// ══════════════════════════════════════════════
// RANDOMISER
// ══════════════════════════════════════════════
const FIRST_NAMES = ['James','Sarah','Mohammed','Emily','Liam','Chloe','Oliver','Amara',
  'Thomas','Priya','Noah','Sophie','Ethan','Fatima','Lucas','Isabella','Aiden','Charlotte'];
const LAST_NAMES  = ['Smith','Patel','Johnson','Williams','Brown','Taylor','Davies','Wilson',
  'Evans','Ahmed','Thomas','Roberts','Khan','Walker','White','Thompson','Harris','Clarke'];
const PRACTICES   = ['City Dental Centre','University Dental Hospital','Riverside Dental',
  'Greenpark Dental Practice','St. Anne\'s Dental','Northgate Dental','Orchard Dental Clinic'];
const LABS        = ['Ace Dental Laboratory','Prestige Dental Lab','Crown & Bridge Ltd',
  'Aesthetic Dental Lab','ProSmile Technicians','Pearce Dental Lab','Midland Dental Studio'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomDOB() {
  const year = randInt(1950, 2008);
  const month = String(randInt(1,12)).padStart(2,'0');
  const day = String(randInt(1,28)).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

function randomFutureDate(minDays=7, maxDays=28) {
  const d = new Date();
  d.setDate(d.getDate() + randInt(minDays, maxDays));
  return d.toISOString().slice(0,10);
}

const SCENARIOS = [
  // FIXED
  {
    type: 'fixed',
    fixedType: 'Full coverage crown', fixedMaterial: 'Full zirconia',
    shadeBody: 'A2', occlusalScheme: 'Conformative (copy existing occlusion)',
    marginType: 'Chamfer', ponticDesign: '',
    teeth: { 36: 'abutment' },
    labNotes: 'Please provide a wax try-in before final firing.',
    enclosures: ['Impressions (polyvinylsiloxane)', 'Bite registration', 'Shade tab photograph'],
  },
  {
    type: 'fixed',
    fixedType: 'Fixed-fixed bridge', fixedMaterial: 'Layered zirconia (zirconia + porcelain)',
    shadeBody: 'A3', occlusalScheme: 'Conformative (copy existing occlusion)',
    marginType: 'Shoulder', ponticDesign: 'Ovate',
    teeth: { 14: 'abutment', 15: 'pontic', 16: 'abutment' },
    labNotes: 'Ovate pontic — ensure tissue contact surface is polished. Photos of adjacent teeth enclosed.',
    enclosures: ['Impressions (polyvinylsiloxane)', 'Bite registration', 'Photographs', 'Facebow record'],
  },
  {
    type: 'fixed',
    fixedType: 'Veneer', fixedMaterial: 'Lithium disilicate (e.max)',
    shadeBody: 'B1', occlusalScheme: 'Conformative (copy existing occlusion)',
    marginType: 'Feather edge', ponticDesign: '',
    teeth: { 11: 'abutment', 12: 'abutment', 21: 'abutment', 22: 'abutment' },
    labNotes: 'Minimal-prep veneers. Patient is a pianist — extremely conscious of appearance. High translucency incisal requested.',
    enclosures: ['Impressions (polyvinylsiloxane)', 'Photographs', 'Study models'],
  },
  {
    type: 'fixed',
    fixedType: 'Maryland bridge', fixedMaterial: 'Lithium disilicate (e.max)',
    shadeBody: 'A1', occlusalScheme: 'Group function', marginType: '',
    ponticDesign: 'Modified ridge lap',
    teeth: { 22: 'missing', 21: 'abutment', 23: 'abutment' },
    labNotes: 'Single wing design — retainer on 23 only. Ensure adequate clearance on palatal surface.',
    enclosures: ['Impressions (polyvinylsiloxane)', 'Bite registration', 'Study models'],
  },
  {
    type: 'fixed',
    fixedType: 'Implant crown', fixedMaterial: 'Full zirconia',
    shadeBody: 'A3', occlusalScheme: 'Mutually protected / canine guidance',
    marginType: 'Chamfer', ponticDesign: '',
    teeth: { 46: 'abutment' },
    labNotes: 'Screw-retained crown on Straumann BL RC implant. Platform: RC 4.8mm. Please include analogue with model.',
    enclosures: ['Digital scan (STL)', 'Photographs'],
  },
  // REMOVABLE
  {
    type: 'removable',
    removableType: 'Chrome cobalt partial denture',
    removableShade: 'A2', toothMould: 'SR Phonares II 6',
    gumShade: 'Medium pink', claspType: 'Circumferential (Akers) clasp',
    removableOcclusion: 'Bilateral balanced occlusion',
    removableNotes: 'Major connector: palatal plate. Mesh retention on 14, 24 for acrylic flange. Rest seats on 17, 27.',
    teeth: { 15: 'missing', 16: 'missing', 25: 'missing', 26: 'missing' },
    enclosures: ['Impressions (alginate)', 'Bite registration', 'Study models'],
  },
  {
    type: 'removable',
    removableType: 'Complete upper and lower dentures',
    removableShade: 'A2', toothMould: 'SR Vivodent S PE 22',
    gumShade: 'Light pink', claspType: '',
    removableOcclusion: 'Bilateral balanced occlusion',
    removableNotes: 'Patient is edentulous. Copy existing denture aesthetics — patient happy with appearance. Shortened dental arch posteriorly. Post dam required on upper.',
    teeth: {},
    enclosures: ['Impressions (alginate)', 'Bite registration', 'Facebow record', 'Existing prosthesis'],
  },
  {
    type: 'removable',
    removableType: 'Acrylic partial denture',
    removableShade: 'B1', toothMould: 'SR Vivodent DCL 3',
    gumShade: 'Stippled', claspType: 'Ball clasp',
    removableOcclusion: 'Copy existing occlusion',
    removableNotes: 'Immediate denture — tooth 44 to be extracted at fit appointment. Please score ridge on cast.',
    teeth: { 44: 'missing', 45: 'missing' },
    enclosures: ['Impressions (alginate)', 'Bite registration', 'Study models'],
  },
  // ORTHO
  {
    type: 'ortho',
    orthoType: 'Upper removable appliance (URA)',
    wireGauge: '0.7mm stainless steel',
    springDetail: 'Z-spring on 12 (palatal root torque)',
    expansionScrew: '',
    acrylicColour: 'Pink',
    orthoNotes: 'Adams clasps 16, 26. Southend clasp 11, 21. Trim acrylic to allow 12 to erupt labially.',
    teeth: { 12: 'abutment', 16: 'abutment', 26: 'abutment' },
    enclosures: ['Study models', 'Impressions (alginate)'],
  },
  {
    type: 'ortho',
    orthoType: 'Twin block appliance',
    wireGauge: '0.7mm stainless steel',
    springDetail: '',
    expansionScrew: 'Midline expansion screw',
    acrylicColour: 'Clear / transparent',
    orthoNotes: 'Class II div 1 malocclusion. Overjet 9mm. Anterior bite plane on upper block. Advance lower block to edge-to-edge incisors.',
    teeth: {},
    enclosures: ['Study models', 'Impressions (alginate)', 'Bite registration'],
  },
  {
    type: 'ortho',
    orthoType: 'Hawley retainer — upper',
    wireGauge: '0.7mm stainless steel labial bow',
    springDetail: '',
    expansionScrew: '',
    acrylicColour: 'Blue',
    orthoNotes: 'Post-fixed appliance retention. Adams clasps 16, 26. Labial bow 13–23. Do not add any springs.',
    teeth: { 13:'abutment', 16:'abutment', 26:'abutment' },
    enclosures: ['Study models', 'Impressions (alginate)'],
  },
  {
    type: 'ortho',
    orthoType: 'Vacuum-formed retainer (VFR) — upper',
    wireGauge: '1mm Essix / Zendura material',
    springDetail: '',
    expansionScrew: '',
    acrylicColour: 'Clear / transparent',
    orthoNotes: 'Post-aligner retention. Full-arch coverage to second molars. Patient to wear nights only.',
    teeth: {},
    enclosures: ['Digital scan (STL)', 'Study models'],
  },
];

function setVal(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = val || '';
}

function randomise() {
  const scenario = rand(SCENARIOS);
  const firstName = rand(FIRST_NAMES);
  const lastName  = rand(LAST_NAMES);
  const gdcNum    = randInt(100000, 299999);
  const ptNum     = 'PT-' + String(randInt(10000, 99999));
  const caseRef   = genCaseRef();

  // Set type and show correct fields
  setType(scenario.type);

  // Patient
  setVal('patientName', `${firstName} ${lastName}`);
  setVal('patientDOB',  randomDOB());
  setVal('patientID',   ptNum);

  // Clinician
  const cFirstName = rand(FIRST_NAMES);
  const cLastName  = rand(LAST_NAMES);
  setVal('clinicianName', `Dr ${cFirstName} ${cLastName}`);
  setVal('gdcNumber',     'GDC-' + gdcNum);
  setVal('practice',      rand(PRACTICES));
  const today = new Date().toISOString().slice(0,10);
  setVal('rxDate', today);

  // Lab
  setVal('labName', rand(LABS));
  setVal('dueDate', randomFutureDate());
  setVal('caseRef', caseRef);

  // Work fields
  if (scenario.type === 'fixed') {
    setVal('fixedType',      scenario.fixedType);
    setVal('fixedMaterial',  scenario.fixedMaterial);
    setVal('shadeBody',      scenario.shadeBody);
    setVal('shadeGingival',  scenario.shadeGingival || '');
    setVal('occlusalScheme', scenario.occlusalScheme);
    setVal('marginType',     scenario.marginType);
    setVal('ponticDesign',   scenario.ponticDesign);
  } else if (scenario.type === 'removable') {
    setVal('removableType',      scenario.removableType);
    setVal('removableShade',     scenario.removableShade);
    setVal('toothMould',         scenario.toothMould);
    setVal('gumShade',           scenario.gumShade);
    setVal('claspType',          scenario.claspType);
    setVal('removableOcclusion', scenario.removableOcclusion);
    setVal('removableNotes',     scenario.removableNotes);
  } else if (scenario.type === 'ortho') {
    setVal('orthoType',       scenario.orthoType);
    setVal('wireGauge',       scenario.wireGauge);
    setVal('springDetail',    scenario.springDetail);
    setVal('expansionScrew',  scenario.expansionScrew);
    setVal('acrylicColour',   scenario.acrylicColour);
    setVal('orthoNotes',      scenario.orthoNotes);
  }

  // Notes & enclosures
  setVal('labNotes', scenario.labNotes || '');

  document.querySelectorAll('#enclosureGroup input[type=checkbox]').forEach(cb => {
    cb.checked = (scenario.enclosures || []).includes(cb.value);
  });

  // Tooth states
  state.toothStates = { ...(scenario.teeth || {}) };
  buildControlChart();

  // Auto-generate
  generatePrescription();
}

// ══════════════════════════════════════════════
// GENERATE
// ══════════════════════════════════════════════
function generatePrescription() {
  const data = collectData();
  if (!data.patientName) {
    alert('Please enter a patient name (or hit Randomise to generate a scenario).');
    return;
  }
  state.lastData = data;
  renderPrescription(data);
}

// ══════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════
function saveToHistory(data) {
  state.history.unshift(data);
  if (state.history.length > 60) state.history.pop();
  try { localStorage.setItem('labRxHistory', JSON.stringify(state.history)); } catch(e) {}
  renderHistory();
}

function renderHistory() {
  if (!state.history.length) {
    historyList.innerHTML = '<p class="empty-state">No prescriptions saved yet.</p>';
    return;
  }
  const typeLabel = { fixed:'Fixed', removable:'Removable', ortho:'Orthodontic' };
  historyList.innerHTML = state.history.map((item, i) => `
    <div class="history-item" data-index="${i}">
      <div>
        <div class="hi-title">${escHtml(typeLabel[item.type] || item.type)} — ${escHtml(item.patientName || '—')}</div>
        <div class="hi-patient">${escHtml(item.practice || '')} · Ref: ${escHtml(item.caseRef)}</div>
      </div>
      <div class="hi-date">${escHtml(item.date)}</div>
    </div>`).join('');

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = state.history[parseInt(el.dataset.index, 10)];
      state.toothStates = { ...(item.toothStates || {}) };
      buildControlChart();
      setType(item.type || 'fixed');
      renderPrescription(item);
      switchTab('generate');
    });
  });
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════
function switchTab(tab) {
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  tabGenerate.style.display = tab === 'generate' ? '' : 'none';
  tabHistory.style.display  = tab === 'history'  ? 'block' : 'none';
}

// ══════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════
typeTabs.forEach(t => t.addEventListener('click', () => setType(t.dataset.type)));

navBtns.forEach(b => b.addEventListener('click', () => {
  switchTab(b.dataset.tab);
  if (b.dataset.tab === 'history') renderHistory();
}));

randomBtn.addEventListener('click', randomise);

generateBtn.addEventListener('click', generatePrescription);

clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all fields and start over?')) return;
  document.getElementById('rxForm') && document.getElementById('rxForm').reset();
  // reset all inputs manually (no form wrapper on aside)
  document.querySelectorAll('.panel-controls input, .panel-controls select, .panel-controls textarea').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  state.toothStates = {};
  buildControlChart();
  rxOutput.style.display = 'none';
  previewPlaceholder.style.display = 'flex';
  previewActions.style.display = 'none';
  state.lastData = null;
});

printBtn.addEventListener('click', () => window.print());

saveBtn.addEventListener('click', () => {
  if (state.lastData) {
    saveToHistory(state.lastData);
    alert(`Saved: ${state.lastData.caseRef}`);
  }
});

clearTeethBtn.addEventListener('click', () => {
  state.toothStates = {};
  buildControlChart();
});

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
buildControlChart();
setType('fixed');
renderHistory();
