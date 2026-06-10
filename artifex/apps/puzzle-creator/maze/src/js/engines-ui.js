import { puzzleEngines, getPuzzleEngine } from './engines/index.js';
import { getPuzzleModuleBrief } from './puzzle-module-briefs.js';

const $ = (id) => document.getElementById(id);
const engineValues = {};
let activeEngine = null;

window.addEventListener('DOMContentLoaded', () => {
  injectBriefStyles();
  buildEngineButtons();
  buildPuzzleLauncher();
  buildPuzzleBriefPage();
  bindImageContrastVisibility();
  patchExportPayload();
  showPuzzleChooser();
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
  if (!host) return;

  let panel = $('puzzle-launcher-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'puzzle-launcher-panel';
    host.prepend(panel);
  }

  panel.className = 'panel tool-panel puzzle-launcher-panel';
  panel.innerHTML = `
    <p class="eyebrow">Choose Puzzle Engine</p>
    <h2>What are we building?</h2>
    <p class="puzzle-launcher-copy">Select an engine to swap the editor controls and preview into that puzzle type.</p>
    <div class="puzzle-type-grid" id="puzzle-type-grid" aria-label="Available puzzle types"></div>
  `;

  const grid = $('puzzle-type-grid');
  if (!grid) return;
  grid.innerHTML = '';

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

function hideBasePanels() {
  document.querySelectorAll('[data-panel-content]').forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove('is-active');
  });
}

function showPuzzleChooser() {
  activeEngine = null;
  window.__artifexActivePuzzleEngine = null;
  document.body.classList.add('is-puzzle-chooser');
  document.body.classList.remove('is-puzzle-brief', 'is-obstacle-course');
  $('puzzle-launcher-panel')?.removeAttribute('hidden');
  $('puzzle-module-brief-page')?.setAttribute('hidden', '');
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((button) => button.classList.remove('is-active', 'is-selected'));
  hideBasePanels();
}

function openWorkflow(engineId) {
  if (engineId === 'obstacle-course') {
    document.body.classList.remove('is-puzzle-chooser', 'is-puzzle-brief');
    $('puzzle-launcher-panel')?.setAttribute('hidden', '');
    $('puzzle-module-brief-page')?.setAttribute('hidden', '');
    hideBasePanels();
    document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((button) => {
      const active = button.dataset.engine === engineId;
      button.classList.toggle('is-active', active);
      button.classList.toggle('is-selected', active);
    });
    if (window.__artifexObstacleCourse?.open) {
      window.__artifexObstacleCourse.open();
    } else {
      setTimeout(() => window.__artifexObstacleCourse?.open?.(), 120);
    }
    return;
  }

  if (engineId !== 'maze-labyrinth') {
    showPlanningBrief(engineId);
    return;
  }

  document.body.classList.remove('is-puzzle-chooser', 'is-puzzle-brief', 'is-obstacle-course');
  $('puzzle-launcher-panel')?.setAttribute('hidden', '');
  $('puzzle-module-brief-page')?.setAttribute('hidden', '');
  setActiveEngine(engineId);
  document.querySelector('.panel-nav-button[data-panel="build"]')?.click();
}

function showPlanningBrief(engineId) {
  const engine = getPuzzleEngine(engineId);
  const brief = getPuzzleModuleBrief(engineId);
  const page = $('puzzle-module-brief-page');
  if (!engine || !brief || !page) return;
  activeEngine = null;
  window.__artifexActivePuzzleEngine = null;
  document.body.classList.add('is-puzzle-chooser', 'is-puzzle-brief');
  document.body.classList.remove('is-obstacle-course');
  $('puzzle-launcher-panel')?.removeAttribute('hidden');
  hideBasePanels();
  document.querySelectorAll('.puzzle-type-option').forEach((button) => button.classList.toggle('is-selected', button.dataset.engine === engineId));
  document.querySelectorAll('.engine-button[data-engine]').forEach((button) => button.classList.toggle('is-active', button.dataset.engine === engineId));
  page.innerHTML = renderBriefPage(engine, brief);
  page.removeAttribute('hidden');
}

function renderBriefPage(engine, brief) {
  const scoreRules = brief.scoreRules ? `<section class="brief-card"><h3>Scoring Rules</h3><div class="brief-table">${brief.scoreRules.map(([action, result]) => `<div><span>${action}</span><strong>${result}</strong></div>`).join('')}</div></section>` : '';
  return `
    <header class="brief-hero"><div class="brief-icon">${engine.icon}</div><div><p class="eyebrow">${brief.engineLabel} · Planning Page</p><h2>${brief.displayName}</h2><span class="brief-status">${brief.status}</span></div></header>
    <section class="brief-card brief-overview"><h3>Concept</h3><p>${brief.overview}</p></section>
    <section class="brief-card"><h3>Intended Workflow</h3>${renderList(brief.gameplayLoop)}</section>
    ${scoreRules}
    <section class="brief-card"><h3>Systems Needed</h3>${renderTwoColumnList(brief.plannedSystems)}</section>
    <section class="brief-card brief-questions-card"><h3>Questions Before Implementation</h3>${renderList(brief.questions, 'brief-questions')}</section>
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
  document.querySelectorAll('.puzzle-type-option').forEach((button) => button.classList.toggle('is-selected', button.dataset.engine === activeEngine.id));
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
    label.innerHTML = `<span>${field.label}</span>`;
    const input = field.type === 'select' ? document.createElement('select') : document.createElement('input');
    if (field.type === 'select') {
      field.options.forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        input.appendChild(option);
      });
    } else {
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
    ctx.fillText(getDisplayName(engine), 58, 41);
    ctx.fillStyle = engine.preview?.accent || '#9ee6a4';
    ctx.font = '700 26px Inter, sans-serif';
    ctx.fillText(engine.icon, 29, 45);
    ctx.restore();
  }, 30);
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
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
    .puzzle-type-option.is-selected{border-color:rgba(158,230,164,.72);background:rgba(20,72,37,.82);box-shadow:inset 0 0 0 1px rgba(158,230,164,.25)}
    .is-puzzle-brief .right-preview-layout{display:none!important}
    .is-puzzle-brief .puzzle-module-brief-page{display:block}
    .puzzle-module-brief-page{height:100%;overflow:auto;padding:28px clamp(18px,3vw,42px) 40px;background:radial-gradient(circle at 20% 0%,rgba(39,96,55,.26),transparent 33%),rgba(1,7,4,.9);color:var(--cream)}
    .brief-hero{display:flex;align-items:center;gap:18px;margin:0 0 22px;padding-bottom:20px;border-bottom:1px solid rgba(158,230,164,.18)}
    .brief-hero h2{margin:4px 0 8px;font-family:'Cinzel',serif;font-size:clamp(1.45rem,2.1vw,2rem);color:var(--cream)}
    .brief-icon{display:grid;place-items:center;width:70px;height:70px;border:1px solid rgba(158,230,164,.36);border-radius:20px;background:rgba(20,72,37,.55);color:var(--green2);font-size:2rem}
    .brief-status{display:inline-block;padding:5px 10px;border:1px solid rgba(226,196,91,.36);border-radius:999px;color:#eec45a;font-size:.7rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
    .brief-card{margin:0 0 16px;padding:18px 20px;border:1px solid rgba(124,202,125,.18);border-radius:15px;background:rgba(7,29,16,.56)}
    .brief-card h3{margin:0 0 12px;color:var(--green2);font-size:.8rem;letter-spacing:.16em;text-transform:uppercase}
    .brief-card p{margin:0;color:var(--cream);font-size:.88rem;line-height:1.55}
    .brief-list{margin:0;padding-left:21px;color:var(--cream);font-size:.84rem;line-height:1.55}
    .brief-list li+li{margin-top:6px}
    .brief-systems{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}
    .brief-systems article{padding:12px 13px;border-radius:11px;background:rgba(20,72,37,.32);border:1px solid rgba(124,202,125,.12)}
    .brief-systems strong{display:block;color:var(--cream);font-size:.82rem;margin-bottom:5px}
    .brief-systems p{color:var(--muted);font-size:.76rem;line-height:1.4}
    .brief-table{display:grid;gap:7px}
    .brief-table div{display:flex;justify-content:space-between;gap:20px;padding:10px 12px;border-radius:9px;background:rgba(20,72,37,.29);font-size:.8rem}
    .brief-table strong{color:var(--green2);white-space:nowrap}
    .brief-questions-card{border-color:rgba(226,196,91,.28)}
    .brief-questions-card h3{color:#eec45a}
  `;
  document.head.appendChild(style);
}
