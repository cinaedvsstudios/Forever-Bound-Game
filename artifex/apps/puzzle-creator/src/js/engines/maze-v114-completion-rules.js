const $ = (id) => document.getElementById(id);

const completionState = {
  reachExit: true,
  collect: false,
  unlock: false,
  portal: false,
  hazard: false,
  defeat: false,
  custom: false,
  collectCount: 1,
  lockCount: 1,
  portalCount: 1,
  customFlag: 'puzzle_complete'
};

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  injectCompletionBuilder();
  bindCompletionBuilder();
  patchExportPayload();
  updateCompletionUi();
});

function injectCompletionBuilder() {
  if ($('completion-rule-builder')) return;
  const anchor = $('difficulty-status-box') || $('difficulty-slider')?.closest('.range-row');
  if (!anchor) return;
  const section = document.createElement('section');
  section.id = 'completion-rule-builder';
  section.className = 'completion-rule-builder';
  section.innerHTML = `
    <div class="completion-builder-head">
      <div>
        <strong>Completion Rules</strong>
        <small>Build the logic the maze must satisfy before it counts as solved.</small>
      </div>
      <span id="completion-builder-status" class="completion-status-pill is-good">Reach Exit</span>
    </div>
    <label class="completion-rule-row is-locked">
      <input type="checkbox" checked disabled />
      <span><strong>Reach Exit</strong><small>The base maze rule. The player must reach the exit cell.</small></span>
    </label>
    <label class="completion-rule-row">
      <input id="rule-collect" type="checkbox" />
      <span><strong>Collect objects first</strong><small>Use placed objects later from object/archetype placement.</small></span>
    </label>
    <div id="rule-collect-options" class="completion-rule-options" hidden>
      <label><span>Required objects</span><input id="rule-collect-count" type="number" min="1" max="20" value="1" /></label>
    </div>
    <label class="completion-rule-row">
      <input id="rule-unlock" type="checkbox" />
      <span><strong>Unlock door/gate first</strong><small>Uses lock/key or locked-door object logic later.</small></span>
    </label>
    <div id="rule-unlock-options" class="completion-rule-options" hidden>
      <label><span>Required locks</span><input id="rule-lock-count" type="number" min="1" max="12" value="1" /></label>
    </div>
    <label class="completion-rule-row">
      <input id="rule-portal" type="checkbox" />
      <span><strong>Use required portal</strong><small>Adds a later Portals tab/section requirement.</small></span>
    </label>
    <div id="rule-portal-options" class="completion-rule-options" hidden>
      <label><span>Required portal pairs</span><input id="rule-portal-count" type="number" min="1" max="12" value="1" /></label>
    </div>
    <label class="completion-rule-row">
      <input id="rule-hazard" type="checkbox" />
      <span><strong>Survive / avoid hazard</strong><small>Marks the maze as containing hazard rules.</small></span>
    </label>
    <label class="completion-rule-row">
      <input id="rule-defeat" type="checkbox" />
      <span><strong>Defeat foe</strong><small>Marks the maze as requiring a foe encounter condition.</small></span>
    </label>
    <label class="completion-rule-row">
      <input id="rule-custom" type="checkbox" />
      <span><strong>Custom flag condition</strong><small>Export a specific custom completion flag.</small></span>
    </label>
    <div id="rule-custom-options" class="completion-rule-options" hidden>
      <label><span>Custom flag</span><input id="rule-custom-flag" type="text" value="puzzle_complete" /></label>
    </div>
    <div id="completion-required-tabs" class="completion-required-tabs" aria-label="Required completion setup tabs"></div>
  `;
  anchor.insertAdjacentElement('afterend', section);
}

function bindCompletionBuilder() {
  const pairs = [
    ['rule-collect', 'collect'],
    ['rule-unlock', 'unlock'],
    ['rule-portal', 'portal'],
    ['rule-hazard', 'hazard'],
    ['rule-defeat', 'defeat'],
    ['rule-custom', 'custom']
  ];
  pairs.forEach(([id, key]) => $(id)?.addEventListener('change', (event) => {
    completionState[key] = event.target.checked;
    updateCompletionUi();
  }));
  $('rule-collect-count')?.addEventListener('input', (event) => { completionState.collectCount = Number(event.target.value || 1); updateCompletionUi(); });
  $('rule-lock-count')?.addEventListener('input', (event) => { completionState.lockCount = Number(event.target.value || 1); updateCompletionUi(); });
  $('rule-portal-count')?.addEventListener('input', (event) => { completionState.portalCount = Number(event.target.value || 1); updateCompletionUi(); });
  $('rule-custom-flag')?.addEventListener('input', (event) => { completionState.customFlag = event.target.value || 'puzzle_complete'; updateCompletionUi(); });
}

function updateCompletionUi() {
  const show = (id, value) => { const node = $(id); if (node) node.hidden = !value; };
  show('rule-collect-options', completionState.collect);
  show('rule-unlock-options', completionState.unlock);
  show('rule-portal-options', completionState.portal);
  show('rule-custom-options', completionState.custom);

  const active = activeRules();
  const status = $('completion-builder-status');
  if (status) {
    status.textContent = active.length ? `${active.length + 1} Rules` : 'Reach Exit';
    status.className = `completion-status-pill ${active.length ? 'is-warning' : 'is-good'}`;
  }

  const tabs = $('completion-required-tabs');
  if (tabs) {
    const requiredTabs = [];
    if (completionState.collect) requiredTabs.push(['Items', `${completionState.collectCount} required`, 'is-warning']);
    if (completionState.unlock) requiredTabs.push(['Locks', `${completionState.lockCount} required`, 'is-warning']);
    if (completionState.portal) requiredTabs.push(['Portals', `${completionState.portalCount} required`, 'is-warning']);
    if (completionState.hazard) requiredTabs.push(['Hazards', 'rules required', 'is-warning']);
    if (completionState.defeat) requiredTabs.push(['Foes', 'encounter required', 'is-warning']);
    tabs.innerHTML = requiredTabs.length
      ? requiredTabs.map(([label, detail, klass]) => `<span class="completion-tab-chip ${klass}"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></span>`).join('')
      : '<span class="completion-tab-chip is-good"><strong>Exit</strong><small>ready</small></span>';
  }

  const flag = $('completion-flag');
  if (flag && completionState.custom) flag.value = completionState.customFlag;
}

function activeRules() {
  return ['collect', 'unlock', 'portal', 'hazard', 'defeat', 'custom'].filter((key) => completionState[key]);
}

function exportCompletionRules() {
  const sequence = ['reach_exit'];
  const requirements = [];
  if (completionState.collect) { sequence.unshift('collect_objects'); requirements.push({ type: 'collect_objects', count: completionState.collectCount, source: 'placed_objects_pending' }); }
  if (completionState.unlock) { sequence.splice(sequence.length - 1, 0, 'unlock_gate'); requirements.push({ type: 'unlock_gate', count: completionState.lockCount, source: 'locked_object_pending' }); }
  if (completionState.portal) { sequence.splice(sequence.length - 1, 0, 'use_required_portal'); requirements.push({ type: 'use_required_portal', count: completionState.portalCount, source: 'portal_pairs_pending' }); }
  if (completionState.hazard) requirements.push({ type: 'survive_or_avoid_hazard', source: 'hazard_rules_pending' });
  if (completionState.defeat) requirements.push({ type: 'defeat_foe', source: 'foe_encounter_pending' });
  if (completionState.custom) requirements.push({ type: 'custom_flag', flag: completionState.customFlag || 'puzzle_complete' });
  return {
    schemaVersion: 'artifex.completionRules.v1',
    mode: requirements.length ? 'compound' : 'reach_exit',
    sequence,
    requirements,
    status: requirements.length ? 'needs_required_tab_setup' : 'ready'
  };
}

function patchExportPayload() {
  setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return {
        ...base,
        puzzle: {
          ...base.puzzle,
          completionRules: exportCompletionRules()
        }
      };
    };
  }, 0);
}

function injectStyles() {
  if ($('maze-v114-completion-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-v114-completion-style';
  style.textContent = `
    .completion-rule-builder{margin:10px 0 14px;padding:13px;border:1px solid rgba(158,230,164,.25);border-radius:18px;background:linear-gradient(180deg,rgba(7,31,16,.86),rgba(4,18,10,.94));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);}
    .completion-builder-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}
    .completion-builder-head strong{display:block;color:var(--cream,#eadfc6);font-weight:900;}
    .completion-builder-head small,.completion-rule-row small{display:block;color:#a9b59e;font-size:.74rem;line-height:1.3;margin-top:2px;}
    .completion-status-pill{display:inline-flex;align-items:center;white-space:nowrap;border-radius:999px;padding:5px 8px;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;}
    .completion-status-pill.is-good{background:rgba(122,220,139,.16);color:#a8e8a3;border:1px solid rgba(122,220,139,.34);}
    .completion-status-pill.is-warning{background:rgba(238,196,89,.13);color:#f1cf75;border:1px solid rgba(238,196,89,.3);}
    .completion-rule-row{display:grid;grid-template-columns:24px 1fr;gap:9px;align-items:start;padding:9px 7px;border-radius:13px;}
    .completion-rule-row:hover{background:rgba(158,230,164,.06);}
    .completion-rule-row input{margin-top:3px;accent-color:#9ee6a4;}
    .completion-rule-row strong{color:#e5dcc5;}
    .completion-rule-row.is-locked{opacity:.92;}
    .completion-rule-options{padding:8px 10px 10px 40px;}
    .completion-rule-options label{display:grid;grid-template-columns:1fr 92px;gap:10px;align-items:center;color:#d8d0ba;font-size:.82rem;}
    .completion-rule-options input{min-height:32px;border-radius:10px;border:1px solid rgba(158,230,164,.26);background:rgba(0,0,0,.22);color:#e8f5de;padding:4px 8px;}
    .completion-required-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(158,230,164,.16);}
    .completion-tab-chip{display:inline-flex;flex-direction:column;gap:1px;min-width:74px;border-radius:14px;padding:8px 10px;border:1px solid rgba(158,230,164,.25);background:rgba(0,0,0,.18);}
    .completion-tab-chip strong{font-size:.75rem;color:#e8f5de;}
    .completion-tab-chip small{font-size:.68rem;color:#a9b59e;}
    .completion-tab-chip.is-warning{border-color:rgba(238,196,89,.35);box-shadow:0 0 16px rgba(238,196,89,.08);}
    .completion-tab-chip.is-good{border-color:rgba(122,220,139,.35);box-shadow:0 0 16px rgba(122,220,139,.08);}
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
