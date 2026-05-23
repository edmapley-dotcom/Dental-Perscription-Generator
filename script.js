/* =============================================
   DENTAL RX GENERATOR — script.js
   ============================================= */

// ── State ──────────────────────────────────────
const state = {
  history: JSON.parse(localStorage.getItem('rxHistory') || '[]'),
};

// ── DOM refs ────────────────────────────────────
const form            = document.getElementById('rxForm');
const generateBtn     = document.getElementById('generateBtn');
const clearBtn        = document.getElementById('clearBtn');
const printBtn        = document.getElementById('printBtn');
const saveBtn         = document.getElementById('saveBtn');
const rxCard          = document.getElementById('rxCard');
const placeholder     = document.getElementById('previewPlaceholder');
const previewActions  = document.getElementById('previewActions');
const historyList     = document.getElementById('historyList');
const drugSelect      = document.getElementById('drugName');
const drugCustom      = document.getElementById('drugCustom');
const navBtns         = document.querySelectorAll('.nav-btn');
const tabGenerate     = document.getElementById('tab-generate');
const tabHistory      = document.getElementById('tab-history');

// ── Helpers ────────────────────────────────────

function getFieldValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function generateRxNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  return `RX-${ts}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayFormatted() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function collectFormData() {
  const drug = drugSelect.value === 'custom'
    ? getFieldValue('drugCustom')
    : drugSelect.value;

  return {
    rxNumber:       generateRxNumber(),
    date:           todayFormatted(),
    patientName:    getFieldValue('patientName'),
    patientDOB:     formatDate(getFieldValue('patientDOB')),
    patientID:      getFieldValue('patientID'),
    allergyNote:    getFieldValue('allergyNote'),
    prescriberName: getFieldValue('prescriberName'),
    prescriberReg:  getFieldValue('prescriberReg'),
    practice:       getFieldValue('practice'),
    drug:           drug,
    strength:       getFieldValue('strength'),
    form:           getFieldValue('form'),
    quantity:       getFieldValue('quantity'),
    dose:           getFieldValue('dose'),
    frequency:      getFieldValue('frequency'),
    duration:       getFieldValue('duration'),
    repeats:        getFieldValue('repeats'),
    instructions:   getFieldValue('instructions'),
    clinicalNote:   getFieldValue('clinicalNote'),
  };
}

function validateForm(data) {
  const required = ['patientName', 'drug', 'dose', 'frequency'];
  const missing = required.filter(k => !data[k]);
  return missing;
}

// ── Render Prescription ─────────────────────────

function renderPrescription(data) {
  const allergyHtml = data.allergyNote
    ? `<div class="rx-allergy-bar">⚠ Allergy / Caution: ${escHtml(data.allergyNote)}</div>`
    : '';

  const clinicalNoteHtml = data.clinicalNote
    ? `<div class="rx-clinical-note">
         <div class="note-label">Clinical Note / Indication</div>
         <div>${escHtml(data.clinicalNote)}</div>
       </div>`
    : '';

  const instructionsHtml = data.instructions
    ? `<p class="rx-instructions">${escHtml(data.instructions)}</p>`
    : '';

  const repeatsText = data.repeats === '0' || !data.repeats
    ? 'No repeats'
    : `${data.repeats} repeat${data.repeats > 1 ? 's' : ''}`;

  rxCard.innerHTML = `
    <div class="rx-card-header">
      <div>
        <div class="practice-name">${escHtml(data.practice || 'Dental Practice')}</div>
        <div class="prescriber-info">
          ${escHtml(data.prescriberName || '—')}
          ${data.prescriberReg ? `&nbsp;·&nbsp;${escHtml(data.prescriberReg)}` : ''}
        </div>
      </div>
      <div>
        <div class="rx-date">${escHtml(data.date)}</div>
        <div class="rx-number">${escHtml(data.rxNumber)}</div>
      </div>
    </div>

    <div class="rx-patient-bar">
      <div>
        <div class="label">Patient</div>
        <div class="value">${escHtml(data.patientName || '—')}</div>
      </div>
      <div>
        <div class="label">DOB</div>
        <div class="value">${escHtml(data.patientDOB)}</div>
      </div>
      <div>
        <div class="label">Patient ID</div>
        <div class="value">${escHtml(data.patientID || '—')}</div>
      </div>
    </div>

    ${allergyHtml}

    <div class="rx-body">
      <div class="rx-symbol">℞</div>

      <div class="rx-drug-line">
        ${escHtml(data.drug || '—')}
        ${data.strength ? `<span class="strength">&nbsp;${escHtml(data.strength)}</span>` : ''}
        ${data.form ? `<span class="strength">&nbsp;${escHtml(data.form)}</span>` : ''}
      </div>

      <div class="rx-sig">
        <div class="sig-label">Sig.</div>
        <div>
          ${escHtml(data.dose)}
          ${data.frequency ? `&nbsp;— ${escHtml(data.frequency)}` : ''}
          ${data.duration ? `&nbsp;for ${escHtml(data.duration)}` : ''}
        </div>
      </div>

      <div class="rx-meta-grid">
        <div class="rx-meta-item">
          <div class="label">Quantity</div>
          <div class="val">${escHtml(data.quantity || '—')}</div>
        </div>
        <div class="rx-meta-item">
          <div class="label">Duration</div>
          <div class="val">${escHtml(data.duration || '—')}</div>
        </div>
        <div class="rx-meta-item">
          <div class="label">Repeats</div>
          <div class="val">${escHtml(repeatsText)}</div>
        </div>
      </div>

      ${instructionsHtml}
      ${clinicalNoteHtml}
    </div>

    <div class="rx-card-footer">
      <div style="font-size:11px; color:var(--clr-muted); max-width:55%;">
        This is a practice prescription generated for educational purposes only.
      </div>
      <div class="sig-line">
        <div class="sig-line-rule"></div>
        <div>Prescriber Signature</div>
        <div style="font-size:11px; opacity:0.6;">${escHtml(data.prescriberName || '')}</div>
      </div>
    </div>
  `;

  placeholder.style.display    = 'none';
  rxCard.style.display          = 'block';
  previewActions.style.display  = 'flex';
}

// ── XSS protection ──────────────────────────────

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── History ─────────────────────────────────────

function saveToHistory(data) {
  state.history.unshift(data);
  if (state.history.length > 50) state.history.pop();
  localStorage.setItem('rxHistory', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No prescriptions saved yet.</p>';
    return;
  }

  historyList.innerHTML = state.history.map((item, i) => `
    <div class="history-item" data-index="${i}">
      <div>
        <div class="hi-drug">${escHtml(item.drug)} ${item.strength ? escHtml(item.strength) : ''}</div>
        <div class="hi-patient">${escHtml(item.patientName || 'Unknown patient')}</div>
      </div>
      <div class="hi-date">${escHtml(item.date)}</div>
    </div>
  `).join('');

  // Click to reload a saved prescription
  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index, 10);
      loadHistoryItem(state.history[idx]);
    });
  });
}

function loadHistoryItem(data) {
  renderPrescription(data);
  // Switch back to generate tab to show it
  switchTab('generate');
}

// ── Tab Switching ────────────────────────────────

function switchTab(tab) {
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  tabGenerate.style.display = tab === 'generate' ? 'block' : 'none';
  tabHistory.style.display  = tab === 'history'  ? 'block' : 'none';
}

// ── Event Listeners ──────────────────────────────

generateBtn.addEventListener('click', () => {
  const data = collectFormData();
  const missing = validateForm(data);

  if (missing.length) {
    alert(`Please fill in: Patient Name, Drug, Dose, and Frequency before generating.`);
    return;
  }

  renderPrescription(data);
  // Store last generated for saving
  generateBtn._lastData = data;
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all form fields?')) {
    form.reset();
    drugCustom.disabled = true;
    rxCard.style.display         = 'none';
    placeholder.style.display    = 'flex';
    previewActions.style.display = 'none';
    generateBtn._lastData        = null;
  }
});

printBtn.addEventListener('click', () => {
  window.print();
});

saveBtn.addEventListener('click', () => {
  const data = generateBtn._lastData;
  if (data) {
    saveToHistory(data);
    alert(`Prescription ${data.rxNumber} saved to history.`);
  }
});

// Enable custom drug field
drugSelect.addEventListener('change', () => {
  drugCustom.disabled = drugSelect.value !== 'custom';
  if (!drugCustom.disabled) drugCustom.focus();
});

// Tab navigation
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
    if (btn.dataset.tab === 'history') renderHistory();
  });
});

// ── Init ─────────────────────────────────────────
renderHistory();