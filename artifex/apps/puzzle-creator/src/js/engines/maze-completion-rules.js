// Maze / Labyrinth completion rules
// Owns maker-defined mandatory conditions after Features have been added to the maze.

const $ = (id) => document.getElementById(id);

const completionState = {
  requireExit: true,
  requireCollectAll: false,
  requiredConnectionIds: new Set()
};

window.__artifexMazeCompletionRules = completionState;

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  removeLegacyMazeFields();
  injectCompletionBuilder();
  bindEvents();
  patchExportPayload();
  renderRules();
});

function removeLegacyMazeFields() {
  document.querySelectorAll('[data-engine-field="showSolution"], [data-engine-field="completionRule"]').forEach((input) => input.closest('.engine-field')?.remove());
  ['puzzle-type', 'gameplay-mode'].forEach((id) => $(id)?.closest('.field-block')?.remove());
}

function injectCompletionBuilder() {
  if ($('completion-rule-builder')) return;
  const logicPanel = document.querySelector('[data-panel-content="logic"]');
  const copyButton = $('btn-copy-json');
  if (!logicPanel) return;
  const section = document.createElement('section');
  section.id = 'completion-rule-builder';
  section.className = 'completion-rule-builder';
  section.innerHTML = `
    <div class="completion-builder-head">
      <div>
        <strong>Completion Rules</strong>
        <small>Choose which added features are mandatory before the exit completes the maze.</small>
      </div>
      <span id="completion-builder-status" class="completion-status-pill is-good">Exit</span>
    </div>
    <label class="completion-rule-row is-locked">
      <input type="checkbox" checked disabled title="The player must always reach the exit to finish a maze." />
      <span><strong>Reach Exit</strong><small>Always required.</small></span>
    </label>
    <div id="completion-feature-rules" class="completion-feature-rules"></div>
    <p id="completion-empty-note" class="completion-empty-note">Add features above to make them optional or mandatory.</p>
  `;
  if (copyButton) copyButton.insertAdjacentElement('beforebegin', section);
  else logicPanel.appendChild(section);
}

function bindEvents() {
  window.addEventListener('artifex-maze-features-updated', renderRules);
  window.addEventListener('artifex-maze-connections-updated', renderRules);
  document.addEventListener('change', (event) => {
    const checkbox = event.target.closest?.('[data-completion-condition]');
    if (!checkbox) return;
    const type = checkbox.dataset.completionCondition;
    if (type === 'collection') completionState.requireCollectAll = checkbox.checked;
    if (type === 'connection') {
      const id = checkbox.dataset.connectionId;
      if (checkbox.checked) completionState.requiredConnectionIds.add(id);
      else completionState.requiredConnectionIds.delete(id);
    }
    renderRules();
  });
}

function features() {
  return window.__artifexMazeFeatures?.state || { enabled: {}, collection: { items: [] } };
}
function connections() {
  return window.__artifexMazeConnections?.pairs || [];
}

function renderRules() {
  const host = $('completion-feature-rules');
  if (!host) return;
  const featureState = features();
  const rows = [];
  if (featureState.enabled?.collection) {
    const total = featureState.collection.items.length;
    const placed = featureState.collection.items.filter((item) => item.cell).length;
    rows.push(`<label class="completion-rule-row"><input type="checkbox" data-completion-condition="collection" ${completionState.requireCollectAll ? 'checked' : ''} title="Require all collection objects before exit." /><span><strong>Collect all objects</strong><small>${placed}/${total} placed · ${completionState.requireCollectAll ? 'Mandatory' : 'Optional content'}</small></span></label>`);
  } else {
    completionState.requireCollectAll = false;
  }
  connections().forEach((connection) => {
    const checked = completionState.requiredConnectionIds.has(connection.id);
    const placed = connection.entry && connection.exit ? 'placed' : 'incomplete';
    rows.push(`<label class="completion-rule-row"><input type="checkbox" data-completion-condition="connection" data-connection-id="${escapeHtml(connection.id)}" ${checked ? 'checked' : ''} title="Require the player to use this ${escapeHtml(connection.type)} before exit." /><span><strong>Use ${escapeHtml(connection.label)} · ${escapeHtml(capitalize(connection.type))}</strong><small>${placed} · ${checked ? 'Mandatory' : 'Optional route feature'}</small></span></label>`);
  });
  host.innerHTML = rows.join('');
  const empty = $('completion-empty-note');
  if (empty) empty.hidden = !!rows.length;
  const mandatoryCount = 1 + (completionState.requireCollectAll ? 1 : 0) + completionState.requiredConnectionIds.size;
  const pill = $('completion-builder-status');
  if (pill) {
    pill.textContent = mandatoryCount === 1 ? 'Exit' : `${mandatoryCount} Required`;
    pill.className = `completion-status-pill ${mandatoryCount === 1 ? 'is-good' : 'is-warning'}`;
  }
}

function exportRules() {
  const featureState = features();
  return {
    schemaVersion: 'artifex.mazeCompletionRules.v3',
    reachExit: true,
    conditions: [
      { type: 'reach_exit', mandatory: true },
      ...(featureState.enabled?.collection ? [{ type: 'collect_all_objects', mandatory: completionState.requireCollectAll, itemIds: featureState.collection.items.map((item) => item.id) }] : []),
      ...connections().map((connection) => ({ type: 'use_connection', mandatory: completionState.requiredConnectionIds.has(connection.id), connectionId: connection.id, connectionType: connection.type }))
    ]
  };
}

function patchExportPayload() {
  setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return { ...base, puzzle: { ...base.puzzle, completionRules: exportRules() } };
    };
  }, 0);
}

function injectStyles() {
  if ($('maze-completion-rules-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-completion-rules-style';
  style.textContent = `
    .completion-rule-builder{margin:12px 0 10px;padding:11px;border:1px solid rgba(158,230,164,.24);border-radius:15px;background:linear-gradient(180deg,rgba(7,31,16,.86),rgba(4,18,10,.94));}
    .completion-builder-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;}
    .completion-builder-head strong{display:block;color:#eadfc6;font-size:.8rem;font-weight:900;}
    .completion-builder-head small,.completion-rule-row small{display:block;color:#a9b59e;font-size:.63rem;line-height:1.3;margin-top:2px;}
    .completion-status-pill{display:inline-flex;white-space:nowrap;border-radius:999px;padding:4px 7px;font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em;}
    .completion-status-pill.is-good{background:rgba(122,220,139,.16);color:#a8e8a3;border:1px solid rgba(122,220,139,.34);}
    .completion-status-pill.is-warning{background:rgba(238,196,89,.13);color:#f1cf75;border:1px solid rgba(238,196,89,.3);}
    .completion-feature-rules{display:grid;gap:2px;}
    .completion-rule-row{display:grid;grid-template-columns:19px 1fr;gap:7px;align-items:start;padding:7px 3px;border-radius:10px;font-size:.72rem;}
    .completion-rule-row:hover{background:rgba(158,230,164,.05);}.completion-rule-row input{margin-top:3px;accent-color:#9ee6a4;}.completion-rule-row strong{color:#e5dcc5;}
    .completion-empty-note{margin:8px 2px 2px;color:#a9b59e;font-size:.62rem;line-height:1.3;}
  `;
  document.head.appendChild(style);
}
function capitalize(value){return String(value).charAt(0).toUpperCase()+String(value).slice(1);}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
