import { puzzleEngines, getPuzzleEngine } from './engines/index.js';
import { getPuzzleModuleBrief } from './puzzle-module-briefs.js';

const $ = (id) => document.getElementById(id);
const engineValues = {};
let activeEngine = null;
let patternLockModule = null;
let patternLockLoadPromise = null;

window.addEventListener('DOMContentLoaded', () => {
  injectBriefStyles();
  buildEngineButtons();
  buildPuzzleLauncher();
  buildPuzzleBriefPage();
  bindImageContrastVisibility();
  patchExportPayload();
  showPuzzleChooser();
  const initialPuzzle = document.body?.dataset.initialPuzzle;
  if (initialPuzzle) {
    window.setTimeout(() => openWorkflow(initialPuzzle), 0);
  }
});

function getDisplayName(engine) {
  return getPuzzleModuleBrief(engine.id)?.displayName || engine.label;
}

function buildEngineButtons() {
  const host = $('engine-switcher');
  if (!host) return;
  host.innerHTML = '';

  const chooserButton = document.createElement('button');
  chooserButton.type = 'button';
  chooserButton.className = 'engine-button engine-chooser-button';
  chooserButton.title = 'Return to the puzzle type selection screen without deleting current work.';
  chooserButton.innerHTML = '<span class="engine-icon">‹</span><span>Choose Puzzle Type</span>';
  chooserButton.addEventListener('click', showPuzzleChooser);
  host.appendChild(chooserButton);

  puzzleEngines.forEach((engine) => {
    const brief = getPuzzleModuleBrief(engine.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'engine-button';
    button.dataset.engine = engine.id;
    button.title = `${getDisplayName(engine)}: ${brief?.launcherDescription || engine.purpose}`;
    button.innerHTML = `<span class="engine-icon">${engine.icon}</span><span>${getDisplayName(engine)}</span>`;
    button.addEventListener('click', () => openWorkflow(engine.id));
    host.appendChild(button);
  });
}

function buildPuzzleLauncher() {
  const host = document.querySelector('.left-panel-body');
  if (!host || $('puzzle-launcher-panel')) return;
  const panel = document.createElement('section');
  panel.id = 'puzzle-launcher-panel';
  panel.className = 'panel puzzle-launcher-panel';
  panel.innerHTML = `
    <p class="eyebrow">Start a puzzle</p>
    <h2>Choose a Puzzle Type</h2>
    <p class="puzzle-launcher-copy">Choose the challenge module you want to author. Labyrinth Maze is developed and playable; Pattern Lock Puzzle now has its first surface-point prototype. Other modules retain planning pages until implementation begins.</p>
    <div class="puzzle-type-grid" aria-label="Available puzzle types"></div>
  `;
  host.prepend(panel);
  const grid = panel.querySelector('.puzzle-type-grid');
  puzzleEngines.forEach((engine) => {
    const brief = getPuzzleModuleBrief(engine.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'puzzle-type-option';
    button.dataset.engine = engine.id;
    button.title = brief?.launcherDescription || engine.purpose;
    button.innerHTML = `<span class="engine-icon">${engine.icon}</span><span class="puzzle-type-copy"><strong>${getDisplayName(engine)}</strong><small>${brief?.launcherDescription || engine.purpose}</small></span><span class="puzzle-type-arrow">›</span>`;
    button.addEventListener('click', () => openWorkflow(engine.id));
    grid.appendChild(button);
  });
}

function buildPuzzleBriefPage() {
  const stage = document.querySelector('.right-panel');
  if (!stage || $('puzzle-module-brief-page')) return;
  const page = document.createElement('section');
  page.id = 'puzzle-module-brief-page';
  page.className = 'puzzle-module-brief-page';
  page.hidden = true;
  stage.prepend(page);
}

function closePatternLockIfLoaded() {
  patternLockModule?.closePatternLockWorkflow?.();
  document.body.classList.remove('is-pattern-lock');
}

function showPuzzleChooser() {
  closePatternLockIfLoaded();
  document.body.classList.add('is-puzzle-chooser');
  document.body.classList.remove('is-puzzle-brief');
  activeEngine = null;
  window.__artifexActivePuzzleEngine = null;
  $('puzzle-launcher-panel')?.removeAttribute('hidden');
  $('puzzle-module-brief-page')?.setAttribute('hidden', '');
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((button) => button.classList.remove('is-active', 'is-selected'));
  document.querySelectorAll('[data-panel-content]').forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove('is-active');
  });
}

async function launchPatternLock() {
  try {
    patternLockLoadPromise ||= import('./engines/pattern-lock-runtime.js?v=2.5');
    patternLockModule = await patternLockLoadPromise;
    patternLockModule.openPatternLockWorkflow();
  } catch (error) {
    patternLockLoadPromise = null;
    showPatternLockFailure(error);
  }
}

function openWorkflow(engineId) {
  if (engineId === 'symbol-assembly') {
    activeEngine = null;
    window.__artifexActivePuzzleEngine = null;
    $('puzzle-launcher-panel')?.setAttribute('hidden', '');
    $('puzzle-module-brief-page')?.setAttribute('hidden', '');
    document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((button) => button.classList.toggle('is-active', button.dataset.engine === engineId));
    void launchPatternLock();
    return;
  }
  closePatternLockIfLoaded();
  if (engineId !== 'maze-labyrinth') {
    showPlanningBrief(engineId);
    return;
  }
  document.body.classList.remove('is-puzzle-chooser', 'is-puzzle-brief');
  $('puzzle-launcher-panel')?.setAttribute('hidden', '');
  $('puzzle-module-brief-page')?.setAttribute('hidden', '');
  setActiveEngine(engineId);
  const setupButton = document.querySelector('.panel-nav-button[data-panel="build"]');
  setupButton?.click();
}

function showPatternLockFailure(error) {
  closePatternLockIfLoaded();
  const page = $('puzzle-module-brief-page');
  if (!page) return;
  document.body.classList.add('is-puzzle-chooser', 'is-puzzle-brief');
  $('puzzle-launcher-panel')?.removeAttribute('hidden');
  page.innerHTML = `
    <header class="brief-hero"><div class="brief-icon">✥</div><div><p class="eyebrow">Symbol Assembly · Prototype Error</p><h2>Pattern Lock did not load</h2><span class="brief-status">Testing blocker</span></div></header>
    <section class="brief-card brief-questions-card"><h3>Browser error</h3><p>${escapeHtml(error?.message || String(error))}</p></section>
    <section class="brief-card"><h3>Next step</h3><p>Copy or screenshot this message so the prototype can be corrected without guessing.</p></section>`;
  page.removeAttribute('hidden');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function showPlanningBrief(engineId) {
  closePatternLockIfLoaded();
  const engine = getPuzzleEngine(engineId);
  const brief = getPuzzleModuleBrief(engineId);
  const page = $('puzzle-module-brief-page');
  if (!engine || !brief || !page) return;
  activeEngine = null;
  window.__artifexActivePuzzleEngine = null;
  document.body.classList.add('is-puzzle-chooser', 'is-puzzle-brief');
  $('puzzle-launcher-panel')?.removeAttribute('hidden');
  document.querySelectorAll('.puzzle-type-option').forEach((button) => button.classList.toggle('is-selected', button.dataset.engine === engineId));
  document.querySelectorAll('.engine-button[data-engine]').forEach((button) => button.classList.toggle('is-active', button.dataset.engine === engineId));
  page.innerHTML = renderBriefPage(engine, brief);
  page.removeAttribute('hidden');
}

function renderBriefPage(engine, brief) {
  const loop = renderList(brief.gameplayLoop);
  const systems = renderTwoColumnList(brief.plannedSystems);
  const scoreRules = brief.scoreRules ? `<section class="brief-card"><h3>Scoring Rules</h3><div class="brief-table">${brief.scoreRules.map(([action, result]) => `<div><span>${action}</span><strong>${result}</strong></div>`).join('')}</div></section>` : '';
  const references = brief.references?.length ? `<section class="brief-card"><h3>Reference Examples</h3><div class="brief-links">${brief.references.map(([label, url, note]) => `<a href="${url}" target="_blank" rel="noopener"><strong>${label}</strong><span>${note}</span><small>${url}</small></a>`).join('')}</div></section>` : `<section class="brief-card"><h3>Reference Examples</h3><p>No example URL was recovered for this module yet.</p></section>`;
  const questions = renderList(brief.questions, 'brief-questions');
  return `
    <header class="brief-hero">
      <div class="brief-icon">${engine.icon}</div>
      <div>
        <p class="eyebrow">${brief.engineLabel} · Planning Page</p>
        <h2>${brief.displayName}</h2>
        <span class="brief-status">${brief.status}</span>
      </div>
    </header>
    <section class="brief-card brief-overview"><h3>Concept</h3><p>${brief.overview}</p></section>
    <section class="brief-card"><h3>Intended Workflow</h3>${loop}</section>
    ${scoreRules}
    <section class="brief-card"><h3>Systems Needed</h3>${systems}</section>
    ${references}
    <section class="brief-card brief-questions-card"><h3>Questions Before Implementation</h3>${questions}</section>
  `;
}

function renderList(items, className = '') {
  return `<ol class="brief-list ${className}">${(items || []).map((item) => `<li>${item}</li>`).join('')}</ol>`;
}

function renderTwoColumnList(items) {
  return `<div class="brief-systems">${(items || []).map(([name, detail]) => `<article><strong>${name}</strong><p>${detail}</p></article>`).join('')}</div>`;
}

function setActiveEngine(engineId) {
  activeEngine = getPuzzleEngine(engineId);
  const brief = getPuzzleModuleBrief(engineId);
  window.__artifexActivePuzzleEngine = activeEngine;
  window.__artifexPuzzleEngineValues = engineValues;
  document.querySelectorAll('.engine-button[data-engine]').forEach((button) => button.classList.toggle('is-active', button.dataset.engine === activeEngine.id));
  if ($('active-engine-title')) $('active-engine-title').textContent = brief?.displayName || activeEngine.label;
  if ($('active-engine-purpose')) $('active-engine-purpose').textContent = activeEngine.purpose;
  if ($('playable-label')) $('playable-label').textContent = `${brief?.displayName || activeEngine.label} Preview`;
  if ($('module-id')) $('module-id').value = activeEngine.defaultModuleId;
  if ($('calling-text')) $('calling-text').value = activeEngine.callingText;
  if ($('gameplay-mode') && activeEngine.mode) $('gameplay-mode').value = activeEngine.mode;
  renderFields(activeEngine);
  drawEnginePreviewBadge(activeEngine);
}

function renderFields(engine) {
  const host = $('engine-fields');
  if (!host) return;
  host.innerHTML = '';
  engineValues[engine.id] ||= {};
  engine.fields.forEach((field) => {
    if (engineValues[engine.id][field.key] === undefined) engineValues[engine.id][field.key] = field.value;
    const label = document.createElement('label');
    label.className = 'field-block engine-field';
    const title = document.createElement('span');
    title.textContent = field.label;
    label.appendChild(title);
    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
    }
    input.value = engineValues[engine.id][field.key];
    input.dataset.engineField = field.key;
    input.addEventListener('input', () => {
      engineValues[engine.id][field.key] = input.type === 'range' ? Number(input.value) : input.value;
      drawEnginePreviewBadge(activeEngine);
    });
    label.appendChild(input);
    host.appendChild(label);
  });
}

function bindImageContrastVisibility() {
  const upload = $('image-upload');
  const group = $('image-contrast-group');
  if (!upload || !group) return;
  const update = () => { group.hidden = !(upload.files && upload.files.length); };
  upload.addEventListener('change', update);
  update();
}

function drawEnginePreviewBadge(engine) {
  if (!engine) return;
  setTimeout(() => {
    const canvas = $('maze-preview-canvas');
    if (!canvas || document.body.classList.contains('is-puzzle-chooser')) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / Math.max(1, rect.width);
    const label = getDisplayName(engine);
    ctx.save();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = 'rgba(2, 10, 5, .74)';
    ctx.strokeStyle = engine.preview?.accent || '#9ee6a4';
    ctx.lineWidth = 1;
    rounded(ctx, 18, 18, 270, 58, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e9dcc1';
    ctx.font = '700 15px Inter, sans-serif';
    ctx.fillText(label, 58, 41);
    ctx.fillStyle = engine.preview?.accent || '#9ee6a4';
    ctx.font = '700 26px Inter, sans-serif';
    ctx.fillText(engine.icon, 29, 45);
    ctx.restore();
  }, 30);
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
}

function patchExportPayload() {
  window.__artifexAugmentPuzzlePayload = (payload) => ({
    ...payload,
    engine: activeEngine ? {
      id: activeEngine.id,
      label: getDisplayName(activeEngine),
      moduleType: activeEngine.moduleType,
      mode: activeEngine.mode,
      values: engineValues[activeEngine.id] || {}
    } : null
  });
}

function injectBriefStyles() {
  if ($('puzzle-brief-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'puzzle-brief-page-styles';
  style.textContent = `
    .puzzle-type-option.is-selected{border-color:rgba(158,230,164,.72);background:rgba(20,72,37,.82);box-shadow:inset 0 0 0 1px rgba(158,230,164,.25);}
    .is-puzzle-brief .right-preview-layout{display:none!important;}
    .is-puzzle-brief .puzzle-module-brief-page{display:block;}
    .puzzle-module-brief-page{height:100%;overflow:auto;padding:28px clamp(18px,3vw,42px) 40px;background:radial-gradient(circle at 20% 0%,rgba(39,96,55,.26),transparent 33%),rgba(1,7,4,.9);color:var(--cream);}
    .brief-hero{display:flex;align-items:center;gap:18px;margin:0 0 22px;padding-bottom:20px;border-bottom:1px solid rgba(158,230,164,.18);}
    .brief-hero h2{margin:4px 0 8px;font-family:'Cinzel',serif;font-size:clamp(1.45rem,2.1vw,2rem);color:var(--cream);}
    .brief-icon{display:grid;place-items:center;width:70px;height:70px;border:1px solid rgba(158,230,164,.36);border-radius:20px;background:rgba(20,72,37,.55);color:var(--green2);font-size:2rem;}
    .brief-status{display:inline-block;padding:5px 10px;border:1px solid rgba(226,196,91,.36);border-radius:999px;color:#eec45a;font-size:.7rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;}
    .brief-card{margin:0 0 16px;padding:18px 20px;border:1px solid rgba(124,202,125,.18);border-radius:15px;background:rgba(7,29,16,.56);}
    .brief-card h3{margin:0 0 12px;color:var(--green2);font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;}
    .brief-card p{margin:0;color:var(--cream);font-size:.88rem;line-height:1.55;}
    .brief-list{margin:0;padding-left:21px;color:var(--cream);font-size:.84rem;line-height:1.55;}
    .brief-list li+li{margin-top:6px;}
    .brief-systems{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;}
    .brief-systems article{padding:12px 13px;border-radius:11px;background:rgba(20,72,37,.32);border:1px solid rgba(124,202,125,.12);}
    .brief-systems strong{display:block;color:var(--cream);font-size:.82rem;margin-bottom:5px;}
    .brief-systems p{color:var(--muted);font-size:.76rem;line-height:1.4;}
    .brief-table{display:grid;gap:7px;}
    .brief-table div{display:flex;justify-content:space-between;gap:20px;padding:10px 12px;border-radius:9px;background:rgba(20,72,37,.29);font-size:.8rem;}
    .brief-table strong{color:var(--green2);white-space:nowrap;}
    .brief-links{display:grid;gap:9px;}
    .brief-links a{display:block;padding:11px 13px;border-radius:10px;border:1px solid rgba(124,202,125,.19);background:rgba(20,72,37,.26);color:var(--cream);text-decoration:none;}
    .brief-links a:hover{border-color:rgba(158,230,164,.5);}
    .brief-links strong{display:block;font-size:.84rem;color:var(--green2);margin-bottom:4px;}
    .brief-links span{display:block;color:var(--muted);font-size:.76rem;line-height:1.38;margin-bottom:5px;}
    .brief-links small{display:block;color:#a4cbb2;font-size:.66rem;overflow-wrap:anywhere;}
    .brief-questions-card{border-color:rgba(226,196,91,.28);}
    .brief-questions-card h3{color:#eec45a;}
    .brief-questions{color:var(--cream);}
  `;
  document.head.appendChild(style);
}
