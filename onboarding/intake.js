/* ==========================================================================
   Client Intake — Wizard
   ========================================================================== */

/* ---------- CONFIG ---------- */

// Replace with your Google Apps Script Web App URL (see README — "Submission setup").
const ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbyjLFR3fUlUR_RS59J9QWxIIOOCXRTXUGk4fBr6UOQao8_ntX6L92Q96JpkgZC5hGIO/exec';

const STORAGE_KEY = 'palantino_intake_v1';

/* ---------- STEP DEFINITIONS ---------- */

// Field shapes:
//   text       → single-line input
//   email/tel  → typed input
//   textarea   → multi-line
//   radio      → vertical radio group (options: [strings])
//   radio_h    → horizontal radio (compact options)
//   radio_other → radio with an "Other" option that reveals a text input
// Optional: { help, placeholder, half, required, showIf: (data) => bool }

const BUYER_STEPS = [
  {
    id: 'contact',
    eyebrow: 'Step 01 — About You',
    title: 'Let\'s start with the <em>basics</em>.',
    lede: 'How we get in touch — and where you call home today.',
    fields: [
      { key: 'first_name', label: 'First name', type: 'text', required: true, half: true },
      { key: 'last_name', label: 'Last name', type: 'text', required: true, half: true },
      { key: 'email', label: 'Email', type: 'email', required: true, half: true },
      { key: 'phone', label: 'Phone number', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567' },
      { key: 'current_address', label: 'Current address', type: 'text', required: true, placeholder: 'Street, City, State, ZIP' },
    ],
  },
  {
    id: 'move',
    eyebrow: 'Step 02 — Your Move',
    title: 'Tell me what\'s <em>driving</em> this.',
    lede: 'The context behind the search shapes how I work for you.',
    fields: [
      { key: 'prompt_move', label: 'What is prompting your move right now?', type: 'textarea', required: true, placeholder: 'A few sentences is plenty.' },
      { key: 'move_type', label: 'Is this your first home, an upgrade, or an investment?', type: 'radio_other',
        options: ['First home', 'Upgrade', 'Investment'], required: true },
      { key: 'timeline', label: 'When would you like to be in your new home?', type: 'radio',
        options: ['Within the next month', 'Within the next 3 months', 'Within the next 6 months', 'No timeline yet'], required: true },
    ],
  },
  {
    id: 'priorities',
    eyebrow: 'Step 03 — Priorities',
    title: 'What <em>matters</em> most?',
    lede: 'The non-negotiables and the dreams. Both help.',
    fields: [
      { key: 'whats_important', label: 'What\'s most important to you in your new home?',
        help: 'Space, location, lifestyle, schools, light, character — whatever rises to the top.',
        type: 'textarea', required: true },
      { key: 'musts_vs_nice', label: 'Must-haves vs nice-to-haves',
        help: 'Bedrooms, yard, garage, home office, walkability… what\'s essential and what\'s bonus?',
        type: 'textarea', required: true },
    ],
  },
  {
    id: 'financing',
    eyebrow: 'Step 04 — Financing',
    title: 'The <em>numbers</em> side.',
    lede: 'Honest answers here mean I can show you the right homes from day one.',
    fields: [
      { key: 'finance_or_cash', label: 'Will you be financing or paying cash?', type: 'radio_h',
        options: ['Financing', 'Cash'], required: true },
      { key: 'lender_status', label: 'Have you spoken with a lender?', type: 'radio',
        options: ['Yes — pre-approved', 'No — I need a lender', 'No — but I have a preferred lender'],
        required: true,
        showIf: (d) => d.finance_or_cash === 'Financing' },
      { key: 'price_range', label: 'Ideal price range', type: 'text', required: true, placeholder: 'e.g. $450K – $600K' },
      { key: 'monthly_payment', label: 'Monthly payment ceiling', help: 'If there\'s a number you\'d like to stay under.',
        type: 'text', required: true, placeholder: 'e.g. $3,500/mo' },
    ],
  },
  {
    id: 'home',
    eyebrow: 'Step 05 — The Home',
    title: 'The <em>property</em> itself.',
    lede: 'Style, location, dealbreakers, and anything you\'ve seen already.',
    fields: [
      { key: 'home_style', label: 'Style of home you prefer', help: 'Single-family, townhouse, condo, multi-family, new construction…',
        type: 'text', required: true },
      { key: 'areas', label: 'Specific neighborhoods or school districts you\'re targeting',
        type: 'textarea', required: true },
      { key: 'deal_breakers', label: 'Any deal breakers?',
        help: 'Things that would take a home off the list immediately.',
        type: 'textarea', required: true },
      { key: 'previous_homes', label: 'Have you seen any homes you liked or disliked? What stood out?',
        type: 'textarea', required: true, placeholder: 'Address or listing link is fine, or just describe.' },
    ],
  },
  {
    id: 'decision',
    eyebrow: 'Step 06 — The Decision',
    title: 'Who\'s in this with <em>you</em>?',
    lede: 'Last one — then a quick review and we\'re done.',
    fields: [
      { key: 'decision_makers', label: 'Who else is involved in your decision-making process?',
        help: 'Spouse, partner, family, financial advisor — anyone whose voice carries weight.',
        type: 'textarea', required: true },
    ],
  },
];

const SELLER_STEPS = [
  {
    id: 'contact',
    eyebrow: 'Step 01 — About You',
    title: 'Let\'s start with the <em>basics</em>.',
    lede: 'How we get in touch.',
    fields: [
      { key: 'first_name', label: 'First name', type: 'text', required: true, half: true },
      { key: 'last_name', label: 'Last name', type: 'text', required: true, half: true },
      { key: 'email', label: 'Email', type: 'email', required: true, half: true },
      { key: 'phone', label: 'Phone number', type: 'tel', required: true, half: true, placeholder: '(555) 123-4567' },
    ],
  },
  {
    id: 'property',
    eyebrow: 'Step 02 — The Property',
    title: 'Tell me about the <em>home</em>.',
    lede: 'The fundamentals — we\'ll go deeper next.',
    fields: [
      { key: 'property_address', label: 'Property address', type: 'text', required: true, placeholder: 'Street, City, State, ZIP' },
      { key: 'property_type', label: 'Property type', type: 'radio',
        options: ['Single-family', 'Townhouse', 'Condo', 'Multi-family', 'Other'], required: true },
      { key: 'beds', label: 'Bedrooms', type: 'text', required: true, half: true, placeholder: 'e.g. 3' },
      { key: 'baths', label: 'Bathrooms', type: 'text', required: true, half: true, placeholder: 'e.g. 2.5' },
      { key: 'sqft', label: 'Approx. square footage', type: 'text', half: true, placeholder: 'optional' },
      { key: 'year_built', label: 'Year built', type: 'text', half: true, placeholder: 'optional' },
    ],
  },
  {
    id: 'story',
    eyebrow: 'Step 03 — The Story',
    title: 'Why <em>sell</em>, and when?',
    lede: 'Context helps me price, position, and pace the sale right.',
    fields: [
      { key: 'reason', label: 'What\'s prompting the sale?', type: 'textarea', required: true },
      { key: 'sell_timeline', label: 'When would you like to be sold?', type: 'radio',
        options: ['ASAP', 'Within 3 months', 'Within 6 months', 'Within a year', 'No firm timeline'], required: true },
      { key: 'occupancy', label: 'Current occupancy', type: 'radio',
        options: ['Owner-occupied', 'Tenant-occupied', 'Vacant'], required: true },
    ],
  },
  {
    id: 'condition',
    eyebrow: 'Step 04 — Condition',
    title: 'The <em>state</em> of things.',
    lede: 'Honest detail here saves surprises later.',
    fields: [
      { key: 'improvements', label: 'Recent improvements or updates',
        help: 'Kitchen, bath, roof, HVAC, windows, landscaping — anything done in the last 5–10 years.',
        type: 'textarea', required: true },
      { key: 'known_issues', label: 'Known issues or repairs needed',
        help: 'Better I know now than at inspection.',
        type: 'textarea' },
      { key: 'previously_listed', label: 'Has the home been listed before?', type: 'radio_h',
        options: ['Yes', 'No'], required: true },
    ],
  },
  {
    id: 'pricing',
    eyebrow: 'Step 05 — Pricing',
    title: 'Your <em>expectations</em>.',
    lede: 'A starting point. I\'ll come back with a full pricing analysis.',
    fields: [
      { key: 'target_price', label: 'Price you have in mind', type: 'text', required: true, placeholder: 'e.g. $650,000' },
      { key: 'mortgage_balance', label: 'Approximate mortgage balance', help: 'Optional — for net-proceeds planning.',
        type: 'text', placeholder: 'e.g. $280,000' },
      { key: 'flexibility', label: 'How flexible are you on price?', type: 'radio',
        options: ['Firm — won\'t go below my number', 'Some room — open to reasonable offers', 'Flexible — let\'s find the market'], required: true },
    ],
  },
  {
    id: 'logistics',
    eyebrow: 'Step 06 — Logistics',
    title: 'Showings &amp; the <em>final word</em>.',
    lede: 'Last one. Anything I should know before we talk?',
    fields: [
      { key: 'open_houses', label: 'Are open houses okay?', type: 'radio_h',
        options: ['Yes', 'No', 'Depends'], required: true },
      { key: 'short_notice', label: 'Showings on short notice?', type: 'radio_h',
        options: ['Yes', 'No', 'With advance notice'], required: true },
      { key: 'decision_makers', label: 'Who else is involved in the decision?',
        type: 'textarea', required: true },
      { key: 'anything_else', label: 'Anything else I should know?',
        type: 'textarea' },
    ],
  },
];

const STEP_LABELS = {
  buyer: ['About You', 'Your Move', 'Priorities', 'Financing', 'The Home', 'Decision', 'Review'],
  seller: ['About You', 'The Property', 'The Story', 'Condition', 'Pricing', 'Logistics', 'Review'],
};

/* ---------- STATE ---------- */

const initialState = {
  type: null,         // 'buyer' | 'seller'
  step: 0,            // 0..N (last index = review)
  data: {},           // { fieldKey: value }
  errors: {},         // { fieldKey: errorMsg }
  submitting: false,
  submitted: false,
  startedAt: null,
};

let state = { ...initialState };

/* ---------- STORAGE ---------- */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return null;
  }
}

function saveState() {
  try {
    const toSave = {
      type: state.type,
      step: state.step,
      data: state.data,
      startedAt: state.startedAt,
      submitted: state.submitted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {}
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

/* ---------- HELPERS ---------- */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSteps() {
  return state.type === 'buyer' ? BUYER_STEPS : SELLER_STEPS;
}

function getVisibleFields(stepDef) {
  return stepDef.fields.filter(f => !f.showIf || f.showIf(state.data));
}

function isReviewStep() {
  return state.step === getSteps().length;
}

function totalSteps() {
  return getSteps().length + 1; // +1 for review
}

/* ---------- VALIDATION ---------- */

function validateField(field, value) {
  if (field.required) {
    if (value == null || String(value).trim() === '') {
      return 'This field is required.';
    }
  }
  const v = String(value || '').trim();
  if (v && field.type === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email.';
  }
  if (v && field.type === 'tel') {
    const digits = v.replace(/\D/g, '');
    if (digits.length < 10) return 'Please enter a complete phone number.';
  }
  return null;
}

function validateStep() {
  if (isReviewStep()) return true;
  const stepDef = getSteps()[state.step];
  const fields = getVisibleFields(stepDef);
  const errors = {};
  for (const f of fields) {
    let val = state.data[f.key];
    // Handle radio_other "Other" expansion
    if (f.type === 'radio_other' && val === '__other__') {
      const otherVal = state.data[f.key + '__other'];
      if (!otherVal || !String(otherVal).trim()) {
        errors[f.key] = 'Please specify.';
        continue;
      }
    }
    const err = validateField(f, val);
    if (err) errors[f.key] = err;
  }
  state.errors = errors;
  return Object.keys(errors).length === 0;
}

/* ---------- RENDER: SIDEBAR ---------- */

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  if (!state.type) {
    sb.innerHTML = `
      <div class="sb-brand">
        <img class="sb-lockup" src="assets/logo-palantino-lockup.png" alt="Palantino Real Estate" />
        <a class="sb-back" href="index.html">Back to onboarding kit</a>
      </div>
      <div class="sb-section">
        <div class="sb-eyebrow">Client Intake</div>
        <div class="sb-title">A quick<br/>conversation,<br/>before the real one.</div>
      </div>
      <div class="sb-foot">
        <div class="sb-foot-tag">Takes about 5 minutes.<br/>Your progress saves automatically.</div>
      </div>
    `;
    return;
  }

  const steps = getSteps();
  const labels = STEP_LABELS[state.type];
  const stepsHtml = labels.map((label, i) => {
    let status = 'future';
    if (i < state.step) status = 'done';
    else if (i === state.step) status = 'current';
    const locked = (i > state.step) ? 'true' : 'false';
    return `
      <div class="sb-step" data-status="${status}" data-locked="${locked}" data-idx="${i}">
        <div class="sb-step-marker"><div class="sb-step-dot"></div></div>
        <div class="sb-step-label">
          <div class="sb-step-num">${String(i+1).padStart(2,'0')}</div>
          <div class="sb-step-title">${label}</div>
        </div>
      </div>
    `;
  }).join('');

  const typeTitle = state.type === 'buyer' ? 'Home Buyer<br/>Snapshot' : 'Home Seller<br/>Snapshot';

  sb.innerHTML = `
    <div class="sb-brand">
      <img class="sb-lockup" src="assets/logo-palantino-lockup.png" alt="Palantino Real Estate" />
      <a class="sb-back" href="index.html">Back to onboarding kit</a>
    </div>
    <div class="sb-section">
      <div class="sb-eyebrow">${state.type === 'buyer' ? 'Buyer Intake' : 'Seller Intake'}</div>
      <div class="sb-title">${typeTitle}</div>
    </div>
    <div class="sb-progress">${stepsHtml}</div>
    <div class="sb-foot">
      <div class="sb-foot-saved">Progress saved</div>
      <div class="sb-foot-tag">Close this tab and come back anytime — you'll pick up right here.</div>
    </div>
  `;

  // wire sidebar step clicks (only allow going back or to current)
  sb.querySelectorAll('.sb-step').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.locked === 'true') return;
      const idx = parseInt(el.dataset.idx, 10);
      state.step = idx;
      state.errors = {};
      saveState();
      render();
    });
  });
}

/* ---------- RENDER: CHOOSER ---------- */

function renderChooser() {
  const main = document.getElementById('main');
  const saved = loadState();
  const hasResumable = saved && saved.type && !saved.submitted &&
    (Object.keys(saved.data || {}).length > 0 || saved.step > 0);

  const resumeBlock = hasResumable ? `
    <div class="chooser-resume">
      <div class="chooser-resume-text">
        Welcome back. You started a <strong>${saved.type}</strong> intake — pick up where you left off?
      </div>
      <div class="chooser-resume-actions">
        <button class="resume-btn" id="resume-btn">Continue</button>
        <button class="resume-btn ghost" id="restart-btn">Start fresh</button>
      </div>
    </div>
  ` : '';

  main.innerHTML = `
    <div class="chooser">
      <div class="chooser-eyebrow">Client Intake</div>
      <h1 class="chooser-title">A few questions to <em>begin</em>.</h1>
      <p class="chooser-lede">Whichever side of the transaction you're on, the first step is the same — I listen, and we go from there. Pick your path.</p>

      <div class="chooser-grid">
        <button class="chooser-card" data-type="buyer">
          <span class="chooser-card-glyph">§</span>
          <div class="chooser-card-label">For Buyers</div>
          <div class="chooser-card-title">I'm looking<br/>to buy</div>
          <p class="chooser-card-desc">Tell me about your timeline, budget, and what you're looking for in a home. About 5 minutes.</p>
          <span class="chooser-card-arrow">Start buyer intake</span>
        </button>

        <button class="chooser-card" data-type="seller">
          <span class="chooser-card-glyph">¶</span>
          <div class="chooser-card-label">For Sellers</div>
          <div class="chooser-card-title">I'm looking<br/>to sell</div>
          <p class="chooser-card-desc">Tell me about your property, your timeline, and your expectations. About 5 minutes.</p>
          <span class="chooser-card-arrow">Start seller intake</span>
        </button>
      </div>

      ${resumeBlock}
    </div>
  `;

  main.querySelectorAll('.chooser-card').forEach(card => {
    card.addEventListener('click', () => {
      const t = card.dataset.type;
      state = { ...initialState, type: t, startedAt: Date.now() };
      saveState();
      render();
    });
  });

  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      state = { ...initialState, ...saved };
      render();
    });
  }
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      clearState();
      state = { ...initialState };
      render();
    });
  }
}

/* ---------- RENDER: FIELD ---------- */

function renderField(field) {
  const value = state.data[field.key] ?? '';
  const error = state.errors[field.key];
  const halfClass = field.half ? '' : 'full';
  const errorClass = error ? 'has-error' : '';
  const reqMark = field.required ? '<span class="req">*</span>' : '';
  const helpHtml = field.help ? `<div class="field-help">${field.help}</div>` : '';

  let controlHtml = '';
  if (field.type === 'textarea') {
    controlHtml = `<textarea class="field-textarea" data-key="${field.key}" rows="3" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(value)}</textarea>`;
  } else if (field.type === 'radio' || field.type === 'radio_h') {
    const groupCls = field.type === 'radio_h' ? 'field-radio-group horizontal' : 'field-radio-group';
    const opts = field.options.map(opt => {
      const selected = value === opt ? 'selected' : '';
      return `
        <button type="button" class="radio-opt ${selected}" data-key="${field.key}" data-value="${escapeHtml(opt)}">
          <div class="radio-opt-dot"></div>
          <div class="radio-opt-label">${escapeHtml(opt)}</div>
        </button>
      `;
    }).join('');
    controlHtml = `<div class="${groupCls}">${opts}</div>`;
  } else if (field.type === 'radio_other') {
    const opts = field.options.map(opt => {
      const selected = value === opt ? 'selected' : '';
      return `
        <button type="button" class="radio-opt ${selected}" data-key="${field.key}" data-value="${escapeHtml(opt)}">
          <div class="radio-opt-dot"></div>
          <div class="radio-opt-label">${escapeHtml(opt)}</div>
        </button>
      `;
    }).join('');
    const otherSelected = value === '__other__' ? 'selected' : '';
    const otherValue = state.data[field.key + '__other'] || '';
    const otherInputActive = value === '__other__' ? 'active' : '';
    controlHtml = `
      <div class="field-radio-group">
        ${opts}
        <button type="button" class="radio-opt ${otherSelected}" data-key="${field.key}" data-value="__other__">
          <div class="radio-opt-dot"></div>
          <div class="radio-opt-label">Other…</div>
        </button>
        <div class="radio-other-input ${otherInputActive}">
          <input class="field-input" data-key="${field.key}__other" type="text" value="${escapeHtml(otherValue)}" placeholder="Please specify" />
        </div>
      </div>
    `;
  } else {
    const inputType = field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text';
    controlHtml = `<input class="field-input" data-key="${field.key}" type="${inputType}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || '')}" />`;
  }

  return `
    <div class="field ${halfClass} ${errorClass}" data-field="${field.key}">
      <label class="field-label">${field.label} ${reqMark}</label>
      ${helpHtml}
      ${controlHtml}
      <div class="field-error">${escapeHtml(error || '')}</div>
    </div>
  `;
}

/* ---------- RENDER: STEP ---------- */

function renderStep() {
  const stepDef = getSteps()[state.step];
  const fields = getVisibleFields(stepDef);
  const main = document.getElementById('main');

  main.innerHTML = `
    <div class="step-eyebrow">${stepDef.eyebrow}</div>
    <h1 class="step-title">${stepDef.title}</h1>
    <p class="step-lede">${stepDef.lede}</p>
    <div class="field-grid">
      ${fields.map(renderField).join('')}
    </div>
    <div class="actions">
      <button class="btn-ghost ${state.step === 0 ? 'hidden' : ''}" id="back-btn">Back</button>
      <button class="btn-primary" id="next-btn">Continue</button>
    </div>
  `;

  wireFieldHandlers();

  document.getElementById('next-btn').addEventListener('click', () => {
    if (validateStep()) {
      state.step += 1;
      state.errors = {};
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      render();
      // focus first error
      const firstError = document.querySelector('.field.has-error input, .field.has-error textarea');
      if (firstError) firstError.focus();
    }
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    if (state.step > 0) {
      state.step -= 1;
      state.errors = {};
      saveState();
      render();
    }
  });
}

function wireFieldHandlers() {
  // text/textarea inputs
  document.querySelectorAll('.field-input, .field-textarea').forEach(el => {
    el.addEventListener('input', (e) => {
      const key = el.dataset.key;
      state.data[key] = el.value;
      // clear inline error as soon as user types
      const base = key.replace(/__other$/, '');
      if (state.errors[base]) {
        delete state.errors[base];
        const fieldEl = document.querySelector(`.field[data-field="${base}"]`);
        if (fieldEl) {
          fieldEl.classList.remove('has-error');
          const errEl = fieldEl.querySelector('.field-error');
          if (errEl) errEl.textContent = '';
        }
      }
      saveState();
    });
  });

  // radio buttons
  document.querySelectorAll('.radio-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const val = btn.dataset.value;
      state.data[key] = val;
      delete state.errors[key];
      saveState();
      render();
    });
  });
}

/* ---------- RENDER: REVIEW ---------- */

function renderReview() {
  const main = document.getElementById('main');
  const steps = getSteps();
  const sectionsHtml = steps.map((stepDef, idx) => {
    const fields = getVisibleFields(stepDef);
    const rowsHtml = fields.map(f => {
      let v = state.data[f.key];
      if (f.type === 'radio_other' && v === '__other__') {
        v = state.data[f.key + '__other'] || '';
      }
      const valHtml = (v && String(v).trim())
        ? `<div class="review-value">${escapeHtml(v)}</div>`
        : `<div class="review-value empty">—</div>`;
      return `
        <div class="review-row">
          <div class="review-label">${f.label}</div>
          ${valHtml}
        </div>
      `;
    }).join('');
    return `
      <div class="review-section">
        <div class="review-section-head">
          <div class="review-section-title">${stepDef.eyebrow.split('—')[1]?.trim() || stepDef.eyebrow}</div>
          <button class="review-edit" data-edit="${idx}">Edit</button>
        </div>
        <div class="review-rows">${rowsHtml}</div>
      </div>
    `;
  }).join('');

  const submitStateHtml = state.submitting
    ? `<div class="submit-state">Sending your snapshot…</div>`
    : (state.submitError ? `<div class="submit-state error">${escapeHtml(state.submitError)}</div>` : '');

  main.innerHTML = `
    <div class="step-eyebrow">Final Step — Review</div>
    <h1 class="step-title">A quick <em>look</em> before you send.</h1>
    <p class="step-lede">Check anything you'd like to revise, then send it my way.</p>
    ${sectionsHtml}
    <div class="actions">
      <button class="btn-ghost" id="back-btn">Back</button>
      <button class="btn-primary submit" id="submit-btn" ${state.submitting ? 'disabled' : ''}>Send to Palantino Team</button>
    </div>
    ${submitStateHtml}
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    state.step -= 1;
    saveState();
    render();
  });

  document.getElementById('submit-btn').addEventListener('click', submitForm);

  document.querySelectorAll('.review-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      state.step = parseInt(btn.dataset.edit, 10);
      saveState();
      render();
    });
  });
}

/* ---------- RENDER: SUCCESS ---------- */

function renderSuccess() {
  const main = document.getElementById('main');
  const firstName = state.data.first_name || '';
  main.innerHTML = `
    <div class="success">
      <div class="success-glyph">✦</div>
      <h1 class="success-title">Thank you${firstName ? ', ' + escapeHtml(firstName) : ''}.</h1>
      <p class="success-lede">Your snapshot is in. I'll review it personally and reach out within one business day to set up our first conversation.</p>
      <div class="success-actions">
        <a href="index.html">Back to onboarding kit</a>
        <a href="mailto:dantejpalantino@gmail.com">Email me directly</a>
      </div>
    </div>
  `;
  // also clear sidebar progress styling
  document.getElementById('sidebar').innerHTML = `
    <div class="sb-brand">
      <img class="sb-lockup" src="assets/logo-palantino-lockup.png" alt="Palantino Real Estate" />
      <a class="sb-back" href="index.html">Back to onboarding kit</a>
    </div>
    <div class="sb-section">
      <div class="sb-eyebrow">Submitted</div>
      <div class="sb-title">Received.<br/>Thank you.</div>
    </div>
    <div class="sb-foot">
      <div class="sb-foot-tag">A reply is on its way within one business day.</div>
    </div>
  `;
}

/* ---------- SUBMIT ---------- */

async function submitForm() {
  state.submitting = true;
  state.submitError = null;
  renderReview();

  // Compose payload — flat object with type, timestamps, all fields, expanding "Other"
  const payload = {
    type: state.type,
    submitted_at: new Date().toISOString(),
    started_at: state.startedAt ? new Date(state.startedAt).toISOString() : null,
  };
  const steps = getSteps();
  for (const stepDef of steps) {
    for (const f of stepDef.fields) {
      if (f.showIf && !f.showIf(state.data)) continue;
      let v = state.data[f.key];
      if (f.type === 'radio_other' && v === '__other__') {
        v = state.data[f.key + '__other'] || '';
      }
      payload[f.key] = v ?? '';
    }
  }

  // If the endpoint URL hasn't been configured yet, simulate success after a beat
  if (!ENDPOINT_URL || ENDPOINT_URL === 'REPLACE_WITH_YOUR_APPS_SCRIPT_URL') {
    console.warn('[intake] ENDPOINT_URL not configured — simulating successful submission. Configure ENDPOINT_URL in intake.js.');
    console.log('[intake] Payload:', payload);
    await new Promise(r => setTimeout(r, 900));
    state.submitting = false;
    state.submitted = true;
    saveState();
    renderSuccess();
    return;
  }

   try {
     const formData = new FormData();
     formData.append('payload', JSON.stringify(payload));
   
     await fetch(ENDPOINT_URL, {
       method: 'POST',
       mode: 'no-cors',
       body: formData,
     });
   
     state.submitting = false;
     state.submitted = true;
     saveState();
     renderSuccess();
   } catch (e) {
     state.submitting = false;
     state.submitError = 'Something went wrong. Please try again or email the Palantino Team directly.';
     renderReview();
   }
}

/* ---------- MAIN RENDER ---------- */

function render() {
  if (state.submitted) {
    renderSuccess();
    return;
  }
  renderSidebar();
  if (!state.type) {
    renderChooser();
    return;
  }
  if (isReviewStep()) {
    renderReview();
  } else {
    renderStep();
  }
}

/* ---------- INIT ---------- */

function init() {
  // Don't auto-resume; let chooser screen handle it.
  // (User opting in via "Continue" button preserves their intent.)
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
